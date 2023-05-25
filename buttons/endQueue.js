const { ButtonInteraction, VoiceChannel } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
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

    const result = await db.endQueue(queueId);
    if (result) {
      result.log();
      await interaction.editReply({content:"Something went wrong"});
      await trans.rollback();
      return;
    }

    const result2 = await db.getChannel(interaction.guildId, "TENMANLOBBY");
    if (result2 instanceof BaseDBError) {
      result2.log();
      if (result2.code != 2) {
        await interaction.editReply({content:"Something went wrong"});
        await trans.rollback();
        return;
      }
    }

    let lobbyId = result2.channelId;

    const result3 = await db.getChannel(
      interaction.guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_ONE}`
    );
    if (result3 instanceof BaseDBError) {
      result3.log();
      if (result3.code != 2) {
        await interaction.editReply({content:"Something went wrong"});
        await trans.rollback();
        return;
      }
    }

    let teamOneId = result3.channelId;

    const result4 = await db.getChannel(
      interaction.guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_TWO}`
    );
    if (result4 instanceof BaseDBError) {
      result4.log();
      if (result4.code != 2) {
        await interaction.editReply({content:"Something went wrong"});
        await trans.rollback();
        return;
      }
    }

    let teamTwoId = result4.channelId;

    const result5 = await db.deleteChannelByName(
      interaction.guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_TWO}`
    );
    if (result5) {
      result5.log();
      await interaction.editReply({content:"Something went wrong"});
      await trans.rollback();
      return;
    }

    const result6 = await db.deleteChannelByName(
      interaction.guildId,
      `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_ONE}`
    );

    if (result6 && result6.code != 2) {
      result6.log();
      await interaction.editReply({content:"Something went wrong"});
      await trans.rollback();
      return;
    } else if (result6) {
      result6.log();
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
            console.log("  [Bot]: Failed to move user");
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
