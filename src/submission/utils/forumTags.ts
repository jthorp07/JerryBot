import { ChannelType, type AnyThreadChannel, type ForumChannel } from "discord.js";
import { TAGS } from "../config";

export async function addTag(thread: AnyThreadChannel, tagId: string, reason = "auto") {
  if (!tagId) return;
  try {
    const cur = new Set(thread.appliedTags ?? []);
    if (!cur.has(tagId)) {
      cur.add(tagId);
      await thread.setAppliedTags([...cur], reason);
    }
  } catch {}
}

export async function removeTag(thread: AnyThreadChannel, tagId: string, reason = "auto") {
  if (!tagId) return;
  try {
    const cur = new Set(thread.appliedTags ?? []);
    if (cur.delete(tagId)) {
      await thread.setAppliedTags([...cur], reason);
    }
  } catch {}
}

export async function removeAnyNamed(
  thread: AnyThreadChannel,
  forum: ForumChannel,
  namesLower: string[],
  reason = "auto"
) {
  try {
    const byNameIds = forum.availableTags
      .filter(t => namesLower.includes(t.name.toLowerCase()))
      .map(t => t.id);
    if (!byNameIds.length) return;
    const cur = new Set(thread.appliedTags ?? []);
    let changed = false;
    for (const id of byNameIds) {
      if (cur.delete(id)) changed = true;
    }
    if (changed) await thread.setAppliedTags([...cur], reason);
  } catch {}
}

/** 30-day rule helper: if thread has Approved, swap to Denied */
export async function swapTagApprovedToDenied(thread: AnyThreadChannel): Promise<void> {
  try {
    const forum = thread.parent;
    if (!forum || forum.type !== ChannelType.GuildForum) return;

    const approvedId =
      TAGS.APPROVED ||
      forum.availableTags.find(t => t.name.toLowerCase() === "approved")?.id ||
      "";

    const deniedId =
      TAGS.DENIED ||
      forum.availableTags.find(t => t.name.toLowerCase() === "denied")?.id ||
      "";

    if (!deniedId) return;

    const cur = new Set(thread.appliedTags ?? []);
    let changed = false;

    if (approvedId && cur.has(approvedId)) {
      cur.delete(approvedId);
      changed = true;
    }
    if (!cur.has(deniedId)) {
      cur.add(deniedId);
      changed = true;
    }

    if (changed) {
      await thread.setAppliedTags([...cur], "30-day rule: Approved → Denied");
    }
  } catch {}
}
