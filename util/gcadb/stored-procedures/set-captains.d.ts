import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function setCaptain(con: ConnectionPool, queueId: number, capOne: string, capTwo: string, guildId: string, trans?: Transaction): Promise<BaseDBError | {
    queueStatus: QueueState;
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
export default setCaptain;
