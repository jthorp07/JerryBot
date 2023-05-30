import { ConnectionPool, Transaction, IRecordSet } from "mssql";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
declare function getQueue(con: ConnectionPool, queueId: number, trans?: Transaction): Promise<BaseDBError | {
    captainCount: number;
    playerCount: number;
    queueStatus: QueueState;
    hostId: string;
    records: TenmansClassicRecords;
}>;
export type TenmansClassicQueuedUserRecord = {
    playerId: string;
    canBeCaptain: boolean;
    guildId: string;
    discordDisplayName: string;
    valorantDisplayName: string;
    roleName: string;
    roleEmote: string;
    roleIcon: string;
};
export type TenmansClassicAvailablePlayerRecord = {
    playerId: string;
    guildId: string;
    discordDisplayName: string;
    valorantDisplayName: string;
    roleName: string;
    roleEmote: string;
    roleIcon: string;
};
export type TenmansClassicTeamPlayerRecord = {
    playerId: string;
    isCaptain: boolean;
    guildId: string;
    discordDisplayName: string;
    valorantDisplayName: string;
    roleName: string;
    roleEmote: string;
    roleIcon: string;
};
export type TenmansClassicRecords = {
    allPlayers: TenmansClassicQueuedUserRecord[];
    availablePlayers: TenmansClassicAvailablePlayerRecord[];
    teamOne: TenmansClassicTeamPlayerRecord[];
    teamTwo: TenmansClassicTeamPlayerRecord[];
};
/**
 * This function WILL crash if given a recordset from any
 * request that is not the GetQueue procedure
 *
 * @param datum The mssql recordsets from a call to the GetQueue procedure
 */
export declare function parseGetQueueRecordsets(datum: IRecordSet<any>[]): TenmansClassicRecords;
export default getQueue;
