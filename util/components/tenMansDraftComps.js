const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, AnyComponentBuilder } = require("discord.js");
const { IRecordSet } = require('mssql');

module.exports = {
  /**
   *
   * @param {string} queueId
   * @param {IRecordSet<any>} draftList
   * 
   * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
   */
  tenMansDraftComps(queueId, draftList, map) {

    // Just defining this object with a schema for intellisense - not necessary for prod
    let playerDraftOptions = [{
      label:"",
      value:""
    }];
    playerDraftOptions = [];

    // If not a map pick, parse available players into valid StringSelectMenu options
    if (!map) {
      draftList.forEach(player => {
        let name = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        playerDraftOptions.push({
          label: name,
          value: player.PlayerId
        });
      });
    }

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
          .setCustomId(`start-draft:${queueId}`)
          .setLabel("Start Draft")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`end-queue:${queueId}`)
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
      map ? new ActionRowBuilder().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`map-select-menu:${queueId}`)
          .setPlaceholder(`please select a map`)
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
      ) : new ActionRowBuilder().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`player-select-menu:${queueId}`)
          .setPlaceholder(
            `please select a player to join your team`
          )
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(playerDraftOptions)
      )
    ];
  },
};
