import { collection, QueryDocumentSnapshot, getDocs, getDoc, addDoc, doc, updateDoc, query, where, setDoc, DocumentReference, CollectionReference } from 'firebase/firestore';
import { firestore, FirebaseCollection } from './db_root';
import { config } from 'dotenv';
import { Snowflake } from 'discord.js';
import { WCAQueue } from '../../queue/queue_manager';
config();

export type FirebaseUserMmrLegacy = {
    decoupled: boolean,
    initialMMR: number,
    discordId: Snowflake,
    gamesPlayed: number,
    seasonsPlayed: number,
    mmr: number,
    active: boolean,
}


type FbQueuePartial = {
    queue: WCAQueue,
    active: boolean,
    season: number,
    channelId: Snowflake,
    messageId: Snowflake,
}


type FbQueue = {
    queue: WCAQueue,
    active: boolean,
    season: number,
    channelId: Snowflake,
    messageId: Snowflake,
    userStats: Map<Snowflake, UserQueueStats>
}


type UserQueueStats = {
    discordId: Snowflake,
    initialMmr: number,
    mmr: number,
    decoupled: boolean,
    gamesPlayed: number,
    gamesPlayedAllTime: number
    seasonsPlayed: number,
    active: boolean,
}

type QueueModerationStatus = {
    punishmentType: "Warning" | "Ban",
    issued: Date,
    expiration: Date,
    reason: string,
    queue: WCAQueue,
}

export type FirebaseUserMmrOptions = {
    decoupled?: boolean,
    initialMMR?: number,
    discordId: Snowflake,
    gamesPlayed?: number,
    seasonsPlayed?: number,
    mmr?: number,
    active?: boolean,
}

class QueueStatsManager {

    private _collection_legacy;
    private rootRef: DocumentReference;

    constructor(guildId: Snowflake) {

        this._collection_legacy = collection(firestore, FirebaseCollection.UserMMR).withConverter({
            toFirestore: (data: FirebaseUserMmrLegacy) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirebaseUserMmrLegacy
        });
        const _collection = collection(firestore, FirebaseCollection.QueueStats).withConverter({
            toFirestore: (data: FbQueuePartial) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FbQueuePartial
        });
        this.rootRef = doc(_collection, guildId);
    }

    /**
     * Marks the target queue as active and updates its season, channelId, and messageId values as necessary.
     * 
     * @param queue The queue to activate
     * @param channelId The channel the queue is hosted in
     * @param messageId The message being used as the queue interface
     * @param newSeason If true, increments the queue's season number
     * @param resetSeason [OPTIONAL: Default=false]: If true, sets the queue's season number to 0. Overrides newSeason.
     */
    async activateQueue(queue: WCAQueue, channelId: Snowflake, messageId: Snowflake, newSeason: boolean, resetSeason: boolean = false) {

        const queueRef = doc(this.rootRef, queue, queue) as DocumentReference<FbQueuePartial, FbQueuePartial>;
        const queueDoc = await getDoc(queueRef);
        if (!queueDoc.exists()) {
            // Create queue doc
            await setDoc(queueRef, {
                queue: queue,
                active: true,
                season: 0,
                channelId: channelId,
                messageId: messageId,
            });
        } else {
            // Reactivate existing queue
            await setDoc(queueRef, {
                queue: queue,
                active: true,
                season: resetSeason ? 0 : newSeason ? queueDoc.data().season + 1 : queueDoc.data().season,
                channelId: channelId,
                messageId: messageId,
            });
        }
    }


    /**
     * Marks the target queue as inactive. In order to reactivate, 
     * 
     * @param queue The queue to deactivate
     */
    async deactivateQueue(queue: WCAQueue) {

        const queueRef = doc(this.rootRef, queue, queue) as DocumentReference<FbQueuePartial, FbQueuePartial>;
        const queueDoc = await getDoc(queueRef);
        if (!queueDoc.exists()) {
            throw new Error("Cannot deactivate queue: Queue does not exist.")
        }
        await updateDoc(queueRef, {
            active: false,
        });

    }

    private async updateUserStats(queue: WCAQueue, userId: Snowflake, active: boolean, mmrDelta: number = 0,
        gamesPlayedDelta: number = 0, gamesPlayedAllTimeDelta: number = 0, seasonsPlayedDelta: number = 0, initialMmrDelta: number = 0) {

        const queueRef = doc(this.rootRef, queue, queue) as DocumentReference<FbQueuePartial, FbQueuePartial>;
        const queueDoc = await getDoc(queueRef);
        if (!queueDoc.exists()) {
            throw new Error("Cannot update stats: Queue does not exist.")
        }
        const userStatsRef = doc(collection(queueRef, "user_stats"), userId) as DocumentReference<UserQueueStats, UserQueueStats>;
        const userStatsDoc = await getDoc(userStatsRef);
        if (!userStatsDoc.exists()) {
            // Create new user
            const newUser: UserQueueStats = {
                discordId: userId,
                initialMmr: initialMmrDelta,
                mmr: mmrDelta,
                decoupled: false,
                gamesPlayed: gamesPlayedDelta,
                gamesPlayedAllTime: gamesPlayedAllTimeDelta,
                seasonsPlayed: seasonsPlayedDelta,
                active: active,
            }
            await setDoc(userStatsRef, newUser);
            return newUser;
        } else {
            // Update existing user
            const oldData = userStatsDoc.data();
            const updatedUser: UserQueueStats = {
                discordId: userId,
                initialMmr: oldData.initialMmr + initialMmrDelta,
                mmr: oldData.mmr + mmrDelta,
                decoupled: oldData.decoupled,
                gamesPlayed: isNaN(gamesPlayedDelta) ? 0 : oldData.gamesPlayed + gamesPlayedDelta,
                gamesPlayedAllTime: oldData.gamesPlayedAllTime + gamesPlayedAllTimeDelta,
                seasonsPlayed: oldData.seasonsPlayed + seasonsPlayedDelta,
                active: active,
            };
            await setDoc(userStatsRef, updatedUser);
            return updatedUser;
        }
    }

    async addUserGameResult(queue: WCAQueue, userId: Snowflake, deltaMmr: number) {
        await this.updateUserStats(queue, userId, true, deltaMmr, 1);
    }

    async endOfSeasonCalculations(queue: WCAQueue) {
        
    }

    async legacy_getAll() {
        const docSnaps = await getDocs(this._collection_legacy);
        return docSnaps.docs.map(doc => doc.data());
    }

    async legacy_setUser(user: FirebaseUserMmrLegacy) {
        const docRef = doc(this._collection_legacy, user.discordId);
        await setDoc(docRef, user);
    }

    async legacy_updateUser(options: FirebaseUserMmrOptions) {
        const docRef = doc(this._collection_legacy, options.discordId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`User does not exist: id=${options.discordId}`);
        }
        await updateDoc(docRef, options);
    }

    async legacy_getUser(userId: Snowflake) {
        const docRef = doc(this._collection_legacy, userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : undefined;
    }

}

export const mmrManager = new QueueStatsManager("710741097126821970");
// Example of using query

// export async function getUserByDiscordId(discordId: Snowflake) {
//     const q = query(_collection, where('discordId', '==', discordId));
//     const snap = (await getDocs(q)).docs;
//     if (snap.length == 0) return null;
//     return snap[0].data()
// }
