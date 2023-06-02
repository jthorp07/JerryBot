const { StringSelectMenuInteraction } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
} = require("../util/helpers");

module.exports = {
  data: {
    customId: "player-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {StringSelectMenuInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    await interaction.deferReply({ ephemeral: true });
    //TODO: Implement button command
    let draftedId = interaction.values[0];
    let queueId = parseInt(idArgs[1]);

    let trans = await db.beginTransaction();

    const getDraftPickIdResult = await db.getDraftPickId(draftedId, queueId, trans);

    if (getDraftPickIdResult instanceof BaseDBError) {
      await interaction.editReply({ content: "It is not your turn to pick!" });
      await trans.rollback();
      getDraftPickIdResult.log();
      return;
    }

    const draftPlayerResult = await db.draftPlayer(draftedId, interaction.guildId, queueId, trans);

    if (draftPlayerResult instanceof BaseDBError) {
      await interaction.editReply({
        content:
          "Something went wrong and the command could not be completed",
      });
      draftPlayerResult.log();
      trans.rollback();
      return;
    }

    let queueStatus = draftPlayerResult.queueStatus;
    let playersAvailable = draftPlayerResult.records.availablePlayers;
    let teamOnePlayers = draftPlayerResult.records.teamOne;
    let teamTwoPlayers = draftPlayerResult.records.teamTwo;
    let spectators = null;
    let host = await interaction.guild.members.fetch(
      draftPlayerResult.hostId
    );
    let team = draftPlayerResult.team;

    const getChannelResult = await db.getChannel(interaction.guildId, `QUEUE:${queueId}:${team}`, trans);

    if (getChannelResult instanceof BaseDBError) {
      await interaction.editReply({
        content:
          "Something went wrong and the command could not be completed",
      });
      getChannelResult.log();
      trans.rollback();
      return;
    }

    let channel = await interaction.guild.channels.fetch(
      getChannelResult.channelId
    );

    let embeds = tenMansClassicNextEmbed(
      queueStatus,
      playersAvailable,
      teamOnePlayers,
      teamTwoPlayers,
      spectators,
      host.displayName,
      host.displayAvatarURL(),
      null,
      0
    );

    let comps = tenMansClassicNextComps(
      queueId,
      queueStatus,
      playersAvailable,
      null,
      host.id
    );

    // Commit transaction and respond on Discord
    await db.commitTransaction(trans);

    let drafted = await interaction.guild.members.fetch(draftedId);
    try {
      drafted.voice.setChannel(channel);
    } catch (err) {
      await interaction.editReply({
        content: "User was unable to be moved into their team channel",
      });
      console.log(err);
    }

    await interaction.message.edit({
      embeds: embeds,
      components: comps,
    });
    await interaction.deleteReply();
    return;

  }
}

