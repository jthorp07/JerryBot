import {
  ChannelType,
  type ButtonInteraction,
  type AnyThreadChannel,
} from "discord.js";
import { addTag, removeTag } from "../utils/forumTags";
import { TAGS } from "../config";
import { ThreadStateStore } from "../state/threadState";

export async function onButtonRequestReview(ix: ButtonInteraction) {
  if (
    !ix.channel ||
    (ix.channel.type !== ChannelType.PublicThread &&
      ix.channel.type !== ChannelType.AnnouncementThread)
  ) {
    await ix.reply({ ephemeral: true, content: "Use this inside a forum thread." }).catch(() => undefined);
    return;
  }

  const thread = ix.channel as AnyThreadChannel;
  const st = ThreadStateStore.get(thread.id);
  if (!st) {
    await ix.reply({ ephemeral: true, content: "Thread state unavailable." }).catch(() => undefined);
    return;
  }

  // Only the original author can press
  if (st.authorId !== ix.user.id) {
    await ix.reply({ ephemeral: true, content: "Only the thread author can request review." }).catch(() => undefined);
    return;
  }

  // Switch tags
  if (TAGS.DENIED) await removeTag(thread, TAGS.DENIED, "User requested review");
  if (TAGS.APPROVED) await removeTag(thread, TAGS.APPROVED, "User requested review");
  if (TAGS.PENDING) await removeTag(thread, TAGS.PENDING, "User requested review");
  if (TAGS.READY_FOR_REVIEW) await addTag(thread, TAGS.READY_FOR_REVIEW, "User requested review");

  // Flag so upsertPostEmbed never re-adds the button
  ThreadStateStore.update(thread.id, { requestedManualReview: true });

  // Remove the button immediately
  if (ix.message && "edit" in ix.message) {
    await ix.message.edit({ components: [] }).catch(() => undefined);
  }

  await ix.reply({
    ephemeral: true,
    content: "Marked as reviewing. A moderator will take a look.",
  }).catch(() => undefined);
}
