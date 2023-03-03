const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const { ConnectionPool } = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvalorantname')
        .setDescription('Sets your VALORANT display name')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('VALORANT username (the stuff before the #)')
                .setMinLength(3)
                .setMaxLength(16)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tagline')
                .setDescription('VALORANT tagline (the stuff after the #)')
                .setMinLength(3)
                .setMaxLength(5)
                .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.deferReply({ephemeral:true});

        let valName = interaction.options.getString('name');
        let tagline = interaction.options.getString('tagline');

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
                .input('UserId', interaction.user.id)
                .input('ValName', `${valName}#${tagline}`)
                .execute('SetValorantName');

            if (result.returnValue != 0) {
                await interaction.editReply({ content: "Something went wrong and the command could not be completed" });
                return;
            }

            trans.commit(async (err) => {

                if (err) {
                    console.log(err);
                    await interaction.editReply({ content: "Something went wrong and the command could not be completed" });
                    return;
                }

                await interaction.editReply({content:"Your name has been updated"});

            });
        });
    },
    permissions: "all"
}