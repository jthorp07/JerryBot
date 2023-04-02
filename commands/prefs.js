const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const {ConnectionPool, Bit} = require('mssql');
const { beginOnErrMaker, commitOnErrMaker } = require('../util/helpers');
const { prefsComps } = require('../util/components');
const { prefsEmbed } = require('../util/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefs')
        .setDescription('Displays a user\'s preferences and allows them to edit their preferences'),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

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

    },
    permissions: "all"
}