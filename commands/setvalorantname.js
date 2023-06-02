const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setvalorantname")
    .setDescription("Sets your VALORANT display name")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("VALORANT username (the stuff before the #)")
        .setMinLength(3)
        .setMaxLength(16)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tagline")
        .setDescription("VALORANT tagline (the stuff after the #)")
        .setMinLength(3)
        .setMaxLength(5)
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });

    let valName = interaction.options.getString("name");
    let tagline = interaction.options.getString("tagline");

    let trans = await db.beginTransaction();
    if (trans instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      trans.log();
      return;
    }

    const result = await db.setValName(
      `${valName}#${tagline}`,
      interaction.user.id,
      interaction.guildId,
    );

    if (result) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed",
      });
      result.log();
      return;
    }

    await db.commitTransaction(trans);
    await interaction.editReply({ content: "Your name has been updated" });
  },
  permissions: "all",
};
