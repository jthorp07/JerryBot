const { checkPermissions } = require('../permission');
const { Interaction, ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction } = require('discord.js');
const { ConnectionPool } = require('mssql');



/**
 * Runs a command interaction execution
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @param {ConnectionPool} con 
 */
async function onSlashCommand(interaction, con, knownInteractions) {
	// Prepare command for execution
	let command = knownInteractions.commands.get(interaction.commandName);
	if (!command) {
		interaction.editReply({ content: 'Unknown Command' });
	}

	// Check user permissions for command
	let permCheck = await checkPermissions(con, command.permissions, interaction.user.id).catch(err => {
		interaction.editReply({content: 'Something went wrong authenticating this command o-o'});
		console.log(err);
		return;
	});
	if (permCheck) {
		command.execute(interaction, con);
		console.log('  [Bot]: Command executed');
	} else {
		// No perms -> Let 'em know and go
		interaction.editReply({ content: 'Sorry, you don\'t have adequate permissions to use this command!' });
	}
}

/**
 * Runs a button interaction execution
 * 
 * @param {ButtonInteraction} interaction 
 * @param {ConnectionPool} con
 */
async function onButton(interaction, con, knownInteractions) {

	let btn = knownInteractions.buttons.get(interaction.customId);
	if (!btn) {
		interaction.editReply({content: 'Unknown Button'});
	}

	let permCheck = await checkPermissions(con, btn.data.permissions, interaction.user.id).catch(err => {
		interaction.editReply({content: 'Something went wrong authenticating this command o-o'});
		console.log(err);
		return;
	});

	if (permCheck) {
		btn.execute(interaction, con);
		console.log('  [Bot]: Button Handled');
	} else {
		await interaction.editReply({content: 'Sorry, you don\'t have adequate permissions to use this button!'});
	}

}

/**
 * Runs a select menu interaction execution
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {ConnectionPool} con
 */
async function onStringSelect(interaction, con, knownInteractions) {
	
	let smCommand = knownInteractions.stringSelects.get(interaction.customId);

	if (!smCommand) {
		await interaction.editReply({content: `Unknown Select Menu`});
		return;
	}
	
	let permCheck = await checkPermissions(con, smCommand.data.permissions, interaction.user.id)	
	if (permCheck) {
		smCommand.execute(interaction, con);
		console.log('  [Bot]: Select Menu Handled');
	} else {
		await interaction.editReply({content: 'Sorry, you don\'t have adequate permissions to use this button!'});
	}
}

/**
 * @param {StringSelectMenuInteraction} interaction 
 * @param {ConnectionPool} con
 */
async function onModal(interaction, con, knownInteractions) {
	let modal = knownInteractions.modals.get(interaction.customId);

	if (!modal) {
		await interaction.editReply({content: `Unknown Modal`});
		return;
	}
		
	modal.execute(interaction, con);
	console.log('  [Bot]: Modal Handled');
}

module.exports = {

	/**
	 * Handles interactions sent to the bot
	 * 
	 * @param {Interaction} interaction 
	 * @param {ConnectionPool} con 
	 */
	async onInteractionCreate(interaction, con, knownInteractions) {

		// Slash Command
		if (interaction.isChatInputCommand()) {
			onSlashCommand(interaction, con, knownInteractions);
		}

		// Button Interactions
		if (interaction.isButton()) {
			onButton(interaction, con, knownInteractions);
		}

		// String Select Menu
		if (interaction.isStringSelectMenu()) {
			onStringSelect(interaction, con, knownInteractions);
		}

		// Modals
		if (interaction.isModalSubmit()) {
			onModal(interaction, con, knownInteractions);
		}
	}
}