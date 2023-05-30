import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
declare function getProfile(con: ConnectionPool, userId: string, guildId: string, trans?: Transaction): Promise<BaseDBError | {
    currentRank: ValorantRank;
    records: GetProfileRecord;
}>;
export default getProfile;
export type GetProfileRecord = {
    isPremium: boolean;
    isOwner: boolean;
    discordUsername: string;
    discordGuildName: string;
    discordDisplayName: string;
    valorantDisplayName: string;
    valorantRoleName: string;
    hasValorantRank: boolean;
    canBeCaptain: boolean;
};
