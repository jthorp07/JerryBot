const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const CLIENT_ID = process.env.PROD_CLIENT;
const TOKEN = process.env.PROD_TOKEN;
const GUILD_ID = process.env.DEV_SERVER;
const fs = require('fs');

if (!TOKEN) {
	console.log('token');
	return;
}

if (!CLIENT_ID) {
	console.log('client');
	return;
}

if (!GUILD_ID) {
	console.log('guild');
	return;
}

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

// For Guild Commands (for now, all commands will be Guild scope in the test server)
rest.put(Routes.applicationGuildCommands(CLIENT_ID, '710741097126821970'), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);



// This will be for Global scope commands (if applicable)

// rest.put(Routes.applicationGuildCommands(clientId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);