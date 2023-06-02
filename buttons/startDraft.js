const { ButtonInteraction } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const {
  tenMansClassicNextComps,
  tenMansClassicNextEmbed,
  selectCaptains,
  beginOnErrMaker,
  commitOnErrMaker,
} = require("../util/helpers");

module.exports = {
  data: {
    customId: "start-draft", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {ButtonInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    // Defer, grab queueId from ID args, and start transaction
    await interaction.deferReply({ ephemeral: true });
    let queueId = parseInt(idArgs[1]);
    let hostId = idArgs[2];

    if (hostId != interaction.member.id) {
      await interaction.editReply({
        content: "You do not have permission to start the queue",
      });
      return;
    }

    let trans = await db.beginTransaction();
    if (trans instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      trans.log();
      return;
    }

    const result = await db.imManuallyStartingDraft(queueId, trans);
    if (result instanceof BaseDBError) {
      result.log();
      trans.rollback();
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    if (!result.success) {
      await interaction.editReply({ content: "Another request is already starting this queue" });
      return;
    }
    // Grab queue data

    const getQueueResult = await db.getQueue(queueId, trans);

    if (getQueueResult instanceof BaseDBError) {
      getQueueResult.log();
      trans.rollback();
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    if (getQueueResult.playerCount < 3) {
      interaction.editReply({
        content: "There are not enough players to start a draft.",
      });
      trans.rollback();
      return;
    }

    let numCaptains = getQueueResult.captainCount;
    let queueStatus = getQueueResult.queueStatus;
    let playersAndCanBeCapt = getQueueResult.records.allPlayers;
    let playersAvailable = getQueueResult.records.availablePlayers;
    let teamOnePlayers = getQueueResult.records.teamOne;
    let teamTwoPlayers = getQueueResult.records.teamTwo;
    //let spectators = result.recordsets[4];
    let host = await interaction.guild.members.fetch(getQueueResult.hostId);

    // Grab rankedroles for guild
    const rankedRoles = await db.getRankRoles(interaction.guildId, trans);
    if (rankedRoles instanceof BaseDBError) {
      rankedRoles.log();
      trans.rollback();
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    const newVals = await selectCaptains(
      numCaptains,
      playersAndCanBeCapt,
      rankedRoles,
      interaction,
      queueId,
      db,
      trans,
      result.enforce
    );
    playersAvailable = newVals.newAvailable;
    teamOnePlayers = newVals.newTeamOne;
    teamTwoPlayers = newVals.newTeamTwo;
    queueStatus = newVals.newStatus;

    // Commit transaction and respond on Discord
    await db.commitTransaction(trans);

    let embeds = tenMansClassicNextEmbed(
      queueStatus,
      playersAvailable,
      teamOnePlayers,
      teamTwoPlayers,
      null, // spectators
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

    interaction.message.edit({
      embeds: embeds,
      components: comps,
    });
  },
};
