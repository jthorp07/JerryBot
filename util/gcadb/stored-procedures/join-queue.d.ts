import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function joinQueue(con: ConnectionPool, userId: string, guildId: string, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    numPlayers: number;
    numCaptains: number;
    queueStatus: QueueState;
    hostId: string;
    records: import("./get-queue").TenmansClassicRecords;
}>;
export default joinQueue;
