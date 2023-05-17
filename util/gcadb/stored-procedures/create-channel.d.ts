import { ConnectionPool, Transaction } from "mssql";
import { DiscordChannelType } from "../enums";
import BaseDBError from "../errors/base-db-error";
/**
 * Writes a newly created Discord channel to the GCA Database
 *
 * @param con A ConnectionPool that is connected to the GCA Database
 * @param guildId The ID of the Discord server the request is coming from
 * @param channelId The ID of the created Discord channel
 * @param channelName The name of the created Discord channel
 * @param channelType The type of the created Discord channel
 * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
 * @param trans A Transaction on the GCA Database, if this request should be part of one
 */
declare function createChannel(con: ConnectionPool, guildId: string, channelId: string, channelName: string, channelType: DiscordChannelType, triggerable?: boolean, trans?: Transaction): Promise<BaseDBError>;
export default createChannel;
