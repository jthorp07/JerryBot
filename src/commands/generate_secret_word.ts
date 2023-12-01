import { SlashCommandBuilder, ForumChannel, MediaChannel, AnyThreadChannel, ChatInputCommandInteraction } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { VOD_REVIEW_FORUM } from "./spin_vod_forum";

async function fetchThreadsFromForum(channel: ForumChannel | MediaChannel): Promise<AnyThreadChannel<boolean>[]> {

    const activeThreads = await channel.threads.fetch();
    const archivedThreads = await channel.threads.fetch({
        archived: {
            fetchAll: true,
        }
    });

    const activeThreadsCache = activeThreads.threads;
    const archivedThreadsCache = archivedThreads.threads;

    const threadBuf: AnyThreadChannel<boolean>[] = [];
    for (const thread of activeThreadsCache) {
        threadBuf.push(thread[1]);
    }
    for (const thread of archivedThreadsCache) {
        threadBuf.push(thread[1]);
    }
    return threadBuf;
}

async function dmApprovedSecretWord(this: any, interaction: ChatInputCommandInteraction, word: string) {
    const channel = await interaction.guild?.channels.fetch(VOD_REVIEW_FORUM.channelId);
    if (!channel || !(channel.isThreadOnly())) return;
    const allThreadsPromise = fetchThreadsFromForum(channel);

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        await interaction.editReply({ content: "This forum is missing one or multiple of the required tags:\n  \"approved\"\n  \"denied\"\n  \"reviewed\"" });
        return;
    }
    const promiseBuf: Promise<void>[] = [];
    const errorBuf: string[] = [];
    const allThreads = await allThreadsPromise;
    for (const thread of allThreads) {

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            const promise: Promise<void> = (async () => {
                const owner = await thread.fetchOwner();
                if (!owner || !(owner.user)) {
                    errorBuf.push(`https://discord.com/channels/${interaction.guildId}/${thread.id}`);
                    return;
                }
                if (!(owner.user?.dmChannel)) {
                    const dm = await owner.user.createDM();
                    await dm.send({ content: `The secret word is '${word}'` })
                } else {
                    await owner.user.send({ content: `The secret word is '${word}'` })
                }
            }).call(this)
            promiseBuf.push(promise);
        }
    }
    await Promise.all(promiseBuf);
    if (errorBuf.length == 0) {
        await interaction.editReply({ content: 'All approved users have been DM\'d' });
    } else {
        let content = `The owners of the following threads could not be DM'd:\n  ${errorBuf.join('\n  ')}.\n\n All other approved users have been DM'd.`;
        await interaction.editReply({ content:content })
    }   
}

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('secretword')
        .setDescription('Sends the provided secret word to all users with approved VoD submissions')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The secret word')
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.deferReply({ephemeral: true});
        const word = interaction.options.getString('word', true);
        await dmApprovedSecretWord(interaction, word);
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;