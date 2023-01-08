const { ButtonInteraction, GuildMember } = require("discord.js");
const { ConnectionPool } = require("mssql");

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

      interaction.editReply({ ephemeral: true, content: `You must be in a voice channel before pressing this button <@${interaction.user.id}>!` });
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

      let result = await con.request(trans)
        .input('GuildId', interaction.guildId)
        .input('UserId', user.id)
        .execute('JoinTenmans');

      if (result.returnValue === -1) {

        //TODO: Fail, rank not registered
        return;

      } else if (result.returnValue === 0) {

        let roleIcon
        result = await con.request(trans)
          .input('GuildId', interaction.guildId)
          .execute('GetRankRoles');
       
        // This is pretty inefficient but still faster than doing it efficiently but having to ping the database again
        for (let entry of result.recordset) {
          for (let item of user.roles.cache) {
            let roleId = item[1].id;
            if (roleId == entry.RoleId) {
              roleIcon = item[1].icon ? item[1].icon:item[1].unicodeEmoji;
              break;
            }
          }
          if (roleIcon) break;
        }

        // Prepare player information for new message board
        let newEntry = `${interaction.member.displayName} ${roleIcon}`;

        // Success, reply and commit transaction
        trans.commit().then(async () => {

          // Update: Update queue board with new player
          let embed = interaction.message.embeds[0];
          let playerList = embed.fields[0].value.split('\n');
          if (playerList.length === 0) {
            embed.fields[0].value = newEntry;
          } else {
            embed.fields[0].value = `${embed.fields[0].value}\n${newEntry}`;
          }
          await interaction.message.edit({            
            //TODO: UPDATE BOARD
            embeds:[embed]

          });

          // Reply: Inform user they are in queue
          interaction.editReply({
            ephemeral: true,
            content: `You are now in queue and in the 10 mans waiting area!\n\n**WARNING:**\nTo leave the queue, please either use the "Leave" button or leave all voice calls. Otherwise, you will be dragged back into a 10 mans call if/when you are assigned a team!\n<@${interaction.user.id}>`
          });

          

          return;
        });
      }
    });
  },
};
