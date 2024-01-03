import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('sendjson')
        .setDescription('Takes a JSON string and converts it to a message')
        .addStringOption(option =>
            option.setName('json')
                .setDescription('The JSON string representing the message')
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {
        try {
            const content = JSON.parse(interaction.options.getString('json', true));
            await interaction.reply(content);
        } catch (err) {
            console.error(err);
        } 
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;