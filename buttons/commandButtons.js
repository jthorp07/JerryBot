const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");
const { helpEmbed } = require("../util/embeds");
const { helpCommands, paginationButtons } = require("../util/components");
const helpInfo = require("../util/help.json");

module.exports = {
  data: {
    customId: `help-button-command`, // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    await interaction.deferReply();

    const embed = helpEmbed({
      title: idArgs[1],
      desc: `command info for /${idArgs[1]}`,
    });

    console.log(`Hey! you clicked ${idArgs[1]}`);
    await interaction.message.edit({
      embeds: [embed],
    });

    interaction.deleteReply();
  },
};
