const { StringSelectMenuInteraction } = require("discord.js");
const { ConnectionPool, NVarChar, Int, VarChar, PreparedStatement } = require('mssql');
const { tenMansClassicNextEmbed, tenMansClassicNextComps } = require('../util/helpers');

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

      let stmt = new PreparedStatement(trans)
        .input('UserId', VarChar(21))
        .input('QueueId', Int);

      let result;
      try {
        await stmt.prepare('SELECT DraftPickId FROM Queues WHERE [Id]=@QueueId AND DraftPickId=@UserId');
        result = await stmt.execute({
          UserId: interaction.user.id,
          QueueId: queueId
        });
        await stmt.unprepare();
      } catch (err) {
        console.log(` [DB]: ${err}`);
        interaction.editReply({
          content: 'Something went wrong and the command was unable to be processed'
        });
        return;
      }

      if (result.recordset.length == 0) {
        interaction.editReply({
          content: 'It is not your turn to pick!'
        });
        trans.rollback();
        return;
      }

      result = await con.request(trans)
        .input('QueueId', queueId)
        .input('PlayerId', draftedId)
        .input('GuildId', interaction.guildId)
        .output('QueueStatus', NVarChar(100))
        .output('HostId', VarChar(21))
        .execute('DraftPlayer');

      let queueStatus = result.output.QueueStatus;
      let playersAvailable = result.recordsets[1];
      let teamOnePlayers = result.recordsets[2];
      let teamTwoPlayers = result.recordsets[3];
      let spectators = result.recordsets[4];
      let host = await interaction.guild.members.fetch(result.output.HostId);

      let embeds = tenMansClassicNextEmbed(queueStatus, playersAvailable,
        teamOnePlayers, teamTwoPlayers, spectators, host.displayName, host.displayAvatarURL(), null, 0);

      let comps = tenMansClassicNextComps(queueId, queueStatus, playersAvailable, null);


      // Commit transaction and respond on Discord
      trans.commit(async (err) => {
        if (err) {
          trans.rollback();
          interaction.editReply({ ephemeral: true, content: 'Something went wrong and the command could not be completed.' });
          console.log(err);
          return;
        }

        await interaction.message.edit({
          embeds: embeds,
          components: comps
        });
        await interaction.deleteReply();
        return;
      });

    })


  },
};
