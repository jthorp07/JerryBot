"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCADBErrorCode = void 0;
var GCADBErrorCode;
(function (GCADBErrorCode) {
    // User or frontend error codes
    GCADBErrorCode[GCADBErrorCode["NULL_ARG_ERROR"] = 1] = "NULL_ARG_ERROR";
    GCADBErrorCode[GCADBErrorCode["DOES_NOT_EXIST_ERROR"] = 2] = "DOES_NOT_EXIST_ERROR";
    GCADBErrorCode[GCADBErrorCode["ALREADY_EXIST_ERROR"] = 3] = "ALREADY_EXIST_ERROR";
    GCADBErrorCode[GCADBErrorCode["DATA_CONSTRAINT_ERROR"] = 4] = "DATA_CONSTRAINT_ERROR";
    GCADBErrorCode[GCADBErrorCode["NULL_ARG_CONDITIONAL_ERROR"] = 5] = "NULL_ARG_CONDITIONAL_ERROR";
    // Driver or database error codes
    GCADBErrorCode[GCADBErrorCode["NOT_CONENCTED_ERROR"] = -96] = "NOT_CONENCTED_ERROR";
    GCADBErrorCode[GCADBErrorCode["UNKNOWN_ERROR"] = -99] = "UNKNOWN_ERROR";
})(GCADBErrorCode = exports.GCADBErrorCode || (exports.GCADBErrorCode = {}));
