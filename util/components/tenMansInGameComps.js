const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AnyComponentBuilder } = require("discord.js");

module.exports = {

  /**
   * 
   * @param {number} queueId
   * 
   * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
   */
  tenMansInGameComps(queueId) {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(`end-queue:${queueId}`)
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
    ];
  },
};
