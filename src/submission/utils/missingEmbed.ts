// src/utils/missingEmbed.ts
import { EmbedBuilder, type AnyThreadChannel, type ThreadChannel } from "discord.js";
import type { ThreadState } from "../types";

type Threadish = AnyThreadChannel | ThreadChannel;

export function buildMissingInfoEmbed(opts: {
  needsYoutube: boolean;
  needsTracker: boolean;
  needsTitle: boolean;
  titleIssues?: string | null;
}): EmbedBuilder {
  const { needsYoutube, needsTracker, needsTitle, titleIssues } = opts;
  const problems: string[] = [];

  if (needsYoutube) problems.push("• Add a **YouTube** link to your initial post");
  if (needsTracker) problems.push("• Add a **tracker.gg** link to your initial post");
  if (needsTitle) {
    problems.push("• Fix the thread title to: `Discord Name | Map | Agent | Rank`");
    if (titleIssues) problems.push(titleIssues);
  }

  const title = problems.length ? "⚠️ Missing information detected" : "✅ Post looks good!";
  const desc = problems.length
    ? problems.join("\n") + "\n\nPlease edit your initial message or the thread title."
    : "All requirements are satisfied!";

  return new EmbedBuilder().setTitle(title).setDescription(desc);
}

export async function upsertMissingInfoEmbed(params: {
  thread: Threadish;
  st: ThreadState;
  needsYoutube: boolean;
  needsTracker: boolean;
  needsTitle: boolean;
  titleIssues?: string | null;
}): Promise<void> {
  const { thread, st, needsYoutube, needsTracker, needsTitle, titleIssues } = params;
  const embed = buildMissingInfoEmbed({ needsYoutube, needsTracker, needsTitle, titleIssues });
  try {
    if (st.requirementsMsgId) {
      const msg = await thread.messages.fetch(st.requirementsMsgId).catch(() => null);
      if (msg) {
        await msg.edit({ embeds: [embed], content: "" }).catch(() => undefined);
        return;
      }
    }
    const sent = await thread.send({ embeds: [embed] }).catch(() => null);
    if (sent) st.requirementsMsgId = sent.id;
  } catch {}
}

export async function deleteMissingInfoEmbed(thread: Threadish, st: ThreadState) {
  if (!st.requirementsMsgId) return;
  const msg = await thread.messages.fetch(st.requirementsMsgId).catch(() => null);
  if (msg) await msg.delete().catch(() => undefined);
  st.requirementsMsgId = undefined;
}
