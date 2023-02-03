const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { tenMansStartComps } = require("../util/components");
const mssql = require("mssql");

const { tenMansStartEmbed } = require("../util/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embedtest")
    .setDescription("Testing embed use"),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {mssql.ConnectionPool} con
   */
  async execute(interaction, con) {
    let comps = tenMansStartComps();
    let embed = tenMansStartEmbed(
      undefined,
      undefined,
      interaction.member.displayName,
      interaction.member.displayAvatarURL()
    );

    console.log(comps);
    interaction.reply({
      embeds: [embed],
      components: comps,
    });
  },
  permissions: "all",
};
