import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function pickSide(con: ConnectionPool, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    numCaptains: number;
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
export default pickSide;
