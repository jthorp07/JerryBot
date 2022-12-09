const { CommandInteraction, SlashCommandBuilder, ChannelType, VoiceChannel } = require('discord.js');
const mssql = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vc')
        .setDescription('Creates a personal voice channel for the user')
        .addNumberOption(option => 
            option.setMaxValue(16)
                .setMinValue(1)
                .setName('capacity')
                .setDescription('The number of people who will be able to be in the VC')
                .setRequired(false)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mssql.ConnectionPool} con 
     */
    async execute(interaction, con) {

        interaction.deferReply();

        let cap = interaction.options.getNumber('capacity');
        /**@type {VoiceChannel} */
        let channel;
        interaction.guild.channels.create({
            name: `${interaction.user.username}'s channel`,
            type: ChannelType.GuildVoice,
            reason: 'cmd'
        }).then(vc => {
            channel = vc;
        });
        
        let trans = con.transaction();
        
        trans.begin(async (err) => {

            let rolledBack = false;
            trans.on("rollback", (aborted) => {
                if (aborted) {
                    console.log("This rollback was triggered by SQL server");
                }
                rolledBack = true;
            });

            let result = await con.request(trans)
                                .input('ChannelName', 'VCCAT')
                                .input('GuildId', interaction.guildId)
                                .execute('GetChannel');

            let parentId = result.recordset[0].Id;
            channel.edit((await channel.setUserLimit(cap ? cap : 100)).setParent(parentId));

            result = await con.request(trans)
                            .input('GuildId', interaction.guildId)
                            .input('ChannelId', channel.id)
                            .input('ChannelName', channel.name)
                            .execute('CreateChannel');

            interaction.deleteReply();

        })
        .catch(err => {
            //fuck
            return;
        })

    },
    permissions: "all"
}