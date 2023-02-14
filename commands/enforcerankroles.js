const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const {ConnectionPool} = require('mssql');

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
        await interaction.deferReply({ephemeral: true});

        let trans = con.transaction();
        trans.begin(async (err) => {

            // Transaction begin error
            if (err) {
                await interaction.editReply({content: 'Something went wrong and the command could not be completed.'});
                console.log(err);
                return;
            }

            // DBMS error handling
            let rolledBack = false;
            trans.on("rollback", (aborted) => {
                if (aborted) {
                    console.log("This rollback was triggered by SQL server");
                }
                rolledBack = true;
                return;
            });

            // Set value in database
            let result = await con.request(trans)
                .input('Enforce', enforce ? 1 : 0)
                .input('GuildId', interaction.guildId)
                .execute('SetEnforceRankRoles');

            // Ensure valid database response
            if (result.returnValue != 0) {
                await interaction.editReply({content: 'Something went wrong and the command could not be completed.'});
                trans.rollback();
                return;
            }

            // Commit transaction and respond on Discord
            trans.commit(async (err) => {
                if (err) {
                    trans.rollback();
                    interaction.editReply({ephemeral:true,content:'Something went wrong and the command could not be completed.'});
                    console.log(err);
                    return;
                }

                interaction.editReply({ephemeral:true,content:`Rank roles will ${enforce ? 'now':'no longer'} be enforced on this server!`});
                return;
            });

        })

    },
    permissions: "all"
}