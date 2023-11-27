import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { logAllCollectedData } from '../util/database_options/standard_submissions';
import { ICommand, ICommandPermission } from "../types/discord_interactions";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Retrieve some logged data')
        .addStringOption(option =>
            option.setName('dataset')
                .setDescription('The set of logged data to pull')
                .setRequired(true)
                .addChoices(
                    { name: 'VoD Review Raffle Data', value: 'vodraffle' },
                )) as SlashCommandBuilder,
    execute: async (interaction) => {

        const type = interaction.options.getString('dataset', true);
        if (type === 'vodraffle') await interaction.reply({content: logAllCollectedData()});

    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;