const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdiscordrole")
    .setDescription("Sets a role for the server in the bot's memory")
    .addStringOption((option) =>
      option
        .setName("rolename")
        .setDescription("The name of the role")
        .setRequired(true)
        .addChoices(
          { name: "Tenmans Host", value: "queuehost:0" },
          { name: "Moderator", value: "mod:0" },
          { name: "Administrator", value: "admin:0" },
          { name: "Tenmans Blacklist", value: "queueban:2" },
          { name: "Tier 1 Sub", value: "subtierone:2" },
          { name: "Tier 2 Sub", value: "subtiertwo:2" },
          { name: "Tier 3 Sub", value: "subtierthree:2" }
        )
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to be used")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emote")
        .setDescription("A unicode emoji OR custom emote to represent the role")
        .setRequired(false)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });
    let role = interaction.options.getRole("role");
    let roleName = interaction.options
      .getString("rolename")
      .toUpperCase()
      .split(":")[0];
    let roleGroup = parseInt(
      interaction.options.getString("rolename").split(":")[1]
    );
    let roleEmote = interaction.options.getString("emote");

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let result = await db.setRole(
      interaction.guildId,
      role.id,
      roleName,
      roleGroup,
      roleEmote
    );

    if (result) {
      //TODO: Error
      await trans.rollback();
      return;
    }

    // Commit transaction and respond on Discord
    await db.commitTransaction(trans);

    await interaction.editReply({ ephemeral: true, content: "Role Set!" });
  },
  permissions: "admin",
};
