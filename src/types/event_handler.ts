import { Client, Events } from "discord.js";
import { PermChecker } from "../util/permissions/permissions";

export type IEventHandler = {
    event: Events,
    handlerFactory: (client: Client, checkPerms?: PermChecker) => (... args: any[]) => Promise<void>,
    useHandler: boolean
}