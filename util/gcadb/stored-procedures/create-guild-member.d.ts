import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
/**
 * Writes a Discord GuildMember's information on the GCA Database.
 * A GuildMember represents a Discord user and their unique profile
 * within a target Discord guild.
 *
 * Returns void on success; BaseDBError on failure
 *
 * @param con ConnectionPool connected to the GCA Database
 * @param guildId Discord ID of target guild
 * @param userId Discord ID of target Discord user
 * @param isOwner True if target Discord user is the owner of the target Guild
 * @param username Username of target Discord user
 * @param guildDisplayName Display name of target Discord user in target guild
 * @param valorantRankRoleName Likely to be deprecated
 * @param trans Database transaction to run this request against
 * @returns
 */
declare function createGuildMember(con: ConnectionPool, guildId: string, userId: string, isOwner: boolean, username: string, guildDisplayName: string, valorantRankRoleName: ValorantRank | null, trans?: Transaction): Promise<BaseDBError | undefined>;
export default createGuildMember;
