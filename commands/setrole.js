const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { ConnectionPool } = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setrole')
        .setDescription('Sets a role for the server in the bot\'s memory')
        .addStringOption(option =>
            option.setName('rolename')
                .setDescription('The name of the role')
                .setRequired(true)
                .addChoices({ name: 'Unranked Rank Role', value: 'unranked' },
                    { name: 'Iron Rank Role', value: 'iron' },
                    { name: 'Bronze Rank Role', value: 'bronze' },
                    { name: 'Silver Rank Role', value: 'silver' },
                    { name: 'Gold Rank Role', value: 'gold' },
                    { name: 'Platinum Rank Role', value: 'platinum' },
                    { name: 'Diamond Rank Role', value: 'diamond' },
                    { name: 'Ascendant Rank Role', value: 'ascendant' },
                    { name: 'Immortal Rank Role', value: 'immortal' },
                    { name: 'Radiant Rank Role', value: 'radiant' }))
        .addNumberOption(option =>
            option.setName('ranklevel')
                .setDescription('For applicable tiers- the sublevel of the rank')
                .setRequired(true)
                .addChoices({ name: '1', value: 1 },
                    { name: '2', value: 2 },
                    { name: '3', value: 3 },
                ))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to be used')
                .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.deferReply();
        let role = interaction.options.getRole('role');
        let roleName = interaction.options.getString('rolename').toUpperCase();
        let roleLevel = interaction.options.getNumber('ranklevel');

        if (!(roleName == 'UNRANKED' || roleName == 'RADIANT')) {
            switch (roleLevel) {
                case 1:
                    roleName = `${roleName}_ONE`;
                    break;
                case 2:
                    roleName = `${roleName}_TWO`;
                    break;
                case 3:
                    roleName = `${roleName}_THREE`;
                    break;
            }
        }

        console.log(roleName);

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

            let result = await con.request(trans)
                .input('GuildId', interaction.guildId)
                .input('RoleId', role.id)
                .input('RoleName', roleName)
                .execute('SetRole');

            if (result.returnValue !== 0) {
                //TODO: Error
                await trans.rollback();
                return;
            }

            await interaction.editReply({ ephemeral: true, content: 'Role Set!' });
            trans.commit(err => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
    },
    permissions: "admin"
}