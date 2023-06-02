const { ButtonInteraction, GuildMember } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const { QUEUE_STATES } = require("../util/");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
  selectCaptains,
  beginOnErrMaker,
  commitOnErrMaker,
} = require("../util/helpers");
const { QueueState, GCADBErrorCode } = require("../util/gcadb/enums");
module.exports = {
  data: {
    customId: "join-tenman", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },

  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    await interaction.deferReply({ ephemeral: true });
    let queueId = parseInt(idArgs[1]);

    /**
     * Check if user is in a voice channel (they have to be in one for this to work)
     * @type {GuildMember} */
    let user = interaction.member;
    if (!user.voice.channel) {
      interaction.editReply({
        ephemeral: true,
        content: `You must be in a voice channel before pressing this button <@${interaction.user.id}>!`,
      });
      return;
    }

    let trans = await db.beginTransaction();
    if (trans instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    // Join player to queue
    const joinQueueResult = await db.joinQueue(
      user.id,
      interaction.guildId,
      queueId
    );

    if (joinQueueResult instanceof BaseDBError) {
      let ret = joinQueueResult.code;
      let cnt = undefined;
      switch (ret) {
        case 6:
          cnt = "You are already in this queue!";
          break;
        case 2:
          cnt =
            "You need to register with /register before joining queues in this server!";
          break;
        case 5:
          cnt = "This server is enforcing rank roles and you do not have one!";
          break;
      }

      joinQueueResult.log();
      if (cnt) {
        
        await trans.rollback();
        await interaction.editReply({
          content: cnt,
        });
        return;
      } else {
        await trans.rollback();
        await interaction.editReply({
          content: "Something went wrong",
        });
        return;
      }
    }


    // Grab outputs from JoinQueue procedure
    let numCaptains = joinQueueResult.numCaptains;
    let queueStatus = joinQueueResult.queueStatus;
    let playersAndCanBeCapt = joinQueueResult.records.allPlayers;
    let playersAvailable = joinQueueResult.records.availablePlayers;
    let teamOnePlayers = joinQueueResult.records.teamOne;
    let teamTwoPlayers = joinQueueResult.records.teamTwo;
    // let spectators = joinQueueResult.recordsets[4];
    let host = await interaction.guild.members.fetch(
      joinQueueResult.hostId
    );

    // Grab guild's rank roles
    const getRankRolesResult = await db.getRankRoles(interaction.guildId);

    if (getRankRolesResult instanceof BaseDBError) {
      getRankRolesResult.log();
      await interaction.editReply({content:"Something went wrong"});
      await trans.rollback();
      return;
    }

    let rankedRoles = getRankRolesResult;

    // If necessary, choose captains
    if (queueStatus == QueueState.STARTING_DRAFT) {
      await db.commitTransaction(trans);

      const startDraftResult = await db.imStartingDraft(queueId);

      // start a new transaction after attempting to grab the draft
      let trans = await db.beginTransaction();
      if (!trans) {
        await interaction.editReply({
          content:
            "Something went wrong and the command could not be completed.",
        });
        return;
      }

      if (startDraftResult instanceof BaseDBError) {
        startDraftResult.log();
        return;
      } else if (startDraftResult.success) {
        let enforce = startDraftResult.enforce;
        // Assuming success, reassign values with updated data after selecting captaibns and starting draft
        let newVals = await selectCaptains(
          numCaptains,
          playersAndCanBeCapt,
          rankedRoles,
          interaction,
          queueId,
          db,
          trans,
          enforce
        );
        playersAvailable = newVals.newAvailable;
        teamOnePlayers = newVals.newTeamOne;
        teamTwoPlayers = newVals.newTeamTwo;
        queueStatus = newVals.newStatus;
      }  else {
        // Do nothing
      }
    }

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

    // Success, reply and commit transaction
    await db.commitTransaction(trans);

    interaction.editReply({
      ephemeral: true,
      content: `You are now in queue and in the 10 mans waiting area!\n\n**WARNING:**\nTo leave the queue, please either use the "Leave" button or leave all voice calls. Otherwise, you will be dragged back into a 10 mans call if/when you are assigned a team!\n<@${interaction.user.id}>`,
    });

    return;
  },
}
