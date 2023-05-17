export declare class BaseDBError {
    message: string;
    code: number;
    constructor(message: string, code: number);
    log(): void;
}
export default BaseDBError;
