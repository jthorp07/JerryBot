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
    CurrentRank,
    Username,
    CanBeCaptain
  ) {
    return [
      new EmbedBuilder()
        .setColor("0x0099ff")
        .setDescription(`For Server: ${GuildName}`)
        .setAuthor({
          name: `${Username}'s Profile`,
          iconURL: userPfp && userPfp,
        })
        .setThumbnail(
          Ranked && ValorantRoleIcon
            ? ValorantRoleIcon
            : "https://buyboosting.com/assets/imgs/valorant/rank-icons/unranked.png"
        )
        .addFields(
          { name: "\u200B", value: "\u200B" },
          {
            name: `Valorant Information`,
            value: "-----------------------",
          },
          {
            name: "Riot ID",
            value: `${ValorantName || "No Riot ID set"}`,
            inline: true,
          },
          {
            name: "Valorant Rank",
            value: `${(Ranked && CurrentRank && CurrentRank) || "No Rank Set"}`,
            inline: true,
          }
        )
        .addFields(
          { name: "\u200B", value: "\u200B" },
          {
            name: `Preferences`,
            value: "--------------",
          },
          {
            name: `Display name in server:`,
            value: `${DisplayName}`,
          },
          {
            name: "Volunteer for Team Captain:",
            value: `${
              CanBeCaptain
                ? "Would prefer to be a captain when needed"
                : "Would prefer NOT to be a captain when needed"
            }`,
          }
        ),
    ];
  },
};
