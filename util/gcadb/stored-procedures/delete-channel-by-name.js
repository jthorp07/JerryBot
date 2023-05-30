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
function deleteChannelByName(con, guildId, channelName, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("DeleteChannelByName");
        if (guildId.length > 21 || guildId.length < 17)
            return new errors_1.DataConstraintError(["GuildId", "ChannelName"], ["Must be greater than 17 and less than 22 characters in length", "Must be greater than 17 and less than 22 characters in length"], "DeleteChannelById");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("GuildId", guildId)
            .input("ChannelName", channelName)
            .execute("DeleteChannelByName");
        switch (result.returnValue) {
            case 0: return;
            case 1: return new errors_1.NullArgError(["GuildId", "ChannelName"], "DeleteChannelByName");
        }
        return new base_db_error_1.default("An unknown error occurred", enums_1.GCADBErrorCode.UNKNOWN_ERROR);
    });
}
exports.default = deleteChannelByName;
