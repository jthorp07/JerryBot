import { GCADBErrorCode } from "../enums";
export declare class BaseDBError {
    message: string;
    code: GCADBErrorCode;
    constructor(message: string, code: GCADBErrorCode);
    log(): void;
}
export default BaseDBError;
