const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AnyComponentBuilder,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {number} queueId
   * @param {string} host
   * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
   */
  tenMansInGameComps(queueId, host) {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(`end-queue:${queueId}:${host}`)
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
    ];
  },
};
