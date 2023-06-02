/// <reference types="node" />
import { ConnectionPool, Transaction } from "mssql";
import { BaseDBError } from "./errors/base-db-error";
import { DiscordChannelName, DiscordChannelType, DiscordMemberRole, DiscordStaffRole, QueuePool, QueueState, QueueType, ValorantRank } from "./enums";
import env from "./env-vars.config";
import { EventEmitter } from "events";
import { GetProfileRecord } from "./stored-procedures/get-profile";
import { TenmansClassicRecords } from "./stored-procedures/get-queue";
import { ValorantRankedRolesRecord } from "./stored-procedures/get-rank-roles";
export declare class GCADB extends EventEmitter {
    con: ConnectionPool;
    reconnecting: boolean;
    private constructor();
    /**
     * Takes a SQL login config object and returns a connection
     * to a SQL database.
     *
     * **WARNING** This can log in to any SQL database and therefore may connect to an
     * invalid database, which would cause the library to error upon attempting to call a query.
     *
     * @param sql SQL login options for target database
     * @returns GCADB Connection
     */
    static GetConnection(sql: {
        user: string;
        password: string;
        database: string;
        server: string;
        pool: {
            max: number;
            min: number;
            idleTimeoutMillis: number;
        };
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
        };
    }): Promise<GCADB | undefined>;
    /**
     * Begins a transaction against the database
     *
     * @param onError Error handler in case of an error when beginning the transaction
     * @returns
     */
    beginTransaction(onError?: (error: Error) => Promise<void>): Promise<Transaction | BaseDBError>;
    /**
     * Commits a transaction to the database
     *
     * @param transaction
     */
    commitTransaction(transaction: Transaction): Promise<BaseDBError | undefined>;
    /**
     * Closes the connection to the database for graceful exit
     */
    closeConnection(): Promise<void>;
    /**
     * Wraps a stored procedure call and handles retries in the event
     * of connectivity errors
     *
     * @param proc Procedure to be called
     * @param args Arguments to give the procedure
     * @returns The result of the procedure
     */
    private callProcedure;
    /**
     * Writes a Discord channel to the GCA Database.
     * Returns void on success; BaseDBError on failure
     *
     * @param guildId The ID of the Discord server the request is coming from
     * @param channelId The ID of the created Discord channel
     * @param channelName The name of the created Discord channel
     * @param channelType The type of the created Discord channel
     * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
     * @param transaction A Transaction on the GCA Database, if this request should be part of one
     */
    createChannel(guildId: string, channelId: string, channelName: string, channelType: DiscordChannelType, triggerable: boolean, transaction?: Transaction): Promise<BaseDBError | undefined>;
    /**
     * Writes a new guild to the GCA Database
     *
     * @param guildId Discord ID of target guild
     * @param guildName Name of target guild
     * @param transaction Database transaction to run this procedure against
     * @returns BaseDBError upon failure, void upon success
     */
    createGuild(guildId: string, guildName: string, transaction?: Transaction): Promise<BaseDBError>;
    /**
     * Writes a Discord GuildMember's information on the GCA Database.
     * A GuildMember represents a Discord user and their unique profile
     * within a target Discord guild.
     *
     * Returns void on success; BaseDBError on failure
     *
     * @param guildId Discord ID of target guild
     * @param userId Discord ID of target Discord user
     * @param isOwner True if target Discord user is the owner of the target Guild
     * @param username Username of target Discord user
     * @param guildDisplayName Display name of target Discord user in target guild
     * @param valorantRankRoleName Likely to be deprecated
     * @param transaction Database transaction to run this request against
     * @returns Void if successful, BaseDBError if failed
     */
    createGuildMember(guildId: string, userId: string, isOwner: boolean, username: string, guildDisplayName: string, valorantRankRoleName: ValorantRank | null, transaction?: Transaction): Promise<BaseDBError>;
    createQueue(guildId: string, hostId: string, queueType: QueueType, transaction?: Transaction): Promise<number | BaseDBError>;
    deleteChannelById(guildId: string, channelId: string, transaction?: Transaction): Promise<BaseDBError>;
    deleteChannelByName(guildId: string, channelName: DiscordChannelName, transaction?: Transaction): Promise<BaseDBError>;
    draftPlayer(playerId: string, guildId: string, queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        queueStatus: QueueState;
        hostId: string;
        team: QueuePool;
        records: TenmansClassicRecords;
    }>;
    endQueue(queueId: number, transaction?: Transaction): Promise<BaseDBError>;
    getChannel(guildId: string, channelName: DiscordChannelName, transaction?: Transaction): Promise<BaseDBError | {
        channelId: string;
        triggerable: boolean;
        channelType: DiscordChannelType;
    }>;
    getEnforceRankRoles(guildId: string, transaction?: Transaction): Promise<boolean | BaseDBError>;
    getPrefs(userId: string, guildId: string, transaction?: Transaction): Promise<BaseDBError | {
        canBeCaptain: boolean;
    }>;
    getProfile(userId: string, guildId: string, transaction?: Transaction): Promise<BaseDBError | {
        currentRank: ValorantRank | null;
        records: GetProfileRecord;
    }>;
    getQueue(queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        captainCount: number;
        playerCount: number;
        queueStatus: QueueState;
        hostId: string;
        records: TenmansClassicRecords;
    }>;
    getRankRoles(guildId: string, transaction?: Transaction): Promise<BaseDBError | ValorantRankedRolesRecord[]>;
    getTriggerableChannels(guildId: string, channelId: string, transaction?: Transaction): Promise<boolean | BaseDBError>;
    getUserValRank(userId: string, guildId: string, transaction?: Transaction): Promise<BaseDBError | {
        roleEmote: string | null;
        roleIcon: string | null;
        roleName: ValorantRank | null;
    }>;
    imManuallyStartingDraft(queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        success: boolean;
        enforce: boolean;
    }>;
    imStartingDraft(queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        success: boolean;
        enforce: boolean;
    }>;
    joinQueue(userId: string, guildId: string, queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        numPlayers: number;
        numCaptains: number;
        queueStatus: QueueState;
        hostId: string;
        records: TenmansClassicRecords;
    }>;
    leaveTenmans(queueId: number, guildId: string, userId: string, transaction?: Transaction): Promise<BaseDBError | {
        wasCaptain: boolean;
        queuePool: QueuePool;
    }>;
    pickMap(queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        numCaptains: number;
        playerCount: number;
        queueStatus: QueueState;
        hostId: string;
        records: TenmansClassicRecords;
    }>;
    pickSide(queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        numCaptains: number;
        playerCount: number;
        queueStatus: QueueState;
        hostId: string;
        records: TenmansClassicRecords;
    }>;
    replaceCaptain(queueId: number, queuePool: number, transaction?: Transaction): Promise<BaseDBError>;
    setCanBeCaptain(userId: string, guildId: string, canBeCaptain: boolean, transaction?: Transaction): Promise<BaseDBError>;
    setCaptain(queueId: number, capOne: string, capTwo: string, guildId: string, transaction?: Transaction): Promise<BaseDBError | {
        queueStatus: QueueState;
        records: TenmansClassicRecords;
    }>;
    setEnforceRankRoles(guildId: string, enforce: boolean, transaction?: Transaction): Promise<BaseDBError>;
    setRole(guildId: string, roleId: string, roleName: ValorantRank | DiscordMemberRole | DiscordStaffRole, orderBy: number, roleIcon: string, roleEmote: string, transaction?: Transaction): Promise<BaseDBError>;
    setValName(valName: string, userId: string, guildId: string, transaction?: Transaction): Promise<BaseDBError>;
    setValorantRank(guildId: string, userId: string, rank: ValorantRank, transaction?: Transaction): Promise<BaseDBError>;
    updateDiscordProfile(guildId: string, userId: string, username: string, isOwner: boolean, guildDisplayName: string, currentRank: ValorantRank | null, transaction: Transaction): Promise<BaseDBError>;
    updateValorantProfile(guildId: string, userId: string, valorantDisplayName: string, transaction?: Transaction): Promise<BaseDBError>;
    /**
     * Deletes a guild from the GCA Database. A guild represents
     * a Discord server.
     *
     * Returns node-mssql.IProcedureResult<any> on success; BaseDBError on failure
     *
     * @param guildId Discord ID of target guild
     * @param trans Database transaction to run this request against
     * @returns
     */
    deleteGuild(guildId: string, trans?: Transaction): Promise<import("mssql").IProcedureResult<any> | BaseDBError>;
    getDraftPickId(userId: string, queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        yourTurn: boolean;
    }>;
    getMapSidePickId(userId: string, queueId: number, transaction?: Transaction): Promise<BaseDBError | {
        yourTurn: boolean;
    }>;
}
export { BaseDBError, env, DiscordChannelName, DiscordChannelType, DiscordMemberRole, DiscordStaffRole, ValorantRank };
export declare const getConnection: typeof GCADB.GetConnection;
