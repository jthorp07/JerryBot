const { ButtonInteraction, ChannelType } = require("discord.js");
const {
  Transaction,
} = require("mssql");
const {
  GCADB,
  DiscordChannelName,
  BaseDBError,
  DiscordChannelType,
} = require("../gcadb");
const { QueuePool } = require("../gcadb/enums");

module.exports = {
  /**
   * Uses the player pool, server's ranked
   * roles, and current interaction to select
   * two captains for a ten mans draft
   *
   * @param {number} numCaps
   * @param {import("../gcadb/stored-procedures/get-queue").TenmansClassicQueuedUserRecord[]} potentialCaps
   * @param {import("../gcadb/stored-procedures/get-rank-roles").ValorantRankedRolesRecord[]} rankedRoles
   * @param {ButtonInteraction} interaction
   * @param {number} queueId
   * @param {GCADB} db
   * @param {Transaction} trans
   * @param {boolean} enforce
   *
   * @returns
   */
  async selectCaptains(
    numCaps,
    potentialCaps,
    rankedRoles,
    interaction,
    queueId,
    db,
    trans,
    enforce
  ) {

    // Establishing capPool type for intellisense
    let capPool = [
      {
        id: "",
        rank: 0,
      },
    ];
    capPool = [];

    // If not enough captains, the 2 lowest ranks will be picked regardless of prefs
    if (numCaps < 2 && enforce) {

      for (let record of potentialCaps) {
        let userId = record.playerId;
        let user = await interaction.guild.members.fetch(userId);
        let role;
        for (let entry of rankedRoles) {
          for (let item of user.roles.cache) {
            let roleId = item[1].id;
            if (roleId == entry.roleId) {
              capPool.push({
                id: userId,
                rank: entry.orderBy,
              });
              role = true;
              break;
            }
          }
          if (role) break;
        }
      }

      // Sort capPool by rank
      capPool.sort((cap1, cap2) => {
        cap1.rank - cap2.rank;
      });
    } else if (enforce) {
      for (let record of potentialCaps) {
        if (record.canBeCaptain == 0) continue;

        let userId = record.playerId;
        let user = await interaction.guild.members.fetch(userId);
        let role;

        for (let entry of rankedRoles) {
          for (let item of user.roles.cache) {
            let roleId = item[1].id;
            if (roleId == entry.roleId) {
              capPool.push({ id: userId, rank: entry.orderBy });
              role = true;
              break;
            }
          }
          if (role) break;
        }
      }
      // Sort capPool by rank
      capPool = capPool.sort((cap1, cap2) => {
        return cap1.rank - cap2.rank;
      });
    } else if (numCaps < 2) {
      for (record of potentialCaps) {
        capPool.push({ id: record.playerId, rank: 0 });
      }
    } else {
      for (record of potentialCaps) {
        if (record.canBeCaptain == 1) {
          capPool.push({ id: record.playerId, rank: 0 });
        }
      }
    }
    
    let capOneIndex = Math.floor(Math.random() * (capPool.length - 1));
    if (capOneIndex == (capPool.length - 1)) capOneIndex -= 1;

    let capTwoIndex = capOneIndex + 1;

    let capOne = capPool[capOneIndex];
    let capTwo = capPool[capTwoIndex];
    const result = await db.setCaptain(
      queueId,
      capOne.id,
      capTwo.id,
      interaction.guildId,
      trans
    );
    if (result instanceof BaseDBError) {
      result.log();
      await interaction.editReply({ content: "Something went wrong" });
      trans.rollback();
      return;
    }

    let done = await createCaptainVC(
      capOne.id,
      queueId,
      QueuePool.TEAM_ONE,
      interaction,
      db,
      trans
    );

    if (done) return;

    await createCaptainVC(
      capTwo.id,
      queueId,
      QueuePool.TEAM_TWO,
      interaction,
      db,
      trans
    );

    return {
      newAvailable: result.records.availablePlayers,
      newTeamOne: result.records.teamOne,
      newTeamTwo: result.records.teamTwo,
      newStatus: result.queueStatus,
    };
  },
};

/**
 * Takes a selected captain ID, creates a voice
 * channel for them, moves them to the created
 * voice channel, and stores the channel in the
 * database for future retrieval
 *
 * @param {string} capId ID of the captain this channel is for
 * @param {number} queueId ID of the queue this channel is for
 * @param {string} team Team this channel is for
 * @param {ButtonInteraction} interaction Interaction that triggered selecting captains
 * @param {GCADB} db Database connection
 * @param {Transaction} trans Database transaction
 */
async function createCaptainVC(capId, queueId, team, interaction, db, trans) {
  let cap = await interaction.guild.members.fetch(capId);
  let channel = await interaction.guild.channels.create({
    type: ChannelType.GuildVoice,
    name: `${cap.displayName}'s Channel (Team ${team})`,
  });

  const result = await db.getChannel(
    interaction.guildId,
    DiscordChannelName.TENMANS_CATEGORY,
    trans
  );
  if (result instanceof BaseDBError) {
    trans.rollback();
    result.log();
    await interaction.editReply({ content: "Something went wrong" });
    return;
  }

  await channel.edit(
    channel.setParent(await interaction.guild.channels.fetch(result.channelId))
  );
  const newResult = await db.createChannel(
    interaction.guildId,
    channel.id,
    `QUEUE:${queueId}:${team}`,
    DiscordChannelType.VOICE,
    false,
    trans
  );
  if (newResult) {
    trans.rollback();
    newResult.log();
    await interaction.editReply({ content: "Something went wrong" });
    return newResult;
  }

  await cap.voice.setChannel(channel);
}
