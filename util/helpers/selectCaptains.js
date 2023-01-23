const { ButtonInteraction, ChannelType } = require("discord.js");
const { IProcedureResult, IRecordSet } = require("mssql");

module.exports = {
  /**
   * Uses the player pool, server's ranked
   * roles, and current interaction to select
   * two captains for a ten mans draft
   *
   * @param {IProcedureResult} result
   * @param {IRecordSet} rankedRoles
   * @param {ButtonInteraction} interaction
   * @returns
   */

  async selectCaptains(result, rankedRoles, interaction) {
    let capPool = [
      {
        id: "",
        rank: 0,
        name: "",
      },
    ];

    // console.log(result);
    capPool = [];
    let numCaps = result.output.NumCaptains;
    if (numCaps < 2) {
      // If not enough captains, the 2 lowest ranks will be picked regardless of prefs
      result.recordset.forEach(async (record) => {
        let userId = record.MemberId;
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
      for (let record of result.recordset) {
        if (record.CanBeCaptain == 0) continue;

        let userId = record.MemberId;
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
      capPool.sort((cap1, cap2) => {
        cap1.rank - cap2.rank;
      });

      for (let record of result.recordset) {
        if (record.CanBeCaptain == 1) continue;

        let userId = record.MemberId;
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
    }

    // TODO: Maybe later rewrite this to remove the reverses
    // console.log(`Captain Pool:\n\n${JSON.stringify(capPool)}\n\n`);
    capPool = capPool.reverse();
    let capOne = capPool.pop();
    let capTwo = capPool.pop();
    capPool = capPool.reverse();
    let draftInfo = {
      capOne: await createCaptainVC(capOne, interaction),
      capTwo: await createCaptainVC(capTwo, interaction),
      draftInfo: capPool,
    };
    // console.log(`Draft Pool:\n\n${JSON.stringify(capPool)}\n\n`);
    // console.log(capOne);
    return draftInfo;
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
