import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
/**
 * Writes a new guild to the GCA Database
 *
 * @param con ConnectionPool connected to the GCA Database
 * @param guildId Discord ID of target guild
 * @param guildName Name of target guild
 * @param trans Database transaction to run this procedure against
 * @returns BaseDBError upon failure, void upon success
 */
declare function createGuild(con: ConnectionPool, guildId: string, guildName: string, trans?: Transaction): Promise<BaseDBError | undefined>;
export default createGuild;
