import {
  EmbedBuilder,
  type AnyThreadChannel,
  type ThreadChannel,
  type Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { ThreadState } from "../types";

type Threadish = AnyThreadChannel | ThreadChannel;

const TITLE_MISSING = "⚠️ Missing information detected";
const TITLE_OK = "✅ Post looks good!";

const locks = new Map<string, Promise<void>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let resolveNext!: () => void;
  const next = new Promise<void>((r) => (resolveNext = r));
  locks.set(key, prev.then(() => next));
  return prev.then(fn).finally(() => resolveNext());
}

export function buildPostEmbed(opts: {
  needsYoutube: boolean;
  needsTracker: boolean;
  needsTitle: boolean;
  needsRegion?: boolean;
  needsRole?: boolean;
  needsHours?: boolean;
  needsSessions?: boolean;
  needsStruggles?: boolean;
  needsGoals?: boolean;
  needsDeathmatch?: boolean;
  firstVodSplitBlocked?: boolean;
  needs1080p?: boolean;
  needsPlayable?: boolean;
  needsDuration?: boolean;
  titleIssues?: string | null;
}): { embed: EmbedBuilder; bullets: number } {
  const {
    needsYoutube, needsTracker, needsTitle,
    needsRegion, needsRole, needsHours, needsSessions, needsStruggles, needsGoals,
    needsDeathmatch, firstVodSplitBlocked, needs1080p, needsPlayable, needsDuration,
    titleIssues,
  } = opts;

  const bullets: string[] = [];
  if (needsYoutube) bullets.push("• Add a **YouTube** link to your initial post");
  if (needsTracker) bullets.push("• Add a **tracker.gg** link to your initial post");
  if (needsTitle) {
    bullets.push("• Fix the thread title to: `Discord Name | Map | Agent | Rank`");
    if (titleIssues) bullets.push(titleIssues);
  }
  if (needsPlayable) bullets.push("• Your **YouTube VOD** must be **playable** (use **Unlisted**, not **Private**).");
  if (needsDuration) bullets.push("• Your **VOD** should be at least 19 rounds");
  if (needs1080p) bullets.push("• Your **YouTube VOD** must be **1080p** (≥ 1920×1080).");
  if (needsDeathmatch) bullets.push("• Because your rank is **Iron/Bronze/Silver/Gold**, include a **Deathmatch VOD** (mention “DM” or “Deathmatch”).");
  if (firstVodSplitBlocked) bullets.push("• Your **first VOD** cannot be **Split**. Choose a different map.");
  if (needsRegion) bullets.push("• Add your **Region**");
  if (needsRole) bullets.push("• Add your **Main Role** (Duelist, Initiator, Controller, Sentinel).");
  if (needsHours) bullets.push("• Add your **Hours per Week** you practice.");
  if (needsSessions) bullets.push("• Add your **Coaching Sessions** (e.g., none, first session, 2 sessions).");
  if (needsStruggles) bullets.push("• Describe your **Struggles**.");
  if (needsGoals) bullets.push("• Describe your **Goals**.");

  const hasIssues = bullets.length > 0;
  const embed = new EmbedBuilder()
    .setTitle(hasIssues ? TITLE_MISSING : TITLE_OK)
    .setDescription(
      hasIssues
        ? bullets.join("\n") + "\n\nPlease edit your initial message or the thread title."
        : "All requirements are satisfied!"
    );
  return { embed, bullets: bullets.length };
}

async function findExistingBotEmbed(thread: Threadish): Promise<Message | null> {
  const botId = thread.client.user?.id;
  if (!botId) return null;
  const msgs = await thread.messages.fetch({ limit: 50 }).catch(() => null);
  if (!msgs) return null;
  for (const [, m] of msgs) {
    if (m.author.id !== botId) continue;
    if (!m.embeds?.length) continue;
    const t = (m.embeds[0].data?.title as string | undefined) ?? m.embeds[0].title ?? "";
    if (t) return m;
  }
  return null;
}

async function cleanupAllOtherBotEmbeds(thread: Threadish, keepId?: string): Promise<void> {
  const botId = thread.client.user?.id;
  if (!botId) return;
  const msgs = await thread.messages.fetch({ limit: 50 }).catch(() => null);
  if (!msgs) return;
  const deletions: Promise<unknown>[] = [];
  for (const [, m] of msgs) {
    if (m.author.id !== botId) continue;
    if (!m.embeds?.length) continue;
    if (keepId && m.id === keepId) continue;
    deletions.push(m.delete().catch(() => undefined));
  }
  await Promise.all(deletions);
}

export async function upsertPostEmbed(params: {
  thread: Threadish;
  st: ThreadState;
  needsYoutube: boolean;
  needsTracker: boolean;
  needsTitle: boolean;
  needsRegion?: boolean;
  needsRole?: boolean;
  needsHours?: boolean;
  needsSessions?: boolean;
  needsStruggles?: boolean;
  needsGoals?: boolean;
  needsDeathmatch?: boolean;
  firstVodSplitBlocked?: boolean;
  needs1080p?: boolean;
  needsPlayable?: boolean;
  needsDuration?: boolean;
  titleIssues?: string | null;
}): Promise<void> {
  const { thread, st } = params;
  await withLock(thread.id, async () => {
    const { embed, bullets } = buildPostEmbed(params);

    if (bullets === 0) {
      if (st.requirementsMsgId) {
        const msg = await thread.messages.fetch(st.requirementsMsgId).catch(() => null);
        if (msg) await msg.delete().catch(() => undefined);
        st.requirementsMsgId = undefined;
      } else {
        const found = await findExistingBotEmbed(thread);
        if (found) await found.delete().catch(() => undefined);
      }
      await cleanupAllOtherBotEmbeds(thread);
      return;
    }

    const components =
      st.requestedManualReview
        ? [] // Hide button if already used
        : [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("post:request_review")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Request Manual Review")
            ),
          ];

    let target: Message | null = null;

    if (st.requirementsMsgId) {
      target = await thread.messages.fetch(st.requirementsMsgId).catch(() => null);
    }
    if (!target) {
      target = await findExistingBotEmbed(thread);
      if (target) st.requirementsMsgId = target.id;
    }

    if (target) {
      await target.edit({ embeds: [embed], content: "", components }).catch(() => undefined);
      await cleanupAllOtherBotEmbeds(thread, target.id);
      return;
    }

    const sent = await thread.send({ embeds: [embed], components }).catch(() => null);
    if (sent) {
      st.requirementsMsgId = sent.id;
      await cleanupAllOtherBotEmbeds(thread, sent.id);
    }
  });
}

export async function deletePostEmbed(thread: Threadish, st: ThreadState): Promise<void> {
  await withLock(thread.id, async () => {
    if (st.requirementsMsgId) {
      const msg = await thread.messages.fetch(st.requirementsMsgId).catch(() => null);
      if (msg) await msg.delete().catch(() => undefined);
      st.requirementsMsgId = undefined;
    } else {
      const found = await findExistingBotEmbed(thread);
      if (found) await found.delete().catch(() => undefined);
    }
    await cleanupAllOtherBotEmbeds(thread);
  });
}
