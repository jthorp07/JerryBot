const { ModalSubmitInteraction } = require("discord.js");
const { ConnectionPool } = require("mssql");


module.exports = {

    data: {
        customId: 'testmodal'
    },

    /**
     * 
     * @param {ModalSubmitInteraction} interaction
     * @param {ConnectionPool} con
     */
    async execute(interaction, con) {

        interaction.reply({content: interaction.fields.getTextInputValue('testtextinput')});
        console.log('WOO');

    }

}