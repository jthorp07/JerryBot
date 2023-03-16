const { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, Channel } = require('discord.js');
const { ConnectionPool } = require('mssql');
const { CHANNEL_TYPES } = require('../util');
const { beginOnErrMaker, commitOnErrMaker } = require('../util/helpers');

const ChannelsByCategory = {
    CATEGORY_CHANNELS: [
        'vccat',
        'tenmancat'
    ],
    VOICE_CHANNELS: [
        'tenmanlobby'
    ],
    TEXT_CHANNELS: [
        'tenmantxt'
    ]
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Sets a channel for the server in the bot\'s database')
        .addStringOption(option =>
            option.setName('channelname')
                .setDescription('The name of the channel')
                .setRequired(true)
                .addChoices(
                    { name: 'Private VC Category', value: 'vccat' },
                    { name: 'Tenmans Category', value: 'tenmancat' },
                    { name: 'Tenmans Waiting Area', value: 'tenmanlobby' },
                    { name: 'Tenmans Text Channel', value: 'tenmantxt' }
                ))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to be set')
                .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.deferReply({ ephemeral: true });
        let channel = interaction.options.getChannel('channel');
        let channelName = interaction.options.getString('channelname');

        let validityCheck = validateType(channel, channelName);
        if (!validityCheck.valid) {
            interaction.editReply({ content: `The channel provided was an invalid type. This channel should be a ${validityCheck.type} channel.` });
            return;
        }

        let trans = con.transaction();
        await trans.begin(beginOnErrMaker(interaction, trans));

        let result = await con.request(trans)
            .input('GuildId', interaction.guildId)
            .input('ChannelId', channel.id)
            .input('ChannelName', channelName.toUpperCase())
            .input('ChannelType', validityCheck.dbType)
            .input('Triggerable', 0)
            .execute('CreateChannel');

        if (result.returnValue !== 0) {
            //TODO: Error
            await trans.rollback();
            await interaction.editReply({ content: 'Something went wrong...' });
            return;
        }

        trans.commit(commitOnErrMaker(interaction));
        await interaction.editReply({ content: 'Channel Set' });

    },
    permissions: "admin"
}

/**
 * 
 * @param {Channel} channel 
 * @param {string} channelName 
 */
function validateType(channel, channelName) {

    // Categories
    if (ChannelsByCategory.CATEGORY_CHANNELS.indexOf(channelName) != -1) {
        return {
            valid: channel.type == ChannelType.GuildCategory,
            type: 'category',
            dbType: CHANNEL_TYPES.CATEGORY
        };
    }

    // Voice Channels
    if (ChannelsByCategory.VOICE_CHANNELS.indexOf(channelName) != -1) {
        return {
            valid: channel.type == ChannelType.GuildVoice,
            type: 'voice',
            dbType: CHANNEL_TYPES.VOICE
        };
    }

    // Text Channels
    if (ChannelsByCategory.TEXT_CHANNELS.indexOf(channelName) != -1) {
        return {
            valid: channel.type == ChannelType.GuildText,
            type: 'text',
            dbType: CHANNEL_TYPES.TEXT
        };
    }

    return { valid: false, type: 'error', dbType: 'error' }; // Should never reach here
}