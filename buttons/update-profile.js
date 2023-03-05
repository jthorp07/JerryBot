const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");
const { getRoleIcon } = require("../util/helpers");

module.exports = {
    data: {
        customId: "update-profile", // customId of buttons that will execute this command
        permissions: "all", //TODO: Implement other permission options
    },
    /**
     *
     * @param {ButtonInteraction} interaction
     * @param {ConnectionPool} con
     * @param {string[]} idArgs
     */
    async execute(interaction, con, idArgs) {
        //TODO: Implement button command
        await interaction.deferReply({ ephemeral: true });

        let trans = con.transaction();
        trans.begin(async (err) => {

            if (err) {
                await interaction.editReply({ content: "Something went wrong" });
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

            let result = await con.request(trans)
                .input('GuildId', interaction.guildId)
                .execute('GetRankRoles');

            if (!result.returnValue == 0) {
                trans.rollback();
                await interaction.editReply({ content: 'There was an error fetching your profile' });
                return;
            }

            let rankedRoles = result.recordset;
            let roleIcon = getRoleIcon(rankedRoles, interaction.member);

            console.log(JSON.stringify(roleIcon));

            result = await con.request(trans)
                .input('UserId', interaction.user.id)
                .input('GuildId', interaction.guildId)
                .input('Username', interaction.user.username)
                .input('GuildDisplayName', interaction.member.displayName)
                .input('IsOwner', (interaction.guild.ownerId == interaction.member.id))
                .input('CurrentRank', roleIcon ? roleIcon.rank : null)
                .input('HasRank', roleIcon ? true : false)
                .execute('UpdateDiscordProfile');

            if (!result.returnValue == 0) {
                trans.rollback();
                await interaction.editReply({ content: 'There was an error fetching your profile' });
                return;
            }

            if (!result.returnValue == 0) {
                trans.rollback();
                await interaction.editReply({ content: 'There was an error fetching your profile' });
                return;
            }

            // TODO: Update profile message to reflect changes & reply indicating success
            trans.commit(async (err) => {

                if (err) {
                    await interaction.editReply({ content: 'There was an error updating your profile' });
                    console.log(err);
                    return;
                }

                await interaction.editReply({content: 'Profile updated'});
                return;

            });

        });
    },
};