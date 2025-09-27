import { ChannelType, type AnyThreadChannel, type Message, type PartialMessage } from "discord.js";
import { ThreadStateStore } from "../state/threadState";

export async function onMessageDelete(message: Message | PartialMessage) {
  const msg = message.partial ? await message.fetch().catch(() => null) : message;
  if (!msg) return;
  const thread = (msg.channel as any) as AnyThreadChannel;
  if (!("isThread" in thread) || !thread.isThread?.()) return;
  if (thread.parent?.type !== ChannelType.GuildForum) return;
  const st = ThreadStateStore.get(thread.id);
  if (!st) return;
  if (st.starterId && msg.id === st.starterId) {
    ThreadStateStore.update(thread.id, { starterDeleted: true, starterId: null });
  }
}
