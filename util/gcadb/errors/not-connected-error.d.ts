import BaseDBError from "./base-db-error";
declare class NotConnectedError extends BaseDBError {
    constructor(proc: string);
}
export default NotConnectedError;
