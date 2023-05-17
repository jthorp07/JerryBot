import { ConnectionPool, Transaction, IRecordSet } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function getQueue(con: ConnectionPool, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    captainCount: number;
    playerCount: number;
    queueStatus: QueueState;
    hostId: string;
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
/**
 * This function WILL crash if given a recordset from any
 * request that is not the GetQueue procedure
 *
 * @param datum The mssql recordsets from a call to the GetQueue procedure
 */
export declare function parseGetQueueRecordsets(datum: IRecordSet<any>[]): {
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
export default getQueue;
