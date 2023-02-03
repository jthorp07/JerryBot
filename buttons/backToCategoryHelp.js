const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");
const { helpEmbed } = require("../util/embeds");
const { helpCategories, paginationButtons } = require("../util/components");

const helpInfo = require("../util/help.json");

module.exports = {
  data: {
    customId: "back-to-category-help", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
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

    await interaction.message.edit({
      embeds: [embed],
      components: compArr,
    });
    interaction.deleteReply();
  },
};
