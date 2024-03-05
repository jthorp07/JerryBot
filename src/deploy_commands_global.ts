import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { exit } from "process";
import { join } from "path";
import { ICommand } from "./types/discord_interactions";

config();
const CLIENT = process.env.CLIENT_DEV;
const TOKEN = process.env.TOKEN_DEV;

if (!TOKEN) {
	console.log('[Deploy]: Missing environment variable TOKEN');
	exit(1);
}

if (!CLIENT) {
	console.log('[Deploy]: Missing environment variable CLIENT');
	exit(1);
}

const commands = [];
const commandFiles = readdirSync(join(__dirname, `./commands`)).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	try {
		console.log(`[Deploy]: Attempting to read command from file ${file}`);
		let path = join(__dirname, `./commands/${file}`);
		const command = require(path) as { default: ICommand };
		commands.push(command.default.data.toJSON());
		console.log(`[Deploy]: Read command from file ${file}`);
	} catch (err) {
		console.log(`[Deploy]: Failed to read command from file ${file}\n  ${err}`);
	}
}

if (commands.length === 0) {
	console.log('[Deploy]: No commands to deploy.');
	exit(0);
}

const rest = new REST().setToken(TOKEN);

// For Guild Commands (for now, all commands will be Guild scope in the test server)
rest.put(Routes.applicationCommands(CLIENT), { body: commands })
	.then(() => console.log('[Deploy]: Successfully registered application commands globally.'))
	.catch(console.error);