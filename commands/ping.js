const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const {ConnectionPool} = require('mssql');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	/**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
	async execute(interaction, con) {
		await interaction.reply({content: 'Pong!'});
	},
	permissions: 'all'
};