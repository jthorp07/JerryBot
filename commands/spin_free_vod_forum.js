const { ChatInputCommandInteraction, SlashCommandBuilder, Collection, ChannelType, ForumChannel } = require('discord.js');
const { GCADB } = require('../util/gcadb');

const VOD_REVIEW_FORUM = {
    key: 'vodforum',
    channelId: '1148751451506622527'
}
const TIER_3_REVIEW_FORUM = {
    key: 'tierthree',
    channelId: '1150160654485954590'
}

/** 
 * @param {ChatInputCommandInteraction} interaction 
 */
const freeVodReviewSpin = async (interaction) => {
    /** @type {ForumChannel} */
    let channel = await interaction.guild.channels.fetch(VOD_REVIEW_FORUM.channelId);
    if (!channel || !channel.type === ChannelType.GuildForum) return;
    let allThreads = await channel.threads.fetch();

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        await interaction.editReply({content:"This forum is missing one or multiple of the required tags:\n  \"approved\"\n  \"denied\"\n  \"reviewed\""});
        return;
    }

    let buf = [];

    for (let i = 0; i < allThreads.threads.size; i++) {

        let thread = allThreads.threads.at(i);
        if (!thread) return;

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            let owner = (await thread.fetchOwner())?.guildMember;
            if (!owner) continue;

            let starterMessage = await thread.fetchStarterMessage();
            if (!starterMessage) continue;

            let entries = owner.roles.cache.has("1094354496609591296") ? 4 : owner.roles.cache.has("1094354494218834040") ? 3 : owner.roles.cache.has("1094354485297561730") ? 2 : 1;
            switch (entries) {
                case 4:
                    console.log("Tier 3 applicant!");
                    break;
                case 3:
                    console.log("Tier 2 applicant!");
                    break;
                case 2:
                    console.log("Tier 1 applicant!");
                    break;
                case 1:
                    console.log("Free applicant!");
                    break;
                default:
                    console.log("Uh oh...");
                    break;
            }
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

    // __testWinRateDistributionForBuffer(buf); // Simulates 10,000 roles and logs win rates to determine fairness

    let winner = Math.floor(Math.random() * buf.length); // To test, move this logic into the commented function above
    let winningMessage = buf[winner].clip;
    let newContent = `The winner is: <@${buf[winner].ownerId}>`;

    let coachChannel = await interaction.guild.channels.fetch("1108357928655781888");
    if (!coachChannel || !coachChannel.isTextBased()) {

    } else {
        coachChannel.send({ content: `Raffle Winner Message:\n\n${winningMessage.content}` })
    }
    await interaction.editReply({ content: newContent });

}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
const tierThreeVodSpin = async (interaction) => {


    // await interaction.editReply({content:'Tier 3 Vod Forum is Not Yet Implemented'});
    // return;
    /** @type {ForumChannel} */
    let channel = await interaction.client.channels.fetch(TIER_3_REVIEW_FORUM.channelId);
    if (!channel || !channel.type === ChannelType.GuildForum) return;
    let allThreads = await channel.threads.fetch();

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        await interaction.editReply({content:"This forum is missing one or multiple of the required tags:\n  \"approved\"\n  \"denied\"\n  \"reviewed\""});
        return;
    }

    let buf = [];

    for (let i = 0; i < allThreads.threads.size; i++) {

        let thread = allThreads.threads.at(i);
        if (!thread) return;

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            let owner = (await thread.fetchOwner())?.guildMember;
            if (!owner) continue;

            let starterMessage = await thread.fetchStarterMessage();
            if (!starterMessage) continue;

            buf.push({
                ownerId: owner.id,
                ownerDisplayName: owner.displayName,
                ownerUsername: owner.user.username,
                clip: starterMessage
            });

        }
    }

    if (buf.length == 0) {
        await interaction.editReply({content:'There are no tier three patreon submissions!'});
        return;
    }

    // __testWinRateDistributionForBuffer(buf); // Simulates 10,000 roles and logs win rates to determine fairness

    let winner = Math.floor(Math.random() * buf.length); // To test, move this logic into the commented function above
    let winningMessage = buf[winner].clip;
    let newContent = `The winner is: <@${buf[winner].ownerId}>`;

    let coachChannel = await interaction.guild.channels.fetch("1108357928655781888");
    if (!coachChannel || !coachChannel.isTextBased()) {

    } else {
        coachChannel.send({ content: `Raffle Winner Message:\n\n${winningMessage.content}` })
    }
    await interaction.editReply({ content: newContent });


}

const sourceMap = new Collection();
sourceMap.set(VOD_REVIEW_FORUM.key, freeVodReviewSpin);
sourceMap.set(TIER_3_REVIEW_FORUM.key, tierThreeVodSpin);

module.exports = {
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
                )),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {GCADB} db 
     */
    async execute(interaction, db) {

        await interaction.deferReply();
        let raffleType = interaction.options.getString('type');
        let spinFunc = sourceMap.get(raffleType);
        await spinFunc(interaction);

    },
    permissions: "admin"
}

function __testWinRateDistributionForBuffer(buf) {
    let winnerRates = new Collection();
    for (let i = 0; i < 10000; i++) {
        let winner = Math.floor(Math.random() * buf.length);
        if (winner === buf.length) winner -= 1;

        if (winnerRates.get(winner) == undefined) {
            winnerRates.set(winner, 1);
        } else {
            winnerRates.set(winner, winnerRates.get(winner) + 1);
        }
    }

    console.log("For buffer length " + buf.length);
    console.log(JSON.stringify(winnerRates));
}
