const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "start-tenman-game", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    //TODO: Implement button command
    await interaction.reply("Starting the team selection process...");
  },
};
