const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  paginationButtons(currentIdx, endIdx) {
    return new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId(`prev-page-help:${currentIdx}:${endIdx}`)
        .setLabel("Prev")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`next-page-help:${currentIdx}:${endIdx}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
    );
  },
};
