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
const { ConnectionPool } = require("mssql");

require("dotenv").config();
const TOKEN = process.env.TOKEN;
const SQL = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  server: process.env.MSSQL_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

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
/** @type {ConnectionPool} */
var con;
var pool = new ConnectionPool(SQL);
pool
  .connect()
  .then((conPool) => {
    con = conPool;
    console.log("[Startup]: Database connection ready");
  })
  .catch((err) => {
    console.log(err);
  });

// Read commands and interactable components into the bot's main memory
client = readCommands(client);
const btnCommands = readButtons();
const smCommands = readStringSelectMenus();
const modalInteractions = readModals();

const knownInteractions = {
  commands: client.commands,
  stringSelects: smCommands,
  buttons: btnCommands,
  modals: modalInteractions,
};

/**
 * Bot's listeners
 */
client.on(Events.ClientReady, () => {
  client.user.setActivity('over Gamer\'s Coaching Academy', {type: ActivityType.Watching});
  console.log("Bot Ready.");
});

// On joining a new Discord server
client.on(Events.GuildCreate, async (guild) => {
  try {
    Handlers.onGuildCreate(guild, con);
  } catch (err) {
    console.log(err);
    return;
  }
});

// Events to handle on users joining/moving channels
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    Handlers.onVoiceStateUpdate(oldState, newState, con);
  } catch (err) {
    console.log(err);
    return;
  }
});

// Command Handling
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    Handlers.onInteractionCreate(interaction, con, knownInteractions);
  } catch (err) {
    console.log(err);
    return;
  }
});

client.login(TOKEN);
