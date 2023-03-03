const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  AnyComponentBuilder,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {string} queueId
   * @param playerDraftOptions
   * @param {boolean} map
   * @param {string} mapName
   * @param {string} host
   *
   * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
   */
  tenMansDraftComps(queueId, playerDraftOptions, map, mapName, host) {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(`join-tenman:${queueId}`)
          .setLabel("Join Player Pool")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`leave-queue:${queueId}`)
          .setLabel("Leave Player Pool")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`join-tenman-spec:${queueId}`)
          .setLabel("Join Spectators")
          .setStyle(ButtonStyle.Secondary)
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(`start-draft:${queueId}:${host}`)
          .setLabel("Start Draft")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`end-queue:${queueId}:${host}`)
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
      map
        ? new ActionRowBuilder().setComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`map-select-menu:${queueId}`)
              .setPlaceholder(`Select a map`)
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
          )
        : mapName
        ? new ActionRowBuilder().setComponents(
            new StringSelectMenuBuilder()
              .setCustomId(
                `side-select-menu:${queueId}:${mapName.toLowerCase()}`
              )
              .setPlaceholder(`Select your team's side`)
              .setMinValues(1)
              .setMaxValues(1)
              .addOptions([
                { label: "Attack", value: "atk" },
                { label: "Defend", value: "dfn" },
              ])
          )
        : new ActionRowBuilder().setComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`player-select-menu:${queueId}`)
              .setPlaceholder(`Pick a player`)
              .setMinValues(1)
              .setMaxValues(1)
              .addOptions(playerDraftOptions)
          ),
    ];
  },
};
