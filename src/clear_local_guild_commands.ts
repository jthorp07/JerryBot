import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { exit } from "process";
import { join } from "path";
import { ICommand } from "./types/discord_interactions";

config();
const CLIENT = process.env.CLIENT;
const TOKEN = process.env.TOKEN;
const DEV_SERVER = process.env.WORTHY_SERVER;

if (!TOKEN) {
	console.log('[Deploy]: Missing environment variable TOKEN');
	exit(1);
}

if (!CLIENT) {
	console.log('[Deploy]: Missing environment variable CLIENT');
	exit(1);
}

if (!DEV_SERVER) {
	console.log('[Deploy-Dev]: Missing environment variable DEV_SERVER');
	exit();
}

const rest = new REST().setToken(TOKEN);

// For Guild Commands (for now, all commands will be Guild scope in the test server)
rest.put(Routes.applicationGuildCommands(CLIENT, DEV_SERVER), { body: [] })
	.then(() => console.log('[Deploy-Dev]: Successfully registered application commands to dev server.'))
	.catch(console.error);