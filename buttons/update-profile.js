const { ButtonInteraction } = require("discord.js");
const {
  getRoleIcon,
  beginOnErrMaker,
  commitOnErrMaker,
} = require("../util/helpers");
const { GCADB } = require("../util/gcadb");

module.exports = {
  data: {
    customId: "update-profile", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    //TODO: Implement button command
    await interaction.deferReply({ ephemeral: true });

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let result = await db.getRankRoles(interaction.guildId);

    if (result) {
      trans.rollback();
      await interaction.editReply({
        content: "There was an error fetching your profile",
      });
      return;
    }

    let rankedRoles = result.recordset;
    let roleIcon = getRoleIcon(rankedRoles, interaction.member);

    result = await db.updateDiscordProfile(
      interaction.user.id,
      interaction.guildId,
      interaction.user.username,
      interaction.member.displayName,
      interaction.guild.ownerId == interaction.member.id,
      roleIcon ? roleIcon.rank : null,
      roleIcon ? true : false
    );

    if (result) {
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
