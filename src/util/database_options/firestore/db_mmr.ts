import { collection, QueryDocumentSnapshot, getDocs, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { firestore, FirebaseCollection } from './db_root';
import { Snowflake } from 'discord.js';

export type FirebaseUserMmr = {
    decoupled: boolean,
    initialMMR: number,
    discordId: Snowflake,
    gamesPlayed: number,
    seasonsPlayed: number,
    mmr: number,
    active: boolean,
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

class MmrManager {

    private _collection;

    constructor() {
        this._collection = collection(firestore, FirebaseCollection.UserMMR).withConverter({
            toFirestore: (data: FirebaseUserMmr) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirebaseUserMmr 
        });
    }

    async getAll() {
        const docSnaps = await getDocs(this._collection);
        return docSnaps.docs.map(doc => doc.data());
    }

    async setUser(user: FirebaseUserMmr) {
        const docRef = doc(this._collection, user.discordId);
        await setDoc(docRef, user);
    }

    async updateUser(options: FirebaseUserMmrOptions) {
        const docRef = doc(this._collection, options.discordId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`User does not exist: id=${options.discordId}`);
        }
        await updateDoc(docRef, options);
    }

    async getUser(userId: Snowflake) {
        const docRef = doc(this._collection, userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : undefined;
    }

}

export const mmrManager = new MmrManager();
// Example of using query

// export async function getUserByDiscordId(discordId: Snowflake) {
//     const q = query(_collection, where('discordId', '==', discordId));
//     const snap = (await getDocs(q)).docs;
//     if (snap.length == 0) return null;
//     return snap[0].data()
// }
