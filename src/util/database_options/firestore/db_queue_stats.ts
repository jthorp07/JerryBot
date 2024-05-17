import { collection, QueryDocumentSnapshot, getDocs, getDoc, DocumentSnapshot, doc, updateDoc, query, where, setDoc, DocumentReference, CollectionReference, deleteDoc } from 'firebase/firestore';
import { firestore, FirebaseCollection } from './db_root';
import { config } from 'dotenv';
import { Snowflake } from 'discord.js';
import { WCAQueue } from '../../queue/queue_manager';
import { queueRoot, FbQueuePartial } from './db_queue_root';
import { NeatQueueApiLeaderboardUser, getLastSeason } from '../../neatqueue/neatqueue';
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

// TODO: Likely to be moved to db_queue_moderation.ts (QueueModerationManager)
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

export class QueueStatsManager {

    private _collection_legacy;
    private root;

    constructor() {

        this._collection_legacy = collection(firestore, FirebaseCollection.UserMMR).withConverter({
            toFirestore: (data: FirebaseUserMmrLegacy) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirebaseUserMmrLegacy
        });
        this.root = queueRoot;
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
     * @param newInitialMmr The new initial MMR to apply to the user. If not supplied or negative, initial MMR will be unchanged.
     * @param _qRef An already verified queue document reference. If provided, will be used instead of making a new reference to prevent unnecessary reads.
     * @returns The updated user's stats
     */
    private async updateUserStats(queue: WCAQueue, userId: Snowflake, active: boolean, mmrDelta: number = 0,
        gamesPlayedDelta: number = 0, gamesPlayedAllTimeDelta: number = 0, seasonsPlayedDelta: number = 0, newInitialMmr: number = -1,
        _qRef?: DocumentReference<FbQueuePartial, FbQueuePartial>) {

        const queueRef = _qRef ? _qRef : (await this.root.getQueue(queue)).ref;
        const userStatsRef = doc(collection(queueRef, FirebaseCollection.QueueUserStats), userId) as DocumentReference<UserQueueStats, UserQueueStats>;
        const userStatsDoc = await getDoc(userStatsRef);
        if (!userStatsDoc.exists()) {
            // Create new user
            const newUser: UserQueueStats = {
                discordId: userId,
                initialMmr: newInitialMmr,
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
                initialMmr: newInitialMmr < 0 ? oldData.initialMmr : newInitialMmr,
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
     * @returns The stats of all users in the queue, or the stats of all active users in the queue
     */
    async getAllUserStats(queue: WCAQueue, activeOnly: boolean = true, _qRef?: DocumentReference<FbQueuePartial, FbQueuePartial>) {
        const queueRef = _qRef ? _qRef : (await this.root.getQueue(queue)).ref;

        const userStatCollection = collection(queueRef, FirebaseCollection.QueueUserStats).withConverter({
            toFirestore: (data: UserQueueStats) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as UserQueueStats
        });
        const userStatsQuery = activeOnly ? await getDocs(query(userStatCollection, where("active", "==", true))) : await getDocs(userStatCollection);
        const userStats = userStatsQuery.docs.map(doc => doc.data());
        return userStats;
    }

    /**
     * Retrieves the stats of a user in the target queue.
     * 
     * @param queue The target queue
     * @param userId Discord ID of target user
     * @param _qRef An already verified queue document reference. If provided, will be used instead of making a new reference to prevent unnecessary reads.
     * @returns 
     */
    async getUserStats(queue: WCAQueue, userId: Snowflake, _qRef?: DocumentReference<FbQueuePartial, FbQueuePartial>) {
        const queueRef = _qRef ? _qRef : (await this.root.getQueue(queue)).ref;
        const userStatCollection = collection(queueRef, FirebaseCollection.QueueUserStats).withConverter({
            toFirestore: (data: UserQueueStats) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as UserQueueStats
        });
        const userStatsQuery = await getDoc(doc(userStatCollection, userId));
        const userStats = userStatsQuery.exists() ? userStatsQuery.data() : undefined;
        return userStats;
    }

    async addUserGameResult(queue: WCAQueue, userId: Snowflake, deltaMmr: number) {
        await this.updateUserStats(queue, userId, true, deltaMmr, 1);
    }

    async updateUserNewSeason(queue: WCAQueue, userId: Snowflake, newMmr: number, gamesPlayed: number, _qRef?: DocumentReference<FbQueuePartial, FbQueuePartial>) {
        await this.updateUserStats(queue, userId, false, 0, NaN, gamesPlayed, 1, newMmr, _qRef);
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

    legacyUserMmrToUserQueueStats(user: FirebaseUserMmrLegacy, gamesPlayedAllTime: number): UserQueueStats {
        return {
            discordId: user.discordId,
            initialMmr: user.initialMMR,
            mmr: user.mmr,
            decoupled: user.decoupled,
            gamesPlayed: gamesPlayedAllTime,
            gamesPlayedAllTime: user.gamesPlayed,
            seasonsPlayed: user.seasonsPlayed,
            active: user.active,
        }
    }

    async legacy_migrate(users: FirebaseUserMmrLegacy[]) {

        console.log("Fetching Refs")
        const refs = await this.root.getQueue(WCAQueue.CustomsNA);
        const queueRef = refs.ref;
        const userStatCollection = collection(queueRef, FirebaseCollection.QueueUserStats).withConverter({
            toFirestore: (data: UserQueueStats) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as UserQueueStats
        });

        console.log("Fetching NeatQueue user data");
        const nqUserData = await getLastSeason("1180382139712286791", "710741097126821970");
        console.log("Mapping NeatQueue user data");
        const nqUserMap = new Map<Snowflake, NeatQueueApiLeaderboardUser>();
        for (const nqUser of nqUserData.alltime) {
            nqUserMap.set(nqUser.id, nqUser);
        }

        console.log("Adding user data to new schema");
        const userUploadPromises: Promise<any>[] = [];
        for (const oldUser of users) {

            const nqData = nqUserMap.get(oldUser.discordId);
            if (!nqData) {
                console.log(`Missing NeatQueue data for user ${oldUser.discordId}. Skipping`);
                continue;
            }

            const newUser = this.legacyUserMmrToUserQueueStats(oldUser, nqData.data.wins + nqData.data.losses);
            const newUserDocRef = doc(userStatCollection, oldUser.discordId);
            userUploadPromises.push(setDoc(newUserDocRef, newUser));
        }
        await Promise.all(userUploadPromises);

        console.log("Validating data in new schema");
        const newData = await getDocs(userStatCollection);
        if (newData.docs.length != users.length) {
            console.log(`New and old data is not consistent (new length = ${newData.docs.length}, old length = ${users.length}). Aborting.`);
            return false;
        }
        return true;

        // console.log("Deleting data from old schema");
        // const userDeletePromises: Promise<any>[] = [];
        // for (const oldUser of users) {

        //     const oldUserDocRef = doc(this._collection_legacy, oldUser.discordId);
        //     userDeletePromises.push(deleteDoc(oldUserDocRef));
        // }
        // await Promise.all(userDeletePromises);
    }

}

export const mmrManager = new QueueStatsManager();
// Example of using query

// export async function getUserByDiscordId(discordId: Snowflake) {
//     const q = query(_collection, where('discordId', '==', discordId));
//     const snap = (await getDocs(q)).docs;
//     if (snap.length == 0) return null;
//     return snap[0].data()
// }
