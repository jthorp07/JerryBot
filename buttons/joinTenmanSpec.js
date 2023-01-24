const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "join-tenman-spec", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    //TODO: Implement button command
    await interaction.reply(
      `${interaction.user.username} joined the spectators`
    );
  },
};
