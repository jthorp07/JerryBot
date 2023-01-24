const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  playerSelectBuilder(captainName, playerList) {
    return [
      new ActionRowBuilder().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("player-select-menu")
          .setPlaceholder(
            `${captainName} please select a player to join your team`
          )
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(playerList)
      ),
    ];
  },
};
