import type { ForumChannel, AnyThreadChannel, ThreadChannel, Client, Channel } from "discord.js";
import { ThreadStateStore } from "../state/threadState";
import { FORUM_FILTER } from "../config";


export async function countUserActiveForumPosts(
  forumChannel: ForumChannel,
  userId: string,
  excludeThreadId?: string
): Promise<number> {
  let total = 0;
  const active = await forumChannel.threads.fetchActive().catch(() => null);
  if (!active?.threads?.size) return 0;

  for (const [, th] of active.threads) {
    if (excludeThreadId && th.id === excludeThreadId) continue;

    const aId = await getThreadAuthorId(th);
    if (aId !== userId) continue;

    const st = ThreadStateStore.get(th.id);
    if (st?.starterDeleted) continue;

    const starter = await th.fetchStarterMessage().catch(() => null);
    if (!starter) {
      if (st) {
        ThreadStateStore.update(th.id, { starterDeleted: true, starterId: null });
      } else {
        ThreadStateStore.set(th.id, {
          starterId: null,
          starterDeleted: true,
          authorId: aId,
          needsYoutube: false,
          needsTracker: false,
          needsTitle: false,
          blockWarnIds: [],
        } as any);
      }
      continue;
    }
    total++;
  }
  return total;
}


export async function countUserActiveAcrossAllowedForums(
  client: Client,
  userId: string,
  excludeThreadId?: string
): Promise<number> {
  if (!FORUM_FILTER.length) return 0;

  let total = 0;
  const uniqueForumIds = Array.from(new Set(FORUM_FILTER));
  for (const forumId of uniqueForumIds) {
    const ch = await safeFetchChannel(client, forumId);
    if (!ch || ch.type !== 15) continue;
    const forum = ch as ForumChannel;

    const active = await forum.threads.fetchActive().catch(() => null);
    if (!active?.threads?.size) continue;

    for (const [, th] of active.threads) {
      if (excludeThreadId && th.id === excludeThreadId) continue;

      const aId = await getThreadAuthorId(th);
      if (aId !== userId) continue;

      const st = ThreadStateStore.get(th.id);
      if (st?.starterDeleted) continue;

      const starter = await th.fetchStarterMessage().catch(() => null);
      if (!starter) {
        if (st) {
          ThreadStateStore.update(th.id, { starterDeleted: true, starterId: null });
        } else {
          ThreadStateStore.set(th.id, {
            starterId: null,
            starterDeleted: true,
            authorId: aId,
            needsYoutube: false,
            needsTracker: false,
            needsTitle: false,
            blockWarnIds: [],
          } as any);
        }
        continue;
      }
      total++;
    }
  }
  return total;
}

async function safeFetchChannel(client: Client, id: string): Promise<Channel | null> {
  return await client.channels.fetch(id).catch(() => null);
}

async function getThreadAuthorId(thread: AnyThreadChannel): Promise<string | null> {
  const starter = await thread.fetchStarterMessage().catch(() => null);
  if (starter?.author?.id) return starter.author.id;
  return (thread as ThreadChannel).ownerId ?? null;
}
