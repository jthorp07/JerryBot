const { SelectMenuInteraction } = require("discord.js");

module.exports = {
  data: {
    customId: "map-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {SelectMenuInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    //TODO: Implement button command
    console.log(interaction);
    await interaction.editReply("You selected a map!", { ephemeral: true });
  },
};
