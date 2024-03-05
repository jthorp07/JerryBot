import { Snowflake } from "discord.js";
import { getJson } from "../json_data";
import { join } from "path";

type MetaData = {
    guild: Snowflake,
    rankRoles: Map<RankRole, Snowflake>,
    moderationRoles: Map<ModerationRole, Snowflake>
}

function isMetaData(o: any): o is MetaData {
    return "guild" in o && "rankRoles" in o && "moderationRoles" in o;
}

enum RankRole {
    Iron="iron",
    Bronze="bronze",
    Silver="silver",
    Gold="gold",
    Platinum="platinum",
    Diamond="diamond",
    Ascendant="ascendant",
    Immortal="immortal",
    Radiant="radiant",
    Unranked="unranked",
}

enum ModerationRole {
    Moderator="mod",
    Admin="admin",

}

const metaData = ;

class MetaDataJSONManager {

    private async get() {
        const obj = getJson(join(__dirname, "metadata.json"));
        return 
    }

}