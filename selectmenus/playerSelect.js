const { SelectMenuInteraction } = require("discord.js");

module.exports = {
  data: {
    customId: "player-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {SelectMenuInteraction} interaction
   */
  async execute(interaction) {
    //TODO: Implement button command
    console.log(interaction.values[0]);
    await interaction.reply("You selected a player!");
  },
};
