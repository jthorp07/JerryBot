import type { AnyThreadChannel, ThreadChannel, Client } from "discord.js";
import { PermissionsBitField } from "discord.js";

type Threadish = AnyThreadChannel | ThreadChannel;

async function fetchThread(client: Client, id: string) {
  const ch = await client.channels.fetch(id).catch(() => null);
  return ch && "isThread" in ch && (ch as ThreadChannel).isThread() ? (ch as AnyThreadChannel) : null;
}

function hasManageThreadsPerm(thread: AnyThreadChannel) {
  const me = thread.guild?.members.me;
  if (!me) return false;
  const p = me.permissions;
  return p.has(PermissionsBitField.Flags.ManageThreads) || p.has(PermissionsBitField.Flags.ManageChannels);
}

export async function deleteThreadSafe(thread: Threadish, reason: string) {
  try {
    const client = (thread as AnyThreadChannel).client as Client;
    const fresh = await client.channels.fetch((thread as AnyThreadChannel).id).catch(() => null);
    if (!fresh || !("isThread" in fresh) || !(fresh as ThreadChannel).isThread()) return;
    const t = fresh as AnyThreadChannel;
    if (t.archived) await t.setArchived(false, "Unarchive before delete").catch(() => undefined);
    await t.delete(reason);
  } catch {}
}

export async function scheduleDeletion(client: Client, thread: Threadish, delayMs: number, reason: string) {
  const id = (thread as AnyThreadChannel).id;
  const run = async () => {
    const t = await fetchThread(client, id);
    if (!t) return;
    if (!hasManageThreadsPerm(t)) return;
    try {
      if (t.archived) await t.setArchived(false, "Unarchive before delete").catch(() => undefined);
      await t.delete(reason);
    } catch {
      try {
        const again = await fetchThread(client, id);
        if (!again) return;
        if (!again.archived) await again.setArchived(true, "Fallback archive").catch(() => undefined);
        if (!again.locked) await again.setLocked(true, "Fallback lock").catch(() => undefined);
      } catch {}
    }
  };
  if (delayMs <= 0) {
    await run();
    return;
  }
  setTimeout(() => {
    run().catch(() => undefined);
  }, delayMs);
}

export async function getThreadAuthorId(thread: Threadish): Promise<string | null> {
  const starter = await (thread as AnyThreadChannel).fetchStarterMessage().catch(() => null);
  if (starter?.author?.id) return starter.author.id;
  return (thread as ThreadChannel).ownerId ?? null;
}

export async function getThreadCreatedTimestamp(thread: Threadish): Promise<number> {
  const starter = await (thread as AnyThreadChannel).fetchStarterMessage().catch(() => null);
  return starter?.createdTimestamp ?? (thread as ThreadChannel).createdTimestamp ?? Date.now();
}
