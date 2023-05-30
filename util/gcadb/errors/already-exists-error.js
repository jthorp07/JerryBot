"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../enums");
const base_db_error_1 = require("./base-db-error");
class AlreadyExistsError extends base_db_error_1.default {
    constructor(proc) {
        super(`The data supplied for procedure '${proc}' would result in a duplicate in the database`, enums_1.GCADBErrorCode.ALREADY_EXIST_ERROR);
        Object.setPrototypeOf(this, AlreadyExistsError.prototype);
    }
}
exports.default = AlreadyExistsError;
