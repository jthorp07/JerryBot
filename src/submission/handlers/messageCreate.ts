// src/handlers/messageCreate.ts
import { ChannelType, type AnyThreadChannel, type Message } from "discord.js";
import { ThreadStateStore } from "../state/threadState";
import { isPrivileged } from "../utils/isPrivileged";

export async function onMessageCreate(msg: Message) {
  if (msg.author?.bot) return;

  const thread = msg.channel as AnyThreadChannel;
  if (!("isThread" in thread) || !thread.isThread?.()) return;
  if (thread.parent?.type !== ChannelType.GuildForum) return;

  const st = ThreadStateStore.get(thread.id);
  if (!st) return;

  const member = msg.member ?? (await msg.guild?.members.fetch(msg.author.id).catch(() => null));
  if (isPrivileged(member)) return;

  const isAuthor = st.authorId === msg.author.id;
  const isStarter = st.starterId != null && msg.id === st.starterId;

  if (!isAuthor) {
    await msg.delete().catch(() => undefined);
    return;
  }

  if (st.moderationStatus === "denied") {
    return;
  }

  if (!isStarter) {
    await msg.delete().catch(() => undefined);
  }
}
