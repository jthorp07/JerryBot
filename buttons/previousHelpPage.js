const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");
const { helpEmbed } = require("../util/embeds");
const { helpCategories, paginationButtons } = require("../util/components");

const helpInfo = require("../util/help.json");

module.exports = {
  data: {
    customId: "prev-page-help", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   * idArgs[1] === currentIdx
   * idArgs[2] === endIdx
   */
  async execute(interaction, con, idArgs) {
    //TODO: Handle if no more prev buttons

    // await interaction.deferReply({ ephemeral: true });
    const embed = helpEmbed();
    const newCategories = await helpCategories(
      helpInfo.categories.slice(parseInt(idArgs[1]) - 5, parseInt(idArgs[1]))
    );

    const newPaginationButtons = paginationButtons(
      parseInt(idArgs[1]) - 5,
      helpInfo.categories.length
    );

    await interaction.message.edit({
      embeds: [embed],
      components: [newCategories, newPaginationButtons],
    });
    // interaction.editReply({ content: "done", ephemeral: true });
    // interaction.deleteReply();
  },
};
