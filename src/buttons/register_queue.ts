import { ButtonBuilder, ButtonStyle, GuildMember, GuildMemberRoleManager, Snowflake } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";
import { setPlayerMmr } from "../util/neatqueue/neatqueue";

const wcaQueueRole = "1180001507828043798";
const wcaChannel = "1161809001923747971";

const patreonQueueRole = "1396240749816709231";
const patreonChannel = "1396220384998719518";
const patreonPingRole = "1396240041839296692";

enum RankRole {
    IRON = 500,
    BRONZE = 650,
    SILVER = 800,
    GOLD = 950,
    PLATINUM = 1100,
    DIAMOND = 1250,
    ASCENDANT = 1400,
    IMMORTAL = 1750,
    RADIANT = 2000,
    // UNRANKED = 1100,
}

const wcaRankRoles = new Map<Snowflake, RankRole>();
wcaRankRoles.set('1056006144310661140', RankRole.IRON);
wcaRankRoles.set('1056006134516940880', RankRole.BRONZE);
wcaRankRoles.set('1056006099125411912', RankRole.SILVER);
wcaRankRoles.set('1056006096311029811', RankRole.GOLD);
wcaRankRoles.set('1056006089533046835', RankRole.PLATINUM);
wcaRankRoles.set('1056006080095858779', RankRole.DIAMOND);
wcaRankRoles.set('1056006066002989086', RankRole.ASCENDANT);
wcaRankRoles.set('1056006047841665095', RankRole.IMMORTAL);
wcaRankRoles.set('1056006036990996582', RankRole.RADIANT);
// wcaRankRoles.set('1080684550579032154', RankRole.UNRANKED);

const patreonRankRoles = new Map<Snowflake, RankRole>();
patreonRankRoles.set('1396222909823062158', RankRole.IRON);
patreonRankRoles.set('1396223554881720452', RankRole.BRONZE);
patreonRankRoles.set('1396223925574176970', RankRole.SILVER);
patreonRankRoles.set('1396223924676853911', RankRole.GOLD);
patreonRankRoles.set('1396223896822480961', RankRole.PLATINUM);
patreonRankRoles.set('1396223895475847319', RankRole.DIAMOND);
patreonRankRoles.set('1396223893387350237', RankRole.ASCENDANT);
patreonRankRoles.set('1396223660829966356', RankRole.IMMORTAL);
patreonRankRoles.set('1396223649962393680', RankRole.RADIANT);
// patreonRankRoles.set('', RankRole.UNRANKED);

const customId = 'queuereg'
const button: IButton = {
    customId: customId,
    execute: async (interaction) => {

        await interaction.deferReply({ephemeral: true});
        const queueRole = interaction.guildId === '710741097126821970' ? wcaQueueRole : patreonQueueRole;
        const queueChannel = interaction.guildId === '710741097126821970' ? wcaChannel : patreonChannel;
        const rankRoles = interaction.guildId === '710741097126821970' ? wcaRankRoles : patreonRankRoles;
        const member = interaction.member as GuildMember;

        // Check if user is already registered
        if (member.roles.cache.has(queueRole)) {
            if (interaction.guildId === '710741097126821970') {
                await interaction.editReply({content: 'You are already registered for 10 mans'});
            } else {
                await interaction.editReply({content: 'You are already registered for our Patreon exclusive 10 mans'});
            }
            return;
        }

        // Check user's rank role
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
            await interaction.editReply({ content: 'You don\'t appear to have a rank role. A rank role is required to assign your initial MMR. You can obtain a rank role in #rank-roles' });
            return;
        }
        setPlayerMmr(member.id, queueChannel, roleMmr);

        // Add queue role
        await member.roles.add(queueRole);
        if (interaction.guildId === '710741097126821970') {
            await interaction.editReply({ content: 'You have registered for 10 mans! You can now queue here: ⁠<#1161809001923747971>' });
        } else {
            await member.roles.add(patreonPingRole);
            await interaction.editReply({ content: 'You have registered for our Patreon exclusive 10 mans! You can now queue here: ⁠<#1396220384998719518>' });
        }
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