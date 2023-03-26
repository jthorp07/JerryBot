const { EmbedBuilder } = require("discord.js");

module.exports = {

    prefsEmbed(username, userPfp, guildName, canBeCaptain) {
        return [
            new EmbedBuilder()
        .setColor("0x0099ff")
        .setDescription(`Preferences For Server: ${guildName}`)
        .setAuthor({
          name: `${username}'s Profile`,
          iconURL: userPfp && userPfp,
        })
        .addFields(
          { name: "\u200B", value: "\u200B" },
          {
            name: `Preferences`,
            value: "--------------",
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
        ]
    }

}