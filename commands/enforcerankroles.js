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
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        let enforce = interaction.options.getBoolean('enforce');
        await interaction.deferReply({ephemeral: true});

        let trans = con.transaction();
        trans.begin(async (err) => {

            // DBMS error handling
            let rolledBack = false;
            trans.on("rollback", (aborted) => {
                if (aborted) {
                    console.log("This rollback was triggered by SQL server");
                }
                rolledBack = true;
                return;
            });

            trans.commit(async (err) => {
                if (err) {
                    trans.rollback();
                    interaction.editReply({ephemeral:true,content:'Something went wrong with the database o-o'});
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