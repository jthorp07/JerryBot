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
/**
 * Writes a newly created Discord channel to the GCA Database
 *
 * @param con A ConnectionPool that is connected to the GCA Database
 * @param guildId The ID of the Discord server the request is coming from
 * @param channelId The ID of the created Discord channel
 * @param channelName The name of the created Discord channel
 * @param channelType The type of the created Discord channel
 * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
 * @param trans A Transaction on the GCA Database, if this request should be part of one
 */
function createChannel(con, guildId, channelId, channelName, channelType, triggerable, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("CreateChannel");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("GuildId", guildId)
            .input("ChannelId", channelId)
            .input("ChannelName", channelName)
            .input("ChannelType", channelType)
            .input("Triggerable", triggerable)
            .execute("CreateChannel");
        switch (result.returnValue) {
            case 0:
                return;
            case 1:
                return new errors_1.NullArgError(["GuildId", "ChannelId", "ChannelName", "ChannelType"], "CreateChannel");
            case 2:
                return new errors_1.DoesNotExistError("CreateChannel");
        }
        return new base_db_error_1.default("An unknown error occurred", -99);
    });
}
exports.default = createChannel;
