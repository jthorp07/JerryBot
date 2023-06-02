import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function getTriggerableChannels(con: ConnectionPool, guildId: string, channelId: string, trans?: Transaction): Promise<boolean | BaseDBError>;
export default getTriggerableChannels;
