const { SelectMenuInteraction } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const {
  tenMansClassicNextEmbed,
  tenMansClassicNextComps,
} = require("../util/helpers");

module.exports = {
  data: {
    customId: "side-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {SelectMenuInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */

  async execute(interaction, db, idArgs) {
    //TODO: Implement button command
    await interaction.deferReply({ ephemeral: true });

    let queueId = parseInt(idArgs[1]);

    let mapPick = idArgs[2];
    let firstUpper = mapPick.charAt(0).toUpperCase();
    mapPick = firstUpper.concat(mapPick.substring(1));

    let choice = interaction.values[0] == "atk" ? 1 : 2;

    // Authorize map/side picker
    let pickResult = await db.getMapSidePickId(interaction.user.id, queueId);

    if (pickResult instanceof BaseDBError) {
      pickResult.log();
      await interaction.editReply({content:"Something went wrong"});
      return;
    } else if (!pickResult.yourTurn) {
      await interaction.editReply({content:"You are not allowed to pick the sides for this game"});
      return;
    }

    const pickSideResult = await db.pickSide(queueId);

    if (pickSideResult instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed",
      });
      pickSideResult.log();
      return;
    }

    let queueStatus = pickSideResult.queueStatus;
    let playersAvailable = pickSideResult.records.availablePlayers;
    let teamOnePlayers = pickSideResult.records.teamOne;
    let teamTwoPlayers = pickSideResult.records.teamTwo;
    let spectators = null;
    let host = await interaction.guild.members.fetch(
      pickSideResult.hostId
    );

    let embeds = tenMansClassicNextEmbed(
      queueStatus,
      playersAvailable,
      teamOnePlayers,
      teamTwoPlayers,
      spectators,
      host.displayName,
      host.displayAvatarURL(),
      mapPick,
      choice
    );

    let comps = tenMansClassicNextComps(
      queueId,
      queueStatus,
      playersAvailable,
      mapPick,
      host.id
    );

    await interaction.message.edit({
      embeds: embeds,
      components: comps,
    });

    await interaction.editReply({content:"You've picked your team's side! Now the game should be ready to go. Good luck!"});
  },
};
