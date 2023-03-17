const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool, Int, VarChar, Bit } = require("mssql");
const { tenMansStartEmbed } = require("../util/embeds");
const { tenMansStartComps } = require("../util/components");
const { beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tenmans-launch")
    .setDescription("Launches a ten mans lobby hosted by the user")
    .addStringOption((option) =>
      option
        .setName("type")
        .addChoices({ name: "Classic", value: "TENMAN" })
        .setDescription("The type of ten mans lobby to make")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    let type = interaction.options.getString("type");

    await interaction.deferReply({ ephemeral: true });

    let trans = con.transaction();
    await trans.begin(beginOnErrMaker(interaction, trans));

    let queueId;
    let result = await con
      .request(trans)
      .input("GuildId", interaction.guildId)
      .input("HostId", interaction.member.id)
      .input("QueueType", type)
      .output("QueueId", Int)
      .execute("CreateQueue");

    queueId = result.output.QueueId;

    let embeds = tenMansStartEmbed(
      undefined,
      undefined,
      interaction.member.displayName,
      interaction.member.displayAvatarURL()
    );
    let comps = tenMansStartComps(queueId, interaction.member.id);

    result = await con.request(trans)
      .input("GuildId", interaction.guildId)
      .input("ChannelName", "TENMANTXT")
      .output("ChannelId", VarChar(21))
      .output("Triggerable", Bit)
      .output("Type", VarChar(20))
      .execute("GetChannel");

    if (result.returnValue == 2) {
      await interaction.channel.send({ embeds: embeds, components: comps });
    } else if (result.returnValue == 0) {
      await (await interaction.guild.channels.fetch(result.output.ChannelId)).send({embeds: embeds, components: comps});
    } else {
      await interaction.editReply({content:"Something went wrong"});
      trans.rollback();
      return;
    }
    trans.commit(commitOnErrMaker(interaction));

    await interaction.editReply({
      ephemeral: true,
      content: `You have successfully launched a ten mans queue (Queue ID: ${queueId})`,
    });
    return;
  },
  permissions: "all",
};
