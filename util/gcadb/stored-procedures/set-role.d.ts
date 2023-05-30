import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { DiscordMemberRole, DiscordStaffRole, ValorantRank } from "../enums";
declare function setRole(con: ConnectionPool, guildId: string, roleId: string, roleName: DiscordMemberRole | DiscordStaffRole | ValorantRank, orderBy: number, roleIcon: string, roleEmote: string, trans?: Transaction): Promise<BaseDBError | undefined>;
export default setRole;
