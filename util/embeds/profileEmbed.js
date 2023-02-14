const { EmbedBuilder } = require("discord.js");

module.exports = {
  /**
    IsPremium: boolean,
    Username: string,
    GuildName: string
    IsOwner: boolean **owner of the server only**
    DisplayName: string
    ValorantName: string|null
    ValorantRoleIcon: string|null(url)
    Ranked: boolean
    CurrentRank: number
    CanBeCaptain: boolean
   */
  profileEmbed(
    userPfp,
    GuildName,
    DisplayName,
    ValorantName,
    ValorantRoleIcon,
    Ranked,
    CurrentRank
  ) {
    return [
      new EmbedBuilder()
        .setColor("0x0099ff")
        .setDescription(`For Server: ${GuildName}`)
        // .setThumbnail(Ranked && ValorantRoleIcon && ValorantRoleIcon)
        .setAuthor({
          name: `${DisplayName}'s Profile`,
          iconURL: userPfp && userPfp,
        })
        .addFields(
          {
            name: `Valorant Information`,
            value: `Riot ID: ${ValorantName || "No name set"}`,
            inline: true,
          },
          {
            name: "\u200B",
            value: `Valorant Role: ${
              (Ranked && CurrentRank && CurrentRank) || "No role set"
            }`,
            inline: true,
          }
        ),
    ];
  },
};
