const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { ConnectionPool, Int } = require("mssql");
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
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    let type = interaction.options.getString("type");

    await interaction.deferReply({ ephemeral: true });

    let trans = con.transaction();
    trans.begin(async (err) => {

      if (err) {
        console.log(err);
        await interaction.editReply({content:"Something went wrong and the command could not be completed"});
        return;
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

      let queueId;
      let result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input("HostId", interaction.member.id)
        .input("QueueType", type)
        .output("QueueId", Int, queueId)
        .execute("CreateQueue");

      if (!queueId) queueId = result.output.QueueId;

      let embeds = tenMansStartEmbed(
        undefined,
        undefined,
        interaction.member.displayName,
        interaction.member.displayAvatarURL()
      );
      let comps = tenMansStartComps(queueId, interaction.member.id);

      await interaction.channel.send({ embeds: embeds, components: comps });

      trans.commit(async (err) => {
        
        if (err) {
          console.log(err);
          await interaction.editReply({content:"Something went wrong and the command could not be completed"});
          return;
        }

        await interaction.editReply({
          ephemeral: true,
          content: `You have successfully launched a ten mans queue (Queue ID: ${queueId})`,
        });
        return;
      });
    });
  },
  permissions: "all",
};
