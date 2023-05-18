const { ButtonInteraction } = require("discord.js");
const { GCADB } = require("../util/gcadb");
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

    let result = await db.leaveTenmans(
      queueId,
      interaction.user.id,
      interaction.guildId
    );

    if (result) {
      trans.rollback();
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong o-o",
      });
      return;
    }

    if (result.WasCaptain) {
      result = await db.replaceCaptain(queueId, result.QueuePool);

      if (result) {
        trans.rollback();
        interaction.editReply({
          ephemeral: true,
          content: "Something went wrong o-o;",
        });
        return;
      }
    }

    result = await db.getQueue(queueId);
    // Grab queue data

    trans.commit(commitOnErrMaker(interaction));

    await db.commitTransaction(trans);

    let queueStatus = result.QueueStatus;
    // MIGHT NEED TO CHANGE THIS NOT SURE IF RECORDSETS EXISTS //
    let playersAvailable = result.recordsets[1];
    let teamOnePlayers = result.recordsets[2];
    let teamTwoPlayers = result.recordsets[3];
    let spectators = result.recordsets[4];
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
      spectators,
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
