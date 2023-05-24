const { ButtonInteraction } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
  beginOnErrMaker,
  commitOnErrMaker,
} = require("../util/helpers");

module.exports = {
  data: {
    customId: "leave-queue", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    // Go ahead and edit embed
    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    const result = await db.leaveTenmans(
      queueId,
      interaction.user.id,
      interaction.guildId
    );

    if (result instanceof BaseDBError) {
      trans.rollback();
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong o-o",
      });
      return;
    }

    if (result.wasCaptain) {
      const replaceCaptainResult = await db.replaceCaptain(
        queueId,
        result.QueuePool
      );

      if (replaceCaptainResult) {
        trans.rollback();
        interaction.editReply({
          ephemeral: true,
          content: "Something went wrong o-o;",
        });
        return;
      }
    }

    const queueResult = await db.getQueue(queueId);
    if (queueResult instanceof BaseDBError) {
      trans.rollback();
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong o-o",
      });
      result.log();
      return;
    }
    // Grab queue data

    trans.commit(commitOnErrMaker(interaction));

    await db.commitTransaction(trans);

    const queueStatus = result.QueueStatus;

    let playersAvailable = queueResult.records.availablePlayers;
    let teamOnePlayers = queueResult.records.teamOne;
    let teamTwoPlayers = queueResult.records.teamTwo;
    let host = await interaction.guild.members.fetch(result.output.HostId);

    if (!host) {
      await interaction.editReply({
        content:
          "Something went wrong and the interaction could not be completed",
      });
      console.log("no host oops");
      console.log(JSON.stringify(host));
      await trans.rollback();
      return;
    }

    let embeds = tenMansClassicNextEmbed(
      queueStatus,
      playersAvailable,
      teamOnePlayers,
      teamTwoPlayers,
      null,
      host.displayName,
      host.displayAvatarURL(),
      null,
      0
    );

    let comps = tenMansClassicNextComps(
      queueId,
      queueStatus,
      playersAvailable,
      null,
      host.id
    );

    interaction.message.edit({
      embeds: embeds,
      components: comps,
    });

    await interaction.editReply({
      ephemeral: true,
      content: `${interaction.user.username} left the player pool!`,
    });
  },
};
