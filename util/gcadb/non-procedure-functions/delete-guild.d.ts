import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function deleteGuild(con: ConnectionPool, guildId: string, trans?: Transaction): Promise<import("mssql").IProcedureResult<any> | BaseDBError>;
export default deleteGuild;
