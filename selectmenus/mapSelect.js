const { SelectMenuInteraction } = require("discord.js");
const { GCADB, BaseDBError } = require("../util/gcadb");
const {
  tenMansClassicNextComps,
  tenMansClassicNextEmbed,
} = require("../util/helpers");

module.exports = {
  data: {
    customId: "map-select-menu", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   * @param {SelectMenuInteraction} interaction
   * @param {GCADB} db
   * @param {string[]} idArgs
   */
  async execute(interaction, db, idArgs) {
    await interaction.deferReply({ ephemeral: true });
    //TODO: Implement button command
    let queueId = parseInt(idArgs[1]);

    let mapPick = interaction.values[0];
    let firstUpper = mapPick.charAt(0).toUpperCase();
    mapPick = firstUpper.concat(mapPick.substring(1));

    // Authorize map/side picker
    const pickResult = await db.getMapSidePickId(interaction.user.id, queueId);
    
    if (pickResult instanceof BaseDBError) {
      pickResult.log();
      await interaction.editReply({content:"Something went wrong"});
      return;
    }

    if (!pickResult.yourTurn) {
      interaction.editReply({
        content: "It is not your turn to pick!",
      });
      return;
    }

    const pickMapResult = await db.pickMap(queueId);

    if (pickMapResult instanceof BaseDBError) {
      await interaction.editReply({
        content: "Something went wrong and the command could not be completed",
      });
      pickMapResult.log();
      return;
    }

    let queueStatus = pickMapResult.queueStatus;
    let playersAvailable = pickMapResult.records.availablePlayers;
    let teamOnePlayers = pickMapResult.records.teamOne;
    let teamTwoPlayers = pickMapResult.records.teamTwo;
    let spectators = null;
    let host = await interaction.guild.members.fetch(
      pickMapResult.hostId
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
      0
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

    await interaction.editReply("You selected a map! Now pick a side and let the game begin!", { ephemeral: true });
  },
};
