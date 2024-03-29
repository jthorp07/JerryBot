import { ICommandPermission } from "../../../types/discord_interactions";
import { IPermission } from "../permissions";

const perm: IPermission = {
    permLevel: ICommandPermission.SERVER_OWNER,
    permCheck: async (interaction) => {
        return interaction.guild ? interaction.user.id === interaction.guild.ownerId : false;
    }
}

export default perm;