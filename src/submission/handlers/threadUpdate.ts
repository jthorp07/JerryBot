// src/handlers/threadUpdate.ts
import {
  ChannelType,
  type AnyThreadChannel,
  type ThreadChannel,
  type ForumChannel,
} from "discord.js";
import { ThreadStateStore } from "../state/threadState";
import { validateTitle } from "../validators/title";
import { upsertPostEmbed, deletePostEmbed } from "../utils/postEmbed";
import { addTag, removeTag } from "../utils/forumTags";
import { TAGS, YT_RE, TRACKER_RE } from "../config";
import { extractFields } from "../utils/fieldExtract";

const DM_RE = /\b(?:dm|death ?match)\b/i;

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

export async function onThreadUpdate(
  _oldThread: ThreadChannel,
  newThread: ThreadChannel
) {
  try {
    if (newThread.parent?.type !== ChannelType.GuildForum) return;
    const st = ThreadStateStore.get(newThread.id);
    if (!st) return;

    const thread = newThread as AnyThreadChannel;
    const starter = await thread.fetchStarterMessage().catch(() => null);
    const starterText = [starter?.content || "", newThread.name || ""].join("\n");

    const titleIssues = validateTitle(newThread.name);
    const needsTitle = Boolean(titleIssues);

    const parts = (newThread.name || "").split("|").map(s => s.trim()).filter(Boolean);
    const mapName = (parts[1] ?? "").toLowerCase();
    const rankRaw = parts[3] ?? "";
    const lowRank = isLowRank(rankRaw);

    const hasYoutube = YT_RE.test(starterText);
    const hasTracker = TRACKER_RE.test(starterText);
    const needsYoutube = !hasYoutube;
    const needsTracker = !hasTracker;

    const needsDeathmatch = lowRank && !DM_RE.test(starterText);

    let firstVodSplitBlocked = false;
    const authorId = st.authorId ?? starter?.author?.id ?? newThread.ownerId ?? null;
    if (authorId && newThread.parent) {
      const first = await isFirstVod(newThread.parent as ForumChannel, authorId, newThread.id);
      if (first && mapName === "split") firstVodSplitBlocked = true;
    }

    const fx = extractFields(starterText);
    const needsRegion = !fx.region;
    const needsRole = !fx.mainRole;
    const needsHours = fx.hoursPerWeek === undefined;
    const needsSessions = fx.coachingSessions === undefined;
    const needsStruggles = !fx.struggles;
    const needsGoals = !fx.goals;

    ThreadStateStore.update(newThread.id, {
      needsTitle,
      needsDeathmatch,
      firstVodSplitBlocked,
      needsYoutube,
      needsTracker,
      needsRegion,
      needsRole,
      needsHours,
      needsSessions,
      needsStruggles,
      needsGoals,
    });

    if (st.moderationStatus === "approved" || st.moderationStatus === "denied") {
      if (TAGS.PENDING) await removeTag(newThread as AnyThreadChannel, TAGS.PENDING, "Moderator status set");
      if (TAGS.READY_FOR_REVIEW) await removeTag(newThread as AnyThreadChannel, TAGS.READY_FOR_REVIEW, "Moderator status set");
      return;
    }

    const allGood =
      !needsYoutube &&
      !needsTracker &&
      !needsTitle &&
      !needsDeathmatch &&
      !firstVodSplitBlocked &&
      !needsRegion &&
      !needsRole &&
      !needsHours &&
      !needsSessions &&
      !needsStruggles &&
      !needsGoals &&
      !st.needs1080p &&
      !st.needsPlayable &&
      !st.needsDuration;

    if (allGood) {
      await deletePostEmbed(newThread as AnyThreadChannel, {
        ...st,
        needsTitle,
        needsDeathmatch,
        firstVodSplitBlocked,
        needsYoutube,
        needsTracker,
        needsRegion,
        needsRole,
        needsHours,
        needsSessions,
        needsStruggles,
        needsGoals,
      });

      const applied = new Set(newThread.appliedTags ?? []);
      if (TAGS.PENDING && applied.has(TAGS.PENDING)) {
        await removeTag(newThread as AnyThreadChannel, TAGS.PENDING, "All requirements fixed");
      }
      if (TAGS.READY_FOR_REVIEW && !applied.has(TAGS.READY_FOR_REVIEW)) {
        await addTag(newThread as AnyThreadChannel, TAGS.READY_FOR_REVIEW, "Ready for review");
      }
    } else {
      await upsertPostEmbed({
        thread: newThread as AnyThreadChannel,
        st: {
          ...st,
          needsTitle,
          needsDeathmatch,
          firstVodSplitBlocked,
          needsYoutube,
          needsTracker,
          needsRegion,
          needsRole,
          needsHours,
          needsSessions,
          needsStruggles,
          needsGoals,
        },
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
        needs1080p: st.needs1080p,
        needsPlayable: st.needsPlayable,
        needsDuration: st.needsDuration,
      });

      const applied = new Set(newThread.appliedTags ?? []);
      const hasReviewing = TAGS.READY_FOR_REVIEW ? applied.has(TAGS.READY_FOR_REVIEW) : false;

      if (hasReviewing) {
        if (TAGS.PENDING && applied.has(TAGS.PENDING)) {
          await removeTag(newThread as AnyThreadChannel, TAGS.PENDING, "Under manual review");
        }
      } else {
        if (TAGS.PENDING) await addTag(newThread as AnyThreadChannel, TAGS.PENDING);
      }
    }
  } catch {}
}
