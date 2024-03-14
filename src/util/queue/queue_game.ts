import { Snowflake } from "discord.js";
import { QueueEvent } from "./queue";
import { FirebaseUserMmr, mmrManager } from "../database_options/firestore/db_mmr";
import { emitToQueue } from "./queue_manager";

type QueuePlayer = {
    discordId: Snowflake;
    mmr?: number;
}

export class QueueGame {

    private id: number;
    private players: Snowflake[];
    private teamOne: QueuePlayer[] = [];
    private teamTwo: QueuePlayer[] = [];
    private cancelVotes: Snowflake[] = [];
    private winVotes: Snowflake[] = [];
    private teamOneVotes: number = 0;
    private queueName: string;

    constructor(players: Snowflake[], id: number, queueName: string) {
        this.id = id;
        this.players = players;
        this.queueName = queueName;
    }

    async init() {
        await this.makeTeams(this.players);
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
        emitToQueue(QueueEvent.GameOver, this.id);
    }

    async emitEndGame(winningTeam: 1 | 2) {
        emitToQueue(QueueEvent.GameOver, this.id, this.queueName, winningTeam);
    }

    getId() {
        return this.id;
    }

    voteWin(id: Snowflake, team: 1 | 2) {
        if (!this.winVotes.includes(id)) {
            this.winVotes.push(id);
            team === 1 ? this.teamOneVotes++ : null;
        }
        if (this.winVotes.length > 5) {
            this.emitEndGame(this.teamOneVotes > 5 ? 1 : 2)
        }
    } 

    voteCancel(id: Snowflake) {
        if (!this.cancelVotes.includes(id)) this.cancelVotes.push(id);
        if (this.cancelVotes.length >= 5) this.cancel();
    }
}