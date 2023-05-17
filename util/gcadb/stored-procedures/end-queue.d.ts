import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function endQueue(con: ConnectionPool, queueId: number, trans?: Transaction): Promise<BaseDBError>;
export default endQueue;
