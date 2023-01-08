const {
  CommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mssql = require("mssql");

const tenManEmbed = require("../embeds/tenManEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embedtest")
    .setDescription("Testing embed use"),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {mssql.ConnectionPool} con
   */
  async execute(interaction, con) {
    let comps = [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("join-tenman-pool")
          .setLabel("Join Player Pool")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("leave-tenman-pool")
          .setLabel("Leave Player Pool")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("join-tenman-spec")
          .setLabel("Join Spectators")
          .setStyle(ButtonStyle.Secondary)
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("start-tenman-game")
          .setLabel("Start Game")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("end-tenman-game")
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
    ];

    interaction.reply({
      embeds: [tenManEmbed.exampleEmbed],
      components: comps,
    });
  },
  permissions: "all",
};
