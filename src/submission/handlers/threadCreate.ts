import {
  ChannelType,
  EmbedBuilder,
  type AnyThreadChannel,
  type ThreadChannel,
  type ForumChannel,
} from "discord.js";
import {
  YT_RE,
  TRACKER_RE,
  TAGS,
  MIN_VOD_DURATION_MIN,
  DUPLICATE_DELETE_DELAY_MS,
} from "../config";
import { ThreadStateStore } from "../state/threadState";
import { validateTitle } from "../validators/title";
import { scheduleDeletion } from "../utils/threadOps";
import { countUserActiveForumPosts } from "../services/countDuplicates";
import { upsertPostEmbed, deletePostEmbed } from "../utils/postEmbed";
import { extractFields } from "../utils/fieldExtract";
import { has1080pOrUnknown } from "../utils/youtube";
import { classifyVodLinks } from "../services/videoClassifier";

function isLowRank(rankRaw: string): boolean {
  const r = (rankRaw || "").trim().toLowerCase();
  if (/^(iron|bronze|silver|gold)\b/.test(r)) return true;
  if (/^[ibsg][1-3]$/.test(r)) return true;
  return false;
}

async function isFirstVod(
  forum: ForumChannel,
  userId: string,
  currentThreadId: string
): Promise<boolean> {
  let count = 0;
  const active = await forum.threads.fetchActive().catch(() => null);
  if (active?.threads?.size) {
    for (const [, th] of active.threads) {
      if (th.id === currentThreadId) continue;
      const starter = await th.fetchStarterMessage().catch(() => null);
      const aid = starter?.author?.id ?? (th as ThreadChannel).ownerId ?? null;
      if (aid === userId) count++;
    }
  }
  const archived = await forum.threads.fetchArchived({ type: "public" }).catch(() => null);
  if (archived?.threads?.size) {
    for (const [, th] of archived.threads) {
      if (th.id === currentThreadId) continue;
      const starter = await th.fetchStarterMessage().catch(() => null);
      const aid = starter?.author?.id ?? (th as ThreadChannel).ownerId ?? null;
      if (aid === userId) count++;
    }
  }
  return count === 0;
}

export async function onThreadCreate(
  client: import("discord.js").Client,
  thread: AnyThreadChannel,
  newlyCreated: boolean
) {
  try {
    if (!newlyCreated) return;
    if (thread.parent?.type !== ChannelType.GuildForum) return;

    if (thread.joinable) await thread.join().catch(() => undefined);

    const starter = await thread.fetchStarterMessage().catch(() => null);
    const starterText = [starter?.content, thread.name].filter(Boolean).join("\n");
    const authorId = starter?.author?.id ?? (thread as ThreadChannel).ownerId ?? null;

    if (authorId && thread.parent) {
      const dupCount = await countUserActiveForumPosts(thread.parent as ForumChannel, authorId, thread.id);
      if (dupCount >= 1) {
        const warnEmbed = new EmbedBuilder()
          .setTitle("⚠️ Duplicate post detected")
          .setDescription(
            `You aren't allowed multiple posts at once. This post will be deleted in ${Math.round(
              DUPLICATE_DELETE_DELAY_MS / 1000
            )} seconds.`
          );

        if (starter?.id) {
          const msg = await thread.messages.fetch(starter.id).catch(() => null);
          if (msg) await msg.delete().catch(() => undefined);
        }

        await thread.send({ embeds: [warnEmbed] }).catch(() => undefined);
        await thread.setLocked(true, "Locked due to duplicate").catch(() => undefined);
        await scheduleDeletion(thread.client, thread, DUPLICATE_DELETE_DELAY_MS, "Duplicate post removal");
        return;
      }
    }

    const hasYoutubeLink = YT_RE.test(starterText);
    const hasTracker = TRACKER_RE.test(starterText);

    let needsDuration = false;
    let needs1080p = false;

    if (hasYoutubeLink) {
      const info = await classifyVodLinks(starterText);
      if (info.mainVodUrl) {
        const dur = info.durations[info.mainVodUrl] ?? 0;
        const mainVodOk = dur >= MIN_VOD_DURATION_MIN * 60;
        needsDuration = !mainVodOk;
        const ok1080 = await has1080pOrUnknown(info.mainVodUrl);
        needs1080p = ok1080 === false;
      }
    }

    const titleIssues = validateTitle(thread.name);
    const needsTitle = Boolean(titleIssues);

    const parts = thread.name.split("|").map((s) => s.trim()).filter(Boolean);
    const mapName = (parts[1] ?? "").toLowerCase();
    const rankRaw = (parts[3] ?? "").toLowerCase();
    const lowRank = isLowRank(rankRaw);

    const fx = extractFields(starterText);

    const needsYoutube = !hasYoutubeLink;
    const needsTracker = !hasTracker;

    let needsDeathmatch = false;
    if (lowRank && hasYoutubeLink) {
      const info = await classifyVodLinks(starterText);
      const hasDmSatisfied = info.dmMentionedInsideMain || Boolean(info.dmVodUrl);
      needsDeathmatch = !hasDmSatisfied;
    }

    let firstVodSplitBlocked = false;
    if (authorId && thread.parent) {
      const first = await isFirstVod(thread.parent as ForumChannel, authorId, thread.id);
      if (first && mapName === "split") {
        firstVodSplitBlocked = true;
      }
    }

    const needsRegion = !fx.region;
    const needsRole = !fx.mainRole;
    const needsHours = fx.hoursPerWeek === undefined;
    const needsSessions = fx.coachingSessions === undefined;
    const needsStruggles = !fx.struggles;
    const needsGoals = !fx.goals;

    ThreadStateStore.set(thread.id, {
      starterId: starter?.id ?? null,
      starterDeleted: !starter,
      authorId,
      needsYoutube,
      needsTracker,
      needsTitle,
      needsRegion,
      needsRole,
      needsHours,
      needsSessions,
      needsStruggles,
      needsGoals,
      needsDeathmatch,
      firstVodSplitBlocked,
      needs1080p,
      needsPlayable: false,
      needsDuration,
      moderationStatus: null,
      autoDeniedFirstVodSplit: false,
      requirementsMsgId: undefined,
      blockWarnIds: [],
    });

    const st = ThreadStateStore.get(thread.id)!;

    const needsAny =
      needsYoutube ||
      needsTracker ||
      needsTitle ||
      needsRegion ||
      needsRole ||
      needsHours ||
      needsSessions ||
      needsStruggles ||
      needsGoals ||
      needsDeathmatch ||
      firstVodSplitBlocked ||
      needs1080p ||
      needsDuration;

    if (needsAny) {
      await upsertPostEmbed({
        thread,
        st,
        needsYoutube,
        needsTracker,
        needsTitle,
        titleIssues,
        needsRegion,
        needsRole,
        needsHours,
        needsSessions,
        needsStruggles,
        needsGoals,
        needsDeathmatch,
        firstVodSplitBlocked,
        needs1080p,
        needsPlayable: false,
        needsDuration,
      });
      await thread.setAppliedTags(TAGS.PENDING ? [TAGS.PENDING] : [], "Missing information").catch(() => undefined);
      return;
    }

    await deletePostEmbed(thread, st).catch(() => undefined);
    await thread.setAppliedTags(TAGS.READY_FOR_REVIEW ? [TAGS.READY_FOR_REVIEW] : [], "Submission ready for moderator review").catch(() => undefined);
  } catch {}
}
