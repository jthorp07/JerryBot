const { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, VoiceChannel } = require('discord.js');
const { ConnectionPool, VarChar, Bit } = require('mssql');
const { beginOnErrMaker, commitOnErrMaker } = require('../util/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vc')
        .setDescription('Creates a personal voice channel for the user')
        .addNumberOption(option =>
            option.setMaxValue(16)
                .setMinValue(1)
                .setName('capacity')
                .setDescription('The number of people who will be able to be in the VC')
                .setRequired(false)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.deferReply({ ephemeral: true });

        // Create the channel in the Discord server
        let cap = interaction.options.getNumber('capacity');
        /**@type {VoiceChannel} */
        let channel;
        try {
            channel = await interaction.guild.channels.create({
                name: `${interaction.user.username}'s channel`,
                type: ChannelType.GuildVoice,
                reason: 'cmd'
            });
        } catch (err) {
            await interaction.editReply({ content: 'An error occured creating a new channel' });
            console.log(err);
            return;
        }

        // Begin a database transaction to store newly made channel's information
        let trans = con.transaction();
        await trans.begin(beginOnErrMaker(interaction, trans));

        let result = await con.request(trans)
            .input('ChannelName', 'VCCAT')
            .input('GuildId', interaction.guildId)
            .output('ChannelId', VarChar(21))
            .output('Triggerable', Bit)
            .output('Type', VarChar(20))
            .execute('GetChannel');

        let parentId = result.output.ChannelId;
        try {
            channel.edit((await channel.setUserLimit(cap ? cap : 99)).setParent(parentId));
        } catch (err) {
            console.log(err);
            await interaction.editReply({ content: 'Your channel could not be placed in the correct category. Make sure your server\'s staff have set up the "Private VC Category" channel with the /setchannel command!' });
            if (channel.deletable) {
                channel.delete();
            }
            return;
        }

        result = await con.request(trans)
            .input('GuildId', interaction.guildId)
            .input('ChannelId', channel.id)
            .input('ChannelName', channel.name)
            .input('ChannelType', 'voice')
            .input('Triggerable', 1)
            .execute('CreateChannel');

        interaction.editReply({ content: "All done! Your channel should be in the VC Category now!" });

        trans.commit(commitOnErrMaker(interaction));
    },
    permissions: "all"
}