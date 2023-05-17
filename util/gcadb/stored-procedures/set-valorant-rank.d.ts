import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { ValorantRank } from "../enums";
declare function setValorantRank(con: ConnectionPool, guildId: string, userId: string, rank: ValorantRank, trans?: Transaction): Promise<BaseDBError>;
export default setValorantRank;
