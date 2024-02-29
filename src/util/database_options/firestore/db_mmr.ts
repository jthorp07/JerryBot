import { collection, QueryDocumentSnapshot, getDocs, getDoc, addDoc, doc, updateDoc, query, where, setDoc } from 'firebase/firestore';
import { firestore, FirebaseCollection } from './db_root';
import { config } from 'dotenv';
import { Snowflake } from 'discord.js';
config();

export type FirebaseUserMMR = {
    decoupled: boolean,
    initialMMR: number,
    discordId: Snowflake,
    gamesPlayed: number,
    seasonsPlayed: number
}

const _collection = collection(firestore, FirebaseCollection.UserMMR).withConverter({
    toFirestore: (data: FirebaseUserMMR) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirebaseUserMMR 
});

export async function getMmrForAllUsers() {
    return getDocs(_collection).then(snap => {
        if (snap.empty) return [];
        return snap.docs.map(doc => doc.data())
    });
}

export async function getAllReferences() {
    return getDocs(_collection).then(snap => {
        return snap.docs;
    });
}

export async function addMmrUser(user: FirebaseUserMMR) {
    const docRef = doc(_collection, user.discordId);
    const document = (await getDoc(docRef)).data();
    if (document) throw new Error(`User ${user.discordId} already exists - use updateMmrUser instead`);
    return addDoc(_collection, user);
}

export async function updateMmrUser(user: FirebaseUserMMR) {

    const docRef = doc(_collection, user.discordId);
    const document = (await getDoc(docRef)).data();
    if (!document) throw new Error(`User ${user.discordId} does not exist - use addMmrUser instead`);
    updateDoc(docRef, user);
    return true;
}

export async function getUserByDiscordId(discordId: Snowflake) {
    const docRef = doc(_collection, discordId);
    const user = (await getDoc(docRef)).data();
    if (!user) return null;
    return user;
}

// Example of using query

// export async function getUserByDiscordId(discordId: Snowflake) {
//     const q = query(_collection, where('discordId', '==', discordId));
//     const snap = (await getDocs(q)).docs;
//     if (snap.length == 0) return null;
//     return snap[0].data()
// }
