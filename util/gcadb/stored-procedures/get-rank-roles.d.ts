import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
declare function getRankRoles(con: ConnectionPool, guildId: string, trans?: Transaction): Promise<BaseDBError | {
    roleId: string;
    roleName: ValorantRank;
    orderBy: number;
    roleIcon: string;
    roleEmote: string;
}[]>;
export default getRankRoles;
