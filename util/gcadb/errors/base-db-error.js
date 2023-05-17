"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDBError = void 0;
class BaseDBError {
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }
    log() {
        console.log(`  [GCADB]: A database error has occured:\n    Message: ${this.message}\n    Code: ${this.code}`);
    }
}
exports.BaseDBError = BaseDBError;
exports.default = BaseDBError;
