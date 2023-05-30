import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function pickSide(con: ConnectionPool, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    numCaptains: number;
    playerCount: number;
    queueStatus: QueueState;
    hostId: string;
    records: import("./get-queue").TenmansClassicRecords;
}>;
export default pickSide;
