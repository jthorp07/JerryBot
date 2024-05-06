import { QueryDocumentSnapshot, collection, getDocs, setDoc, doc, getDoc, deleteDoc, where, query } from "@firebase/firestore";
import { mmrManager } from "./db_queue_stats";
import { firestore, FirebaseCollection } from "./db_root";
import { Snowflake } from "discord.js";
import { leaderboardScore } from "../../queue/queue_utils";

export type LeaderboardUser = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    gamesPlayed: number,
    queue: Leaderboard,
    position: number
}

type LeaderboardUserPartial = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    gamesPlayed: number,
    queue: Leaderboard,
}

export type Leaderboard = "classic";

class LeaderboardManager {

    private lastRefreshed;
    private cachedLeaderboard: LeaderboardUser[] = [];
    private _collection;

    constructor() {
        this.lastRefreshed = new Date(Date.now() - (1000 * 60 * 60));
        this._collection = collection(firestore, FirebaseCollection.TenmansLeaderboard).withConverter({
            toFirestore: (data: LeaderboardUser) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as LeaderboardUser
        });
    }

    async getLeaderboard(leaderboard: Leaderboard) {
        if ((this.lastRefreshed.getTime() - (Date.now() - (1000 * 60 * 60))) > 0) {
            console.log("cached lb");
            return this.cachedLeaderboard;
        } else {
            console.log("make lb");
            this.lastRefreshed = new Date(Date.now());
            await this.clearLeaderboard(leaderboard);
            await this.makeLeaderboard(leaderboard);
            return this.cachedLeaderboard;
        }
    }

    private async setUser(user: LeaderboardUser) {
        const docRef = doc(this._collection, user.discordId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            throw new Error(`User Already Exists: id=${user.discordId}`);
        }
        await setDoc(docRef, user);
    }

    private async clearLeaderboard(leaderboard: Leaderboard) {
        console.log("lb clearing");
        const _query = query(this._collection, where("type", "==", leaderboard));
        const docSnaps = await getDocs(_query);
        const promises: Promise<any>[] = [];
        docSnaps.docs.forEach(doc => {
            promises.push(deleteDoc(doc.ref));
        });
        await Promise.all(promises);
        console.log("lb cleared");
    } 

    private async makeLeaderboard(leaderboard: Leaderboard) {
        console.log("lb making")
        const newLbPartial: LeaderboardUserPartial[] = [];
        const allUsers = await mmrManager.legacy_getAll();
        for (const user of allUsers) {
            if (!user.active) {
                console.log(`User not active: id=${user.discordId}`);
                continue;
            }
            newLbPartial.push({
                discordId: user.discordId,
                gamesPlayed: user.gamesPlayed,
                score: leaderboardScore(user.initialMMR, user.mmr - user.initialMMR),
                queue: "classic",
                decoupled: user.decoupled
            });
        }
        newLbPartial.sort((a, b) => {
            return a.score - b.score;
        });
        const promises: Promise<void>[] = [];
        newLbPartial.forEach((partial, i) => {
            const final = this.leaderboardUserFromPartial(partial, i + 1);
            promises.push(this.setUser(final).then(() => console.log("lb user add")));
            this.cachedLeaderboard.push(final);
        });
        await Promise.all(promises);
        console.log("lb made");
    }

    private leaderboardUserFromPartial(user: LeaderboardUserPartial, position: number): LeaderboardUser {
        return {
            discordId: user.discordId,
            position: position,
            decoupled: user.decoupled,
            score: user.score,
            gamesPlayed: user.gamesPlayed,
            queue: user.queue
        }
    }
}

export const leaderboardManager = new LeaderboardManager();