const { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } = require('discord.js');
const { Transaction } = require('mssql');

/**
 * 
 * @param {ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction } interaction 
 * @param {Transaction}
 */
function beginOnErrMaker(interaction, trans) {
    return async (err) => {
        if (err) {
            console.log(err);
            await interaction.editReply({ content: "Something went wrong" });
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
    }
}

/**
 * 
 * @param {ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction } interaction 
 */
function commitOnErrMaker(interaction) {
    return async (err) => {
        if (err) {
            console.log(err);
            await interaction.editReply({ content: "Something went wrong" });
        }
    }
}

module.exports = {
    beginOnErrMaker,
    commitOnErrMaker
}