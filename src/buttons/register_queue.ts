import { ButtonBuilder, ButtonStyle, GuildMember, GuildMemberRoleManager, Snowflake } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";
import { addMmrUser, getMmrForAllUsers, getUserByDiscordId } from "../util/database_options/firestore/db_mmr";
import { setPlayerMmr } from "../util/neatqueue/neatqueue";

const queueRole = '1180001507828043798';
const queueChannel = '1161809001923747971';
enum RankRole {
    IRON = 500,
    BRONZE = 550,
    SILVER = 600,
    GOLD = 700,
    PLATINUM = 750,
    DIAMOND = 850,
    ASCENDANT = 900,
    IMMORTAL = 1000,
    RADIANT = 1100,
    UNRANKED = 750,
}

const rankRoles = new Map<Snowflake, RankRole>();
rankRoles.set('1056006144310661140', RankRole.IRON);
rankRoles.set('1056006134516940880', RankRole.BRONZE);
rankRoles.set('1056006099125411912', RankRole.SILVER);
rankRoles.set('1056006096311029811', RankRole.GOLD);
rankRoles.set('1056006089533046835', RankRole.PLATINUM);
rankRoles.set('1056006080095858779', RankRole.DIAMOND);
rankRoles.set('1056006066002989086', RankRole.ASCENDANT);
rankRoles.set('1056006047841665095', RankRole.IMMORTAL);
rankRoles.set('1056006036990996582', RankRole.RADIANT);
rankRoles.set('1080684550579032154', RankRole.UNRANKED);

const customId = 'queuereg'
const button: IButton = {
    customId: customId,
    execute: async (interaction) => {

        await interaction.deferReply({ephemeral: true})
        const member = interaction.member as GuildMember;
        if (member.roles.cache.has(queueRole)) {
            await interaction.editReply({content: 'You are already registered for this season of ten mans!'});
            return;
        }

        // pull user
        let user = await getUserByDiscordId(interaction.user.id);
        // if not exist get rank role
        if (!user) {

            const userRoles = interaction.member?.roles;
            let roleMmr: number = -1;
            if (!userRoles) {
                await interaction.editReply({ content: 'Sorry, I was unable to fetch your rank role :(' });
                return;
            }
            if (userRoles instanceof GuildMemberRoleManager) {
                for (const key of rankRoles.keys()) {
                    if (userRoles.cache.has(key)) {
                        roleMmr = rankRoles.get(key) as number;
                        break;
                    }
                }
            } else {
                for (const role of userRoles) {
                    let value = rankRoles.get(role)
                    if (value != undefined) {
                        roleMmr = value;
                        break;
                    }
                }
            }

            if (roleMmr == -1) {
                await interaction.editReply({ content: 'You don\'t appear to have a rank role. Since this is your first time in the queue, a rank role is required to assign your initial MMR. You can obtain a rank role in #rank-roles' });
                return;
            }

            user = {
                documentId: null,
                discordId: interaction.user.id,
                decoupled: false,
                initialMMR: roleMmr,
                gamesPlayed: 0,
                seasonsPlayed: 0
            }
            addMmrUser(user);
            
        }

        //set neatqueue mmr
        setPlayerMmr(user.discordId, queueChannel, user.initialMMR);

        // Unlock queue channel for user
        member.roles.add(queueRole);
        await interaction.editReply({content: 'You can now queue for ten mans!'});
    },
    permissions: ICommandPermission.ALL,
    button: () => {
        return new ButtonBuilder()
            .setCustomId(customId)
            .setLabel('Register')
            .setStyle(ButtonStyle.Primary);
    }
}

export default button;