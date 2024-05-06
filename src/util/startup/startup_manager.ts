import { EventEmitter } from "node:events"

export enum StartupEvent {
    MetaDataReady = "meta_ready",
    LeaderboardReady = "leaderboard_ready",
}

/**
 * TODO: 
 * 
 *  - expose eventManager.emit() somehow
 */
export class StartupService {

    private flags: Map<string, boolean> = new Map();
    private eventManager: EventEmitter = new EventEmitter();

    private onAllReady: (() => void) | undefined;

    constructor(onReady: () => void, ignored?: StartupEvent[]) {
        this.onAllReady = onReady;
        for (const eventName of Object.values(StartupEvent)) {
            if (!(ignored?.includes(eventName))) {
                this.flags.set(eventName, false);
                this.eventManager.on(eventName, () => {
                    this.flags.set(eventName, true);
                    this.checkAllReady();
                });
            }
        }
        if (this.flags.size === 0) {
            onReady();
        }
    }

    private checkAllReady() {
        for (const value of this.flags.values()) {
            if (!value) return;
        }
        if (this.onAllReady) this.onAllReady();
    }
}