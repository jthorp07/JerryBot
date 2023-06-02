const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  VoiceChannel,
} = require("discord.js");
const { GCADB, BaseDBError, DiscordChannelName, DiscordChannelType } = require("../util/gcadb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc")
    .setDescription("Creates a personal voice channel for the user")
    .addNumberOption((option) =>
      option
        .setMaxValue(16)
        .setMinValue(1)
        .setName("capacity")
        .setDescription("The number of people who will be able to be in the VC")
        .setRequired(false)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });

    // Create the channel in the Discord server
    let cap = interaction.options.getNumber("capacity");
    /**@type {VoiceChannel} */
    let channel;
    try {
      channel = await interaction.guild.channels.create({
        name: `${interaction.user.username}'s channel`,
        type: ChannelType.GuildVoice,
        reason: "cmd",
      });
    } catch (err) {
      await interaction.editReply({
        content: "An error occured creating a new channel",
      });
      console.log(err);
      return;
    }

    // Begin a database transaction to store newly made channel's information
    let trans = await db.beginTransaction();
    if (trans instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    const result = await db.getChannel(interaction.guildId, DiscordChannelName.PRIVATE_VC_CATEGORY);

    let parentId = result.channelId;
    try {
      channel.edit(
        (await channel.setUserLimit(cap ? cap : 99)).setParent(parentId)
      );
    } catch (err) {
      console.log(err);
      await interaction.editReply({
        content:
          'Your channel could not be placed in the correct category. Make sure your server\'s staff have set up the "Private VC Category" channel with the /setchannel command!',
      });
      if (channel.deletable) {
        channel.delete();
      }
      return;
    }

    const result2 = await db.createChannel(
      interaction.guildId,
      channel.id,
      channel.name,
      DiscordChannelType.VOICE,
      true,
      trans
    );

    if (result2) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      result2.log();
      trans.rollback();
      return;
    }

    // Commit transaction and respond on Discord
    interaction.editReply({
      content: "All done! Your channel should be in the VC Category now!",
    });
    await db.commitTransaction(trans);
  },
  permissions: "all",
};
