const { EmbedBuilder, EmbedField } = require("discord.js");

module.exports = {
  /**
   *
   * @param {string} capOne
   * @param {string} capTwo
   * @param {string} draftList
   * @param {EmbedField} specs The embed field with the spectators
   * @param {string} host host's displayName
   * @param {string} hostPfp link to host's pfp
   */
  helpEmbed() {
    return new EmbedBuilder()
      .setColor("0x0099ff")
      .setTitle("Helpin ya out weeeeeeee")
      .setDescription("Click a button below for help")
      .setAuthor({
        name: "Jerry Bot Help weeeeee",
      })
      .addFields();
  },
};
