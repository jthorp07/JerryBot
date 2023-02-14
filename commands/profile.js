const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool, NVarChar } = require("mssql");
const { profileEmbed } = require("../util/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Displays user profile information"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    await interaction.deferReply({ ephemeral: true });

    let trans = con.transaction();
    let result = await con
      .request(trans)
      .input("GuildId", interaction.guildId)
      .input("UserId", interaction.user.id)
      .output("CurrentRank", NVarChar(100))
      .execute("GetProfile");

    const userObj = result.recordsets[0][0];

    console.log(userObj);

    const profile = profileEmbed(
      interaction.member.displayAvatarURL(),
      userObj.GuildName,
      userObj.DisplayName,
      userObj.ValorantName,
      userObj.ValorantRoleIcon,
      userObj.Ranked,
      userObj.CurrentRank
    );

    // let stringoption = interaction.options.getString("stringone");
    await interaction.editReply({ embeds: profile, ephemeral: true });
  },
  permissions: "all",
};
