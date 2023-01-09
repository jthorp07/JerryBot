const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const {ConnectionPool} = require('mssql');

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
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        let stringoption = interaction.options.getString('stringone');
        await interaction.reply({content: `Hello ${stringoption}`});

    },
    permissions: "all"
}