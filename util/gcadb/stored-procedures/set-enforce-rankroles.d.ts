import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function setEnforceRankRoles(con: ConnectionPool, guildId: string, enforce: boolean, trans?: Transaction): Promise<BaseDBError | undefined>;
export default setEnforceRankRoles;
