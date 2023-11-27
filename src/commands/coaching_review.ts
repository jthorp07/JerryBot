import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import modal from '../modals/coaching_review_modal';
import { ICommand, ICommandPermission } from "../types/discord_interactions";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Leaves a review about the coaching you received')
        .addIntegerOption(option =>
            option.setName('stars')
                .setDescription('The number of stars for the review')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(5))
        .addStringOption(option =>
            option.setName('coachingtype')
                .setDescription('The type of coaching received for this review')
                .setRequired(true)
                .addChoices(
                    { name: 'Standard', value: 'std' },
                    { name: 'Patreon Tier One', value: 'pato' },
                    { name: 'Patreon Tier Two', value: 'patt' },
                    { name: 'Patreon Tier Three', value: 'patr' },
                    { name: 'Premium', value: 'pre' }
                ))
        .addBooleanOption(option =>
            option.setName('anonymousreview')
                .setDescription('Use true if you want your review to be anonymous')
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {

        const numStars = interaction.options.getInteger('stars', true);
        const type = interaction.options.getString('coachingtype', true);
        const anon = interaction.options.getBoolean('anonymousreview', true);
        await interaction.showModal(modal.modal(numStars, type, anon));

    },
    permissions: ICommandPermission.ALL
}

export default command;