import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { exit } from "process";
import { join } from "path";
import { ICommand } from "./types/discord_interactions";

config();
const CLIENT = process.env.CLIENT_DEV;
const TOKEN = process.env.TOKEN_DEV;
const DEV_SERVER = process.env.WORTHY_SERVER;

if (!TOKEN) {
	console.log('[Deploy-Dev]: Missing environment variable TOKEN');
	exit();
}

if (!CLIENT) {
	console.log('[Deploy-Dev]: Missing environment variable CLIENT');
	exit();
}

if (!DEV_SERVER) {
	console.log('[Deploy-Dev]: Missing environment variable DEV_SERVER');
	exit();
}

const commands = [];
const commandFiles = readdirSync(join(__dirname, './commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	try {
		console.log(`[Deploy-Dev]: Attempting to read command from file ${file}`);
		let path = join(__dirname, `./commands/${file}`);
		const command = require(path) as { default: ICommand };
		commands.push(command.default.data.toJSON());
		console.log(`[Deploy-Dev]: Read command from file ${file}`);
	} catch (err) {
		console.log(`[Deploy-Dev]: Failed to read command from file ${file}`);
	}
}

if (commands.length === 0) {
	console.log('[Deploy-Dev]: No commands to deploy.');
	exit(0);
}

const rest = new REST().setToken(TOKEN);

// For Guild Commands (for now, all commands will be Guild scope in the test server)
rest.put(Routes.applicationGuildCommands(CLIENT, DEV_SERVER), { body: commands })
	.then(() => console.log('[Deploy-Dev]: Successfully registered application commands to dev server.'))
	.catch(console.error);