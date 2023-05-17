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
const get_queue_1 = require("./get-queue");
function pickSide(con, queueId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("PickSide");
        if (!queueId)
            return new errors_1.NullArgError(["QueueId"], "PickSide");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input("QueueId", queueId)
            .output("NumCaptains", mssql_1.Int)
            .output("PlayerCount", mssql_1.Int)
            .output("QueueStatus", (0, mssql_1.NVarChar)(100))
            .output("HostId", (0, mssql_1.VarChar)(22))
            .execute("PickSide");
        switch (result.returnValue) {
            case 0:
                return {
                    numCaptains: result.output.NumCaptains,
                    playerCount: result.output.PlayerCount,
                    queueStatus: result.output.QueueStatus,
                    hostId: result.output.HostId,
                    records: (0, get_queue_1.parseGetQueueRecordsets)(result.recordsets)
                };
            case 1:
                return new errors_1.NullArgError(["QueueId"], "PickSide");
        }
        return new base_db_error_1.default("An unknown error occurred", -99);
    });
}
exports.default = pickSide;
