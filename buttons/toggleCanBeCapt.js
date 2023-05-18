const { GCADB } = require("../util/gcadb");
const { ButtonInteraction } = require("discord.js");
const { beginOnErrMaker, commitOnErrMaker } = require("../util/helpers");
const { prefsEmbed } = require("../util/embeds");
const { prefsComps } = require("../util/components");

module.exports = {
  data: {
    customId: "toggle-canbecapt", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {ButtonInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    let canBeCapt = idArgs[1] == "false" ? false : true;

    await interaction.deferReply({ ephemeral: true });

    let trans = await db.beginTransaction();
    if (!trans) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed.",
      });
      return;
    }

    let result = await db.setCanBeCaptain(
      interaction.user.id,
      interaction.guildId,
      !canBeCapt
    );

    if (result) {
      console.log("Invalid proc");
      await interaction.editReply({
        content:
          "Something went wrong and the interaction could not be completed",
      });
      await trans.rollback();
      return;
    }
    await db.commitTransaction(trans);

    let comps = prefsComps(!canBeCapt);
    let embeds = prefsEmbed(
      interaction.member.displayName,
      interaction.member.displayAvatarURL(),
      interaction.guild.name,
      !canBeCapt
    );

    await interaction.editReply({ embeds: embeds, components: comps });
  },
};
