"use strict";
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
exports.default = {
    SQL: {
        user: (_a = process.env.MSSQL_USER) !== null && _a !== void 0 ? _a : '',
        password: (_b = process.env.MSSQL_PASSWORD) !== null && _b !== void 0 ? _b : '',
        database: (_c = process.env.MSSQL_DATABASE) !== null && _c !== void 0 ? _c : '',
        server: (_d = process.env.MSSQL_SERVER) !== null && _d !== void 0 ? _d : '',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
        options: {
            encrypt: true,
            trustServerCertificate: true,
        },
    },
    ADMINS: [
        (_e = process.env.JACK) !== null && _e !== void 0 ? _e : '',
        (_f = process.env.UNI) !== null && _f !== void 0 ? _f : '',
        (_g = process.env.ANIMUZ) !== null && _g !== void 0 ? _g : ''
    ]
};
