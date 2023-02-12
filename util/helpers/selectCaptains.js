const { ButtonInteraction, ChannelType } = require("discord.js");
const { IProcedureResult, IRecordSet, ConnectionPool, Transaction, NVarChar } = require("mssql");

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
   * 
   * @returns
   */
  async selectCaptains(numCaps, potentialCaps, rankedRoles, interaction, queueId, con, trans) {

    // Establishing capPool type for intellisense
    let capPool = [
      {
        id: "",
        rank: 0,
        name: "",
      },
    ];
    capPool = [];

    // If not enough captains, the 2 lowest ranks will be picked regardless of prefs
    if (numCaps < 2) {
      
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
                name: user.displayName,
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
    } else {
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
    }

    let capOne = capPool[0]
    let capTwo = capPool[1]
    let result = await con.request(trans)
      .input('QueueId', queueId)
      .input('CapOne', capOne.id)
      .input('CapTwo', capTwo.id)
      .input('GuildId', interaction.guildId)
      .output('QueueStatus', NVarChar(100))
      .execute('SetCaptains');

    return {
      newAvailable: result.recordsets[1],
      newTeamOne: result.recordsets[2],
      newTeamTwo: result.recordsets[3],
      newStatus: result.output.QueueStatus
    }

  },
};

// Create the channel in the Discord server
async function createCaptainVC(object, interaction) {
  const captain = await interaction.guild.members.fetch(object.id);
  return new Promise((resolve) => {
    /**@type {VoiceChannel} */
    let channel;
    interaction.guild.channels
      .create({
        name: `${captain.displayName}'s channel`,
        type: ChannelType.GuildVoice,
        reason: "cmd",
      })
      .then((vc) => {
        resolve({ ...object, name: captain.displayName });
      })
      .catch((err) => {
        console.error("BAD THING HAPPENED");
        console.error(err);
      });
  });
}
