import { ChatInputCommandInteraction, SlashCommandBuilder, Collection, ChannelType, ForumChannel, AnyThreadChannel, GuildMember, MediaChannel } from "discord.js";
import { ICommand, ICommandExecute, ICommandPermission } from "../types/discord_interactions";
// import { stdTempData, ptrTempData, addSpinData } from '../data/standard_submissions';

// TODO: Uncomment data related items when /data/* gets ported to Typescript branch

const VOD_REVIEW_FORUM = {
    key: 'vodforum',
    channelId: '1148751451506622527'
}
const TIER_3_REVIEW_FORUM = {
    key: 'tierthree',
    channelId: '1150160654485954590'
}


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


const freeVodReviewSpin: ICommandExecute = async (interaction) => {
    const channel = await interaction.guild?.channels.fetch(VOD_REVIEW_FORUM.channelId);
    if (!channel || !(channel.isThreadOnly())) return;
    const allThreadsPromise = fetchThreadsFromForum(channel);

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    // stdTempData.reset();
    let numEntries = 0;
    let numPosts = 0;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        await interaction.editReply({ content: "This forum is missing one or multiple of the required tags:\n  \"approved\"\n  \"denied\"\n  \"reviewed\"" });
        return;
    }

    let buf = [];
    let ownerless = [];
    const allThreads = await allThreadsPromise;

    console.log(`There are ${allThreads.length} threads`);
    const currentDate = new Date(Date.now());
    for (const thread of allThreads) {

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            const ownerThreadMember = thread.fetchOwner()
            const starterMessageFetch = thread.fetchStarterMessage()
            const owner = (await ownerThreadMember)?.guildMember;
            if (!owner) {
                console.log('No owner');
                ownerless.push(`https://discord.com/channels/${interaction.guildId}/${thread.id}`);
                continue;
            }
            const patreonStatusMultiplier = owner.roles.cache.has("1094354496609591296") ? 4 : owner.roles.cache.has("1094354494218834040") ? 3 : owner.roles.cache.has("1094354485297561730") ? 2 : 1;


            const postDate = thread.createdAt;
            if (!postDate) return;
            const differenceInMillis = currentDate.getTime() - postDate.getTime();
            const wholeWeeks = Math.floor(differenceInMillis / (1000 * 60 * 60 * 24 * 7));
            const postAgeMultiplier = 1 + Math.floor(wholeWeeks / 2);

            const entries = 1 * (patreonStatusMultiplier + postAgeMultiplier);
            const starterMessage = await starterMessageFetch;
            if (!starterMessage) {
                console.log("No message fetch");
                continue;
            }
            // stdTempData.addPostAge(currentDate.getTime() - thread.createdAt.getTime());
            numEntries += entries;
            numPosts++;
            for (let j = 0; j < entries; j++) {
                buf.push({
                    ownerId: owner.id,
                    ownerDisplayName: owner.displayName,
                    ownerUsername: owner.user.username,
                    clip: starterMessage
                });
            }
        }
    }

    // addSpinData(numPosts, numEntries, 'std_vod');

    // __testWinRateDistributionForBuffer(buf); // Simulates 10,000 roles and logs win rates to determine fairness

    let winner = Math.floor(Math.random() * buf.length); // To test, move this logic into the commented function above
    let winningMessage = buf[winner].clip;
    let newContent = `The winner is: <@${buf[winner].ownerId}>`;

    let links;
    if (ownerless.length > 0) {
        links = `The owners of the following threads may have left the server:\n`;
        for (const link of ownerless) {
            links = `${links}${link}\n`
        }
    }

    let coachChannel = await interaction.guild?.channels.fetch("1161809001923747971");
    const winningContent = `Raffle Winner Message:\n\n${winningMessage.content}`;
    if (!coachChannel || !coachChannel.isTextBased()) {


    } else {
        coachChannel.send({ content: winningContent.length >= 2000 ? winningMessage.content : winningContent });
        if (links) coachChannel.send({ content: links });
    }
    await interaction.editReply({ content: newContent });

}


