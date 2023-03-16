const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool } = require("mssql");
const { beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Registers the user in their current guild with the bot"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    await interaction.deferReply({ ephemeral: true });

    let trans = con.transaction();
    await trans.begin(beginOnErrMaker(interaction, trans));

    let result = await con
      .request(trans)
      .input("GuildId", interaction.guildId)
      .input("GuildName", interaction.guild.name)
      .execute("CreateGuild");

    if (result.returnValue !== 0 && !result.returnValue === 2) {
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong",
      });
      trans.rollback();
      return;
    }

    result = await con.request(trans)
      .input('GuildId', interaction.guildId)
      .input('UserId', interaction.user.id)
      .input('IsOwner', (interaction.user.id == interaction.guild.ownerId) ? 1 : 0)
      .input('Username', interaction.user.username)
      .input('GuildDisplayName', interaction.member.displayName)
      .input('ValorantRankRoleName', null)
      .execute('CreateGuildMember');

    if (result.returnValue === 2) {
      interaction.editReply({
        ephemeral: true,
        content: "You are already registered in this server!",
      });
      trans.rollback();
      return;
    } else if (result.returnValue !== 0) {
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong",
      });
      trans.rollback();
      return;
    }

    trans.commit(commitOnErrMaker(interaction));

    interaction.editReply({
      ephemeral: true,
      content: "You are now registered in this server!",
    });
  },
  permissions: "all",
};