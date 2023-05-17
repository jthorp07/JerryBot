"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_db_error_1 = require("./base-db-error");
class AlreadyExistsError extends base_db_error_1.default {
    constructor(proc) {
        super(`The data supplied for procedure '${proc}' would result in a duplicate in the database`, 3);
        Object.setPrototypeOf(this, AlreadyExistsError.prototype);
    }
}
exports.default = AlreadyExistsError;
