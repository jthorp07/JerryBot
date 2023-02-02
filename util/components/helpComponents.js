const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  async helpCategories(categoryArray) {
    if (categoryArray.length > 5) {
      throw new Error("Too many buttons in the array");
    }
    return new ActionRowBuilder().setComponents(
      categoryArray.map((category) => {
        return new ButtonBuilder()
          .setCustomId(`help-button-category:${category}`)
          .setLabel(category)
          .setStyle(ButtonStyle.Primary);
      })
    );
  },
  async helpCommands(commandArray) {
    if (commandArray.length > 5) {
      throw new Error("Too many buttons in the array");
    }
    return new ActionRowBuilder().setComponents(
      commandArray.map((command) => {
        return new ButtonBuilder()
          .setCustomId(`help-button-command:${command}`)
          .setLabel(`/${command}`)
          .setStyle(ButtonStyle.Primary);
      })
    );
  },
  paginationButtons(currentIdx, endIdx, menuLevel) {
    return new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId(`prev-page-help:${currentIdx}:${endIdx}:${menuLevel}`)
        .setLabel("Prev")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentIdx === 0 ? true : false),
      new ButtonBuilder()
        .setCustomId(`next-page-help:${currentIdx}:${endIdx}:${menuLevel}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(endIdx - currentIdx < 5 ? true : false)
    );
  },
};