const tierThreeVodSpin: ICommandExecute = async (interaction) => {

    const channel = await interaction.guild?.channels.fetch(TIER_3_REVIEW_FORUM.channelId);
    if (!channel || !(channel.isThreadOnly())) return;
    const allThreadsPromise = fetchThreadsFromForum(channel);

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    // ptrTempData.reset();
    let numEntries = 0;
    let numPosts = 0;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        await interaction.editReply({ content: "This forum is missing one or multiple of the required tags:\n  \"approved\"\n  \"denied\"\n  \"reviewed\"" });
        return;
    }

    let buf = [];
    let ownerless = [];
    const currentDate = new Date(Date.now());
    const allThreads = await allThreadsPromise;
    for (const thread of allThreads) {

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            let owner = (await thread.fetchOwner())?.guildMember;
            if (!owner) {
                console.log('No owner');
                ownerless.push(`https://discord.com/channels/${interaction.guildId}/${thread.id}`);
                continue;
            }

            let starterMessage = await thread.fetchStarterMessage();
            if (!starterMessage) continue;

            const postDate = thread.createdAt;
            if (!postDate) return;
            const differenceInMillis = currentDate.getTime() - postDate.getTime();
            const wholeWeeks = Math.floor(differenceInMillis / (1000 * 60 * 60 * 24 * 7));
            const entries = 1 + Math.floor(wholeWeeks / 2);

            // ptrTempData.addPostAge(currentDate.getTime() - thread.createdAt.getTime());
            numEntries += entries;
            numPosts++;

            buf.push({
                ownerId: owner.id,
                ownerDisplayName: owner.displayName,
                ownerUsername: owner.user.username,
                clip: starterMessage
            });

        }
    }

    // addSpinData(numPosts, numEntries, 'ptr_vod');

    if (buf.length == 0) {
        await interaction.editReply({ content: 'There are no tier three patreon submissions!' });
        return;
    }

    // __testWinRateDistributionForBuffer(buf); // Simulates 10,000 roles and logs win rates to determine fairness
    let winner = Math.floor(Math.random() * buf.length); // To test, move this logic into the commented function above
    let winningMessage = buf[winner].clip;
    let newContent = `The winner is: <@${buf[winner].ownerId}>`;

    let coachChannel = await interaction.guild?.channels.fetch("1161809001923747971");

    let links;
    if (ownerless.length > 0) {
        links = `The owners of the following threads may have left the server:\n`;
        for (const link of ownerless) {
            links = `${links}${link}\n`
        }
    }

    if (!coachChannel || !coachChannel.isTextBased()) {

    } else {
        coachChannel.send({ content: `Raffle Winner Message:\n\n${winningMessage.content}` });
        if (links) coachChannel.send({ content: links });
    }
    await interaction.editReply({ content: newContent });
}

const sourceMap = new Collection<String, ICommandExecute>();
sourceMap.set(VOD_REVIEW_FORUM.key, freeVodReviewSpin);
sourceMap.set(TIER_3_REVIEW_FORUM.key, tierThreeVodSpin);

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('freevodreviewspin')
        .setDescription('Executes a raffle')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of raffle to do')
                .setRequired(true)
                .addChoices(
                    { name: 'Free Vod Review Forum', value: VOD_REVIEW_FORUM.key },
                    { name: 'Tier 3 Vod Review Forum', value: TIER_3_REVIEW_FORUM.key }
                )) as SlashCommandBuilder,

    async execute(interaction) {

        await interaction.deferReply();
        let raffleType = interaction.options.getString('type', true);
        let spinFunc = sourceMap.get(raffleType);
        if (!spinFunc) return;
        await spinFunc(interaction);

    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;


// TypeScript doesn't like this guy

// function __testWinRateDistributionForBuffer(buf) {
//     let winnerRates = new Collection();
//     for (let i = 0; i < 10000; i++) {
//         let winner = Math.floor(Math.random() * buf.length);
//         if (winner === buf.length) winner -= 1;

//         if (winnerRates.get(winner) == undefined) {
//             winnerRates.set(winner, 1);
//         } else {
//             winnerRates.set(winner, winnerRates.get(winner) + 1);
//         }
//     }

//     console.log("For buffer length " + buf.length);
//     console.log(JSON.stringify(winnerRates));
// }