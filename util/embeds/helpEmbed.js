const { EmbedBuilder, EmbedField } = require("discord.js");

module.exports = {
  /**
   *
   */
  helpEmbed() {
    return new EmbedBuilder()
      .setColor("0x0099ff")
      .setTitle("Helpin ya out weeeeeeee")
      .setDescription("Click a button below for help")
      .setAuthor({
        name: "Jerry Bot Help",
      })
      .addFields();
  },
};
