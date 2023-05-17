import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function imStartingDraft(con: ConnectionPool, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    success: boolean;
    enforce: boolean;
}>;
export default imStartingDraft;
