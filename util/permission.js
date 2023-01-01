const mssql = require('mssql');

module.exports = {

    /**
     * Returns a promise that resolves as true if the 
     * command's user has permission to use the command
     * or as false if the user does not have permission.
     * 
     * @param {mssql.ConnectionPool} con 
     * @param {string} permissionLevel 
     * @param {string} user 
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
                
                for (let admin of admins) {
                    if (user == admin) {
                        resolve(true);
                        return;
                    }
                }
                resolve(false);
                return;
            }

            // TODO: Add permission rules here

            // Timeout after 30 seconds (should not take nearly that long to finish)
            setTimeout(() => {
                reject('Timeout');
            }, 30000);

        });
    }
}