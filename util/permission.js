const {ConnectionPool} = require('mssql');
const {GuildMember} = require('discord.js');

module.exports = {

    /**
     * Returns a promise that resolves as true if the 
     * command's user has permission to use the command
     * or as false if the user does not have permission.
     * 
     * @param {ConnectionPool} con 
     * @param {string} permissionLevel 
     * @param {GuildMember} user 
     * 
     * @returns {Promise<boolean>}
     */
    async checkPermissions(con, permissionLevel, user) {

        return new Promise((resolve, reject) => {
            if (permissionLevel == 'all') {
                resolve(true);
                return;
            }

            if (permissionLevel == 'admin') {

                let admins = [];
                admins.push(process.env.JACK);
                admins.push(process.env.UNI);
                admins.push(process.env.ANIMUZ);
                admins.push(process.env.WENDLER);
                admins.push(process.env.WORTHY);
                admins.push(process.env.MANUAL);
                admins.push(process.env.PEPPA);
                
                for (let admin of admins) {
                    if (user.id == admin) {
                        resolve(true);
                        return;
                    }
                }
                resolve(false);
                return;
            }

            if (permissionLevel == 'queuehost') {

            }

            // TODO: Add permission rules here

            // Timeout after 2.5 seconds 
            setTimeout(() => {
                reject('Timeout');
            }, 2500);

        });
    }
}