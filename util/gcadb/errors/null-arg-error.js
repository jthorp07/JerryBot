"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_db_error_1 = require("./base-db-error");
class NullArgError extends base_db_error_1.default {
    constructor(args, proc) {
        let argString = args.join(", ");
        super(`Stored procedure '${proc}' expects the following inputs to be NOT NULL: ${argString}`, 1);
        Object.setPrototypeOf(this, NullArgError.prototype);
    }
}
exports.default = NullArgError;
