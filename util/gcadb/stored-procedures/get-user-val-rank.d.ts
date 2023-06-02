import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
declare function getUserValRank(con: ConnectionPool, guildId: string, userId: string, trans?: Transaction): Promise<BaseDBError | {
    roleEmote: string | null;
    roleIcon: string | null;
    roleName: ValorantRank | null;
}>;
export default getUserValRank;
