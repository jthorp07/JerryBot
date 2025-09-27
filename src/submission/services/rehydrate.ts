import {
  ChannelType,
  type AnyThreadChannel,
  type ForumChannel,
  type ThreadChannel,
  type Client,
} from "discord.js";
import { ThreadStateStore } from "../state/threadState";
import { YT_RE, TRACKER_RE } from "../config";
import { validateTitle } from "../validators/title";
import { extractFields } from "../utils/fieldExtract";
import { has1080pOrUnknown } from "../utils/youtube";

const DM_RE = /\b(?:dm|death ?match)\b/i;

function isLowRank(rankRaw: string): boolean {
  const r = (rankRaw || "").trim().toLowerCase();
  if (/^(iron|bronze|silver|gold)\b/.test(r)) return true;
  if (/^[ibsg][1-3]$/.test(r)) return true;
  return false;
}

async function isFirstVod(forum: ForumChannel, userId: string, currentThreadId: string): Promise<boolean> {
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

async function computeThreadState(thread: AnyThreadChannel) {
  const starter = await thread.fetchStarterMessage().catch(() => null);
  const starterText = [starter?.content || "", thread.name || ""].join("\n");
  const authorId = starter?.author?.id ?? (thread as ThreadChannel).ownerId ?? null;

  const hasYoutube = YT_RE.test(starterText);
  const hasTracker = TRACKER_RE.test(starterText);

  const parts = (thread.name || "").split("|").map(s => s.trim()).filter(Boolean);
  const mapName = (parts[1] ?? "").toLowerCase();
  const rankRaw = parts[3] ?? "";
  const lowRank = isLowRank(rankRaw);

  const titleIssues = validateTitle(thread.name || "");
  const needsTitle = Boolean(titleIssues);
  const needsYoutube = !hasYoutube;
  const needsTracker = !hasTracker;
  const needsDeathmatch = lowRank && !DM_RE.test(starterText);

  let firstVodSplitBlocked = false;
  if (authorId && thread.parent?.type === ChannelType.GuildForum) {
    const first = await isFirstVod(thread.parent as ForumChannel, authorId, thread.id);
    if (first && mapName === "split") firstVodSplitBlocked = true;
  }

  const fx = extractFields(starterText);
  const needsRegion = !fx.region;
  const needsRole = !fx.mainRole;
  const needsHours = fx.hoursPerWeek === undefined;
  const needsSessions = fx.coachingSessions === undefined;
  const needsStruggles = !fx.struggles;
  const needsGoals = !fx.goals;

  let needs1080p = false;
  if (hasYoutube) {
    const res = await has1080pOrUnknown(starterText);
    needs1080p = (res === false);
  }

  return {
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
    requirementsMsgId: undefined as string | undefined,
    blockWarnIds: [] as string[],
  };
}

export async function rehydrateForums(client: Client) {
  for (const [, guild] of client.guilds.cache) {
    const channels = await guild.channels.fetch().catch(() => null);
    if (!channels) continue;
    for (const [, ch] of channels) {
      if (!ch || ch.type !== ChannelType.GuildForum) continue;
      const active = await ch.threads.fetchActive().catch(() => null);
      if (active?.threads?.size) {
        for (const [, th] of active.threads) {
          try {
            if (!ThreadStateStore.get(th.id)) {
              const st = await computeThreadState(th);
              ThreadStateStore.set(th.id, st);
            }
          } catch {}
        }
      }
      const archived = await ch.threads.fetchArchived({ type: "public" }).catch(() => null);
      if (archived?.threads?.size) {
        for (const [, th] of archived.threads) {
          try {
            if (!ThreadStateStore.get(th.id)) {
              const st = await computeThreadState(th);
              ThreadStateStore.set(th.id, st);
            }
          } catch {}
        }
      }
    }
  }
}
