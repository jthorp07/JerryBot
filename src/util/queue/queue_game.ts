import { Snowflake } from "discord.js";
import { EventEmitter } from "node:events";
import { QueueEvent } from "./queue";
import { FirebaseUserMmr, mmrManager } from "../database_options/firestore/db_mmr";

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
        const players: FirebaseUserMmr[] = [];
        const promises = [];
        for (const id of members) {
            promises.push((async () => {
                const player = await mmrManager.getUser(id);
                if (!player) throw new Error("player does not exist");
                players.push(player);
            }).call(this));
        }
        await Promise.all(promises).catch(err => {
            console.error(err);
            this.cancel();
            return;
        });

        players.sort((a, b) => {
            return a.mmr - b.mmr;
        });
        


    }

    private async cancel() {
        this.events.emit(QueueEvent.GameOver, this.id);
    }

    async endGame(winningTeam: 1 | 2) {
        this.events.emit(QueueEvent.GameOver, this.id, winningTeam);
    }

    getId() {
        return this.id;
    }


}