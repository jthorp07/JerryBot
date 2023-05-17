import BaseDBError from "./base-db-error";
declare class DoesNotExistError extends BaseDBError {
    constructor(proc: string);
}
export default DoesNotExistError;
