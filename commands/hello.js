const { CommandInteraction, SlashCommandBuilder } = require('discord.js');
const mssql = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello')
        .addStringOption(option =>
            option.setName('stringone')
                .setDescription('a string')
                .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mssql.ConnectionPool} con 
     */
    async execute(interaction, con) {

        let stringoption = interaction.options.getString('stringone');
        await interaction.reply(`Hello ${stringoption}`);

    },
    permissions: "all"
}