const { EmbedBuilder } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    name: "test-embed", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  exampleEmbed: new EmbedBuilder()
    .setColor("0x0099ff")
    .setTitle("10 Man Queue")
    .setAuthor({
      name: "<--- [[Manager profile pic?]] [[10 Man Manager Username]]",
      iconURL: "https://i.imgur.com/AfFp7pu.png",
    })
    .addFields(
      {
        name: "Player Pool",
        value:
          "-Some username\n-Some username\n-Some username\n-Some username\n-Some username\n-Some username\n-Some username\n-Some username",
        inline: true,
      },

      {
        name: "Spectators",
        value: "-Some username\n-Some username\n-Some username\n-Some username",
        inline: true,
      }
    ),
};
