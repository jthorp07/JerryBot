import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueuePool } from "../enums";
declare function leaveTenmans(con: ConnectionPool, queueId: number, guildId: string, trans?: Transaction): Promise<BaseDBError | {
    wasCaptain: boolean;
    queuePool: QueuePool;
}>;
export default leaveTenmans;
