const { SelectMenuInteraction } = require('discord.js');


module.exports = {
    data: {
        customId: "genericid", // customId of buttons that will execute this command
        permissions: "all" //TODO: Implement other permission options
    },
    /**
     * 
     * @param {SelectMenuInteraction} interaction 
     */
    async selectExecute(interaction) {

        //TODO: Implement button command
        await interaction.reply("You pressed a generic selectmenu option!");

    }
}