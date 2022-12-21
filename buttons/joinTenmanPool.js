const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "join-tenman-pool", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    //TODO: Implement button command
    await interaction.reply(
      `${interaction.user.username} joined the player pool!`
    );
  },
};
