import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function getPrefs(con: ConnectionPool, userId: string, guildId: string, trans?: Transaction): Promise<BaseDBError | {
    canBeCaptain: boolean;
}>;
export default getPrefs;
