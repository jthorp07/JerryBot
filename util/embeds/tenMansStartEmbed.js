const { EmbedBuilder } = require("discord.js");

module.exports = {

  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  baseEmbed: new EmbedBuilder()
    .setColor("0x0099ff")
    .setTitle("Ten Mans Queue")
    .setDescription("Waiting for players...")
    .setAuthor({
      name: "<--- [[Manager profile pic?]] [[10 Man Manager Username]]",
      iconURL: "https://i.imgur.com/AfFp7pu.png",
    })
    .addFields(
      {
        name: "Player Pool",
        value:
          'N/A\n\nplayers will show up here when they join',
        inline: true,
      },

      {
        name: "Spectators",
        value: 'N/A\n\nplayers will show up here when they join',
        inline: true,
      }
    ),

  /**
   * 
   * @param {string} players 
   * @param {string} specs 
   * @param {string} host 
   * @param {string} hostPfp
   * @returns {EmbedBuilder} 
   */
  tenMansStartEmbed(players, specs, host, hostPfp) {
    return new EmbedBuilder()
      .setColor("0x0099ff")
      .setTitle("Ten Mans Queue")
      .setDescription("Waiting for players...")
      .setAuthor({
        name: host ? host : "Unknown Host",
        iconURL: hostPfp ? hostPfp : undefined,
      })
      .addFields(
        {
          name: "Player Pool",
          value: players ? players : 'N/A\n\nplayers will show up here when they join',
          inline: true,
        },

        {
          name: "Spectators",
          value: specs ? specs : 'N/A\n\nplayers will show up here when they join',
          inline: true,
        }
      )
  }
};
