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
exports.parseGetQueueRecordsets = void 0;
const mssql_1 = require("mssql");
const errors_1 = require("../errors");
const base_db_error_1 = require("../errors/base-db-error");
const _1 = require(".");
function getQueue(con, queueId, trans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!con.connected)
            return new errors_1.NotConnectedError("GetQueue");
        if (!queueId)
            return new errors_1.NullArgError(["QueueId"], "GetQueue");
        let req = (0, _1.initReq)(con, trans);
        let result = yield req.input("QueueId", queueId)
            .output("NumCaptains", mssql_1.Int)
            .output("PlayerCount", mssql_1.Int)
            .output("QueueStatus", (0, mssql_1.NVarChar)(100))
            .output("HostId", (0, mssql_1.VarChar)(22))
            .execute("GetQueue");
        switch (result.returnValue) {
            case 0:
                return {
                    captainCount: result.output.NumCaptains,
                    playerCount: result.output.PlayerCount,
                    queueStatus: result.output.QueueStatus,
                    hostId: result.output.hostId,
                    records: parseGetQueueRecordsets(result.recordsets)
                };
            case 1:
                return new errors_1.NullArgError(["QueueId"], "GetQueue");
            case 2:
                return new errors_1.DoesNotExistError("GetQueue");
        }
        return new base_db_error_1.default("An unknown error has occurred", -99);
    });
}
/**
 * This function WILL crash if given a recordset from any
 * request that is not the GetQueue procedure
 *
 * @param datum The mssql recordsets from a call to the GetQueue procedure
 */
function parseGetQueueRecordsets(datum) {
    // Index 0: All players in queue AS: {PlayerId, GuildId, CanBeCaptain, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon}
    let allPlayers = [];
    for (let i = 0; i < datum[0].length; i++) {
        allPlayers.push({
            playerId: datum[0][i].PlayerId,
            canBeCaptain: datum[0][i].CanBeCaptain,
            guildId: datum[0][i].GuildId,
            discordDisplayName: datum[0][i].DiscordDisplayName,
            valorantDisplayName: datum[0][i].ValorantDisplayName,
            roleName: datum[0][i].RoleName,
            roleEmote: datum[0][i].RoleEmote,
            roleIcon: datum[0][i].RoleIcon,
        });
    }
    // Index 1: Available players in queue AS { PlayerId, GuildId, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon }
    let availablePlayers = [];
    for (let i = 0; i < datum[0].length; i++) {
        availablePlayers.push({
            playerId: datum[0][i].PlayerId,
            guildId: datum[0][i].GuildId,
            discordDisplayName: datum[0][i].DiscordDisplayName,
            valorantDisplayName: datum[0][i].ValorantDisplayName,
            roleName: datum[0][i].RoleName,
            roleEmote: datum[0][i].RoleEmote,
            roleIcon: datum[0][i].RoleIcon,
        });
    }
    // Index 2: Team One roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon }
    let teamOne = [];
    for (let i = 0; i < datum[2].length; i++) {
        teamOne.push({
            playerId: datum[2][i].PlayerId,
            isCaptain: datum[2][i].IsCaptain,
            guildId: datum[2][i].GuildId,
            discordDisplayName: datum[2][i].DiscordDisplayName,
            valorantDisplayName: datum[2][i].ValorantDisplayName,
            roleName: datum[2][i].RoleName,
            roleEmote: datum[2][i].RoleEmote,
            roleIcon: datum[2][i].RoleIcon,
        });
    }
    // Index 3: Team Two roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon }   
    let teamTwo = [];
    for (let i = 0; i < datum[3].length; i++) {
        teamTwo.push({
            playerId: datum[3][i].PlayerId,
            isCaptain: datum[3][i].IsCaptain,
            guildId: datum[3][i].GuildId,
            discordDisplayName: datum[3][i].DiscordDisplayName,
            valorantDisplayName: datum[3][i].ValorantDisplayName,
            roleName: datum[3][i].RoleName,
            roleEmote: datum[3][i].RoleEmote,
            roleIcon: datum[3][i].RoleIcon,
        });
    }
    return {
        allPlayers: allPlayers,
        availablePlayers: availablePlayers,
        teamOne: teamOne,
        teamTwo: teamTwo
    };
}
exports.parseGetQueueRecordsets = parseGetQueueRecordsets;
exports.default = getQueue;
