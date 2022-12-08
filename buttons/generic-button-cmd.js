const { ButtonInteraction } = require('discord.js');


module.exports = {
    data: {
        buttonId: "genericid", // customId of buttons that will execute this command
        permissions: "all" //TODO: Implement other permission options
    },
    /**
     * 
     * @param {ButtonInteraction} interaction 
     */
    async btnExecute(interaction) {

        //TODO: Implement button command
        await interaction.reply("You pressed a generic button!");

    }
}