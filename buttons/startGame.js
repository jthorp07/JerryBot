const { ButtonInteraction } = require("discord.js");
const { ConnectionPool, Int } = require("mssql");
const Helpers = require("../util/helpers");
const { tenMansStartComps, mapSelectBuilder } = require("../util/components");

module.exports = {
  data: {
    customId: "start-tenman-game", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    await interaction.deferReply({ ephemeral: true });
    let embed = interaction.message.embeds[0];
    //TODO: Implement button command
    let trans = con.transaction();

    result = await con
      .request(trans)
      .input("GuildId", interaction.guildId)
      .execute("GetRankRoles");

    // This is pretty inefficient but still faster than doing it efficiently but having to ping the database again
    let rankedRoles = result.recordset;

    result = await con
      .request(trans)
      .input("GuildId", interaction.guildId)
      .output("NumCaptains", Int)
      .output("PlayerCount", Int)
      .execute("GetTenmansQueue");
    let draftInfo = await Helpers.selectCaptains(
      result,
      rankedRoles,
      interaction,
      embed
    );

    let newEmbed = Helpers.makeDraftEmbed(draftInfo, embed);

    await interaction.message.edit({
      embeds: [newEmbed],
      components: mapSelectBuilder(draftInfo.capOne.name).concat(
        tenMansStartComps()
      ),
    });
    interaction.editReply("Draft has begun!", { ephemeral: true });

    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
  },
};
