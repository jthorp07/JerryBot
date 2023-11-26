import { Events, User } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.UserUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldUser: User, newUser: User) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;