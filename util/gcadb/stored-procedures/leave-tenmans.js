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
function leaveTenmans(con, queueId, guildId, userId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("LeaveTenmans");
        if (!queueId || !guildId)
            return new errors_1.NullArgError(["QueueId", "GuildId"], "LeaveTenmans");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("QueueId", queueId)
            .input("GuildId", guildId)
            .input("UserId", userId)
            .output("WasCaptain", mssql_1.Bit)
            .output("QueuePool", (0, mssql_1.NVarChar)(100))
            .execute("LeaveTenmans");
        switch (result.returnValue) {
            case 0:
                return {
                    wasCaptain: result.output.WasCaptain,
                    queuePool: result.output.QueuePool
                };
            case 1:
                return new errors_1.NullArgError(["QueueId", "GuildId"], "LeaveTenmans");
        }
        return new base_db_error_1.default("An unknown error occurred", -99);
    });
}
exports.default = leaveTenmans;
