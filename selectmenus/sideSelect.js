const { SelectMenuInteraction } = require("discord.js");
const { ConnectionPool, Int, NVarChar, VarChar, PreparedStatement } = require("mssql");
const { tenMansClassicNextEmbed, tenMansClassicNextComps } = require("../util/helpers");

module.exports = {
  data: {
    customId: "side-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {SelectMenuInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */

  async execute(interaction, con, idArgs) {
    //TODO: Implement button command
    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);

    let mapPick = idArgs[2];
    let firstUpper = mapPick.charAt(0).toUpperCase();
    mapPick = firstUpper.concat(mapPick.substring(1));

    let choice = interaction.values[0] == 'atk' ? 1 : 2;

    // Authorize map/side picker
    let stmt = new PreparedStatement(con)
      .input('UserId', VarChar(21))
      .input('QueueId', Int);

    let result;
    try {
      await stmt.prepare('SELECT MapSidePickId FROM Queues WHERE [Id]=@QueueId AND MapSidePickId=@UserId');
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
      return;
    }

    result = await con.request()
      .input("QueueId", queueId)
      .output("NumCaptains", Int)
      .output("PlayerCount", Int)
      .output("QueueStatus", NVarChar(100))
      .output("HostId", VarChar(21))
      .execute("PickSide");

    if (result.returnValue != 0) {
      await interaction.editReply({ content: "Something went wrong and the command could not be completed" });
      console.log("Database error");
      return;
    }

    let queueStatus = result.output.QueueStatus;
    let playersAvailable = result.recordsets[1];
    let teamOnePlayers = result.recordsets[2];
    let teamTwoPlayers = result.recordsets[3];
    let spectators = result.recordsets[4];
    let host = await interaction.guild.members.fetch(result.output.HostId);

    let embeds = tenMansClassicNextEmbed(queueStatus, playersAvailable,
      teamOnePlayers, teamTwoPlayers, spectators, host.displayName, host.displayAvatarURL(), mapPick, choice);

    let comps = tenMansClassicNextComps(queueId, queueStatus, playersAvailable, mapPick, host.id);

    await interaction.message.edit({
      embeds: embeds,
      components: comps
    });
  },
};
