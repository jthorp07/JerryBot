const { ConnectionPool } = require("mssql");
const { ButtonInteraction } = require("discord.js");
const { beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");
const { prefsEmbed } = require("../util/embeds");
const { prefsComps } = require("../util/components");

module.exports = {
    data: {
        customId: "toggle-canbecapt", // customId of buttons that will execute this command
        permissions: "all", //TODO: Implement other permission options
    },
    /**
     * @param {ButtonInteraction} interaction
     * @param {ConnectionPool} con
     * @param {string[]} idArgs
     */
    async execute(interaction, con, idArgs) {

        await interaction.deferReply({ephemeral:true});

        let trans = con.transaction();
        await trans.begin(beginOnErrMaker(interaction, trans));

        let result = await con.request(trans)
            .input('UserId', interaction.user.id)
            .input('GuildId', interaction.guildId)
            .input('CanBeCaptain', false)
            .execute('SetCanbeCaptain');

        if (result.returnValue != 0) {
            console.log("Invalid proc");
            await interaction.editReply({content: 'Something went wrong and the interaction could not be completed'});
            await trans.rollback();
            return;
        }

        trans.commit(commitOnErrMaker(interaction));

    }
}