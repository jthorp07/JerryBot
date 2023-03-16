const { ButtonInteraction, GuildMember } = require("discord.js");
const { ConnectionPool, Int, NVarChar, VarChar, Bit, Transaction } = require("mssql");
const { QUEUE_STATES } = require("../util/");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
  selectCaptains,
  beginOnErrMaker,
  commitOnErrMaker
} = require("../util/helpers");
module.exports = {
  data: {
    customId: "join-tenman", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  // async execute(interaction, con, idArgs) {
  //   await interaction.deferReply({ ephemeral: true });
  //   let queueId = parseInt(idArgs[1]);

  //   /**
  //    * Check if user is in a voice channel (they have to be in one for this to work)
  //    * @type {GuildMember} */
  //   let user = interaction.member;
  //   if (!user.voice.channel) {
  //     interaction.editReply({
  //       ephemeral: true,
  //       content: `You must be in a voice channel before pressing this button <@${interaction.user.id}>!`,
  //     });
  //     return;
  //   }

  //   let trans = con.transaction();
  //   trans.begin(async (err) => {

  //     if (err) {
  //       console.log(err);
  //       await interaction.editReply({ content: "Something went wrong and you could not be joined to the queue" });
  //       return;
  //     }

  //     // DBMS error handling
  //     let rolledBack = false;
  //     trans.on("rollback", (aborted) => {
  //       if (aborted) {
  //         console.log("This rollback was triggered by SQL server");
  //       }
  //       rolledBack = true;
  //       return;
  //     });

  //     // Join player to queue
  //     let result = await con
  //       .request(trans)
  //       .input("GuildId", interaction.guildId)
  //       .input("UserId", user.id)
  //       .input("QueueId", queueId)
  //       .output("NumPlayers", Int)
  //       .output("NumCaptains", Int)
  //       .output("QueueStatus", NVarChar(100))
  //       .output("HostId", VarChar(21))
  //       .execute("JoinQueue");

  //     let ret = result.returnValue;

  //     let cnt = undefined;
  //     switch (ret) {
  //       case 6:
  //         cnt = "You are already in this queue!";
  //         break;
  //       case 2:
  //         cnt = "You need to register with /register before joining queues in this server!";
  //         break;
  //       case 5:
  //         cnt = "This server is enforcing rank roles and you do not have one!";
  //         break;
  //     }

  //     if (cnt) {
  //       await interaction.editReply({
  //         content:
  //           cnt,
  //       });
  //       return;
  //     }

  //     if (ret == 0) {
  //       // Grab outputs from JoinQueue procedure
  //       let numCaptains = result.output.NumCaptains;
  //       let queueStatus = result.output.QueueStatus;
  //       let playersAndCanBeCapt = result.recordsets[0];
  //       let playersAvailable = result.recordsets[1];
  //       let teamOnePlayers = result.recordsets[2];
  //       let teamTwoPlayers = result.recordsets[3];
  //       let spectators = result.recordsets[4];
  //       let host = await interaction.guild.members.fetch(result.output.HostId);

  //       // Grab guild's rank roles
  //       result = await con.request(trans)
  //         .input("GuildId", interaction.guildId)
  //         .execute("GetRankRoles");

  //       let rankedRoles = result.recordset;

  //       // If necessary, choose captains
  //       if (queueStatus == QUEUE_STATES.TENMANS_STARTING_DRAFT) {

  //         result = await con.request()
  //           .input("QueueId", queueId)
  //           .output("EnforceRankRoles", Bit)
  //           .execute("ImStartingDraft");

  //         if (result.returnValue == 0) {

  //           let enforce = result.output.EnforceRankRoles;
  //           // Assuming success, reassign values with updated data after selecting captaibns and starting draft
  //           let newVals = await selectCaptains(
  //             numCaptains,
  //             playersAndCanBeCapt,
  //             rankedRoles,
  //             interaction,
  //             queueId,
  //             con,
  //             trans,
  //             enforce
  //           );
  //           playersAvailable = newVals.newAvailable;
  //           teamOnePlayers = newVals.newTeamOne;
  //           teamTwoPlayers = newVals.newTeamTwo;
  //           queueStatus = newVals.newStatus;
  //         } else if (result.returnValue != -1) {



  //         }
  //         else {
  //           console.log("Idk what's happening");
  //           return;
  //         }
  //       }

  //       let embeds = tenMansClassicNextEmbed(
  //         queueStatus,
  //         playersAvailable,
  //         teamOnePlayers,
  //         teamTwoPlayers,
  //         spectators,
  //         host.displayName,
  //         host.displayAvatarURL(),
  //         null,
  //         0
  //       );

  //       let comps = tenMansClassicNextComps(
  //         queueId,
  //         queueStatus,
  //         playersAvailable,
  //         null,
  //         host.id
  //       );

  //       interaction.message.edit({
  //         embeds: embeds,
  //         components: comps,
  //       });

  //       // Success, reply and commit transaction
  //       trans.commit(async (err) => {
  //         if (err) {
  //           console.log(err);
  //           await interaction.editReply({
  //             ephemeral: true,
  //             content:
  //               "Something went wrong and the command could not be completed.",
  //           });
  //           // TODO: Have bot report error
  //           return;
  //         }

  //         interaction.editReply({
  //           ephemeral: true,
  //           content: `You are now in queue and in the 10 mans waiting area!\n\n**WARNING:**\nTo leave the queue, please either use the "Leave" button or leave all voice calls. Otherwise, you will be dragged back into a 10 mans call if/when you are assigned a team!\n<@${interaction.user.id}>`,
  //         });

  //         return;
  //       });
  //     } else {
  //       await trans.rollback();
  //       throw new Error(`Database failure: Code ${result.returnValue}`);
  //     }
  //   });
  // },

  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
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

    let trans = con.transaction();
    await trans.begin(beginOnErrMaker(interaction, trans));

    // Join player to queue
    let result = await con
      .request(trans)
      .input("GuildId", interaction.guildId)
      .input("UserId", user.id)
      .input("QueueId", queueId)
      .output("NumPlayers", Int)
      .output("NumCaptains", Int)
      .output("QueueStatus", NVarChar(100))
      .output("HostId", VarChar(21))
      .execute("JoinQueue");

    let ret = result.returnValue;

    let cnt = undefined;
    switch (ret) {
      case 6:
        cnt = "You are already in this queue!";
        break;
      case 2:
        cnt = "You need to register with /register before joining queues in this server!";
        break;
      case 5:
        cnt = "This server is enforcing rank roles and you do not have one!";
        break;
    }

    if (cnt) {
      await interaction.editReply({
        content:
          cnt,
      });
      return;
    }

    if (ret == 0) {
      // Grab outputs from JoinQueue procedure
      let numCaptains = result.output.NumCaptains;
      let queueStatus = result.output.QueueStatus;
      let playersAndCanBeCapt = result.recordsets[0];
      let playersAvailable = result.recordsets[1];
      let teamOnePlayers = result.recordsets[2];
      let teamTwoPlayers = result.recordsets[3];
      let spectators = result.recordsets[4];
      let host = await interaction.guild.members.fetch(result.output.HostId);

      // Grab guild's rank roles
      result = await con.request(trans)
        .input("GuildId", interaction.guildId)
        .execute("GetRankRoles");

      let rankedRoles = result.recordset;

      // If necessary, choose captains
      if (queueStatus == QUEUE_STATES.TENMANS_STARTING_DRAFT) {

        trans.commit(commitOnErrMaker(interaction));


        result = await con.request()
          .input("QueueId", queueId)
          .output("EnforceRankRoles", Bit)
          .execute("ImStartingDraft");

        if (result.returnValue == 0) {

          let enforce = result.output.EnforceRankRoles;
          // Assuming success, reassign values with updated data after selecting captaibns and starting draft
          let newVals = await selectCaptains(
            numCaptains,
            playersAndCanBeCapt,
            rankedRoles,
            interaction,
            queueId,
            con,
            trans,
            enforce
          );
          playersAvailable = newVals.newAvailable;
          teamOnePlayers = newVals.newTeamOne;
          teamTwoPlayers = newVals.newTeamTwo;
          queueStatus = newVals.newStatus;
        } else if (result.returnValue != -1) {



        }
        else {
          console.log("Idk what's happening");
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
      trans.commit(async (err) => {
        if (err) {
          console.log(err);
          await interaction.editReply({
            ephemeral: true,
            content:
              "Something went wrong and the command could not be completed.",
          });
          // TODO: Have bot report error
          return;
        }

        interaction.editReply({
          ephemeral: true,
          content: `You are now in queue and in the 10 mans waiting area!\n\n**WARNING:**\nTo leave the queue, please either use the "Leave" button or leave all voice calls. Otherwise, you will be dragged back into a 10 mans call if/when you are assigned a team!\n<@${interaction.user.id}>`,
        });

        return;
      });
    } else {
      await trans.rollback();
      throw new Error(`Database failure: Code ${result.returnValue}`);
    }
  },
};
