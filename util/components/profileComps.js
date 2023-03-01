const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AnyComponentBuilder} = require("discord.js");


module.exports = {

    /**
     * MessageComponents for the /profile command
     * 
     * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
     */
    profileComps() {
        return [new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId("update-profile")
                .setLabel("Update Discord Profile")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("prefs")
                .setLabel("My Prefs")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
        )];
    }
}