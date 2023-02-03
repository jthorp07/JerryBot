const {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { ConnectionPool } = require("mssql");
const { helpEmbed } = require("../util/embeds");
const { helpCommands, paginationButtons } = require("../util/components");
const helpInfo = require("../util/help.json");

module.exports = {
  data: {
    customId: `help-button-category`, // customId of buttons that will execute this command
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
      title: `${idArgs[1]}`,
      desc: `The following commands are ${idArgs[1]}. You may not be able to access them if you do not have proper access.`,
    });
    const commands = await helpCommands(
      helpInfo[idArgs[1]].commands.slice(0, 5),
      idArgs[1]
    );
    const pagination = paginationButtons(
      0,
      helpInfo[idArgs[1]].commands.length,
      idArgs[1]
    );

    const back = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId(`back-to-category-help`)
        .setLabel("Back To Categories")
        .setStyle(ButtonStyle.Primary)
    );

    let compArr;

    if (helpInfo.categories.length > 5) {
      compArr = [commands, pagination];
    } else {
      compArr = [commands];
    }

    await interaction.message.edit({
      embeds: [embed],
      components: [...compArr, back],
    });

    interaction.deleteReply();
  },
};
