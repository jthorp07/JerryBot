const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
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

    if (result instanceof BaseDBError) {
      result.log();
      trans.rollback();
      await interaction.editReply({ content: "Something went wrong" });
      return;
    }

    // TODO: This must change (Probably)
    const result2 = await db.getUserValRank(
      interaction.user.id,
      interaction.guildId,
      trans
    );

    if (result2 instanceof BaseDBError) {
      result2.log();
      await interaction.editReply({ content: "Something went wrong" });
      await trans.rollback();
      return;
    }

    await db.commitTransaction(trans);

    let comps = profileComps();

    let currentRank = result2.roleName;
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
      result.records.discordGuildName,
      result.records.discordDisplayName,
      result.records.valorantDisplayName,
      result2.roleIcon || result2.roleEmote,
      result.currentRank ? true : false,
      currentRank,
      result.records.discordUsername,
      result.records.canBeCaptain
    );
    await interaction.editReply({
      embeds: profile,
      ephemeral: true,
      components: comps,
    });
  },
  permissions: "all",
};
