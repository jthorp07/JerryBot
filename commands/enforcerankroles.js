const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { GCADB } = require('../util/gcadb');
const { beginOnErrMaker, commitOnErrMaker } = require('../util/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enforcerankroles')
        .setDescription('Sets whether or not rank roles will be required to queue in this server')
        .addBooleanOption(option =>
            option.setName('enforce')
                .setDescription('a string')
                .setRequired(true)),
    /**
     * 
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {GCADB} db 
     */
    async execute(interaction, db) {

        let enforce = interaction.options.getBoolean('enforce');
        await interaction.deferReply({ ephemeral: true });

        let trans = await db.beginTransaction();
        if (!trans) {
            await interaction.editReply({ content: 'Something went wrong and the command could not be completed.' });
            return;
        }
        
        // Set value in database
        let result = await db.setEnforceRankRoles(interaction.guildId, enforce);

        // Ensure valid database response
        if (result) {
            await interaction.editReply({ content: 'Something went wrong and the command could not be completed.' });
            trans.rollback();
            return;
        }

        // Commit transaction and respond on Discord
        await db.commitTransaction(trans);

        interaction.editReply({ ephemeral: true, content: `Rank roles will ${enforce ? 'now' : 'no longer'} be enforced on this server!` });
        return;
    },
    permissions: "all"
}