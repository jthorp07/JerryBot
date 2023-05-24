const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");
const { profileEmbed } = require("../util/embeds");
const { profileComps } = require("../util/components");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Displays user profile information"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    const result = await db.getProfile(
      interaction.user.id,
      interaction.guildId
    );

    if (result) {
      trans.rollback();
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    const userObj = result.recordsets[0][0];

    if (!userObj) {
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    const result2 = await db.getUserValRank(
      interaction.user.id,
      interaction.guildId
    );

    if (result2) {
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    await db.commitTransaction(trans);

    let comps = profileComps();

    /**@type {string} */
    let currentRank = result2.output.RoleName;
    if (currentRank) {
      let parts = currentRank.toLowerCase().split("_");
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        parts[i] = part.charAt(0).toUpperCase().concat(part.substring(1));
      }
      currentRank = parts.join(" ");
    }

    const profile = profileEmbed(
      interaction.member.displayAvatarURL(),
      userObj.GuildName,
      userObj.DisplayName,
      userObj.ValorantName,
      result2.output.RoleIcon,
      userObj.Ranked,
      currentRank,
      userObj.Username,
      userObj.CanBeCaptain
    );
    await interaction.editReply({
      embeds: profile,
      ephemeral: true,
      components: comps,
    });
  },
  permissions: "all",
};
