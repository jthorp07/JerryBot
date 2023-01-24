const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  mapSelectBuilder(firstCaptainName) {
    return [
      new ActionRowBuilder().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("map-select-menu")
          .setPlaceholder(`${firstCaptainName} please select a map`)
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions([
            { label: "Ascent", value: "Ascent" },
            { label: "Bind", value: "Bind" },
            { label: "Breeze", value: "Breeze" },
            { label: "Fracture", value: "Fracture" },
            { label: "Haven", value: "Haven" },
            { label: "Icebox", value: "Icebox" },
            { label: "Lotus", value: "Lotus" },
            { label: "Pearl", value: "Pearl" },
            { label: "Split", value: "Split" },
          ])
      ),
    ];
  },
};
