const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool } = require("mssql");
const helpEmbed = require("../util/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Helps ya out duh"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    const embed = helpEmbed();
    await interaction.reply({ embeds: [embed] });
  },
  permissions: "all",
};
