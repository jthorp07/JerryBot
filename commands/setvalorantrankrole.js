const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { ConnectionPool } = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvalorantrankrole')
        .setDescription('Sets a role for the server in the bot\'s memory')
        .addStringOption(option =>
            option.setName('rolename')
                .setDescription('The name of the role')
                .setRequired(true)
                .addChoices({ name: 'Unranked Rank Role', value: 'unranked:1' },
                    { name: 'Iron Rank Role', value: 'iron:1' },
                    { name: 'Bronze Rank Role', value: 'bronze:1' },
                    { name: 'Silver Rank Role', value: 'silver:1' },
                    { name: 'Gold Rank Role', value: 'gold:1' },
                    { name: 'Platinum Rank Role', value: 'platinum:1' },
                    { name: 'Diamond Rank Role', value: 'diamond:1' },
                    { name: 'Ascendant Rank Role', value: 'ascendant:1' },
                    { name: 'Immortal Rank Role', value: 'immortal:1' },
                    { name: 'Radiant Rank Role', value: 'radiant:1' }))
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

        await interaction.deferReply({ephemeral:true});
        let role = interaction.options.getRole('role');
        let roleName = interaction.options.getString('rolename').toUpperCase().split(':')[0];
        let roleGroup = parseInt(interaction.options.getString('rolename').split(':')[1]);
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

            if (err) {
                console.log(err);
                await interaction.editReply({ content: "Something went wrong and the command could not be completed" });
                return;
            }

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
                .input('OrderBy', roleGroup)
                .execute('SetRole');

            if (result.returnValue !== 0) {
                //TODO: Error
                await trans.rollback();
                return;
            }

            trans.commit(async (err) => {
                if (err) {
                    console.log(err);
                    await interaction.editReply({content:"Something went wrong and the command could not be completed"});
                    return;
                }
                await interaction.editReply({ ephemeral: true, content: 'Role Set!' });
            });
        });
    },
    permissions: "admin"
}