import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  ChannelType,
  type AnyThreadChannel,
} from "discord.js";
import { TAGS } from "../config";
import { addTag, removeTag } from "../utils/forumTags";
import { ThreadStateStore } from "../state/threadState";
import { deletePostEmbed } from "../utils/postEmbed";

export const vodCommandData = new SlashCommandBuilder()
  .setName("vod")
  .setDescription("Moderation actions for VOD posts")
  .addSubcommand((sub) =>
    sub.setName("approve").setDescription("Approve this VOD thread"),
  )
  .addSubcommand((sub) =>
    sub.setName("deny").setDescription("Deny this VOD thread"),
  )
  .toJSON();

export async function handleVodCommand(ix: ChatInputCommandInteraction) {
  if (
    !ix.channel ||
    (ix.channel.type !== ChannelType.PublicThread &&
      ix.channel.type !== ChannelType.AnnouncementThread)
  ) {
    await ix
      .reply({
        ephemeral: true,
        content: "Run this inside a forum thread.",
      })
      .catch(() => undefined);
    return;
  }

  const thread = ix.channel as AnyThreadChannel;
  const st = ThreadStateStore.get(thread.id);
  if (!st) {
    await ix
      .reply({
        ephemeral: true,
        content: "Thread state unavailable.",
      })
      .catch(() => undefined);
    return;
  }

  const sub = ix.options.getSubcommand(true);

  if (sub === "approve") {
    ThreadStateStore.update(thread.id, { moderationStatus: "approved" });

    if (TAGS.DENIED) await removeTag(thread, TAGS.DENIED, "Approved");
    if (TAGS.PENDING) await removeTag(thread, TAGS.PENDING, "Approved");
    if (TAGS.READY_FOR_REVIEW) await removeTag(thread, TAGS.READY_FOR_REVIEW, "Approved");
    if (TAGS.APPROVED) await addTag(thread, TAGS.APPROVED, "Approved");

    await deletePostEmbed(thread, st).catch(() => undefined);

    await ix
      .reply({ ephemeral: true, content: "✅ Marked as **Approved**." })
      .catch(() => undefined);
    return;
  }

  if (sub === "deny") {
    ThreadStateStore.update(thread.id, { moderationStatus: "denied" });

    if (TAGS.APPROVED) await removeTag(thread, TAGS.APPROVED, "Denied");
    if (TAGS.PENDING) await removeTag(thread, TAGS.PENDING, "Denied");
    if (TAGS.READY_FOR_REVIEW) await removeTag(thread, TAGS.READY_FOR_REVIEW, "Denied");
    if (TAGS.DENIED) await addTag(thread, TAGS.DENIED, "Denied");

    await deletePostEmbed(thread, st).catch(() => undefined);

    await ix
      .reply({ ephemeral: true, content: "⛔ Marked as **Denied**." })
      .catch(() => undefined);
    return;
  }

  await ix
    .reply({ ephemeral: true, content: "Unknown subcommand." })
    .catch(() => undefined);
}
