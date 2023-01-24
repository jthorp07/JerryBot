const { EmbedBuilder } = require("discord.js");
/**
 *
 * @param {*} draftInfo
 * @param {Embed} embed
 * @returns
 */
module.exports = {
  makeDraftEmbed(draftInfo, embed) {
    // Set up draft embed
    let specs = embed.fields[1];
    let oldPlayers = embed.fields[0].value.split("\n");

    console.log(draftInfo);

    //TODO: This is bad. I'll fix it eventually
    oldPlayers.forEach((player, i) => {
      if (
        player.startsWith(draftInfo.capOne.name) ||
        player.startsWith(`${draftInfo.capTwo.name} `)
      )
        oldPlayers.splice(i, 1);
    });
    oldPlayers.forEach((player, i) => {
      if (
        player.startsWith(draftInfo.capOne.name) ||
        player.startsWith(`${draftInfo.capTwo.name} `)
      )
        oldPlayers.splice(i, 1);
    });
    let draftList = oldPlayers.join("\n");
    return new EmbedBuilder().addFields(
      {
        name: `Team 1`,
        value: `${draftInfo.capOne.name} [Captain]`,
        inline: false,
      },
      {
        name: `Team 2`,
        value: `${draftInfo.capTwo.name} [Captain]`,
        inline: false,
      },
      {
        name: `Available Players`,
        value: draftList, //TODO: Reformat draftInfo.draftPool to string and put here,
        inline: true,
      },
      {
        name: specs.name,
        value: specs.value,
        inline: true,
      }
    );
  },
};
