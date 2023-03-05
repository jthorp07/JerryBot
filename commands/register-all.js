const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { ConnectionPool } = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register-all')
        .setDescription('Registers all users in the current guild with the bot'),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.reply({ content: "Beginning to register all guild users...\n\n**WARNING**\nThis may take a while! When the job is completed, this message will be updated." });

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

            let users = interaction.guild.members.cache;
            let guildId = interaction.guildId;
            let alreadyIn = 0;
            let usersAdded = 0;

            // Register guild & guild owner first to avoid ternary check for every member
            let owner = await interaction.guild.members.fetch(interaction.guild.ownerId);
            let result = await con.request(trans)
                .input('GuildId', guildId)
                .input('GuildName', interaction.guild.name)
                .execute('CreateGuild');
            
            if (result.returnValue !== 0 && !result.returnValue === 2) {
                interaction.editReply({ephemeral:true, content:'Something went wrong'});
                trans.rollback();
                return;
            }

            result = await con.request(trans)
                .input('GuildId', guildId)
                .input('UserId', owner.id)
                .input('IsOwner', 1)
                .input('Username', owner.user.username)
                .input('GuildDisplayName', owner.displayName)
                .input('ValorantRankRoleName', null)
                .execute('CreateGuildMember');

            if (result.returnValue === 2) {
                alreadyIn++;
            } else if (result.returnValue !== 0) {
                interaction.editReply({ ephemeral: true, content: 'Something went wrong, rolling back and cancelling to prevent data corruption' });
                trans.rollback();
                return;
            } else {
                usersAdded++;
            }

            for (let item of users) {
                let user = item[1];
                let result = await con.request(trans)
                    .input('GuildId', guildId)
                    .input('UserId', user.id)
                    .input('IsOwner', 0)
                    .input('Username', user.user.username)
                    .input('GuildDisplayName', user.displayName)
                    .input('ValorantRankRoleName', null)
                    .execute('CreateGuildMember');

                if (result.returnValue === 2) {
                    alreadyIn++;
                } else if (result.returnValue !== 0) {
                    interaction.editReply({ ephemeral: true, content: 'Something went wrong, rolling back and cancelling to prevent data corruption' });
                    trans.rollback();
                    return;
                } else {
                    usersAdded++;
                }
            }

            trans.commit(async (err) => {
                if (err) {
                    interaction.editReply({ephemeral:true,content:'Something went wrong!'});
                    trans.rollback();
                    console.log(err);
                    return;
                }


                interaction.editReply({ ephemeral: true, content: `All done! Here\'s a summary of what happened:\n\n  Users added: ${usersAdded}\n  Previously registered users (skipped): ${alreadyIn}` });
                return;
            });
        });
    },
    permissions: "admin"
}