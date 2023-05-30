import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function setCaptain(con: ConnectionPool, queueId: number, capOne: string, capTwo: string, guildId: string, trans?: Transaction): Promise<BaseDBError | {
    queueStatus: QueueState;
    records: import("./get-queue").TenmansClassicRecords;
}>;
export default setCaptain;
