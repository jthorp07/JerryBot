const { SelectMenuInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "genericid", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {SelectMenuInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */

  async selectExecute(interaction, con, idArgs) {
    //TODO: Implement button command
    await interaction.reply("You pressed a generic selectmenu option!");
  },
};
