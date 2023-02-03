const { EmbedBuilder, EmbedField } = require("discord.js");

module.exports = {
  /**
   *
   */
  helpEmbed({
    title = " ",
    desc = " ",
    examples = [
      {
        name: "\u200B",
        value: "\u200B",
      },
    ],
  }) {
    return {
      color: 0x0099ff,
      title: title,
      description: desc,
      fields: examples,
    };
  },
};
