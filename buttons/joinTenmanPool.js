const { ButtonInteraction, GuildMember, EmbedBuilder } = require("discord.js");
const { ConnectionPool, Int, IProcedureResult, IRecordSet } = require("mssql");

module.exports = {
  data: {
    customId: "join-tenman-pool", // customId of buttons that will execute this command
    permissions: "all", //TODO: Implement other permission options
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {ConnectionPool} con
   */
  async execute(interaction, con) {

    await interaction.deferReply({ ephemeral: true });

    /**
     * Check if user is in a voice channel (they have to be in one for this to work)
     * @type {GuildMember} */
    let user = interaction.member;
    if (!user.voice.channel) {

      interaction.editReply({ ephemeral: true, content: `You must be in a voice channel before pressing this button <@${interaction.user.id}>!` });
      return;

    }

    // Fetch 10 mans waiting lobby
    let trans = con.transaction();
    trans.begin(async (err) => {

      // DBMS error handling
      let rolledBack = false;
      trans.on("rollback", (aborted) => {
        if (aborted) {
          console.log("This rollback was triggered by SQL server");
        }
        rolledBack = true;
        return;
      });

      // Join player to queue
      let result = await con.request(trans)
        .input('GuildId', interaction.guildId)
        .input('UserId', user.id)
        .execute('JoinTenmans');

      if (result.returnValue === -1) {

        await trans.rollback();
        await interaction.editReply({ ephemeral: true, content: "You need to register your rank before you can join!" });
        return;
      } else if (result.returnValue === 0) {

        result = await con.request(trans)
          .input('GuildId', interaction.guildId)
          .execute('GetRankRoles');

        // This is pretty inefficient but still faster than doing it efficiently but having to ping the database again
        let rankedRoles = result.recordset;
        let roleIcon = await getRoleIcon(rankedRoles, user);

        // Prepare player information for new message board
        let newEntry = `${interaction.member.displayName} ${roleIcon}`;
        let embed = interaction.message.embeds[0];

        // If there are 10 players, start draft, otherwise add new player to player list
        if (embed.fields[0].value.split('\n').length >= 10) {

          // Identify 2 lowest ranks
          result = await con.request(trans)
            .input('GuildId', interaction.guildId)
            .output('NumCaptains', Int)
            .output('PlayerCount', Int)
            .execute('GetTenmansQueue');
          let draftInfo = await selectCaptains(result, rankedRoles, interaction, embed);
          let newEmbed = makeDraftEmbed(draftInfo, embed);
        } else {
          // Update: Update queue board with new player
          if (embed.fields[0].value === 'N/A\n\nplayers will show up here when they join') {
            embed.fields[0].value = newEntry;
          } else {
            // Add player to embed
            embed.fields[0].value = `${embed.fields[0].value}\n${newEntry}`;
          }
          await interaction.message.edit({
            embeds: [embed]
          });
        }

        // Success, reply and commit transaction
        trans.commit(async (err) => {
          if (err) {
            console.log(err);
            await interaction.editReply({ ephemeral: true, content: "Something went wrong, sorry!" });
            // TODO: Have bot report error
            return;
          }

          interaction.editReply({
            ephemeral: true,
            content: `You are now in queue and in the 10 mans waiting area!\n\n**WARNING:**\nTo leave the queue, please either use the "Leave" button or leave all voice calls. Otherwise, you will be dragged back into a 10 mans call if/when you are assigned a team!\n<@${interaction.user.id}>`
          });

          return;
        });
      } else {
        throw new Error(`Database failure: Code ${result.returnValue}`);
      }
    });
  },
};



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
async function selectCaptains(result, rankedRoles, interaction) {

  let capPool = [
    {
      id: '',
      rank: 0,
      name: ''
    }
  ];
  capPool = [];
  let numCaps = result.output.get('NumCaptains');
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
            capPool.push({ id: userId, rank: entry.OrderBy, name: user.displayName });
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
  console.log(`Captain Pool:\n\n${JSON.stringify(capPool)}\n\n`);
  capPool = capPool.reverse();
  let capOne = capPool.pop();
  let capTwo = capPool.pop();
  capPool = capPool.reverse();
  console.log(`Draft Pool:\n\n${JSON.stringify(capPool)}\n\n`);
  return {
    capOne: capOne,
    capTwo: capTwo,
    draftPool: capPool
  };
}

/**
 * Loops through user and ranked roles to identify
 * the rank of the user (each user should have a role
 * corresponding to their rank)
 * 
 * Returns the icon of the user's rank role
 * in string format, or the role's name if no icon exists
 * 
 * @param {IRecordSet} rankedRoles 
 * @param {GuildMember} user
 */
async function getRoleIcon(rankedRoles, user) {
  for (let entry of rankedRoles) {
    for (let item of user.roles.cache) {
      let roleId = item[1].id;
      if (roleId == entry.RoleId) {
        return item[1].icon ? item[1].icon : item[1].unicodeEmoji ? item[1].unicodeEmoji : item[1].name;
      }
    }
  }
}

/**
 * 
 * @param {*} draftInfo 
 * @param {Embed} embed 
 * @returns 
 */
function makeDraftEmbed(draftInfo, embed) {
  // Set up draft embed
  let specs = embed.fields[1];
  let oldPlayers = embed.fields[0].value.split('\n');

  //TODO: This is bad. I'll fix it eventually 
  oldPlayers.forEach((player, i) => {
    if (player.startsWith(draftInfo.capOne.name) || player.startsWith(`${draftInfo.capTwo.name} `)) oldPlayers.splice(i, 1);
  });
  oldPlayers.forEach((player, i) => {
    if (player.startsWith(draftInfo.capOne.name) || player.startsWith(`${draftInfo.capTwo.name} `)) oldPlayers.splice(i, 1);
  });
  let draftList = oldPlayers.join('\n');
  return new EmbedBuilder()
    .addFields(
      {
        name: `Team 1`,
        value: `${draftInfo.capOne.name} [Captain]`,
        inline: false
      },
      {
        name: `Team 2`,
        value: `${draftInfo.capTwo.name} [Captain]`,
        inline: false
      },
      {
        name: `Available Players`,
        value: draftList, //TODO: Reformat draftInfo.draftPool to string and put here,
        inline: true
      },
      {
        name: specs.name,
        value: specs.value,
        inline: true
      }
    );
}
