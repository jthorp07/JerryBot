import BaseDBError from "./base-db-error";
declare class AlreadyExistsError extends BaseDBError {
    constructor(proc: string);
}
export default AlreadyExistsError;
