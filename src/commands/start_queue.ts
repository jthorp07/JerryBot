import { SlashCommandBuilder, /* APIApplicationCommandOptionChoice */ } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

// function makeQueueOptions() {
//     const vals = Object.values(WCAQueue).filter(v => isNaN(Number(v)));
//     return vals.map(v => { return { name: v.replaceAll("_"," ").toUpperCase(), value: v }}) as unknown as APIApplicationCommandOptionChoice<string>
// }

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("startqueue")
        .setDescription("Starts a new queue in the channel where the command is used")
        .addStringOption(option =>
            option.setName("queue")
                .setDescription("The queue to start from a predefined set of queues")
                .setRequired(true)
                .setChoices(
                    { name: "NA Customs", value: WCAQueue.CustomsNA },
                    { name: "EU Customs", value: WCAQueue.CustomsEU },
                    // makeQueueOptions()
                )) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const queue = interaction.options.getString("queue", true) as WCAQueue;
        const channelId = interaction.channelId;
        queueManager.startQueue(queue, channelId);

    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;