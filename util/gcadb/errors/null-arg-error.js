"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../enums");
const base_db_error_1 = require("./base-db-error");
class NullArgError extends base_db_error_1.default {
    constructor(args, proc) {
        let argString = args.join(", ");
        super(`Stored procedure '${proc}' expects the following inputs to be NOT NULL: ${argString}`, enums_1.GCADBErrorCode.NULL_ARG_ERROR);
        Object.setPrototypeOf(this, NullArgError.prototype);
    }
}
exports.default = NullArgError;
