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
    console.log(idArgs);
    const arrayLengthDiff = (currentIdx) => {
      if (parseInt(currentIdx) <= 0) {
        return 0;
      } else {
        return parseInt(currentIdx) - 5;
      }
    };

    await interaction.deferReply();

    let updatedSelectors;
    if (idArgs[3] === "categories") {
      const newCategories = await helpCategories(
        helpInfo.categories.slice(
          arrayLengthDiff(parseInt(idArgs[1])),
          parseInt(idArgs[1])
        )
      );
      updatedSelectors = newCategories;
    } else {
      const newCommands = await helpCommands(
        helpInfo[idArgs[3]].commands.slice(
          arrayLengthDiff(parseInt(idArgs[1])),
          parseInt(idArgs[1])
        ),
        idArgs[3]
      );
      updatedSelectors = newCommands;
    }

    const newPaginationButtons = paginationButtons(
      arrayLengthDiff(parseInt(idArgs[1])),
      parseInt(helpInfo.categories.length),
      idArgs[3]
    );

    await interaction.message.edit({
      components: [updatedSelectors, newPaginationButtons],
    });

    interaction.deleteReply();
  },
};
