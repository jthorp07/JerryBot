import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState, QueuePool } from "../enums";
declare function draftPlayer(con: ConnectionPool, playerId: string, guildId: string, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    queueStatus: QueueState;
    hostId: string;
    team: QueuePool;
    records: import("./get-queue").TenmansClassicRecords;
}>;
export default draftPlayer;
