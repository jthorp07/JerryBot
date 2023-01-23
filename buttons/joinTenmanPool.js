const { ButtonInteraction, GuildMember } = require("discord.js");
const { ConnectionPool, Int } = require("mssql");
const Helpers = require("../util/helpers");
module.exports = {
  data: {
    customId: "join-tenman-pool", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    await interaction.deferReply({ ephemeral: true });

    /**
     * Check if user is in a voice channel (they have to be in one for this to work)
     * @type {GuildMember} */
    let user = interaction.member;
    if (!user.voice.channel) {
      interaction.editReply({
        ephemeral: true,
        content: `You must be in a voice channel before pressing this button <@${interaction.user.id}>!`,
      });
      return;
    }

    // Fetch 10 mans waiting lobby
    let trans = con.transaction();
    trans.begin(async (err) => {
      // DBMS error handling
      let rolledBack = false;
      trans.on("rollback", (aborted) => {
        if (aborted) {
          console.log("This rollback was triggered by SQL server");
        }
        rolledBack = true;
        return;
      });

      // Join player to queue
      let result = await con
        .request(trans)
        .input("GuildId", interaction.guildId)
        .input("UserId", user.id)
        .execute("JoinTenmans");

      if (result.returnValue === -1) {
        await trans.rollback();
        await interaction.editReply({
          ephemeral: true,
          content: "You need to register your rank before you can join!",
        });
        return;
      } else if (result.returnValue === 0) {
        result = await con
          .request(trans)
          .input("GuildId", interaction.guildId)
          .execute("GetRankRoles");

        // This is pretty inefficient but still faster than doing it efficiently but having to ping the database again
        let rankedRoles = result.recordset;
        let roleIcon = await Helpers.getRoleIcon(rankedRoles, user);

        // Prepare player information for new message board
        let newEntry = `${interaction.member.displayName} ${roleIcon}`;
        let embed = interaction.message.embeds[0];

        // If there are 10 players, start draft, otherwise add new player to player list
        if (embed.fields[0].value.split("\n").length >= 10) {
          // Identify 2 lowest ranks
          result = await con
            .request(trans)
            .input("GuildId", interaction.guildId)
            .output("NumCaptains", Int)
            .output("PlayerCount", Int)
            .execute("GetTenmansQueue");
          let draftInfo = await Helpers.selectCaptains(
            result,
            rankedRoles,
            interaction,
            embed
          );
          let newEmbed = Helpers.makeDraftEmbed(draftInfo, embed);
        } else {
          // Update: Update queue board with new player
          if (
            embed.fields[0].value ===
            "N/A\n\nplayers will show up here when they join"
          ) {
            embed.fields[0].value = newEntry;
          } else {
            // Add player to embed
            embed.fields[0].value = `${embed.fields[0].value}\n${newEntry}`;
          }
          await interaction.message.edit({
            embeds: [embed],
          });
        }

        // Success, reply and commit transaction
        trans.commit(async (err) => {
          if (err) {
            console.log(err);
            await interaction.editReply({
              ephemeral: true,
              content: "Something went wrong, sorry!",
            });
            // TODO: Have bot report error
            return;
          }

          interaction.editReply({
            ephemeral: true,
            content: `You are now in queue and in the 10 mans waiting area!\n\n**WARNING:**\nTo leave the queue, please either use the "Leave" button or leave all voice calls. Otherwise, you will be dragged back into a 10 mans call if/when you are assigned a team!\n<@${interaction.user.id}>`,
          });

          return;
        });
      } else {
        throw new Error(`Database failure: Code ${result.returnValue}`);
      }
    });
  },
};
