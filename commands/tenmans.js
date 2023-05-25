const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const { tenMansStartEmbed } = require("../util/embeds");
const { tenMansStartComps } = require("../util/components");

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
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    let type = interaction.options.getString("type");

    await interaction.deferReply({ ephemeral: true });

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    const result = await db.createQueue(
      interaction.guildId,
      interaction.member.id,
      type
    );

    if (result instanceof BaseDBError) {
      result.log();
      await interaction.editReply({content:"Something went wrong"});
      await trans.rollback();
      return;
    }

    let queueId = result;

    let embeds = tenMansStartEmbed(
      undefined,
      undefined,
      interaction.member.displayName,
      interaction.member.displayAvatarURL()
    );
    let comps = tenMansStartComps(queueId, interaction.member.id);

    const result2 = await db.getChannel(interaction.guildId, "TENMANTXT");

    // LOGIC FOR THIS CHECK MIGHT BE WRONG //

    if (result2 instanceof BaseDBError && result2.code == 2) {
      await interaction.channel.send({ embeds: embeds, components: comps });
    } else if (!(result2 instanceof BaseDBError)) {
      await (
        await interaction.guild.channels.fetch(result2.channelId)
      ).send({ embeds: embeds, components: comps });
    } else {
      result2.log();
      await interaction.editReply({ content: "Something went wrong" });
      trans.rollback();
      return;
    }

    await db.commitTransaction(trans);

    await interaction.editReply({
      ephemeral: true,
      content: `You have successfully launched a ten mans queue (Queue ID: ${queueId})`,
    });
    return;
  },
  permissions: "all",
};
