"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delete_guild_1 = require("./delete-guild");
const get_draft_pick_id_1 = require("./get-draft-pick-id");
const get_map_side_pick_id_1 = require("./get-map-side-pick-id");
exports.default = {
    deleteGuild: delete_guild_1.default,
    getDraftPickId: get_draft_pick_id_1.default,
    getMapSidePickId: get_map_side_pick_id_1.default
};
