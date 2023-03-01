const { ButtonInteraction } = require('discord.js');
const { ConnectionPool } = require('mssql');

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
        trans.begin(async (err) => {

            if (err) {
                console.log(err);
                await interaction.editReply({content:"Something went wrong"});
                return;
            }

            let result = await con.request();


            trans.commit(async (err) => {

                if (err) {
                    console.log(err);
                    await interaction.editReply({content:"Something went wrong"});
                    return;
                }



            });

        });

    }

}