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
const errors_1 = require("../errors");
const base_db_error_1 = require("../errors/base-db-error");
const _1 = require(".");
const enums_1 = require("../enums");
function updateDiscordProfile(con, guildId, userId, username, isOwner, guildDisplayName, currentRank, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("UpdateDiscordProfile");
        if (!guildId || !userId || !username || isOwner == null || !guildDisplayName)
            return new errors_1.NullArgError(["GuildId", "UserId", "Username", "IsOwner", "GuildDisplayName"], "UpdateDiscordProfile");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("GuildId", guildId)
            .input("UserId", userId)
            .input("Username", username)
            .input("IsOwner", isOwner)
            .input("GuildDisplayName", guildDisplayName)
            .input("CurrentRank", currentRank)
            .input("HasRank", currentRank ? true : false)
            .execute("UpdateDiscordProfile");
        switch (result.returnValue) {
            case 0:
                return;
            case 1:
                return new errors_1.NullArgError(["GuildId", "UserId", "Username", "IsOwner", "GuildDisplayName"], "UpdateDiscordProfile");
            case 2:
                return new errors_1.DoesNotExistError("UpdateDiscordProfile");
            case 3:
                return new errors_1.DataConstraintError(["Username", "GuildDisplayName", "CurrentRank"], ["Must be a string between 3 and 32 characters", "Must be a string between 3 and 32 characters", "Must be of type 'ValorantRank' (see import ValorantRank)"], "UpdateDiscordProfile");
        }
        return new base_db_error_1.default("An unknown error occurred", enums_1.GCADBErrorCode.UNKNOWN_ERROR);
    });
}
exports.default = updateDiscordProfile;
