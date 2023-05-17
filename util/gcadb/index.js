"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = exports.ValorantRank = exports.DiscordStaffRole = exports.DiscordMemberRole = exports.DiscordChannelType = exports.DiscordChannelName = exports.env = exports.BaseDBError = exports.GCADB = void 0;
const mssql_1 = require("mssql");
const stored_procedures_1 = require("./stored-procedures");
const non_procedure_functions_1 = require("./non-procedure-functions");
const base_db_error_1 = require("./errors/base-db-error");
Object.defineProperty(exports, "BaseDBError", { enumerable: true, get: function () { return base_db_error_1.BaseDBError; } });
const enums_1 = require("./enums");
Object.defineProperty(exports, "DiscordChannelName", { enumerable: true, get: function () { return enums_1.DiscordChannelName; } });
Object.defineProperty(exports, "DiscordChannelType", { enumerable: true, get: function () { return enums_1.DiscordChannelType; } });
Object.defineProperty(exports, "DiscordMemberRole", { enumerable: true, get: function () { return enums_1.DiscordMemberRole; } });
Object.defineProperty(exports, "DiscordStaffRole", { enumerable: true, get: function () { return enums_1.DiscordStaffRole; } });
Object.defineProperty(exports, "ValorantRank", { enumerable: true, get: function () { return enums_1.ValorantRank; } });
const env_vars_config_1 = require("./env-vars.config");
exports.env = env_vars_config_1.default;
class GCADB {
    constructor(conPool) {
        this.con = conPool;
    }
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
    static GetConnection(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let initCon = new mssql_1.ConnectionPool(sql);
                let db = new GCADB(yield initCon.connect());
                return db;
            }
            catch (err) {
                return null;
            }
        });
    }
    /*
      =======================================================================================================
      Utility Methods
      =======================================================================================================
    */
    /**
     * Begins a transaction against the database
     *
     * @param onError Error handler in case of an error when beginning the transaction
     * @returns
     */
    beginTransaction(onError) {
        return __awaiter(this, void 0, void 0, function* () {
            let trans = yield this.con.transaction().begin().catch((err) => __awaiter(this, void 0, void 0, function* () { return yield onError(err); }));
            if (trans) {
                // DBMS error handling
                let rolledBack = false;
                trans.on("rollback", (aborted) => {
                    if (aborted) {
                        console.log("This rollback was triggered by SQL server");
                    }
                    rolledBack = true;
                    return;
                });
            }
            return trans;
        });
    }
    /**
     * Commits a transaction to the database
     *
     * @param transaction
     */
    commitTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            transaction.commit();
        });
    }
    /**
     * Closes the connection to the database for graceful exit
     */
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.con.close();
        });
    }
    /*
      =======================================================================================================
      Stored Procedure Calls
      =======================================================================================================
    */
    /**
     * Writes a Discord channel to the GCA Database.
     * Returns void on success; BaseDBError on failure
     *
     * @param guildId The ID of the Discord server the request is coming from
     * @param channelId The ID of the created Discord channel
     * @param channelName The name of the created Discord channel
     * @param channelType The type of the created Discord channel
     * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
     * @param trans A Transaction on the GCA Database, if this request should be part of one
     */
    createChannel(guildId, channelId, channelName, channelType, triggerable, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.createChannel(this.con, guildId, channelId, channelName, channelType, triggerable, transaction);
        });
    }
    ;
    /**
     * Writes a new guild to the GCA Database
     *
     * @param guildId Discord ID of target guild
     * @param guildName Name of target guild
     * @param trans Database transaction to run this procedure against
     * @returns BaseDBError upon failure, void upon success
     */
    createGuild(guildId, guildName, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.createGuild(this.con, guildId, guildName, transaction);
        });
    }
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
     * @returns Void if successful, BaseDBError if failed
     */
    createGuildMember(guildId, userId, isOwner, username, guildDisplayName, valorantRankRoleName, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.createGuildMember(this.con, guildId, userId, isOwner, username, guildDisplayName, valorantRankRoleName, transaction);
        });
    }
    createQueue(guildId, hostId, queueType, queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.createQueue(this.con, guildId, hostId, queueType, queueId, transaction);
        });
    }
    deleteChannelById(guildId, channelId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.deleteChannelById(this.con, guildId, channelId, transaction);
        });
    }
    deleteChannelByName(guildId, channelName, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.deleteChannelByName(this.con, guildId, channelName, transaction);
        });
    }
    draftPlayer(playerId, guildId, queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.draftPlayer(this.con, playerId, guildId, queueId, transaction);
        });
    }
    endQueue(queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.endQueue(this.con, queueId, transaction);
        });
    }
    getChannel(guildId, channelName, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.getChannel(this.con, guildId, channelName, transaction);
        });
    }
    getEnforceRankRoles(guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.getEnforceRankRoles(this.con, guildId, transaction);
        });
    }
    getPrefs(userId, guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.getPrefs(this.con, userId, guildId, transaction);
        });
    }
    getProfile(userId, guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.getProfile(this.con, userId, guildId, transaction);
        });
    }
    getQueue(queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.getQueue(this.con, queueId, transaction);
        });
    }
    getRankRoles(guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.getRankRoles(this.con, guildId, transaction);
        });
    }
    imManuallyStartingDraft(queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.imManuallyStartingDraft(this.con, queueId, transaction);
        });
    }
    imStartingDraft(queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.imStartingDraft(this.con, queueId, transaction);
        });
    }
    joinQueue(userId, guildId, queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.joinQueue(this.con, userId, guildId, queueId, transaction);
        });
    }
    leaveTenmans(queueId, guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.leaveTenmans(this.con, queueId, guildId, transaction);
        });
    }
    pickMap(queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.pickMap(this.con, queueId, transaction);
        });
    }
    pickSide(queueId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.pickSide(this.con, queueId, transaction);
        });
    }
    replaceCaptain(queueId, queuePool, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.replaceCaptain(this.con, queueId, queuePool, transaction);
        });
    }
    setCanBeCaptain(userId, guildId, canBeCaptain, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.setCanBeCaptain(this.con, userId, guildId, canBeCaptain, transaction);
        });
    }
    setCaptain(queueId, capOne, capTwo, guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.setCaptain(this.con, queueId, capOne, capTwo, guildId, transaction);
        });
    }
    setEnforceRankRoles(guildId, enforce, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.setEnforceRankRoles(this.con, guildId, enforce, transaction);
        });
    }
    setRole(guildId, roleId, roleName, orderBy, roleIcon, roleEmote, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.setRole(this.con, guildId, roleId, roleName, orderBy, roleIcon, roleEmote, transaction);
        });
    }
    setValName(valName, userId, guildId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.setValName(this.con, valName, userId, guildId, transaction);
        });
    }
    setValorantRank(guildId, userId, rank, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.setValorantRank(this.con, guildId, userId, rank, transaction);
        });
    }
    updateDiscordProfile(guildId, userId, username, isOwner, guildDisplayName, currentRank, hasRank, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.updateDiscordProfile(this.con, guildId, userId, username, isOwner, guildDisplayName, currentRank, hasRank, transaction);
        });
    }
    updateValorantProfile(guildId, userId, valorantDisplayName, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return stored_procedures_1.default.updateValorantProfile(this.con, guildId, userId, valorantDisplayName, transaction);
        });
    }
    /*
      =======================================================================================================
      Non-Stored Procedure Calls
      =======================================================================================================
    */
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
    deleteGuild(guildId, trans) {
        return __awaiter(this, void 0, void 0, function* () {
            return non_procedure_functions_1.default.deleteGuild(this.con, guildId, trans);
        });
    }
}
exports.GCADB = GCADB;
exports.getConnection = GCADB.GetConnection;
