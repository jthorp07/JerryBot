const { ButtonInteraction } = require("discord.js");
const { ConnectionPool, Int, NVarChar, VarChar } = require("mssql");
const { tenMansClassicNextComps, tenMansClassicNextEmbed, selectCaptains } = require("../util/helpers");

module.exports = {
  data: {
    customId: "start-draft", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {

    // Defer, grab queueId from ID args, and start transaction
    await interaction.deferReply({ ephemeral: true });
    let queueId = parseInt(idArgs[1]);

    let trans = con.transaction();
    trans.begin(async (err) => {

      // Transaction begin error
      if (err) {
        await interaction.editReply({ content: 'Something went wrong and the command could not be completed.' });
        console.log(err);
        return;
      }

      // DBMS error handling
      let rolledBack = false;
      trans.on("rollback", (aborted) => {
        if (aborted) {
          console.log("This rollback was triggered by SQL server");
        }
        rolledBack = true;
        return;
      });

      // Grab queue data
      let result = await con.request(trans)
        .input('QueueId', queueId)
        .output('NumCaptains', Int)
        .output('PlayerCount', Int)
        .output('QueueStatus', NVarChar(100))
        .output('HostId', VarChar(21))
        .execute('GetQueue');

      if (result.output.PlayerCount < 3) {
        interaction.editReply({
          content: 'There are not enough players to start a draft.'
        });
        return;
      }

      let numCaptains = result.output.NumCaptains;
      let queueStatus = result.output.QueueStatus;
      let playersAndCanBeCapt = result.recordsets[0];
      let playersAvailable = result.recordsets[1];
      let teamOnePlayers = result.recordsets[2];
      let teamTwoPlayers = result.recordsets[3];
      let spectators = result.recordsets[4];
      let host = await interaction.guild.members.fetch(result.output.HostId);


      // Grab rankedroles for guild
      result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .execute("GetRankRoles");

      let rankedRoles = result.recordset;
      // Set starting so that other threads know not to attempt to start
      result = await con.request(trans)
        .input('QueueId', queueId)
        .execute('ImStartingDraft');

      if (result.returnValue === 0) {
        let newVals = await selectCaptains(numCaptains, playersAndCanBeCapt, rankedRoles, interaction, queueId, con, trans);
        playersAvailable = newVals.newAvailable;
        teamOnePlayers = newVals.newTeamOne;
        teamTwoPlayers = newVals.newTeamTwo;
        queueStatus = newVals.newStatus;
      } else if (result.returnValue !== -1) {
        // Something bad happened
        throw new Error("Database error");
      } else {
        await interaction.editReply({ content: 'Another interaction is already trying to start this queue!' });
        await trans.rollback();
        return;
      }

      let embeds = tenMansClassicNextEmbed(queueStatus, playersAvailable, teamOnePlayers,
        teamTwoPlayers, spectators, host.displayName, host.displayAvatarURL(), null, 0);

      let comps = tenMansClassicNextComps(queueId, queueStatus, playersAvailable, null);

      // Commit transaction and respond on Discord
      trans.commit(async (err) => {
        if (err) {
          trans.rollback();
          interaction.editReply({ ephemeral: true, content: 'Something went wrong and the command could not be completed.' });
          console.log(err);
          return;
        }

        interaction.message.edit({
          embeds: embeds,
          components: comps
        })

        setTimeout(() => {
          interaction.deleteReply();
        }, 5000);
        return;
      });
    });
  },
};
