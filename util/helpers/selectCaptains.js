const { ButtonInteraction, ChannelType } = require("discord.js");
const { IRecordSet, ConnectionPool, Transaction, NVarChar, VarChar, Bit } = require("mssql");
const { CHANNEL_TYPES, TENMANS_QUEUE_POOLS } = require("../database-enums");

module.exports = {
  /**
   * Uses the player pool, server's ranked
   * roles, and current interaction to select
   * two captains for a ten mans draft
   *
   * @param {number} numCaps
   * @param {IRecordSet<any>} potentialCaps
   * @param {IRecordSet<any>} rankedRoles
   * @param {ButtonInteraction} interaction
   * @param {number} queueId
   * @param {ConnectionPool} con
   * @param {Transaction} trans
   * @param {boolean} enforce
   * 
   * @returns
   */
  async selectCaptains(numCaps, potentialCaps, rankedRoles, interaction, queueId, con, trans, enforce) {

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

      potentialCaps.forEach(async (record) => {
        let userId = record.PlayerId;
        let user = await interaction.guild.members.fetch(userId);
        let role;

        for (let entry of rankedRoles) {
          for (let item of user.roles.cache) {
            let roleId = item[1].id;
            if (roleId == entry.RoleId) {
              capPool.push({
                id: userId,
                rank: entry.OrderBy,
              });
              role = true;
              break;
            }
          }
          if (role) break;
        }
      });

      // Sort capPool by rank
      capPool.sort((cap1, cap2) => {
        cap1.rank - cap2.rank;
      });
    } else if (enforce) {
      for (let record of potentialCaps) {
        if (record.CanBeCaptain == 0) continue;

        let userId = record.PlayerId;
        let user = await interaction.guild.members.fetch(userId);
        let role;

        for (let entry of rankedRoles) {
          for (let item of user.roles.cache) {
            let roleId = item[1].id;
            if (roleId == entry.RoleId) {
              capPool.push({ id: userId, rank: entry.OrderBy });
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
        capPool.push({ id: record.PlayerId, rank: 0 });
      }
    } else {
      for (record of potentialCaps) {
        if (record.CanBeCaptain == 1) {
          capPool.push({ id: record.PlayerId, rank: 0 });
        }
      }
    }

    let capOneIndex = Math.floor(Math.random() * (capPool.length));
    if (capOneIndex == capPool.length) capOneIndex-= 2;

    let capTwoIndex = capOneIndex + 1;

    let capOne = capPool[capOneIndex];
    let capTwo = capPool[capTwoIndex];
    let result = await con.request(trans)
      .input('QueueId', queueId)
      .input('CapOne', capOne.id)
      .input('CapTwo', capTwo.id)
      .input('GuildId', interaction.guildId)
      .output('QueueStatus', NVarChar(100))
      .execute('SetCaptains');

    await createCaptainVC(capOne.id, queueId, TENMANS_QUEUE_POOLS.TEAM_ONE, interaction, con, trans);
    await createCaptainVC(capTwo.id, queueId, TENMANS_QUEUE_POOLS.TEAM_TWO, interaction, con, trans);

    return {
      newAvailable: result.recordsets[1],
      newTeamOne: result.recordsets[2],
      newTeamTwo: result.recordsets[3],
      newStatus: result.output.QueueStatus
    }

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
 * @param {ConnectionPool} con Database connection
 * @param {Transaction} trans Database transaction
 */
async function createCaptainVC(capId, queueId, team, interaction, con, trans) {

  let cap = await interaction.guild.members.fetch(capId);
  let channel = await interaction.guild.channels.create({
    type: ChannelType.GuildVoice,
    name: `${cap.displayName}'s Channel (Team ${team})`
  });

  let result = await con.request(trans)
    .input('GuildId', interaction.guildId)
    .input('ChannelName', 'TENMANCAT')
    .output('ChannelId', VarChar(21))
    .output('Triggerable', Bit)
    .output('Type', VarChar(20))
    .execute('GetChannel');

  await channel.edit(channel.setParent(await interaction.guild.channels.fetch(result.output.ChannelId)));
  result = await con.request(trans)
    .input('GuildId', interaction.guildId)
    .input('ChannelId', channel.id)
    .input('ChannelName', `QUEUE:${queueId}:${team}`)
    .input('ChannelType', CHANNEL_TYPES.VOICE)
    .input('Triggerable', 0)
    .execute('CreateChannel');

  await cap.voice.setChannel(channel);
}
