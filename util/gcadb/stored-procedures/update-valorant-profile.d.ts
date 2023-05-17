import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function updateValorantProfile(con: ConnectionPool, guildId: string, userId: string, valorantDisplayName: string, trans?: Transaction): Promise<BaseDBError>;
export default updateValorantProfile;
