import { collection, QueryDocumentSnapshot, getDocs, getDoc, DocumentSnapshot, doc, updateDoc, query, where, setDoc, DocumentReference, CollectionReference } from 'firebase/firestore';
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


export type UserQueueStats = {
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

    /**
     * Private method used to update an individual user's stats. Public methods that interact with
     * user stats should call this method to make changes.
     * 
     * @param queue Queue to update user's stats in
     * @param userId Discord ID of the target user
     * @param active If a user is marked inactive, they will be excluded from end of season calculations and leaderloard requests
     * @param mmrDelta The change to apply to the user's MMR. Negative values will result in lowering the user's MMR
     * @param gamesPlayedDelta The change to apply to the user's 'games played' count for the current season
     * @param gamesPlayedAllTimeDelta The change to apply to the user's 'games played' count over all seasons (should only be modified on season resets)
     * @param seasonsPlayedDelta The change to apply to the user's number of seasons played
     * @param initialMmrDelta The change to apply to the user's starting MMR. Negative values will result in lowering the user's starting MMR.
     * @param _qRef An already verified queue document reference. If provided, will be used instead of making a new reference to prevent unnecessary reads.
     * @param _qDoc An already verified queue document. If provided, will be used instead of making a new document to prevent unnecessary reads.
     * @returns The updated user's stats
     */
    private async updateUserStats(queue: WCAQueue, userId: Snowflake, active: boolean, mmrDelta: number = 0,
            gamesPlayedDelta: number = 0, gamesPlayedAllTimeDelta: number = 0, seasonsPlayedDelta: number = 0, initialMmrDelta: number = 0,
            _qRef?: DocumentReference<FbQueuePartial, FbQueuePartial>, _qDoc?: DocumentSnapshot<FbQueuePartial, FbQueuePartial>) {

        const queueRef = _qRef ? _qRef : doc(this.rootRef, queue, queue) as DocumentReference<FbQueuePartial, FbQueuePartial>;
        const queueDoc = _qDoc ? _qDoc : await getDoc(queueRef);
        if (!queueDoc.exists()) {
            throw new Error("Cannot update stats: Queue does not exist.")
        }
        const userStatsRef = doc(collection(queueRef, FirebaseCollection.QueueUserStats), userId) as DocumentReference<UserQueueStats, UserQueueStats>;
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

    /**
     * Retrieves the stats of all users in the target queue.
     * 
     * @param queue The target queue
     * @param activeOnly If true, will only return users who are active in the queue
     * @param _qRef An already verified queue document reference. If provided, will be used instead of making a new reference to prevent unnecessary reads.
     * @param _qDoc An already verified queue document. If provided, will be used instead of making a new document to prevent unnecessary reads.
     * @returns 
     */
    async getAllUserStats(queue: WCAQueue, activeOnly: boolean = true, _qRef?: DocumentReference<FbQueuePartial, FbQueuePartial>, _qDoc?: DocumentSnapshot<FbQueuePartial, FbQueuePartial>) {
        const queueRef = _qRef ? _qRef : doc(this.rootRef, queue, queue) as DocumentReference<FbQueuePartial, FbQueuePartial>;
        const queueDoc = _qDoc ? _qDoc : await getDoc(queueRef);
        if (!queueDoc.exists()) {
            throw new Error("Cannot update stats: Queue does not exist.")
        }
        const userStatCollection = collection(queueRef, FirebaseCollection.QueueUserStats).withConverter({
            toFirestore: (data: UserQueueStats) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as UserQueueStats
        });
        const userStatsQuery = activeOnly ? await getDocs(query(userStatCollection, where("active", "==", true))) : await getDocs(userStatCollection);
        const userStats = userStatsQuery.docs.map(doc => doc.data());
        return userStats;
    }

    async addUserGameResult(queue: WCAQueue, userId: Snowflake, deltaMmr: number) {
        await this.updateUserStats(queue, userId, true, deltaMmr, 1);
    }

    async updateUserNewSeason(queue: WCAQueue, userId: Snowflake, newMmr: number, gamesPlayed: number) {
        await this.updateUserStats(queue, userId, false, 0, NaN, gamesPlayed, 1);
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
