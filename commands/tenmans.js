const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const {ConnectionPool} = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settenmans')
        .setDescription('todo')
        .addStringOption(option =>
            option.setName('todo')
                .setDescription('todo')
                .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        let stringoption = interaction.options.getString('todo');
        await interaction.reply(`Hello ${stringoption}`);

    },
    permissions: "all"
}