const { CommandInteraction, SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle } = require('discord.js');
const mssql = require('mssql');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Sets the bot up if it has not already done so'),
	/**
     * @param {CommandInteraction} interaction 
     * @param {mssql.ConnectionPool} con 
     */
	async execute(interaction, con) {

		await interaction.deferReply();

		let trans = con.transaction();
		trans.begin(async (err) => {

			// Error handling
			let rolledBack = false;
            trans.on("rollback", (aborted) => {
                if (aborted) {
                    console.log("This rollback was triggered by SQL server");
                }
                rolledBack = true;
            });

			let result = await trans.request(trans)
				.input('GuildId', interaction.guildId)
				.input('GuildName', interaction.guild.name)
				.execute('CreateGuild');

			if (result.returnValue != 0) {
				console.log('A database error occured in setup.js, query starting on line 28');
				interaction.editReply({content: 'Uh oh... something went wrong...'});
				return;
			}

			let embed = new EmbedBuilder()
				.setTitle('JerryBot? Setup')
				.setColor(Colors.Red)
				.setDescription('Thanks for using JerryBot?! This series of menus should help you get most of my functionality set up in your server!')
				.setFooter('JerryBot?')
				.addFields([{
					inline: true, 
					name: 'Select Setup Mode', 
					value: 'Press the button labelled "Automatic" to have the bot automatically set itself up, or press the button labelled "Manual" to manually set up the bot through these menus.\n\n**WARNING** Automatic setup will create several channels and roles.'}])
				.toJSON();

			let autoBtn = new ButtonBuilder()
				.setCustomId('autosetupbtn')
				.setLabel('Automatic')
				.setStyle(ButtonStyle.Primary)
				.toJSON();

			let manualBtn = new ButtonBuilder()
				.setCustomId('manualsetupbtn')
				.setLabel('Manual')
				.setStyle(ButtonStyle.Primary)
				.toJSON();

			await interaction.editReply({embeds: [embed], components: [autoBtn, manualBtn]});

		});

	},
	permissions: 'all'
};