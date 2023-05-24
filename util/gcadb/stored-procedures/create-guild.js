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
 * Writes a new guild to the GCA Database
 *
 * @param con ConnectionPool connected to the GCA Database
 * @param guildId Discord ID of target guild
 * @param guildName Name of target guild
 * @param trans Database transaction to run this procedure against
 * @returns BaseDBError upon failure, void upon success
 */
function createGuild(con, guildId, guildName, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (guildName.length > 32 || guildName.length < 3 || guildId.length > 21 || guildId.length < 17)
            return new errors_1.DataConstraintError(["GuildName", "GuildId"], ["Must be greater than 2 and less than 33 characters in length", "Must be greater than 17 and less than 22 characters in length"], "CreateGuild");
        if (!con.connected)
            return new errors_1.NotConnectedError("CreateGuild");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input("GuildId", guildId)
            .input("GuildName", guildName)
            .execute("CreateGuild");
        let ret = result.returnValue;
        switch (ret) {
            case 0:
                return;
            case 1:
                return new errors_1.NullArgError(["GuildId"], "CreateGuild");
            case 2:
                return new errors_1.DoesNotExistError("CreateGuild");
        }
        return new base_db_error_1.default("An unknown error occurred", -99);
    });
}
exports.default = createGuild;
