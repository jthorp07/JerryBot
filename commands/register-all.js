const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");
const { beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register-all")
    .setDescription("Registers all users in the current guild with the bot"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {GCADB} db
   */
  async execute(interaction, db) {
    await interaction.reply({
      content:
        "Beginning to register all guild users...\n\n**WARNING**\nThis may take a while! When the job is completed, this message will be updated.",
    });

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let users = interaction.guild.members.cache;
    let guildId = interaction.guildId;
    let alreadyIn = 0;
    let usersAdded = 0;

    // Register guild & guild owner first to avoid ternary check for every member
    let owner = await interaction.guild.members.fetch(
      interaction.guild.ownerId
    );
    let result = await db.createGuild(guildId, interaction.guild.name);

    if (result) {
      interaction.editReply({
        ephemeral: true,
        content: "Something went wrong",
      });
      trans.rollback();
      return;
    }

    result = await db.createGuildMember(
      guildId,
      owner.id,
      1,
      owner.user.username,
      owner.displayName,
      null
    );

    if (result.code === 3) {
      alreadyIn++;
    } else if (result) {
      interaction.editReply({
        ephemeral: true,
        content:
          "Something went wrong, rolling back and cancelling to prevent data corruption",
      });
      trans.rollback();
      return;
    } else {
      usersAdded++;
    }

    for (let item of users) {
      let user = item[1];
      result = await db.createGuildMember(
        guildId,
        user.id,
        0,
        user.user.username,
        user.displayName,
        null
      );

      if (result.code === 3) {
        alreadyIn++;
      } else if (result) {
        interaction.editReply({
          ephemeral: true,
          content:
            "Something went wrong, rolling back and cancelling to prevent data corruption",
        });
        trans.rollback();
        return;
      } else {
        usersAdded++;
      }
    }

    await db.commitTransaction(trans);

    interaction.editReply({
      ephemeral: true,
      content: `All done! Here\'s a summary of what happened:\n\n  Users added: ${usersAdded}\n  Previously registered users (skipped): ${alreadyIn}`,
    });
  },
  permissions: "admin",
};
