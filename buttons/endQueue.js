const { ButtonInteraction, VoiceChannel } = require("discord.js");
const { ConnectionPool, VarChar, Bit } = require("mssql");
const { TENMANS_QUEUE_POOLS } = require("../util");

module.exports = {
  data: {
    customId: "end-queue", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    //TODO: Implement button command

    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);
    let hostId = idArgs[2];

    let trans = con.transaction();

    trans.begin(async (err) => {
      if (err) {
        await interaction.editReply({
          content: "Something went wrong",
        });
        return;
      }
      if (hostId !== interaction.member.id) {
        await interaction.editReply({
          content: "You do not have permission to end the queue",
        });
        return;
      }

      // DBMS error handling
      let rolledBack = false;
      trans.on("rollback", async (aborted) => {
        if (aborted) {
          console.log("This rollback was triggered by SQL server");
        }
        rolledBack = true;
        await interaction.editReply({ content: "Something went wrong" });
        return;
      });

      let result = await con
        .request(trans)
        .input("QueueId", queueId)
        .execute("EndQueue");

      result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input("ChannelName", "TENMANLOBBY")
        .output("ChannelId", VarChar(21))
        .output("Triggerable", Bit)
        .output("Type", VarChar(20))
        .execute("GetChannel");

      let lobbyId = result.output.ChannelId;

      result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input(
          "ChannelName",
          `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_ONE}`
        )
        .output("ChannelId", VarChar(21))
        .output("Triggerable", Bit)
        .output("Type", VarChar(20))
        .execute("GetChannel");

      let teamOneId = result.output.ChannelId;

      result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input(
          "ChannelName",
          `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_TWO}`
        )
        .output("ChannelId", VarChar(21))
        .output("Triggerable", Bit)
        .output("Type", VarChar(20))
        .execute("GetChannel");

      let teamTwoId = result.output.ChannelId;

      result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input(
          "ChannelName",
          `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_TWO}`
        )
        .execute("DeleteChannelByName");

      result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input(
          "ChannelName",
          `QUEUE:${queueId}:${TENMANS_QUEUE_POOLS.TEAM_ONE}`
        )
        .execute("DeleteChannelByName");

      trans.commit(async (err) => {
        if (err) {
          await interaction.editReply({ content: "Something went wrong" });
          return;
        }

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
      });
    });
  },
};
