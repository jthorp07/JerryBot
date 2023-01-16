const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { ConnectionPool, Int } = require('mssql');
const { tenMansStartEmbed } = require('../util/embeds');
const { tenMansStartComps } = require('../util/components');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settenmans')
        .setDescription('Launches a ten mans lobby hosted by the user'),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.deferReply({ ephemeral: true });

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

            let playerCount = -1;
            let result = await con.request(trans)
                .input('GuildId', interaction.guildId)
                .output('NumCaptains', Int)
                .output('PlayerCount', Int, playerCount)
                .execute('GetTenmansQueue');

            let embed;
            if (playerCount !== 0) {
                let playersValue = '';
                let playerListRecords = result.recordset;
                for (record of playerListRecords) {
                    let member =  await interaction.guild.members.fetch(record.memberId);

                }

            } else {
                embed = tenMansStartEmbed(undefined, undefined, interaction.member.displayName, interaction.member.displayAvatarURL());
            }

            trans.commit(async (err) => {
                if (err) {
                    console.log(err);
                    await interaction.editReply({ ephemeral: true, content: "Something went wrong, sorry!" });
                    // TODO: Have bot report error
                    return;
                }
                return;
            });

        })


    },
    permissions: "all"
}