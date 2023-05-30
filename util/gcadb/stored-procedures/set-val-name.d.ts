import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function setValName(con: ConnectionPool, valName: string, userId: string, guildId: string, trans?: Transaction): Promise<BaseDBError | undefined>;
export default setValName;
