const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "leave-tenman-pool", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {

    // Go ahead and edit embed
    let userToRemove = interaction.member.displayName;
    let embed = interaction.message.embeds[0];
    let playerList = embed.fields[0].value.split('\n');
    playerList.forEach((player, i) => {
      if (player.includes(userToRemove)) {
        playerList.splice(i, 1);
      }
    });

    let newValue = playerList.join('\n');

    embed.fields[0].value = (newValue === '') ? 'N/A\n\nplayers will show up here when they join':newValue;

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
        .input('UserId', interaction.user.id)
        .execute('LeaveTenmans');

      if (result.returnValue !== 0) {
        trans.rollback();
        interaction.editReply({ ephemeral: true, content: 'Something went wrong o-o' });
        return;
      }

      trans.commit(async (err) => {
        if (err) {
          console.log(err);
          return;
        }

        interaction.message.edit({
          embeds: [embed]
        });

        await interaction.reply(
          `${interaction.user.username} left the player pool!`
        );

      });

    })


  },
};
