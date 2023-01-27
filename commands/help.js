const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool } = require("mssql");
const { helpEmbed } = require("../util/embeds");
const { helpCategories, paginationButtons } = require("../util/components");
const helpInfo = require("../util/help.json");

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
    await interaction.deferReply({ ephemeral: true });
    const embed = helpEmbed();

    const comps = await helpCategories(helpInfo.categories.slice(0, 5));
    const pagination = paginationButtons(0, helpInfo.categories.length);

    let compArr;

    if (helpInfo.categories.length > 5) {
      compArr = [comps, pagination];
    } else {
      compArr = [comps];
    }

    console.log(pagination);
    interaction.editReply({
      embeds: [embed],
      components: compArr,
      ephemeral: true,
    });
  },
  permissions: "all",
};
