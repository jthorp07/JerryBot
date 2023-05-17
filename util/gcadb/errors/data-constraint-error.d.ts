import BaseDBError from "./base-db-error";
declare class DataConstraintError extends BaseDBError {
    constructor(args: string[], constraints: string[], proc: string);
}
export default DataConstraintError;
