export enum JerryErrorType {
    InternalError = "INTERNAL",
    IllegalStateError = "ILLEGAL",
    DatabaseError = "DB",
    DatabaseReadError = "DB_READ",
    DatabaseWriteError = "DB_WRITE",
    DiscordMissingArgError = "DISC_ARG_MISSING",
    DiscordFailedFetchError = "DISC_FETCH",
    DiscordFailedPostError = "DISC_POST",
}

export enum JerryErrorRecoverability {
    NonBreakingRecoverable = "nBR",
    BreakingRecoverable = "BR",
    BreakingNonRecoverable = "BnR",
}

export class JerryError {

    type: JerryErrorType;
    recoverability: JerryErrorRecoverability;
    message: string;
    cause?: Error | JerryError;
    stack?: string;

    constructor(type: JerryErrorType, recoverability: JerryErrorRecoverability, message: string, cause?: Error | JerryError) {
        const e: Error = new Error();
        if (e.stack) {
            this.stack = e.stack;
        }
        this.type = type;
        this.recoverability = recoverability;
        this.message = message;
        this.cause = cause;
    }

    throw() {
        throw new Error(this.makeMessage(), { cause: this.cause });
    }

    recover() {
        console.log(`[Bot]: An error was encountered but recovered from.\n  Recovered from:\n${this.makeMessage(2)}`);
    }

    private makeMessage(layer: number = 0) {
        let lyr = "";
        for (let i = 0; i < layer; i++) {
            lyr = ` ${lyr}`;
        }
        let message = `${lyr}[ERROR]:\n`;
        message = `${lyr}${message}  TYPE: ${this.type}\n`;
        message = `${lyr}${message}  RECOVERABILITY: ${this.recoverability}\n`;
        message = `${lyr}${message}  MESSAGE: ${this.message}\n`;
        if (this.stack) message = `${lyr}${message}  STACK:\n${this.stack}\n`;
        if (this.cause && this.cause instanceof JerryError) message = `${lyr}${message}  CAUSE:\n${this.cause.makeMessage(layer + 2)}`;
        return message;
    }
}