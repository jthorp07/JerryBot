const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const mssql = require("mssql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tenmanbtns")
    .setDescription("Testing button use"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {mssql.ConnectionPool} con
   */
  async execute(interaction, con) {
    let comps = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("join-tenman-pool")
          .setLabel("Join Player Pool")
          .setStyle(ButtonStyle.Primary)
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("leave-tenman-pool")
          .setLabel("Leave Player Pool")
          .setStyle(ButtonStyle.Danger)
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("join-tenman-spec")
          .setLabel("Join Spectators")
          .setStyle(ButtonStyle.Secondary)
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("leave-tenman-spec")
          .setLabel("Leave Spectators")
          .setStyle(ButtonStyle.Danger)
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("start-tenman-game")
          .setLabel("Start Game")
          .setStyle(ButtonStyle.Success)
      ),
      // new ActionRowBuilder().addComponents(
      //   new ButtonBuilder()
      //     .setCustomId("end-tenman-game")
      //     .setLabel("End Game")
      //     .setStyle(ButtonStyle.Danger)
      // ),
    ];
    await interaction.reply({
      content: "Buttons for 10 Mans",
      components: comps,
    });
  },
  permissions: "all",
};
