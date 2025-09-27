// src/handlers/messageUpdate.ts
import { ChannelType, type AnyThreadChannel, type Message, type PartialMessage } from "discord.js";
import { ThreadStateStore } from "../state/threadState";
import { YT_RE, TRACKER_RE, TAGS, MIN_VOD_DURATION_MIN } from "../config";
import { upsertPostEmbed, deletePostEmbed } from "../utils/postEmbed";
import { removeTag, addTag } from "../utils/forumTags";
import { validateTitle } from "../validators/title";
import { extractFields } from "../utils/fieldExtract";
import { has1080pOrUnknown, getQuickMeta } from "../utils/youtube";

const DM_RE = /\b(?:dm|death ?match)\b/i;

function isLowRank(rankRaw: string): boolean {
  const r = (rankRaw || "").trim().toLowerCase();
  if (/^(iron|bronze|silver|gold)\b/.test(r)) return true;
  if (/^[ibsg][1-3]$/.test(r)) return true;
  return false;
}

const timers = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_MS = 800;

export async function onMessageUpdate(
  _oldMsg: Message | PartialMessage,
  newMsg: Message | PartialMessage
) {
  try {
    const msg = newMsg.partial ? await newMsg.fetch().catch(() => null) : newMsg;
    if (!msg || msg.author?.bot) return;

    const thread = msg.channel as AnyThreadChannel;
    if (!("isThread" in thread) || !thread.isThread?.()) return;
    if (thread.parent?.type !== ChannelType.GuildForum) return;

    const st = ThreadStateStore.get(thread.id);
    if (!st || !st.starterId) return;
    if (msg.id !== st.starterId) return;

    if (timers.has(thread.id)) clearTimeout(timers.get(thread.id)!);
    const t = setTimeout(() => evaluateThread(thread, msg).catch(() => {}), DEBOUNCE_MS);
    timers.set(thread.id, t);
  } catch {}
}

async function evaluateThread(thread: AnyThreadChannel, starterMsg: Message) {
  const st0 = ThreadStateStore.get(thread.id);
  if (!st0) return;

  const starterText = [starterMsg.content || "", thread.name || ""].join("\n");

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

  const fx = extractFields(starterText);
  const needsRegion = !fx.region;
  const needsRole = !fx.mainRole;
  const needsHours = fx.hoursPerWeek === undefined;
  const needsSessions = fx.coachingSessions === undefined;
  const needsStruggles = !fx.struggles;
  const needsGoals = !fx.goals;

  let needsPlayable = false;
  let needsDuration = false;
  let needs1080p = false;

  if (hasYoutube) {
    const meta = await getQuickMeta(starterText);
    if (meta && meta.ok) {
      needsPlayable = Boolean(meta.isPrivate);
      if (meta.durationSec !== undefined) {
        needsDuration = meta.durationSec < MIN_VOD_DURATION_MIN * 60;
      }
    }
    const ok1080 = await has1080pOrUnknown(starterText);
    needs1080p = ok1080 === false;
  }

  ThreadStateStore.update(thread.id, {
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
    firstVodSplitBlocked: st0.firstVodSplitBlocked,
    needs1080p,
    needsPlayable,
    needsDuration,
  });

  const allGood =
    !needsYoutube &&
    !needsTracker &&
    !needsTitle &&
    !needsDeathmatch &&
    !st0.firstVodSplitBlocked &&
    !needsRegion &&
    !needsRole &&
    !needsHours &&
    !needsSessions &&
    !needsStruggles &&
    !needsGoals &&
    !needs1080p &&
    !needsPlayable &&
    !needsDuration;

  if (allGood) {
    await deletePostEmbed(thread, { ...st0 });
    if (TAGS.PENDING) await removeTag(thread, TAGS.PENDING, "All requirements fixed");
    if (TAGS.READY_FOR_REVIEW) await addTag(thread, TAGS.READY_FOR_REVIEW, "Ready for review");
    return;
  }

  await upsertPostEmbed({
    thread,
    st: { ...st0 },
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
    firstVodSplitBlocked: st0.firstVodSplitBlocked,
    needs1080p,
    needsPlayable,
    needsDuration,
  });

  const applied = new Set(thread.appliedTags ?? []);
  const hasReviewing = TAGS.READY_FOR_REVIEW ? applied.has(TAGS.READY_FOR_REVIEW) : false;

  if (hasReviewing) {
    if (TAGS.PENDING && applied.has(TAGS.PENDING)) {
      await removeTag(thread, TAGS.PENDING, "Under manual review");
    }
  } else {
    if (TAGS.PENDING) await addTag(thread, TAGS.PENDING);
  }
}
