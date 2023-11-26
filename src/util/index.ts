import { Client, Collection, Interaction } from "discord.js";
import { IEventHandler } from "../types/event_handler";
import { readdirSync } from "fs";
import { join } from "path"
import { ICommandPermission } from "../types/discord_interactions";


export const setEventHandlers = (client: Client, checkPerms?: (permissionLevel: ICommandPermission, interaction: Interaction) => Promise<boolean>) => {

    if (!client) return;

    const eventHandlers = new Collection<String, IEventHandler>();
    const handlerFiles = readdirSync(join(__dirname, "handlers")).filter(file => file.endsWith(".js"));

    for (const file of handlerFiles) {

        try {

            console.log(`[Handlers]: Reading event handler ${file}.`);
            const handler = require(join(__dirname, `handlers/${file}`)).default as IEventHandler;
            const onEvent = handler.handlerFactory(client, checkPerms);
            if (handler.useHandler === true) {
                console.log(`[Handlers]: Setting event handler for event ${handler.event}`);
                client.on(handler.event.toString(), onEvent);
            }
        } catch (error) {
            console.log(`[Handlers]: Error in file ${file}`);
            continue;
        }
    };

    return eventHandlers;
}