const { SelectMenuInteraction } = require("discord.js");
const { ConnectionPool, PreparedStatement, Int, NVarChar, VarChar } = require("mssql");
const { tenMansClassicNextComps, tenMansClassicNextEmbed } = require("../util/helpers");

module.exports = {
  data: {
    customId: "map-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {SelectMenuInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    await interaction.deferReply({ ephemeral: true });
    //TODO: Implement button command
    let queueId = parseInt(idArgs[1]);

    let mapPick = interaction.values[0];
    let firstUpper = mapPick.charAt(0).toUpperCase();
    mapPick = firstUpper.concat(mapPick.substring(1));

    // Authorize map/side picker
    let result;
    try {
    let stmt = new PreparedStatement(con)
      .input('UserId', VarChar(21))
      .input('QueueId', Int);
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
      .execute("PickMap");

    if (result.returnValue != 0) {
      await interaction.editReply({content:"Something went wrong and the command could not be completed"});
      console.log("Database failure");
      return;
    }

    let queueStatus = result.output.QueueStatus;
    let playersAvailable = result.recordsets[1];
    let teamOnePlayers = result.recordsets[2];
    let teamTwoPlayers = result.recordsets[3];
    let spectators = result.recordsets[4];
    let host = await interaction.guild.members.fetch(result.output.HostId);

    let embeds = tenMansClassicNextEmbed(queueStatus, playersAvailable,
      teamOnePlayers, teamTwoPlayers, spectators, host.displayName, host.displayAvatarURL(), mapPick, 0);

    let comps = tenMansClassicNextComps(queueId, queueStatus, playersAvailable, mapPick, host.id);

    await interaction.message.edit({
      embeds: embeds,
      components: comps
    });

    await interaction.editReply("You selected a map!", { ephemeral: true });
  },
};
