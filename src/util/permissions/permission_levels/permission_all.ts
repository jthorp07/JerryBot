import { ICommandPermission } from "../../../types/discord_interactions";
import { IPermission } from "../permissions";

const perm: IPermission = {
    permLevel: ICommandPermission.ALL,
    permCheck: async () => {
        return true;
    }
}

export default perm;