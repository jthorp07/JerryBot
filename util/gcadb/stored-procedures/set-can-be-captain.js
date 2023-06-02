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
function setCanBeCaptain(con, userId, guildId, canBeCaptain, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("SetCanBeCaptain");
        if (!userId || !guildId || canBeCaptain == null)
            return new errors_1.NullArgError(["UserId", "GuildId", "CanBeCaptain"], "SetCanBeCaptain");
        let req = (0, _1.initReq)(con, trans);
        if (req instanceof base_db_error_1.default) {
            return req;
        }
        let result = yield req.input("UserId", userId)
            .input("GuildId", guildId)
            .input("CanBeCaptain", canBeCaptain)
            .execute("SetCanBeCaptain");
        switch (result.returnValue) {
            case 0:
                return;
            case 1:
                return new errors_1.NullArgError(["UserId", "GuildId", "CanBeCaptain"], "SetCanBeCaptain");
        }
        return new base_db_error_1.default("An unknown error has occurred", enums_1.GCADBErrorCode.UNKNOWN_ERROR);
    });
}
exports.default = setCanBeCaptain;
