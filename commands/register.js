const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Registers the user in their current guild with the bot"),
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

    let result = await db.createGuild(
      interaction.guildId,
      interaction.guild.name
    );

    if (result) {
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong",
      });
      trans.rollback();
      return;
    }

    result = await db.createGuildMember(
      interaction.guildId,
      interaction.user.id,
      interaction.user.id == interaction.guild.ownerId ? 1 : 0,
      interaction.user.username,
      interaction.member.displayName,
      null
    );

    if (result.returnValue === 3) {
      interaction.editReply({
        ephemeral: true,
        content: "You are already registered in this server!",
      });
      trans.rollback();
      return;
    } else if (result) {
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong",
      });
      trans.rollback();
      return;
    }

    // Commit transaction and respond on Discord
    await db.commitTransaction(trans);

    interaction.editReply({
      ephemeral: true,
      content: "You are now registered in this server!",
    });
  },
  permissions: "all",
};
