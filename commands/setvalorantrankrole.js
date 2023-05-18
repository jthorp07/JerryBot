const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setvalorantrankrole")
    .setDescription("Sets a role for the server in the bot's memory")
    .addStringOption((option) =>
      option
        .setName("rolename")
        .setDescription("The name of the role")
        .setRequired(true)
        .addChoices(
          { name: "Unranked Rank Role", value: "unranked:1" },
          { name: "Iron Rank Role", value: "iron:1" },
          { name: "Bronze Rank Role", value: "bronze:1" },
          { name: "Silver Rank Role", value: "silver:1" },
          { name: "Gold Rank Role", value: "gold:1" },
          { name: "Platinum Rank Role", value: "platinum:1" },
          { name: "Diamond Rank Role", value: "diamond:1" },
          { name: "Ascendant Rank Role", value: "ascendant:1" },
          { name: "Immortal Rank Role", value: "immortal:1" },
          { name: "Radiant Rank Role", value: "radiant:1" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("ranklevel")
        .setDescription("For applicable tiers- the sublevel of the rank")
        .setRequired(true)
        .addChoices(
          { name: "1", value: 1 },
          { name: "2", value: 2 },
          { name: "3", value: 3 }
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
    let roleLevel = interaction.options.getNumber("ranklevel");
    let roleEmote = interaction.options.getString("emote");

    if (!(roleName == "UNRANKED" || roleName == "RADIANT")) {
      switch (roleLevel) {
        case 1:
          roleName = `${roleName}_ONE`;
          break;
        case 2:
          roleName = `${roleName}_TWO`;
          break;
        case 3:
          roleName = `${roleName}_THREE`;
          break;
      }
    }

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let result = await db.setValorantRankRole(
      interaction.guildId,
      role.id,
      roleName,
      roleGroup,
      roleLevel,
      roleEmote
    );

    if (result) {
      //TODO: Error
      await trans.rollback();
      return;
    }

    await db.commitTransaction(trans);
    await interaction.editReply({ ephemeral: true, content: "Role Set!" });
  },
  permissions: "admin",
};
