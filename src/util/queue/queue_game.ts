import { Snowflake } from "discord.js";

type QueuePlayer = {
    discordId: Snowflake;
    mmr?: number;
    
}



export class QueueGame {
    private teamOne: QueuePlayer[] = [];
    private teamTwo: QueuePlayer[] = [];

    constructor(players: Snowflake[]) {
        this.makeTeams(players);
    }

    private makeTeams(members: Snowflake[]) {
        
    }
}