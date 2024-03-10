import { createTransport } from "nodemailer";
import { LogRecipient, LogLevel, LogType } from "../logger";
import { config } from "dotenv";
config();

const provider = "gmail" as const;

const transporter = createTransport({
    service: provider,
    auth: {
        user: process.env.JERRYBOT_GMAIL,
        pass: process.env.JERRYBOT_GMAIL_PASSWORD,
    }
});

function sendEmailer(target: string, type: LogType, level: LogLevel) {
    return (message: string, timestamp: Date) => {
        const greeting = timestamp.getHours() < 12 ? "morning" : timestamp.getHours() < 18 ? "afternoon" : "evening"
        transporter.sendMail({
            from: process.env.JERRYBOT_GMAIL,
            to: target,
            subject: "JerryBot Logging",
            text: `Good ${greeting}\n\nThis is an automated log sent from JerryBot:\n\nMessage: ${message}\nType: ${type}\nLevel: ${level}\n\nRegards,\nJerryBot`,
        })
    }
}

export class EmailRecipient extends LogRecipient {

    constructor(name: string, type: LogType, level: LogLevel, target: string) {
        super(sendEmailer(target, type, level), name, type, level);
    }

}