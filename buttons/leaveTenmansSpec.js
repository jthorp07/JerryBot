const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "leave-tenman-spec", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    //TODO: Implement button command
    console.log(interaction.user.id, interaction.user.username);
    await interaction.reply(
      `${interaction.user.username} left the spectators!`
    );
  },
};
