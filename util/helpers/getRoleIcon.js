const { GuildMember } = require("discord.js");

module.exports = {
  /**
   * Loops through user and ranked roles to identify
   * the rank of the user (each user should have a role
   * corresponding to their rank)
   *
   * Returns the icon of the user's rank role
   * in string format, or the role's name if no icon exists
   *
   * @param {import("../gcadb/stored-procedures/get-rank-roles").ValorantRankedRolesRecord[]} rankedRoles
   * @param {GuildMember} user
   */
  getRoleIcon(rankedRoles, user) {


    for (let entry of rankedRoles) {
      for (let item of user.roles.cache) {
        let roleId = item[1].id;
        if (roleId == entry.roleId) {
          return { 
            icon: item[1].iconURL()
              ? item[1].iconURL()
              : entry.roleIcon,
            rank: entry.roleName,
            emote: entry.roleEmote,
          };
        }
      }
    }
  },
};
