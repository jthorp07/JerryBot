import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueType } from "../enums";
/**
 *
 * @param con ConnectionPool
 * @param guildId
 * @param hostId
 * @param queueType
 * @param queueId
 * @param trans
 * @returns
 */
declare function createQueue(con: ConnectionPool, guildId: string, hostId: string, queueType: QueueType, trans?: Transaction): Promise<number | BaseDBError>;
export default createQueue;
