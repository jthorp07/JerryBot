const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");
const {
  helpCategories,
  paginationButtons,
  helpCommands,
} = require("../util/components");

const helpInfo = require("../util/help.json");

module.exports = {
  data: {
    customId: "next-page-help", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   * idArgs[1] === currentIdx
   * idArgs[2] === endIdx
   * idArgs[3] === menuLevel
   */
  async execute(interaction, con, idArgs) {
    await interaction.deferReply();

    const arrayLengthDiff = (currentIdx, endIdx) => {
      console.log(
        parseInt(currentIdx),
        parseInt(currentIdx) + 5,
        parseInt(endIdx)
      );
      if (endIdx >= parseInt(currentIdx) + 5) {
        return parseInt(currentIdx) + 5;
      } else {
        return parseInt(endIdx);
      }
    };

    let updatedSelectors;
    if (idArgs[3] === "categories") {
      const newCategories = await helpCategories(
        helpInfo.categories.slice(
          parseInt(idArgs[1]) + 5,
          arrayLengthDiff(parseInt(idArgs[1]) + 5, parseInt(idArgs[2]))
        )
      );
      updatedSelectors = newCategories;
    } else {
      const newCommands = await helpCommands(
        helpInfo[idArgs[3]].commands.slice(
          parseInt(idArgs[1]) + 5,
          arrayLengthDiff(parseInt(idArgs[1]) + 5, parseInt(idArgs[2]))
        ),
        idArgs[3]
      );
      updatedSelectors = newCommands;
    }

    const newPaginationButtons = paginationButtons(
      parseInt(idArgs[1]) + 5,
      parseInt(idArgs[2]),
      idArgs[3]
    );

    await interaction.message.edit({
      components: [updatedSelectors, newPaginationButtons],
    });

    interaction.deleteReply();
  },
};
