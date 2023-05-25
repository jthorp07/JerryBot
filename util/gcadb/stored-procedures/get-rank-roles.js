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
const _1 = require(".");
function getRankRoles(con, guildId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("GetRankRoles");
        if (!guildId)
            return new errors_1.NullArgError(["GuildId"], "GetRankRoles");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input("GuildId", guildId)
            .execute("GetRankRoles");
        return parseRankRoles(result.recordset);
    });
}
function parseRankRoles(datum) {
    let parsedRoles = [];
    for (let row of datum) {
        parsedRoles.push({
            roleId: row.RoleId,
            roleName: row.RoleName,
            orderBy: row.OrderBy,
            roleIcon: row.RoleIcon,
            roleEmote: row.RoleEmote
        });
    }
    return (parsedRoles.length > 0 ? parsedRoles : null);
}
exports.default = getRankRoles;