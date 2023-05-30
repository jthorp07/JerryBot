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
const enums_1 = require("../enums");
const _1 = require(".");
function getChannel(con, guildId, channelName, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("GetChannel");
        if (!channelName || !guildId)
            return new errors_1.NullArgError(["GuildId", "ChannelName"], "GetChannel");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("GuildId", guildId)
            .input("ChannelName", channelName)
            .output("ChannelId", (0, mssql_1.VarChar)(22))
            .output("Triggerable", mssql_1.Bit)
            .output("Type", (0, mssql_1.VarChar)(20))
            .execute("GetChannel");
        switch (result.returnValue) {
            case 0:
                return {
                    channelId: result.output.ChannelId,
                    triggerable: result.output.Triggerable,
                    channelType: result.output.Type
                };
            case 1:
                return new errors_1.NullArgError(["GuildId", "ChannelName"], "GetChannel");
            case 2:
                return new errors_1.DoesNotExistError("GetChannel");
        }
        return new base_db_error_1.default("An unknown error has occurred", enums_1.GCADBErrorCode.UNKNOWN_ERROR);
    });
}
exports.default = getChannel;
