const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  async helpCategories(categoryArray) {
    if (categoryArray.length > 5) {
      throw new Error("Too many buttons in the array");
    }
    return new ActionRowBuilder().setComponents(
      categoryArray.map((category) => {
        return new ButtonBuilder()
          .setCustomId(category.toLowerCase())
          .setLabel(category)
          .setStyle(ButtonStyle.Primary);
      })
    );
  },
};
