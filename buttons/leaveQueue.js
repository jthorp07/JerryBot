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

    let trans = await db.beginTransaction(async () => {
      console.log("wtf")
      await interaction.editReply({content:"Something went wrong creating a transaction"});
      return;
    });
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    const result = await db.leaveTenmans(
      queueId,
      interaction.guildId,
      interaction.user.id,
      trans
    );

    console.log('  [DEBUG]: End leaveTenmans()')

    if (result instanceof BaseDBError) {
      await trans.rollback();
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong o-o",
      });
      return;
    }

    if (result.wasCaptain) {

      const replaceCaptainResult = await db.replaceCaptain(
        queueId,
        result.queuePool,
        trans
      );

      console.log('  [DEBUG]: End replaceCaptain()')

      if (replaceCaptainResult) {
        trans.rollback();
        interaction.editReply({
          ephemeral: true,
          content: "Something went wrong o-o;",
        });
        return;
      }
    }

    console.log(`  [DEBUG]: QueueId: ${queueId}`)

    const queueResult = await db.getQueue(queueId, trans);
    console.log('  [DEBUG]: End getQueue()')
    if (queueResult instanceof BaseDBError) {
      trans.rollback();
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong o-o",
      });
      queueResult.log();
      return;
    }
    // Grab queue data
    await db.commitTransaction(trans);

    console.log('  [DEBUG]: End transaction')

    const queueStatus = queueResult.queueStatus;

    let playersAvailable = queueResult.records.availablePlayers;
    let teamOnePlayers = queueResult.records.teamOne;
    let teamTwoPlayers = queueResult.records.teamTwo;
    let host = await interaction.guild.members.fetch(queueResult.hostId);
    if (!host) {
      await interaction.editReply({
        content:
          "The queue has been deleted on the database, but the embed could not be updated",
      });
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
