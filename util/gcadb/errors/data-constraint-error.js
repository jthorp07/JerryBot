"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_db_error_1 = require("./base-db-error");
class DataConstraintError extends base_db_error_1.default {
    constructor(args, constraints, proc) {
        let msg = '';
        for (let i = 0; i < args.length; i++) {
            msg = `${msg}\n[${args[i]}]: ${constraints[i]}`;
        }
        super(`Some of the supplied data does not conform with the constraints on procedure ${proc}:${msg}`, 4);
        Object.setPrototypeOf(this, DataConstraintError.prototype);
    }
}
exports.default = DataConstraintError;
