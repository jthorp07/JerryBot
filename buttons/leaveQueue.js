const { ButtonInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");

module.exports = {
  data: {
    customId: "leave-queue", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   * @param {string[]} idArgs
   */
  async execute(interaction, con, idArgs) {


    // Go ahead and edit embed
    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);

    let trans = con.transaction();
    trans.begin(async (err) => {

      if (err) {
        await interaction.editReply({content:"Something went wrong"});
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

      let result = await con
        .request(trans)
        .input("QueueId", queueId)
        .input("UserId", interaction.user.id)
        .execute("LeaveTenmans");

      if (result.returnValue !== 0) {
        trans.rollback();
        interaction.editReply({
          ephemeral: true,
          content: "Something went wrong o-o",
        });
        return;
      }

      trans.commit(async (err) => {
        if (err) {
          console.log(err);
          await interaction.editReply({content:'Something went wrong o-o'})
          return;
        }

        interaction.message.edit({
          embeds: [embed],
        });

        await interaction.editReply({
          ephemeral: true,
          content: `${interaction.user.username} left the player pool!`,
        });
      });
    });
  },
};
