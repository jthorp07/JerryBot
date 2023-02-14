const { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, VoiceChannel } = require('discord.js');
const {ConnectionPool, VarChar, Bit} = require('mssql');

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
     * @param {ChatInputCommandInteraction} interaction 
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

        await interaction.deferReply();

        // Create the channel in the Discord server
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
        
        // Begin a database transaction to store newly made channel's information
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
                                .input('ChannelName', 'VCCAT')
                                .input('GuildId', interaction.guildId)
                                .output('ChannelId', VarChar(21))
                                .output('Triggerable', Bit)
                                .output('Type', VarChar(20))
                                .execute('GetChannel');

            let parentId = result.output.ChannelId;
            channel.edit((await channel.setUserLimit(cap ? cap : 100)).setParent(parentId));

            result = await con.request(trans)
                            .input('GuildId', interaction.guildId)
                            .input('ChannelId', channel.id)
                            .input('ChannelName', channel.name)
                            .input('ChannelType', 'voice')
                            .input('Triggerable', 1)
                            .execute('CreateChannel');

            interaction.editReply({content:"All done! Your channel should be in the VC Category now!"}).then(message => {
                setTimeout(() => {
                    message.delete();
                }, 5000)
            });

            trans.commit(err => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
    },
    permissions: "all"
}