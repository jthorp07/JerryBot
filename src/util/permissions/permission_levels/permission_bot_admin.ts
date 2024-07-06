import { ICommandPermission } from "../../../types/discord_interactions";
import { IPermission } from "../permissions";
import { Interaction } from "discord.js";

const perm: IPermission = {
    permLevel: ICommandPermission.BOT_ADMIN,
    permCheck: async (interaction: Interaction) => {
        const userId = interaction.user.id;
        return userId == process.env.JACK || userId == process.env.WORTHY || userId == process.env.OSTI;
    }
}

export default perm;