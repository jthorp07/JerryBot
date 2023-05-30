import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
declare function getRankRoles(con: ConnectionPool, guildId: string, trans?: Transaction): Promise<BaseDBError | ValorantRankedRolesRecord[] | null | undefined>;
/**
 * Type returned by parseRankRoles:
 * A set of records that represent the VALORANT Ranked
 * Roles set in a Discord server
 */
export type ValorantRankedRolesRecord = {
    roleId: string;
    roleName: ValorantRank;
    orderBy: number;
    roleIcon: string;
    roleEmote: string;
};
export default getRankRoles;
