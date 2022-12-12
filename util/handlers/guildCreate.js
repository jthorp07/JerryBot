const {Guild} = require('discord.js');
const {ConnectionPool} = require('mssql');

module.exports = {

    /**
     * 
     * @param {Guild} guild 
     * @param {ConnectionPool} con 
     */
    async onGuildCreate(guild, con) {
        let trans = con.transaction();
        trans.begin(async (err) => {

            if (err) {
                trans.rollback();
                return;
            }

            let rolledBack = false;
            trans.on("rollback", (aborted) => {
                if (aborted) {
                    console.log("This rollback was triggered by SQL server");
                }
                rolledBack = true;
            });

            let result = await con.request(trans)
                .input('GuildId', VarChar(20), guild.id)
                .input('GuildName', VarChar(32))
                .execute('CreateGuild');

            if (result.returnValue != 0) {
                trans.rollback();
            }

        }).catch(err => {
            console.log(err);
            return;
        })
    }
}