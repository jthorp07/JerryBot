import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function joinQueue(con: ConnectionPool, userId: string, guildId: string, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    numPlayers: number;
    numCaptains: number;
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
export default joinQueue;
