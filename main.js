const { Client, GatewayIntentBits, Events, ActivityType } = require("discord.js");
const {
  Handlers,
  readCommands,
  readStringSelectMenus,
  readButtons,
  readModals,
} = require("./util");
const { fork } = require("child_process");
const process = require("process");
const { getConnection, GCADB } = require("./util/gcadb");

require("dotenv").config();
const TOKEN = process.env.PROD_TOKEN;

// const SQL = {
//   user: process.env.PROD_MSSQL_USER,
//   password: process.env.PROD_MSSQL_PASSWORD,
//   database: process.env.PROD_MSSQL_DATABASE,
//   server: process.env.PROD_MSSQL_SERVER,
//   pool: {
//     max: 10,
//     min: 2,
//     idleTimeoutMillis: Number.MAX_SAFE_INTEGER,
//   },
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };

/*
 *	Launch a second process executing deploy-commands.js to ensure all
 *	commands are up to date on Discord's end
 */
fork("./deploy-commands.js");
fork("./deploy-gca.js");

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

var client = new Client({ intents: intent_flags });

/*
  Log in to database 
*/
console.log("[Startup]: Connecting to database");
/**@type {GCADB} */
let db = null



// Read commands and interactable components into the bot's main memory
client = readCommands(client);


const knownInteractions = {
  commands: client.commands,
  stringSelects: null,
  buttons: null,
  modals: null,
};

/**
 * Bot's listeners
 */
client.on(Events.ClientReady, () => {
  client.user.setActivity('over Gamer\'s Coaching Academy', {type: ActivityType.Watching});
  console.log("  [Bot]: Ready.");
});

// Command Handling
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    Handlers.onInteractionCreate(interaction, db, knownInteractions);
  } catch (err) {
    console.log(err);
    return;
  }
});

client.login(TOKEN);
