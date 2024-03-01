import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { exit } from "process";
import { setEventHandlers } from "./util";
import { initPerms } from "./util/permissions/permissions";
import { StartupEvents, StartupEvent } from "./util/startup/startup_manager";

config();
const TOKEN = process.env.TOKEN;
const USE_CUSTOM_PERMS = process.env.USE_CUSTOM_PERMISSIONS === "TRUE";

// Holy crap that's a lot of intention :flushed:
const intent_flags = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.GuildVoiceStates,
];

const client = new Client({ intents: intent_flags });
if (!client) {
  console.log("[Startup]: Failed to instantiate client");
  exit(1);
}

let checkPerms;
if (USE_CUSTOM_PERMS) checkPerms = initPerms();
setEventHandlers(client, checkPerms);

new StartupEvents(
  () => {
    client.login(TOKEN);
  }, 
  [StartupEvent.LeaderboardReady, StartupEvent.MetaDataReady]
);