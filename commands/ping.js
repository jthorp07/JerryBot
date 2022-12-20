const { CommandInteraction, SlashCommandBuilder } = require('discord.js');
const mssql = require('mssql');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	/**
     * @param {CommandInteraction} interaction 
     * @param {mssql.ConnectionPool} con 
     */
	async execute(interaction, con) {
		await interaction.reply({content: 'Pong!'});
	},
	permissions: 'all'
};