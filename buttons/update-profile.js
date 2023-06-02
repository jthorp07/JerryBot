const { ButtonInteraction } = require("discord.js");
const {
  getRoleIcon,
} = require("../util/helpers");
const { GCADB, BaseDBError } = require("../util/gcadb");

module.exports = {
  data: {
    customId: "update-profile", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction Interaction received by the bot
   * @param {GCADB} db Database connection provided by the GCADB package
   * @param {string[]} idArgs If applicable, extra arguments that would be provided through the unique ID of the interaction's source
   */
  async execute(interaction, db, idArgs) {
    //TODO: Implement button command
    await interaction.deferReply({ ephemeral: true });

    let trans = await db.beginTransaction();
    if (!trans || trans instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    const rankedRoles = await db.getRankRoles(interaction.guildId, trans);

    if (rankedRoles instanceof BaseDBError) {
      rankedRoles.log();
      trans.rollback();
      await interaction.editReply({
        content: "There was an error fetching your profile",
      });
      return;
    }

    let roleIcon = getRoleIcon(rankedRoles, interaction.member);

    const result2 = await db.updateDiscordProfile(
      interaction.guildId,
      interaction.user.id,
      interaction.user.username,
      interaction.guild.ownerId == interaction.member.id,
      interaction.member.displayName,
      roleIcon ? roleIcon.rank : null,
      trans
    );

    if (result2) {
      result2.log();
      trans.rollback();
      await interaction.editReply({
        content: "There was an error fetching your profile",
      });
      return;
    }

    await db.commitTransaction(trans);

    await interaction.editReply({ content: "Profile updated" });
    return;
  },
};
