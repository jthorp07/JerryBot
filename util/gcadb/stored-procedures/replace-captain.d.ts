import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function replaceCaptain(con: ConnectionPool, queueId: number, queuePool: number, trans?: Transaction): Promise<BaseDBError>;
export default replaceCaptain;
