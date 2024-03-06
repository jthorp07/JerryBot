import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { getMmrForAllUsers, addMmrUser, updateMmrUser, FirebaseUserMMR } from "../util/database_options/firestore/db_mmr";
import { getLastSeason } from "../util/neatqueue/neatqueue";
import { LeaderboardUser, addUserToLeaderboard, resetLeaderboard } from "../util/database_options/firestore/db_leaderboard";

async function removeRoleFromEveryone(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) return;
    const allMembers = await guild.members.fetch();
    for (const member of allMembers) {
        member[1].roles.remove('1180001507828043798');
    }
}

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('newseason')
        .setDescription('Performs all necessary data calculations for a new season')
        .addChannelOption(option => 
            option.addChannelTypes(ChannelType.GuildText)
                .setName('queuechannel')
                .setDescription('The channel the NeatQueue queue is hosted in')
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {

        await interaction.reply({content: 'Starting end of season calculations... I will update this message once calculations are complete!'});
        console.log("getting started");
        removeRoleFromEveryone(interaction);
        const resetResult = await resetLeaderboard();
        if (!resetResult) {
            await interaction.editReply({content: 'The leaderboard could not be reset... aborting'});
            return;
        }

        const channelId = interaction.options.getChannel('queuechannel', true, [ChannelType.GuildText]).id;
        const initialMmrMap = new Map<Snowflake, FirebaseUserMMR>();
        const leaderboardPromise = getLastSeason(channelId, interaction.guildId || '');
        const previousInitialMmrPromise = getMmrForAllUsers().then(arr => {
            arr.forEach(user => {
                initialMmrMap.set(user.discordId, user);
            });
        });
        await previousInitialMmrPromise;
        const leaderboard = await leaderboardPromise;

        const promises: Promise<any>[] = [];

        for (const user of leaderboard.alltime) {
            const prevMmr = initialMmrMap.get(user.id);
            if (!prevMmr) {
                console.log('User does not exist');
                continue;
            }

            const oldMmr = prevMmr.initialMMR;
            const finalMmr = user.data.mmr;
            const delta = finalMmr - oldMmr;
            const newMmr = (oldMmr + (delta / Math.max(2, Math.log2(Math.abs(delta)))));
            const leaderboardScore = (delta * (delta < 0 ? 1 - (oldMmr / 10000) : 1 + (oldMmr / 10000))).toFixed(2) as unknown as number;

            console.log(`Old Initial MMR: ${oldMmr}\nFinal MMR: ${finalMmr}\nDelta MMR: ${delta}\nLeaderboard Score: ${leaderboardScore}\nNew Initial MMR: ${newMmr}\n\n`);

            prevMmr.initialMMR = newMmr;
            const finalLeaderboardScore: LeaderboardUser = {
                discordId: user.id,
                decoupled: prevMmr.decoupled,
                score: leaderboardScore,
                gamesPlayed: user.data.losses + user.data.wins
            }

            const updatedUserMmr: FirebaseUserMMR = {
                discordId: prevMmr.discordId,
                decoupled: (prevMmr.gamesPlayed + user.data.losses + user.data.wins) >= 10,
                documentId: prevMmr.documentId,
                gamesPlayed: prevMmr.gamesPlayed + user.data.losses + user.data.wins,
                seasonsPlayed: prevMmr.seasonsPlayed + 1,
                initialMMR: newMmr
            }

            promises.push(updateMmrUser(updatedUserMmr));
            promises.push(addUserToLeaderboard(finalLeaderboardScore, true));
        } // End Loop
        await Promise.all(promises);
        if ((await interaction.fetchReply()).deletable) {
            interaction.editReply({content: 'All done! At this point, you can wipe and reset the NeatQueue queue!'});
            console.log("done");
        }
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;