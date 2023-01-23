const { ModalSubmitInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "testmodal",
  },

  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    interaction.reply({
      content: interaction.fields.getTextInputValue("testtextinput"),
    });
    console.log("WOO");
  },
};
