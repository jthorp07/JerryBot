import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
declare function updateDiscordProfile(con: ConnectionPool, guildId: string, userId: string, username: string, isOwner: boolean, guildDisplayName: string, currentRank: ValorantRank | null, trans?: Transaction): Promise<BaseDBError | undefined>;
export default updateDiscordProfile;
