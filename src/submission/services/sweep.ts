import { ChannelType, PermissionsBitField, type AnyThreadChannel } from "discord.js";
import { TIMES } from "../config";
import { getThreadAuthorId, getThreadCreatedTimestamp, deleteThreadSafe } from "../utils/threadOps";
import { swapTagApprovedToDenied } from "../utils/forumTags";

export async function sweepAllForums(client: import("discord.js").Client) {
  for (const [, guild] of client.guilds.cache) {
    const me = guild.members.me ?? (await guild.members.fetch(client.user!.id).catch(() => null));
    if (!me) continue;

    const canManage =
      me.permissions.has(PermissionsBitField.Flags.ManageThreads) ||
      me.permissions.has(PermissionsBitField.Flags.ManageChannels);

    const channels = await guild.channels.fetch().catch(() => null);
    if (!channels) continue;

    for (const [, ch] of channels) {
      if (!ch || ch.type !== ChannelType.GuildForum) continue;

      const active = await ch.threads.fetchActive().catch(() => null);
      if (active?.threads?.size) {
        for (const [, th] of active.threads) {
          await processAging(th);
        }
      }

      if (canManage) {
        const archived = await ch.threads.fetchArchived({ type: "public" }).catch(() => null);
        if (archived?.threads?.size) {
          for (const [, th] of archived.threads) {
            await processAging(th);
          }
        }
      }
    }
  }
}

export async function processAging(thread: AnyThreadChannel) {
  try {
    const createdTs = await getThreadCreatedTimestamp(thread);
    const age = Date.now() - createdTs;

    if (age >= TIMES.THIRTY_ONE_DAYS) {
      await deleteThreadSafe(thread, "Auto-delete after 31 days");
      return;
    }

    if (age >= TIMES.THIRTY_DAYS) {
      const authorId = await getThreadAuthorId(thread);
      if (authorId) {
        if (thread.joinable) await thread.join().catch(() => undefined);
        await thread
          .send(
            `<@${authorId}> This submission has passed the **30-day** limit and **will be deleted tomorrow**.`
          )
          .catch(() => undefined);
      }
      await swapTagApprovedToDenied(thread).catch(() => undefined);
    }
  } catch {}
}
