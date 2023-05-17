import BaseDBError from "./base-db-error";
declare class NullArgError extends BaseDBError {
    constructor(args: string[], proc: string);
}
export default NullArgError;
