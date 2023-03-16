const { ButtonInteraction } = require("discord.js");
const { ConnectionPool, Int, VarChar, NVarChar } = require("mssql");
const { tenMansClassicNextEmbed, tenMansClassicNextComps, beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");

module.exports = {
  data: {
    customId: "leave-queue", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {


    // Go ahead and edit embed
    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);

    let trans = con.transaction();
    await trans.begin(beginOnErrMaker(interaction, trans));

    let result = await con
      .request(trans)
      .input("QueueId", queueId)
      .input("UserId", interaction.user.id)
      .input("GuildId", interaction.guildId)
      .execute("LeaveTenmans");

    if (result.returnValue !== 0) {
      trans.rollback();
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong o-o",
      });
      return;
    }

    // Grab queue data
    result = await con
      .request(trans)
      .input("QueueId", queueId)
      .output("NumCaptains", Int)
      .output("PlayerCount", Int)
      .output("QueueStatus", NVarChar(100))
      .output("HostId", VarChar(21))
      .execute("GetQueue");

    trans.commit(commitOnErrMaker(interaction));

    let queueStatus = result.output.QueueStatus;
    let playersAvailable = result.recordsets[1];
    let teamOnePlayers = result.recordsets[2];
    let teamTwoPlayers = result.recordsets[3];
    let spectators = result.recordsets[4];
    let host = await interaction.guild.members.fetch(result.output.HostId);

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
      components: comps
    });

    await interaction.editReply({
      ephemeral: true,
      content: `${interaction.user.username} left the player pool!`,
    });
  },
};
