import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState, QueuePool } from "../enums";
declare function draftPlayer(con: ConnectionPool, playerId: string, guildId: string, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    queueStatus: QueueState;
    hostId: string;
    team: QueuePool;
    records: {
        allPlayers: {
            playerId: string;
            canBeCaptain: boolean;
            guildId: string;
            discordDisplayName: string;
            valorantDisplayName: string;
            roleName: string;
            roleEmote: string;
            roleIcon: string;
        }[];
        availablePlayers: {
            playerId: string;
            guildId: string;
            discordDisplayName: string;
            valorantDisplayName: string;
            roleName: string;
            roleEmote: string;
            roleIcon: string;
        }[];
        teamOne: {
            playerId: string;
            isCaptain: boolean;
            guildId: string;
            discordDisplayName: string;
            valorantDisplayName: string;
            roleName: string;
            roleEmote: string;
            roleIcon: string;
        }[];
        teamTwo: {
            playerId: string;
            isCaptain: boolean;
            guildId: string;
            discordDisplayName: string;
            valorantDisplayName: string;
            roleName: string;
            roleEmote: string;
            roleIcon: string;
        }[];
    };
}>;
export default draftPlayer;
export type GetQueueRecords = {
    allPlayers: {
        playerId: string;
        canBeCaptain: boolean;
        guildId: string;
        discordDisplayName: string;
        valorantDisplayName: string;
        roleName: string;
        roleEmote: string;
        roleIcon: string;
    }[];
    availablePlayers: {
        playerId: string;
        guildId: string;
        discordDisplayName: string;
        valorantDisplayName: string;
        roleName: string;
        roleEmote: string;
        roleIcon: string;
    }[];
    teamOne: {
        playerId: string;
        isCaptain: boolean;
        guildId: string;
        discordDisplayName: string;
        valorantDisplayName: string;
        roleName: string;
        roleEmote: string;
        roleIcon: string;
    }[];
    teamTwo: {
        playerId: string;
        isCaptain: boolean;
        guildId: string;
        discordDisplayName: string;
        valorantDisplayName: string;
        roleName: string;
        roleEmote: string;
        roleIcon: string;
    }[];
};
