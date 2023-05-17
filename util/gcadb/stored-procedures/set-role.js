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
function setRole(con, guildId, roleId, roleName, orderBy, roleIcon, roleEmote, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("SetRole");
        if (!guildId || !roleId || !roleName)
            return new errors_1.NullArgError(["GuildId", "RoleId", "RoleName"], "SetRole");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input("GuildId", guildId)
            .input("RoleId", roleId)
            .input("RoleName", roleName)
            .input("OrderBy", orderBy)
            .input("RoleIcon", roleIcon)
            .input("RoleEmote", roleEmote)
            .execute("SetRole");
        switch (result.returnValue) {
            case 0:
                return;
            case 1:
                return new errors_1.NullArgError(["GuildId", "RoleId", "RoleName"], "SetRole");
        }
        return new base_db_error_1.default("An unknown error has occurred", -99);
    });
}
exports.default = setRole;
