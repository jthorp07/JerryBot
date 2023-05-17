"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_db_error_1 = require("./base-db-error");
class NotConnectedError extends base_db_error_1.default {
    constructor(proc) {
        super(`ConnectionPool not connected when calling procedure '${proc}'`, -99);
        Object.setPrototypeOf(this, NotConnectedError.prototype);
    }
}
exports.default = NotConnectedError;
