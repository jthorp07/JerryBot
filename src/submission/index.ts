import { Client, Events, GatewayIntentBits, Partials, REST, Routes, InteractionType, ChannelType, type AnyThreadChannel } from "discord.js";
import { BOT_TOKEN, TIMES, TAGS } from "./config";
import { sweepAllForums } from "./services/sweep";
import { onThreadCreate } from "./handlers/threadCreate";
import { onMessageUpdate } from "./handlers/messageUpdate";
import { onMessageDelete } from "./handlers/messageDelete";
import { onMessageCreate } from "./handlers/messageCreate";
import { onThreadUpdate } from "./handlers/threadUpdate";
import { rehydrateForums } from "./services/rehydrate";
import { vodCommandData, handleVodCommand } from "./commands/modActions";
import { ThreadStateStore } from "./state/threadState";
import { addTag, removeTag } from "./utils/forumTags";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN missing");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel],
});

client.once(Events.ClientReady, async () => {
  if (!client.user) return;
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
    for (const [, guild] of client.guilds.cache) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: [vodCommandData] }
      );
      console.log(`Registered /vod in guild ${guild.name} (${guild.id})`);
    }
  } catch (e) {
    console.error("Failed to register slash commands:", e);
  }

  await rehydrateForums(client).catch(console.error);
  sweepAllForums(client).catch(console.error);
  setInterval(() => sweepAllForums(client).catch(console.error), TIMES.DAY_MS);
});

client.on(Events.ShardResume, () => {
  rehydrateForums(client).catch(() => undefined);
});

client.on(Events.InteractionCreate, async (ix) => {
  try {
    if (ix.isButton()) {
      if (ix.customId === "post:request_review") {
        if (!ix.channel || (ix.channel.type !== ChannelType.PublicThread && ix.channel.type !== ChannelType.AnnouncementThread)) {
          await ix.reply({ ephemeral: true, content: "Use this inside a forum thread." }).catch(() => undefined);
          return;
        }
        const thread = ix.channel as AnyThreadChannel;
        const st = ThreadStateStore.get(thread.id);
        if (!st) {
          await ix.reply({ ephemeral: true, content: "Thread state unavailable." }).catch(() => undefined);
          return;
        }

        const isAuthor = st.authorId === ix.user.id;
        const canManage = ix.memberPermissions?.has("ManageThreads") || ix.memberPermissions?.has("ManageChannels");
        if (!isAuthor && !canManage) {
          await ix.reply({ ephemeral: true, content: "Only the thread author or staff can request review." }).catch(() => undefined);
          return;
        }

        if (TAGS.DENIED) await removeTag(thread, TAGS.DENIED, "Request review");
        if (TAGS.APPROVED) await removeTag(thread, TAGS.APPROVED, "Request review");
        if (TAGS.PENDING) await removeTag(thread, TAGS.PENDING, "Request review");
        if (TAGS.READY_FOR_REVIEW) await addTag(thread, TAGS.READY_FOR_REVIEW, "Request review");

        await ix.reply({ ephemeral: true, content: "Marked as reviewing. A moderator will take a look." }).catch(() => undefined);
        return;
      }
    }

    if (ix.type !== InteractionType.ApplicationCommand) return;
    if (!ix.isChatInputCommand()) return;
    if (ix.commandName === "vod") {
      await handleVodCommand(ix);
    }
  } catch (e) {
    console.error("Interaction error:", e);
    if (ix.isRepliable()) {
      await ix.reply({ ephemeral: true, content: "Something went wrong." }).catch(() => undefined);
    }
  }
});

client.on(Events.ThreadCreate, (thread, newlyCreated) => onThreadCreate(client, thread, newlyCreated));
client.on(Events.MessageUpdate, (a, b) => onMessageUpdate(a, b));
client.on(Events.MessageDelete, (m) => onMessageDelete(m));
client.on(Events.MessageCreate, (m) => onMessageCreate(m));
client.on(Events.ThreadUpdate, (a, b) => onThreadUpdate(a as any, b as any));

client.login(BOT_TOKEN).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});
