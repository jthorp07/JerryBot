import { Snowflake } from "discord.js";
import { QueueGame } from "./queue_game";
import { SetQueue } from "./set_queue";
import { EventEmitter } from "node:events"

export enum QueueEvent {
    Close="close",
    GameOver="game_over",
}

export class Queue {

    private queue: SetQueue = new SetQueue();
    private games: Map<number, QueueGame> = new Map();
    private gameSize: number;
    private locked: boolean = false;
    private events: EventEmitter = new EventEmitter();
    private nextGameId: number = 0;

    constructor(gameSize?: number) {
        this.gameSize = gameSize || 10;
        this.events.on(QueueEvent.GameOver, (gameId: number, winningTeam?: 1 | 2) => {
            const result = this.games.delete(gameId);
            console.log(`Game ${gameId} ended ${result ? "successfully":"but was not mapped"}. Result was ${winningTeam ? `team ${winningTeam} won` : "cancellation."}`);
        });
    }

    enqueue(id: Snowflake) {
        if (this.locked) throw new Error("lock");
        const result = this.queue.enqueue(id);
        if (result >= this.gameSize) {
            this.locked = true;
            const players = [];
            const gameId = this.nextGameId;
            for (let i = 0; i < 10; i++) {
                const nextPlayer = this.queue.pop();
                if (!nextPlayer) throw new Error("queue empty");
                players.push(nextPlayer);
            }
            this.games.set(1, new QueueGame(players, gameId));
            this.nextGameId++;
            this.locked = false;
        }
    }

    dequeue(id: Snowflake) {
        if (this.locked) throw new Error("lock");
        return this.queue.dequeue(id);
    }

    getQueue() {
        return this.queue.getQueue() as Snowflake[];
    }
}