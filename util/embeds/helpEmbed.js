const { EmbedBuilder, EmbedField } = require("discord.js");

module.exports = {
  /**
   *
   */
  helpEmbed({ title = " ", desc = " " }) {
    return new EmbedBuilder()
      .setColor("0x0099ff")
      .setTitle(title)
      .setDescription(desc)
      .setAuthor({
        name: "Jerry Bot Help",
      });
  },
};
