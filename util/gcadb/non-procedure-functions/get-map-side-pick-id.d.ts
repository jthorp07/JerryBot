import { ConnectionPool, Transaction } from "mssql";
import BaseDBError from "../errors/base-db-error";
declare function getMapSidePickId(con: ConnectionPool, userId: string, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    yourTurn: boolean;
}>;
export default getMapSidePickId;
