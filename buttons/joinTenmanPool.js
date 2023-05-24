const { ButtonInteraction, GuildMember } = require("discord.js");
const { GCADB } = require("../util/gcadb");
const { QUEUE_STATES } = require("../util/");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
  selectCaptains,
  beginOnErrMaker,
  commitOnErrMaker,
} = require("../util/helpers");
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
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    // Join player to queue

    const joinQueueResult = await db.joinQueue(
      queueId,
      user.id,
      interaction.guildId
    );

    let ret = result.code;

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

    if (cnt) {
      await interaction.editReply({
        content: cnt,
      });
      return;
    }

    if (ret == 0) {
      // Grab outputs from JoinQueue procedure
      let numCaptains = joinQueueResult.output.NumCaptains;
      let queueStatus = joinQueueResult.output.QueueStatus;
      let playersAndCanBeCapt = joinQueueResult.recordsets[0];
      let playersAvailable = joinQueueResult.recordsets[1];
      let teamOnePlayers = joinQueueResult.recordsets[2];
      let teamTwoPlayers = joinQueueResult.recordsets[3];
      let spectators = joinQueueResult.recordsets[4];
      let host = await interaction.guild.members.fetch(
        joinQueueResult.output.HostId
      );

      // Grab guild's rank roles

      const getRankRolesResult = await db.getRankRoles(interaction.guildId);

      const rankedRoles = getRankRolesResult.recordset;

      // If necessary, choose captains
      if (queueStatus == QUEUE_STATES.TENMANS_STARTING_DRAFT) {
        await db.commitTransaction(trans);

        const startDraftResult = await db.startDraft(queueId);

        // start a new transaction after attempting to grab the draft
        await db.commitTransaction(trans);
        let trans = await db.beginTransaction();
        if (!trans) {
          await interaction.editReply({
            content:
              "Something went wrong and the command could not be completed.",
          });
          return;
        }

        if (!startDraftResult) {
          let enforce = startDraftResult.output.EnforceRankRoles;
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
        } else if (startDraftResult.returnValue != -1) {
        } else {
          console.log(startDraftResult.returnValue);
          return;
        }
      }

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
    } else {
      await trans.rollback();
      throw new Error(`Database failure: Code ${result.returnValue}`);
    }
  },
};
