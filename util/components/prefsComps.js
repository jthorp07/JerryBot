const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AnyComponentBuilder} = require("discord.js");


module.exports = {

    /**
     * MessageComponents for the /prefs command
     * 
     * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
     */
    prefsComps(canBeCaptain) {
        return [new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId(`toggle-canbecapt:${canBeCaptain}`)
                .setLabel("Can Be Captain")
                .setStyle(canBeCaptain ? ButtonStyle.Success : ButtonStyle.Danger),
        )];
    }
}