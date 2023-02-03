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
   * [1] === category
   * [2] === command
   */
  async execute(interaction, con, idArgs) {
    await interaction.deferReply();
    const exampleArr =
      (await helpInfo[idArgs[1]][idArgs[2]].examples.length) > 0
        ? [
            {
              name: "\u200B",
              value: "\u200B",
            },
            ...helpInfo[idArgs[1]][idArgs[2]].examples.map((cmdExObj) => {
              return {
                name: "```" + cmdExObj.exampleCommand + "```",
                value: cmdExObj.exampleDescription,
              };
            }),
          ]
        : [
            {
              name: "\u200B",
              value: "\u200B",
            },
          ];
    const embed = helpEmbed({
      title: `/${idArgs[2]}`,
      desc: `${helpInfo[idArgs[1]][idArgs[2]].description}`,
      examples: exampleArr,
    });

    await interaction.message.edit({
      embeds: [embed],
    });

    interaction.deleteReply();
  },
};
