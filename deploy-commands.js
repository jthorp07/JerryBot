const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const {CLIENT_ID, GUILD_ID, TOKEN} = require('./config.json');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

// For Guild Commands (for now, all commands will be Guild scope in the test server)
rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);



// This will be for Global scope commands (if applicable)

// rest.put(Routes.applicationGuildCommands(clientId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);