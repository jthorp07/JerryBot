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
const mssql_1 = require("mssql");
const errors_1 = require("../errors");
const base_db_error_1 = require("../errors/base-db-error");
const _1 = require(".");
const enums_1 = require("../enums");
const get_queue_1 = require("./get-queue");
function joinQueue(con, userId, guildId, queueId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("JoinQueue");
        if (!userId || !guildId || !queueId)
            return new errors_1.NullArgError(["UserId", "GuildId", "QueueId"], "JoinQueue");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("UserId", userId)
            .input("GuildId", guildId)
            .input("QueueId", queueId)
            .output("NumPlayers", mssql_1.Int)
            .output("NumCaptains", mssql_1.Int)
            .output("QueueStatus", (0, mssql_1.NVarChar)(100))
            .output("HostId", (0, mssql_1.VarChar)(22))
            .execute("JoinQueue");
        switch (result.returnValue) {
            case 0:
                return {
                    numPlayers: result.output.NumPlayers,
                    numCaptains: result.output.NumCaptains,
                    queueStatus: result.output.QueueStatus,
                    hostId: result.output.HostId,
                    records: (0, get_queue_1.parseGetQueueRecordsets)(result.recordsets)
                };
            case 1:
                return new errors_1.NullArgError(["UserId", "GuildId", "QueueId"], "JoinQueue");
            case 2:
                return new errors_1.DoesNotExistError("JoinQueue");
            case 5:
                return new base_db_error_1.default("Target user is missing required rank role", 5);
            case 6:
                return new base_db_error_1.default("Target user is already in queue", 6);
        }
        return new base_db_error_1.default("An unknown error occurred", enums_1.GCADBErrorCode.UNKNOWN_ERROR);
    });
}
exports.default = joinQueue;
