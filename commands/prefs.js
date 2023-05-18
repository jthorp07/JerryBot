const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");
const { prefsComps } = require("../util/components");
const { prefsEmbed } = require("../util/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prefs")
    .setDescription(
      "Displays a user's preferences and allows them to edit their preferences"
    ),
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

    let result = await db.getPrefs(interaction.user.id, interaction.guildId);

    if (result) {
      await trans.rollback();
      await interaction.editReply({
        content:
          "Something went wrong and the interaction could not be completed",
      });
      return;
    }

    await db.commitTransaction(trans);

    let comps = prefsComps(result.output.CanBeCaptain);
    let embeds = prefsEmbed(
      interaction.member.displayName,
      interaction.member.displayAvatarURL(),
      interaction.guild.name,
      result.output.CanBeCaptain
    );

    await interaction.editReply({ embeds: embeds, components: comps });
  },
  permissions: "all",
};
