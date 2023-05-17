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
 * Writes a Discord GuildMember's information on the GCA Database.
 * A GuildMember represents a Discord user and their unique profile
 * within a target Discord guild.
 *
 * Returns void on success; BaseDBError on failure
 *
 * @param con ConnectionPool connected to the GCA Database
 * @param guildId Discord ID of target guild
 * @param userId Discord ID of target Discord user
 * @param isOwner True if target Discord user is the owner of the target Guild
 * @param username Username of target Discord user
 * @param guildDisplayName Display name of target Discord user in target guild
 * @param valorantRankRoleName Likely to be deprecated
 * @param trans Database transaction to run this request against
 * @returns
 */
function createGuildMember(con, guildId, userId, isOwner, username, guildDisplayName, valorantRankRoleName, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate
        if (guildId.length > 21 || userId.length > 21)
            return new errors_1.DataConstraintError(['GuildId', 'UserId', 'GuildDisplayName'], ['Must be between 17 and 21 characters', 'Must be between 17 and 21 characters', 'Must be between 3 and 32 characters'], 'CreateGuildMember');
        if (guildDisplayName.length > 32 || guildDisplayName.length < 3)
            return new errors_1.DataConstraintError(['GuildId', 'UserId', 'GuildDisplayName'], ['Must be between 17 and 21 characters', 'Must be between 17 and 21 characters', 'Must be between 3 and 32 characters'], 'CreateGuildMember');
        if (!con.connected)
            return new errors_1.NotConnectedError("CreateGuildMember");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input('GuildId', guildId)
            .input('UserId', userId)
            .input('Username', username)
            .input('IsOwner', isOwner)
            .input('GuildDisplayName', guildDisplayName)
            .input('ValorantRankRoleName', valorantRankRoleName)
            .execute('CreateGuildMember');
        let retVal = result.returnValue;
        switch (retVal) {
            case 0:
                return;
            case 1:
                return new errors_1.NullArgError(['GuildId', 'UserId', 'GuildDisplayName', 'IsOwner'], 'CreateGuildMember');
            case 2:
                return new errors_1.DoesNotExistError('CreateGuildMember');
            case 3:
                return new errors_1.AlreadyExistsError('CreateGuildMember');
        }
        return new base_db_error_1.default("An unknown error occurred", -99);
    });
}
exports.default = createGuildMember;
