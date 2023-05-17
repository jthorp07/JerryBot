"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueState = void 0;
var QueueState;
(function (QueueState) {
    QueueState["WAITING_FOR_PLAYERS"] = "WAITING";
    QueueState["STARTING_DRAFT"] = "START_DRAFT";
    QueueState["DRAFTING"] = "DRAFTING";
    QueueState["IN_GAME"] = "PLAYING";
    QueueState["MAP_PICK"] = "MAP_PICK";
    QueueState["SIDE_PICK"] = "SIDE_PICK";
})(QueueState = exports.QueueState || (exports.QueueState = {}));
exports.default = QueueState;
