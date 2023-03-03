const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool, NVarChar } = require("mssql");
const { profileEmbed } = require("../util/embeds");
const { profileComps } = require("../util/components");

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
    trans.begin(async (err) => {

      if (err) {
        console.log(err);
        await interaction.editReply({ content: "Something went wrong" });
        return
      }

      // DBMS error handling
      let rolledBack = false;
      trans.on("rollback", (aborted) => {
        if (aborted) {
          console.log("This rollback was triggered by SQL server");
        }
        rolledBack = true;
        return;
      });

      let result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input("UserId", interaction.user.id)
        .output("CurrentRank", NVarChar(100))
        .execute("GetProfile");

      if (!result.returnValue == 0) {
        trans.rollback();
        await interaction.editReply({ content: "Something went wrong" });
        return;
      }

      trans.commit(async (err) => {

        if (err) {
          console.log(err);
          await interaction.editReply({ content: "Something went wrong" });
          return;
        }

        let comps = profileComps();

        const userObj = result.recordsets[0][0];

        console.log(userObj);

        /**@type {string} */
        let currentRank = result.output.CurrentRank;
        let parts = currentRank.toLowerCase().split('_');
        for (let i = 0; i < parts.length; i++) {
          let part = parts[i];
          parts[i] = part.charAt(0).toUpperCase().concat(part.substring(1));
        }
        currentRank = parts.join(' ');

        const profile = profileEmbed(
          interaction.member.displayAvatarURL(),
          userObj.GuildName,
          userObj.DisplayName,
          userObj.ValorantName,
          userObj.ValorantRoleIcon,
          userObj.Ranked,
          currentRank,
          userObj.Username,
          userObj.CanBeCaptain
        );

        // let stringoption = interaction.options.getString("stringone");
        await interaction.editReply({ embeds: profile, ephemeral: true, components: comps });
      })
    });
  },
  permissions: "all",
};
