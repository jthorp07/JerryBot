import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function getEnforceRankRoles(con: ConnectionPool, guildId: string, trans?: Transaction): Promise<boolean | BaseDBError>;
export default getEnforceRankRoles;
