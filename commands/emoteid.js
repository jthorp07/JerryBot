const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { GCADB } = require("../util/gcadb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoteid")
    .setDescription("Sends the emote and id")
    .addStringOption((option) =>
      option.setName("emote").setDescription("a string").setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {
    let stringoption = interaction.options.getString("emote");
    console.log(stringoption);
    await interaction.reply({ content: `\`\`\`${stringoption}\`\`\`` });
  },
  permissions: "admin",
};
