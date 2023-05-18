const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  Channel,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");
const { CHANNEL_TYPES } = require("../util");

const ChannelsByCategory = {
  CATEGORY_CHANNELS: ["vccat", "tenmancat"],
  VOICE_CHANNELS: ["tenmanlobby"],
  TEXT_CHANNELS: ["tenmantxt"],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Sets a channel for the server in the bot's database")
    .addStringOption((option) =>
      option
        .setName("channelname")
        .setDescription("The name of the channel")
        .setRequired(true)
        .addChoices(
          { name: "Private VC Category", value: "vccat" },
          { name: "Tenmans Category", value: "tenmancat" },
          { name: "Tenmans Waiting Area", value: "tenmanlobby" },
          { name: "Tenmans Text Channel", value: "tenmantxt" }
        )
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to be set")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });
    let channel = interaction.options.getChannel("channel");
    let channelName = interaction.options.getString("channelname");

    let validityCheck = validateType(channel, channelName);
    if (!validityCheck.valid) {
      interaction.editReply({
        content: `The channel provided was an invalid type. This channel should be a ${validityCheck.type} channel.`,
      });
      return;
    }

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let result = await db.createChannel(interaction.guildId, channel.id);

    if (result) {
      //TODO: Error
      await trans.rollback();
      await interaction.editReply({ content: "Something went wrong..." });
      return;
    }
    await db.commitTransaction(trans);

    await interaction.editReply({ content: "Channel Set" });
  },
  permissions: "admin",
};

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
      type: "category",
      dbType: CHANNEL_TYPES.CATEGORY,
    };
  }

  // Voice Channels
  if (ChannelsByCategory.VOICE_CHANNELS.indexOf(channelName) != -1) {
    return {
      valid: channel.type == ChannelType.GuildVoice,
      type: "voice",
      dbType: CHANNEL_TYPES.VOICE,
    };
  }

  // Text Channels
  if (ChannelsByCategory.TEXT_CHANNELS.indexOf(channelName) != -1) {
    return {
      valid: channel.type == ChannelType.GuildText,
      type: "text",
      dbType: CHANNEL_TYPES.TEXT,
    };
  }

  return { valid: false, type: "error", dbType: "error" }; // Should never reach here
}
