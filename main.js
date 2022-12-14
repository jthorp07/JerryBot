const { Client, GatewayIntentBits, ComponentType, Events } = require("discord.js");
const { checkPermissions, Handlers, readCommands, readStringSelectMenus, readButtons } = require("./util");
const { fork } = require('child_process');
const process = require("process");
const { ConnectionPool } = require('mssql');


require('dotenv').config();
const TOKEN = process.env.TOKEN;
const SQL = {
	user: process.env.MSSQL_USER,
	password: process.env.MSSQL_PASSWORD,
	database: process.env.MSSQL_DATABASE,
	server: process.env.MSSQL_SERVER,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	},
	options: {
		encrypt: true,
		trustServerCertificate: true
	}
}

/*
 *	Launch a second process executing deploy-commands.js to ensure all 
 *	commands are up to date on Discord's end
 */
fork('./deploy-commands.js');

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
	GatewayIntentBits.GuildVoiceStates
];

var client = new Client({ intents: intent_flags });

/*
  Log in to database 
*/
console.log('[Startup]: Connecting to database');
/** @type {ConnectionPool} */
var con;
var pool = new ConnectionPool(SQL);
pool.connect().then(conPool => {
	con = conPool;
	console.log('[Startup]: Database connection ready');
})
	.catch(err => {
		console.log(err);
	});


// Read commands and interactable components into the bot's main memory
client = readCommands(client);
const btnCommands = readButtons();
const smCommands = readStringSelectMenus();

/**
 * Bot's listeners
 */
client.on(Events.ClientReady, () => {
	console.log("Bot Ready.");
});

// On joining a new Discord server
client.on(Events.GuildCreate, async (guild) => {
	await Handlers.onGuildCreate(guild, con);
});

// Events to handle on users joining/moving channels
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	await Handlers.onVoiceStateUpdate(oldState, newState, con);
})

// Command Handling
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	// Check user permissions
	checkPermissions(con, command.permissions, interaction.member.id)
		.then((perms) => {
			if (!perms) {
				interaction.reply(`Insufficient user permissions:\n\`\`\`Permission \'${command.permissions}\' required\`\`\``);
				return;
			}
			try {
				command.execute(interaction, con).then(() => {
					console.log(`Command executed`);
				});
			} catch (error) {
				console.error(error);
				interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
				return;
			}
		})
		.catch((err) => {
			console.log(err);
			return;
		});
});

// STRING select menus
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;

	// Handle selectmenus here...
	const smCommand = smCommands.get(interaction.customId);
	if (!smCommand) {
		interaction.reply(
			`This SelectMenu doesn't have a registered command. (ID = '${interaction.customId}')\nPlease send a report to a bot developer to have this fixed.`
		);
		return;
	}

	// WITH PERMISSIONS
	checkPermissions(con, smCommand.data.permissions, interaction.user.id).then((result) => {
		if (result == true) {
			try {
				smCommand.btnExecute(interaction, con);
				console.log(`SelectMenu handled`);
			} catch (err) {
				console.error(err);
				interaction.reply({ content: "There was an error while executing this button's command!", ephemeral: true });
				return;
			}
		} else {
			interaction.reply(`Insufficient user permissions:\nPermission \'${smCommand.data.permissions}\'`);
			console.log(`Insufficient permissions: Halting button handler`);
		}
	})
		.catch(err => {
			interaction.reply("Uh oh, something went wrong...");
			console.log(err);
			return;
		});
});

// Button interactions
client.on(Events.InteractionCreate, (interaction) => {
	if (!interaction.isButton()) return;

	if (!interaction.componentType === ComponentType.Button) return;

	// Handle buttons here...
	var btnCommand;

	btnCommand = btnCommands.get(interaction.buttonId);
	if (!btnCommand) {
		interaction.reply(
			`This button doesn't have a registered command. (ID = '${interaction.customId}')\nPlease send a report to a bot developer to have this fixed.`
		);
		return;
	}

	// permission check
	checkPermissions(con, btnCommand.data.permissions, interaction.user.id).then((result) => {
		if (result == true) {
			try {
				btnCommand.btnExecute(interaction, con);
				console.log(`Button handled`);
			} catch (err) {
				console.error(err);
				interaction.reply({ content: "There was an error while executing this button's command!", ephemeral: true });
				return;
			}
		} else {
			interaction.reply(`Insufficient user permissions:\nPermission \'${btnCommand.data.permissions}\'`);
		}
	})
		.catch(err => {
			interaction.reply("Uh oh, something went wrong...");
			console.log(err);
			return;
		});
});

client.login(TOKEN);
