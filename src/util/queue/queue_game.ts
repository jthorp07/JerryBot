import { Snowflake } from "discord.js";
import { EventEmitter } from "node:events";
import { QueueEvent } from "./queue";

type QueuePlayer = {
    discordId: Snowflake;
    mmr?: number;
}

export class QueueGame {

    private id: number;
    private teamOne: QueuePlayer[] = [];
    private teamTwo: QueuePlayer[] = [];
    private cancelVotes: boolean[] = [];
    private events: EventEmitter = new EventEmitter();

    constructor(players: Snowflake[], id: number) {
        this.id = id;
        this.makeTeams(players);
    }

    private async makeTeams(members: Snowflake[]) {
        
    }

    private async cancel() {

    }

    async endGame(winningTeam: 1 | 2) {
        this.events.emit(QueueEvent.GameOver, this.id, winningTeam);
    }

    getId() {
        return this.id;
    }


}