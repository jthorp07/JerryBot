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
/**
 *
 * @param con ConnectionPool
 * @param guildId
 * @param hostId
 * @param queueType
 * @param queueId
 * @param trans
 * @returns
 */
function createQueue(con, guildId, hostId, queueType, queueId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate
        if (!con.connected)
            return new errors_1.NotConnectedError("CreateQueue");
        if (guildId.length < 17 || guildId.length > 21 || hostId.length < 17 || hostId.length > 21)
            return new errors_1.DataConstraintError(["GuildId", "HostId"], ["Must be greater than 16 characters and less than 22 characters", "Must be greater than 16 characters and less than 22 characters"], "CreateQueue");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input("GuildId", guildId)
            .input("HostId", hostId)
            .input("QueueType", queueType)
            .output("QueueId", mssql_1.Int)
            .execute("CreateQueue");
        switch (result.returnValue) {
            case 0:
                return parseInt(result.output.QueueId);
            case 1:
                return new errors_1.NullArgError(["HostId", "QueueId"], "CreateQueue");
            case 5:
                return new base_db_error_1.default("For the type of queue provided, procedure argument HostId cannot be null", 5);
        }
        return new base_db_error_1.default("An unknown error occured", -99);
    });
}
exports.default = createQueue;
