"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../enums");
const base_db_error_1 = require("./base-db-error");
class DoesNotExistError extends base_db_error_1.default {
    constructor(proc) {
        super(`The data supplied for procedure '${proc}' attempts to reference nonexistent data in the database`, enums_1.GCADBErrorCode.DOES_NOT_EXIST_ERROR);
        Object.setPrototypeOf(this, DoesNotExistError.prototype);
    }
}
exports.default = DoesNotExistError;
