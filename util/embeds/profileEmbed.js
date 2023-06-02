const { EmbedBuilder } = require("discord.js");
const { ValorantRank } = require("../gcadb");

module.exports = {
  
  /**
   * 
   * @param {*} userPfp User's PFP url
   * @param {string} guildName Name of the Discord server for this profile
   * @param {string} discordDisplayName Discord server display name for this profile
   * @param {string | null} valorantDisplayName Valorant display name for this profile
   * @param {string | null} valorantRoleIcon 
   * @param {boolean} hasValorantRank 
   * @param {ValorantRank} currentRank 
   * @param {string} discordUsername 
   * @param {boolean} canBeCaptain 
   * @returns {EmbedBuilder}
   */
  profileEmbed(
    userPfp,
    guildName,
    discordDisplayName,
    valorantDisplayName,
    valorantRoleIcon,
    hasValorantRank,
    currentRank,
    discordUsername,
    canBeCaptain
  ) {
    return [
      new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(`For Server: ${guildName}`)
        .setAuthor({
          name: `${discordUsername}'s Profile`,
          iconURL: userPfp && userPfp,
        })
        .setThumbnail(
          hasValorantRank && valorantRoleIcon
            ? valorantRoleIcon
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
            value: `${valorantDisplayName || "No Riot ID set"}`,
            inline: true,
          },
          {
            name: "Valorant Rank",
            value: `${(hasValorantRank && currentRank && currentRank) || "No Rank Set"}`,
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
            value: `${discordDisplayName}`,
          },
          {
            name: "Volunteer for Team Captain:",
            value: `${
              canBeCaptain
                ? "Would prefer to be a captain when needed"
                : "Would prefer NOT to be a captain when needed"
            }`,
          }
        ),
    ];
  },
};
