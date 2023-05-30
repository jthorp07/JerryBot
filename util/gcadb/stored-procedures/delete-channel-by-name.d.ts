import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { DiscordChannelName } from "../enums";
declare function deleteChannelByName(con: ConnectionPool, guildId: string, channelName: DiscordChannelName, trans?: Transaction): Promise<BaseDBError | undefined>;
export default deleteChannelByName;
