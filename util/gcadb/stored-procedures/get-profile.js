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
function getProfile(con, userId, guildId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("GetProfile");
        if (!userId || !guildId)
            return new errors_1.NullArgError(["UserId", "GuildId"], "GetProfile");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("UserId", userId)
            .input("GuildId", guildId)
            .output("CurrentRank", (0, mssql_1.NVarChar)(100))
            .execute("GetProfile");
        switch (result.returnValue) {
            case 0:
                return {
                    currentRank: result.output.CurrentRank,
                    records: parseGetProfileRecords(result.recordset)
                };
            case 1:
                return new errors_1.NullArgError(["UserId", "GuildId"], "GetProfile");
        }
        return new base_db_error_1.default("An unknown error occurred", enums_1.GCADBErrorCode.UNKNOWN_ERROR);
    });
}
function parseGetProfileRecords(recordset) {
    return {
        isPremium: recordset[0].IsPremium,
        isOwner: recordset[0].IsOwner,
        discordUsername: recordset[0].Username,
        discordGuildName: recordset[0].GuildName,
        discordDisplayName: recordset[0].DisplayName,
        valorantDisplayName: recordset[0].ValorantName,
        valorantRoleName: recordset[0].ValorantRoleName,
        hasValorantRank: recordset[0].Ranked,
        canBeCaptain: recordset[0].CanBeCaptain
    };
}
exports.default = getProfile;
