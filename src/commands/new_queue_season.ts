import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";


const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('seasonrefresh')
        .setDescription('Performs all necessary data calculations for a new season, then responds with a list of instructions to finish starting a new season'),
    execute: async (interaction) => {

    },
    permissions: ICommandPermission.BOT_ADMIN
}