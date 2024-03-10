import { EmailRecipient } from "./recipients/email_recipient";
import { config } from "dotenv";
config();

export enum LogType {
    Default = 0b0,
    Debug = 0b1,
    Info = 0b10,
    Error = 0b100,
}

export enum LogLevel {
    Default = 0b0,
    Low = 0b1,
    Medium = 0b10,
    High = 0b100,
    Critical = 0b1000,
}

export class LogRecipient {
    logFn: ((message: string, timestamp: Date) => void | Promise<void>);
    name: string;

    constructor(fn: ((message: string, timestamp: Date) => void | Promise<void>), name: string, logType: LogType, logLevel: LogLevel) {
        this.name = name;
        this.logFn = fn;
    }

    sendLog(message: string, timestamp: Date) {
        this.logFn(message, timestamp);
    }

}

const defaultRecipient = new LogRecipient((message, timestamp) => { console.log() }, "default", LogType.Default, LogLevel.Default)

class Logger {

    private recipients: Map<LogType, Map<LogLevel, LogRecipient[]>> = new Map();

    constructor() {
        const logTypes = Object.keys(LogType).filter(v => !isNaN(Number(v)));
        const logLevels = Object.keys(LogLevel).filter(v => !isNaN(Number(v)));
        for (const lType of logTypes) {
            const levelMap = new Map<LogLevel, LogRecipient[]>();
            for (const lLevel of logLevels) {
                levelMap.set(lLevel as any as LogLevel, []);
            }
            this.recipients.set(lType as any as LogType, levelMap)
        }
    }

    addLogger(types: LogType[], levels: LogLevel[], recipient: LogRecipient) {
        const logTypes = Object.keys(LogType).filter(v => !isNaN(Number(v)));
        const logLevels = Object.keys(LogLevel).filter(v => !isNaN(Number(v)));

    }

    removeLogger(types: LogType[], levels: LogLevel[], recipient: LogRecipient) {
        const logTypes = Object.keys(LogType).filter(v => !isNaN(Number(v)));
        const logLevels = Object.keys(LogLevel).filter(v => !isNaN(Number(v)));

    }

    log(message: string, type: LogType[], level: LogLevel[], timestamp: Date) {
        const recipients = [];
        const logTypes = Object.keys(LogType).filter(v => !isNaN(Number(v)));
        const logLevels = Object.keys(LogLevel).filter(v => !isNaN(Number(v)));
        for (const lType of logTypes) {
            for (const lLevel of logLevels) {
            }
        }
    }

}

const jackRecipient = new EmailRecipient("jack-gmail", LogType.Error, LogLevel.Critical, process.env.JACK_GMAIL!) as LogRecipient;
const logger = new Logger();
logger.addLogger([LogType.Debug | LogType.Error | LogType.Info], [LogLevel.Critical], jackRecipient);

export function log(message: string, type: LogType[], level: LogLevel[]) {
    const timestamp = new Date(Date.now());
    logger.log(message, type, level, timestamp);
}