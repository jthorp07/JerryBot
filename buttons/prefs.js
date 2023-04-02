const { ButtonInteraction } = require('discord.js');
const { ConnectionPool, Bit } = require('mssql');
const { beginOnErrMaker, commitOnErrMaker } = require('../util/helpers');
const { prefsComps } = require('../util/components');
const { prefsEmbed } = require('../util/embeds');

module.exports = {

    data: {
        customId: "prefs", // customId of buttons that will execute this command
        permissions: "all",
    },

    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {ConnectionPool} con 
     * @param {any} idArgs 
     */
    async execute(interaction, con, idArgs) {

        await interaction.deferReply({ephemeral:true});

        let trans = con.transaction();
        await trans.begin(beginOnErrMaker(interaction, trans));

        let result = await con.request(trans)
            .input("UserId", interaction.user.id)
            .input("GuildId", interaction.guildId)
            .output("CanBeCaptain", Bit)
            .execute("GetPrefs");

        if (result.returnValue != 0) {
            await trans.rollback();
            await interaction.editReply({content:"Something went wrong and the interaction could not be completed"});
            return;
        }

        trans.commit(commitOnErrMaker(interaction));
        
        let comps = prefsComps(result.output.CanBeCaptain);
        let embeds = prefsEmbed(interaction.member.displayName, interaction.member.displayAvatarURL(), interaction.guild.name, result.output.CanBeCaptain);

        await interaction.editReply({embeds:embeds, components:comps});
    }
}