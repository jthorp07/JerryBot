import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function deleteChannelById(con: ConnectionPool, guildId: string, channelId: string, trans?: Transaction): Promise<BaseDBError | undefined>;
export default deleteChannelById;
