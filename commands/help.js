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
    await interaction.deferReply();
    const embed = helpEmbed({
      title: "Jerry Bot Help Home",
      desc: "Select a category below to find different commands",
    });

    const comps = await helpCategories(helpInfo.categories.slice(0, 5));
    const pagination = paginationButtons(
      0,
      helpInfo.categories.length,
      "categories"
    );

    let compArr;

    if (helpInfo.categories.length > 5) {
      compArr = [comps, pagination];
    } else {
      compArr = [comps];
    }

    interaction.member.send({
      embeds: [embed],
      components: compArr,
    });
    interaction.deleteReply();
  },
  permissions: "all",
};
