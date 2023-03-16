const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { ConnectionPool } = require('mssql');
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
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        let enforce = interaction.options.getBoolean('enforce');
        await interaction.deferReply({ ephemeral: true });

        let trans = con.transaction();
        await trans.begin(beginOnErrMaker(interaction, trans));
        // Set value in database
        let result = await con.request(trans)
            .input('Enforce', enforce ? 1 : 0)
            .input('GuildId', interaction.guildId)
            .execute('SetEnforceRankRoles');

        // Ensure valid database response
        if (result.returnValue != 0) {
            await interaction.editReply({ content: 'Something went wrong and the command could not be completed.' });
            trans.rollback();
            return;
        }

        // Commit transaction and respond on Discord
        trans.commit(commitOnErrMaker(interaction));

        interaction.editReply({ ephemeral: true, content: `Rank roles will ${enforce ? 'now' : 'no longer'} be enforced on this server!` });
        return;
    },
    permissions: "all"
}