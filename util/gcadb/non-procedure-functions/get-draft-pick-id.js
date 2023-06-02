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
// TODO: No procedure for this
function getDraftPickId(con, userId, queueId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected) {
            return new errors_1.NotConnectedError("GetDraftPickId");
        }
        if (userId.length > 21 || userId.length < 17) {
            return new errors_1.DataConstraintError(["UserId"], ["Must be greater than 17 and less than 22 characters in length"], "GetDraftPickId");
        }
        // Request will either be made against a transaction or the connection pool
        let req;
        if (trans) {
            req = new mssql_1.PreparedStatement(trans);
        }
        else {
            req = new mssql_1.PreparedStatement(con);
        }
        yield req.input("UserId", (0, mssql_1.VarChar)(21))
            .input("QueueId", mssql_1.Int)
            .prepare("SELECT DraftPickId FROM Queues WHERE [Id]=@QueueId AND DraftPickId=@UserId");
        let result = yield req.execute({ UserId: userId, QueueId: queueId });
        yield req.unprepare();
        return {
            yourTurn: result.recordset.length != 0
        };
    });
}
exports.default = getDraftPickId;
