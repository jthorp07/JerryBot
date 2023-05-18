const { ButtonInteraction, VoiceChannel } = require("discord.js");
const { GCADB } = require("../util/gcadb");
const { TENMANS_QUEUE_POOLS } = require("../util");
const { beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");

module.exports = {
  data: {
    customId: "end-queue", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    //TODO: Implement button command

    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);
    let hostId = idArgs[2];
    if (hostId != interaction.member.id) {
      await interaction.editReply({
        content: "You do not have permission to end the queue",
      });
      return;
    }

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let result = await db.endQueue(queueId);

    result = await db.getChannel(interaction.guildId, "TENMANLOBBY");

    let lobbyId = result.ChannelId;

    result = await db.getChannel(
      interaction.guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_ONE}`
    );

    let teamOneId = result.ChannelId;

    result = await db.getChannel(
      interaction.guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_TWO}`
    );

    let teamTwoId = result.ChannelId;

    result = await db.deleteChannelByName(
      guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_TWO}`
    );
    result = await db.deleteChannelByName(
      guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_ONE}`
    );

    if (result) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      trans.rollback();
      return;
    }
    await db.commitTransaction(trans);

    /** @type {VoiceChannel} */
    let lobbyChan = await interaction.guild.channels.fetch(lobbyId);
    /** @type {VoiceChannel} */
    let teamOneChan = await interaction.guild.channels.fetch(teamOneId);
    /** @type {VoiceChannel} */
    let teamTwoChan = await interaction.guild.channels.fetch(teamTwoId);

    await Promise.all(
      teamOneChan?.members?.map(async (member) => {
        return new Promise((resolve, reject) => {
          try {
            resolve(member.voice.setChannel(lobbyChan));
          } catch (err) {
            reject(new Error("Failed to move user"));
            console.log("Failed to move user");
          }
        });
      })
    )
      .then(() => {
        teamOneChan.delete("Queue has ended");
      })
      .catch(() => {
        console.error(
          "Could not delete VC because there was still one or more members in the call"
        );
      });

    await Promise.all(
      teamTwoChan?.members?.map(async (member) => {
        return new Promise((resolve, reject) => {
          try {
            resolve(member.voice.setChannel(lobbyChan));
          } catch (err) {
            reject(new Error("Failed to move user"));
            console.log("Failed to move user");
          }
        });
      })
    )
      .then(() => {
        teamTwoChan.delete("Queue has ended");
      })
      .catch(() => {
        console.error(
          "Could not delete VC because there was still one or more members in the call"
        );
      });

    interaction.editReply({ content: "The queue has ended" });

    if (interaction.message.deletable) {
      interaction.message.delete();
    }
  },
};
