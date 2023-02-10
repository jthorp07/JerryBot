const { StringSelectMenuInteraction } = require("discord.js");
const { ConnectionPool, NVarChar, Int, VarChar } = require('mssql');
const { QUEUE_STATES, Helpers } = require("../util");

module.exports = {
  data: {
    customId: "player-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {StringSelectMenuInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    await interaction.deferReply({ ephemeral: true });
    //TODO: Implement button command
    let draftedId = interaction.values[0];
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

      let result = await con.request(trans)
        .input('QueueId', queueId)
        .input('PlayerId', draftedId)
        .input('GuildId', interaction.guildId)
        .output('QueueStatus', NVarChar(100))
        .execute('DraftPlayer');


      result = await con.request(trans)
        .input('QueueId', queueId)
        .output('NumCaptains', Int)
        .output('PlayerCount', Int)
        .output('QueueStatus', NVarChar(100))
        .output('HostId', VarChar(21))
        .execute('GetQueue');

      let queueStatus = result.output.QueueStatus;
      let playersAvailable = result.recordsets[1];
      let teamOnePlayers = result.recordsets[2];
      let teamTwoPlayers = result.recordsets[3];
      let spectators = result.recordsets[4];
      let host = await interaction.guild.members.fetch(result.output.HostId);

      let embeds = Helpers.tenMansClassicNextEmbed(queueStatus, playersAvailable,
        teamOnePlayers, teamTwoPlayers, spectators, host.displayName, host.displayAvatarURL());

      let comps = Helpers.


      // Commit transaction and respond on Discord
      trans.commit(async (err) => {
        if (err) {
          trans.rollback();
          interaction.editReply({ ephemeral: true, content: 'Something went wrong and the command could not be completed.' });
          console.log(err);
          return;
        }
        return;
      });

    })


  },
};
