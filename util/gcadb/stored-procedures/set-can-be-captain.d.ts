import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function setCanBeCaptain(con: ConnectionPool, userId: string, guildId: string, canBeCaptain: boolean, trans?: Transaction): Promise<BaseDBError | undefined>;
export default setCanBeCaptain;
