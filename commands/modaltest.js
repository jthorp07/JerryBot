const { CommandInteraction, SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const mssql = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modaltest')
        .setDescription('Testing modal use'),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mssql.ConnectionPool} con 
     */
    async execute(interaction, con) {

        let comps = new ActionRowBuilder()
            .setComponents([new TextInputBuilder()
                                .setCustomId('testtextinput')
                                .setLabel('Test Text Input')
                                .setPlaceholder('Enter some text')
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                            ]);

        interaction.showModal(
            new ModalBuilder()
                .setTitle('Test')
                .setCustomId('testmodal')
                .addComponents(comps)
        );

    },
    permissions: "all"
}