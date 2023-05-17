import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { DiscordChannelName, DiscordChannelType } from "../enums";
declare function getChannel(con: ConnectionPool, guildId: string, channelName: DiscordChannelName, trans?: Transaction): Promise<BaseDBError | {
    channelId: string;
    triggerable: boolean;
    channelType: DiscordChannelType;
}>;
export default getChannel;
