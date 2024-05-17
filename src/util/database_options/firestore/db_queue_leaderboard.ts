import { QueryDocumentSnapshot, DocumentReference, collection, getDocs, setDoc, doc, getDoc, deleteDoc, where, query } from "@firebase/firestore";
import { mmrManager } from "./db_queue_stats";
import { firestore, FirebaseCollection } from "./db_root";
import { Snowflake } from "discord.js";
import { leaderboardScore } from "../../queue/queue_utils";
import { WCAQueue } from "../../queue/queue_manager";
import { queueRoot, FbQueuePartial } from "./db_queue_root";

export type LeaderboardUser = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    gamesPlayed: number,
    type: Leaderboard,
    position: number,
    queue: WCAQueue
}

type LeaderboardUserPartial = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    gamesPlayed: number,
    type: Leaderboard,
    queue: WCAQueue,
}

export type LegacyLeaderboardUser = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    gamesPlayed: number,
    type: Leaderboard,
    position: number,
}

type LegacyLeaderboardUserPartial = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    gamesPlayed: number,
    type: Leaderboard,
}

export type Leaderboard = "classic";

class QueueLeaderboardManager {

    private lastRefreshed;
    private cachedLeaderboard: LegacyLeaderboardUser[] = [];
    private cache: Map<WCAQueue, Map<Leaderboard, { leaderboard: LeaderboardUser[], lastRefreshed: Date}>> = new Map();
    private _collection;
    private root;

    constructor() {
        this.lastRefreshed = new Date(Date.now() - (1000 * 60 * 60));
        this._collection = collection(firestore, FirebaseCollection.TenmansLeaderboard).withConverter({
            toFirestore: (data: LeaderboardUser) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as LeaderboardUser
        });
        this.root = queueRoot;
    }

    async getLeaderboard(queue: WCAQueue, leaderboard: Leaderboard = "classic", forceRefresh: boolean = false) {
        
        const cached = this.cache.get(queue)?.get(leaderboard);
        const lastRefreshed = cached?.lastRefreshed;
        if (!forceRefresh && lastRefreshed && (lastRefreshed.getTime() - (Date.now() - (1000 * 60 * 60))) > 0) {
            console.log("cached lb");
            return cached.leaderboard;
        } else {
            console.log("make lb");
            const refs = await this.root.getQueue(queue);
            await this.clearLeaderboard(queue, leaderboard, refs.ref);
            await this.makeLeaderboard(queue, leaderboard, refs.ref);
            return this.cache.get(queue)?.get(leaderboard)?.leaderboard!;
        }
    }

    private async setUser(queue: WCAQueue, user: LeaderboardUser) {
        const qRefs = await this.root.getQueue(queue);
        const docRef = doc(collection(qRefs.ref, FirebaseCollection.QueueLeaderboard), user.discordId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            throw new Error(`User Already Exists: id=${user.discordId}`);
        }
        await setDoc(docRef, user);
    }

    private async clearLeaderboard(queue: WCAQueue, leaderboard: Leaderboard = "classic", ref: DocumentReference<FbQueuePartial, FbQueuePartial>) {
        console.log("lb clearing");
        const qRef = ref || (await this.root.getQueue(queue)).ref;
        const _query = query(collection(qRef, FirebaseCollection.QueueLeaderboard), where("type", "==", leaderboard));
        const docSnaps = await getDocs(_query);
        const promises: Promise<any>[] = [];
        docSnaps.docs.forEach(doc => {
            promises.push(deleteDoc(doc.ref));
        });
        await Promise.all(promises);
        console.log("lb cleared");
    } 

    private async makeLeaderboard(queue: WCAQueue, leaderboard: Leaderboard = "classic", ref: DocumentReference<FbQueuePartial, FbQueuePartial>) {
        console.log("lb making");
        const qRef = ref || (await this.root.getQueue(queue)).ref;
        const leaderboardCollection = collection(qRef, FirebaseCollection.QueueLeaderboard)
        const newLbPartial: LeaderboardUserPartial[] = [];
        const allUsers = await mmrManager.getAllUserStats(queue, true);
        for (const user of allUsers) {
            if (!user.active) {
                console.log(`[NON-BREAKING ERROR: SHOULD NOT REACH] User not active: id=${user.discordId}`); // Should not be hit anymore, but will keep for testing
                continue;
            }
            newLbPartial.push({
                discordId: user.discordId,
                gamesPlayed: user.gamesPlayed,
                score: leaderboardScore(user.initialMmr, user.mmr - user.initialMmr),
                type: leaderboard,
                decoupled: user.decoupled,
                queue: queue
            });
        }
        newLbPartial.sort((a, b) => {
            return a.score - b.score;
        });
        const promises: Promise<void>[] = [];
        const newCache = {
            lastRefreshed: new Date(Date.now()),
            leaderboard: [] as LeaderboardUser[]
        };
        newLbPartial.forEach((partial, i) => {
            const final = this.leaderboardUserFromPartial(partial, i + 1);
            promises.push(this.setUser(queue, final).then(() => console.log("lb user add")));
            newCache.leaderboard.push(final);
        });
        await Promise.all(promises);
        this.cache.get(queue)!.set(leaderboard, newCache);

        console.log("lb made");
    }

    private leaderboardUserFromPartial(user: LeaderboardUserPartial, position: number): LeaderboardUser {
        return {
            discordId: user.discordId,
            position: position,
            decoupled: user.decoupled,
            score: user.score,
            gamesPlayed: user.gamesPlayed,
            type: user.type,
            queue: user.queue
        }
    }
    
    async legacy_getLeaderboard(leaderboard: Leaderboard) {
        if ((this.lastRefreshed.getTime() - (Date.now() - (1000 * 60 * 60))) > 0) {
            console.log("cached lb");
            return this.cachedLeaderboard;
        } else {
            console.log("make lb");
            this.lastRefreshed = new Date(Date.now());
            await this.legacy_clearLeaderboard(leaderboard);
            await this.legacy_makeLeaderboard(leaderboard);
            return this.cachedLeaderboard;
        }
    }

    private async legacy_setUser(user: LegacyLeaderboardUser) {
        const docRef = doc(this._collection, user.discordId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            throw new Error(`User Already Exists: id=${user.discordId}`);
        }
        await setDoc(docRef, user);
    }

    private async legacy_clearLeaderboard(leaderboard: Leaderboard) {
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

    private async legacy_makeLeaderboard(leaderboard: Leaderboard) {
        console.log("lb making")
        const newLbPartial: LegacyLeaderboardUserPartial[] = [];
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
                type: "classic",
                decoupled: user.decoupled
            });
        }
        newLbPartial.sort((a, b) => {
            return a.score - b.score;
        });
        const promises: Promise<void>[] = [];
        newLbPartial.forEach((partial, i) => {
            const final = this.legacy_leaderboardUserFromPartial(partial, i + 1);
            promises.push(this.legacy_setUser(final).then(() => console.log("lb user add")));
            this.cachedLeaderboard.push(final);
        });
        await Promise.all(promises);
        console.log("lb made");
    }

    private legacy_leaderboardUserFromPartial(user: LegacyLeaderboardUserPartial, position: number): LegacyLeaderboardUser {
        return {
            discordId: user.discordId,
            position: position,
            decoupled: user.decoupled,
            score: user.score,
            gamesPlayed: user.gamesPlayed,
            type: user.type
        }
    }
}

export const leaderboardManager = new QueueLeaderboardManager();