"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initReq = void 0;
const mssql_1 = require("mssql");
const base_db_error_1 = require("../errors/base-db-error");
const create_channel_1 = require("./create-channel");
const create_guild_1 = require("./create-guild");
const create_guild_member_1 = require("./create-guild-member");
const create_queue_1 = require("./create-queue");
const delete_channel_by_id_1 = require("./delete-channel-by-id");
const delete_channel_by_name_1 = require("./delete-channel-by-name");
const draft_player_1 = require("./draft-player");
const end_queue_1 = require("./end-queue");
const get_channel_1 = require("./get-channel");
const get_enforce_rank_roles_1 = require("./get-enforce-rank-roles");
const get_prefs_1 = require("./get-prefs");
const get_profile_1 = require("./get-profile");
const get_queue_1 = require("./get-queue");
const get_rank_roles_1 = require("./get-rank-roles");
const get_triggerable_channels_1 = require("./get-triggerable-channels");
const get_user_val_rank_1 = require("./get-user-val-rank");
const im_manually_starting_draft_1 = require("./im-manually-starting-draft");
const im_starting_draft_copy_1 = require("./im-starting-draft copy");
const join_queue_1 = require("./join-queue");
const leave_tenmans_1 = require("./leave-tenmans");
const pick_map_1 = require("./pick-map");
const pick_side_1 = require("./pick-side");
const replace_captain_1 = require("./replace-captain");
const set_can_be_captain_1 = require("./set-can-be-captain");
const set_captains_1 = require("./set-captains");
const set_enforce_rankroles_1 = require("./set-enforce-rankroles");
const set_role_1 = require("./set-role");
const set_val_name_1 = require("./set-val-name");
const set_valorant_rank_1 = require("./set-valorant-rank");
const update_discord_profile_1 = require("./update-discord-profile");
const update_valorant_profile_1 = require("./update-valorant-profile");
exports.default = {
    createChannel: create_channel_1.default,
    createGuild: create_guild_1.default,
    createGuildMember: create_guild_member_1.default,
    createQueue: create_queue_1.default,
    deleteChannelById: delete_channel_by_id_1.default,
    deleteChannelByName: delete_channel_by_name_1.default,
    draftPlayer: draft_player_1.default,
    endQueue: end_queue_1.default,
    getChannel: get_channel_1.default,
    getEnforceRankRoles: get_enforce_rank_roles_1.default,
    getPrefs: get_prefs_1.default,
    getProfile: get_profile_1.default,
    getQueue: get_queue_1.default,
    getRankRoles: get_rank_roles_1.default,
    getTriggerableChannels: get_triggerable_channels_1.default,
    getUserValRank: get_user_val_rank_1.default,
    imManuallyStartingDraft: im_manually_starting_draft_1.default,
    imStartingDraft: im_starting_draft_copy_1.default,
    joinQueue: join_queue_1.default,
    leaveTenmans: leave_tenmans_1.default,
    pickMap: pick_map_1.default,
    pickSide: pick_side_1.default,
    replaceCaptain: replace_captain_1.default,
    setCanBeCaptain: set_can_be_captain_1.default,
    setCaptain: set_captains_1.default,
    setEnforceRankRoles: set_enforce_rankroles_1.default,
    setRole: set_role_1.default,
    setValName: set_val_name_1.default,
    setValorantRank: set_valorant_rank_1.default,
    updateDiscordProfile: update_discord_profile_1.default,
    updateValorantProfile: update_valorant_profile_1.default
};
function initReq(con, trans) {
    try {
        let req = trans ? new mssql_1.Request(trans) : new mssql_1.Request(con);
        if (!req)
            return new base_db_error_1.default("Failed to create request", -97);
        return req;
    }
    catch (err) {
        return new base_db_error_1.default("Error creating request", -97);
    }
}
exports.initReq = initReq;
;
