const { ButtonInteraction } = require('discord.js');
const { ConnectionPool } = require('mssql');
const { beginOnErrMaker, commitOnErrMaker } = require('../util/helpers');

module.exports = {

    data: {
        customId: "prefs", // customId of buttons that will execute this command
        permissions: "all",
    },

    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {ConnectionPool} con 
     * @param {any} idArgs 
     */
    async execute(interaction, con, idArgs) {

        await interaction.deferReply({ephemeral:true});

        let trans = con.transaction();
        await trans.begin(beginOnErrMaker(interaction, trans));


        trans.commit(commitOnErrMaker(interaction));
        

    }

}