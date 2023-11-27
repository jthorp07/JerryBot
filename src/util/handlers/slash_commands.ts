import { readdirSync } from "fs";
import { join } from "path";
import { ChatInputCommandInteraction, Collection, Events, Interaction } from "discord.js";
import { ICommand } from "../../types/discord_interactions";
import { IEventHandler } from "../../types/event_handler";

const path = join(__dirname, '../../commands');
const eventHandler: IEventHandler = {
    event: Events.InteractionCreate,
    handlerFactory: (client, permCheck) => {
        const slashCommands = new Collection<String, ICommand>();
        const files = (() => {
            try {
                return readdirSync(path).filter(file => file.endsWith(".js"));
            } catch (err) {
                return [];

            }
        }).call(this);
        if (files.length == 0) return async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) return;
            await interaction.reply({ content: `Something went wrong, and slash commands cannot be handled at the moment. Please report this to a staff member.` });
        }

        for (const file of files) {

            const cmd = require(join(__dirname, `../../commands/${file}`)).default as ICommand;
            try {
                console.log(`[Slash Commands]: Reading command ${cmd.data.name}`);
                slashCommands.set(cmd.data.name, cmd)
            } catch (error) {
                console.log(`[Slash Commands]: Error in file ${file}`);
                continue;
            }
        };
        return async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) return
            let cmdInteraction: ChatInputCommandInteraction = interaction;
            let cmd: ICommand | undefined = slashCommands?.get(cmdInteraction.commandName);
            if (cmd === undefined) return;
            if (permCheck) {
                let authenticated = await permCheck(cmd.permissions, interaction);
                if (!authenticated) {
                    await interaction.editReply({ content: "You do not have the right permissions to use this selectmenu!" });
                    return;
                }
            }
            await cmd.execute(cmdInteraction);
        }
    },
    useHandler: true,
}

export default eventHandler;