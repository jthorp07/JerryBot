const { StringSelectMenuInteraction } = require("discord.js");
const {
  ConnectionPool,
  NVarChar,
  Int,
  VarChar,
  PreparedStatement,
  Bit,
} = require("mssql");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
} = require("../util/helpers");

module.exports = {
  data: {
    customId: "player-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {StringSelectMenuInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {
    await interaction.deferReply({ ephemeral: true });
    //TODO: Implement button command
    let draftedId = interaction.values[0];
    let queueId = parseInt(idArgs[1]);

    let trans = con.transaction();
    trans.begin(async (err) => {
      // Transaction begin error
      if (err) {
        await interaction.editReply({
          content:
            "Something went wrong and the command could not be completed.",
        });
        console.log(err);
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

      let stmt = new PreparedStatement(trans)
        .input("UserId", VarChar(21))
        .input("QueueId", Int);

      let result;
      try {
        await stmt.prepare(
          "SELECT DraftPickId FROM Queues WHERE [Id]=@QueueId AND DraftPickId=@UserId"
        );
        result = await stmt.execute({
          UserId: interaction.user.id,
          QueueId: queueId,
        });
        await stmt.unprepare();
      } catch (err) {
        console.log(` [DB]: ${err}`);
        interaction.editReply({
          content:
            "Something went wrong and the command was unable to be processed",
        });
        return;
      }

      if (result.recordset.length == 0) {
        interaction.editReply({
          content: "It is not your turn to pick!",
        });
        trans.rollback();
        return;
      }

      const draftPlayerResult = await con
        .request(trans)
        .input("QueueId", queueId)
        .input("PlayerId", draftedId)
        .input("GuildId", interaction.guildId)
        .output("QueueStatus", NVarChar(100))
        .output("HostId", VarChar(21))
        .output("Team", NVarChar(100))
        .execute("DraftPlayer");

      if (draftPlayerResult.returnValue != 0) {
        await interaction.editReply({
          content:
            "Something went wrong and the command could not be completed",
        });
        console.log("Database error");
        trans.rollback();
        return;
      }

      let queueStatus = draftPlayerResult.output.QueueStatus;
      let playersAvailable = draftPlayerResult.recordsets[1];
      let teamOnePlayers = draftPlayerResult.recordsets[2];
      let teamTwoPlayers = draftPlayerResult.recordsets[3];
      let spectators = draftPlayerResult.recordsets[4];
      let host = await interaction.guild.members.fetch(
        draftPlayerResult.output.HostId
      );
      let team = draftPlayerResult.output.Team;

      const getChannelResult = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input("ChannelName", `QUEUE:${queueId}:${team}`)
        .output("ChannelId", VarChar(21))
        .output("Triggerable", Bit)
        .output("Type", VarChar(20))
        .execute("GetChannel");

      if (getChannelResult.returnValue != 0) {
        await interaction.editReply({
          content:
            "Something went wrong and the command could not be completed",
        });
        console.log("Database error");
        trans.rollback();
        return;
      }

      let channel = await interaction.guild.channels.fetch(
        getChannelResult.output.ChannelId
      );

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

      // Commit transaction and respond on Discord
      trans.commit(async (err) => {
        if (err) {
          trans.rollback();
          interaction.editReply({
            ephemeral: true,
            content:
              "Something went wrong and the command could not be completed.",
          });
          console.log(err);
          return;
        }

        let drafted = await interaction.guild.members.fetch(draftedId);
        try {
          drafted.voice.setChannel(channel);
        } catch (err) {
          await interaction.editReply({
            content: "User was unable to be moved into their team channel",
          });
          console.log(err);
        }

        await interaction.message.edit({
          embeds: embeds,
          components: comps,
        });
        await interaction.deleteReply();
        return;
      });
    });
  },
};
