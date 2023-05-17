import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
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
declare function createQueue(con: ConnectionPool, guildId: string, hostId: string, queueType: string, queueId: number, trans?: Transaction): Promise<number | BaseDBError>;
export default createQueue;
