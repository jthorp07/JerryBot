import { initializeApp } from 'firebase/app';
import { getFirestore, collection, QueryDocumentSnapshot, getDocs, getDoc, addDoc, doc, updateDoc } from 'firebase/firestore';
import { config } from 'dotenv';
import { Snowflake } from 'discord.js';
config();

type FirebaseUserMMR = {
    documentId: string | null,
    decoupled: boolean,
    initialMMR: number,
    discordId: Snowflake
}

export enum FirebaseCollection {
    UserMMR = 'user_mmr',
    MetaData = 'meta'
}

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: "jerry-bot-wca.firebaseapp.com",
    projectId: "jerry-bot-wca",
    storageBucket: "jerry-bot-wca.appspot.com",
    messagingSenderId: "845331301457",
    appId: "1:845331301457:web:bc10568277fee73f34a470",
    measurementId: "G-VS9JMB9ZG7"
};

const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
const userMMRCollection = collection(firestore, FirebaseCollection.UserMMR).withConverter({
    toFirestore: (data: FirebaseUserMMR) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as FirebaseUserMMR
        partial.documentId = snapshot.id;
        return partial;
    }
});


export async function getMmrForAllUsers() {
    return getDocs(userMMRCollection).then(snap => {
        if (snap.empty) return [];
        return snap.docs.map(doc => doc.data())
    });
}

export async function addMmrUser(user: FirebaseUserMMR) {

    if (user.documentId != null) {
        const existingDoc = doc(firestore, `${FirebaseCollection.UserMMR}/${user.documentId}`);
        const existingData = await getDoc(existingDoc);
        if (existingData.exists()) throw new Error(`User ${user.documentId} already exists - use updateMmrUser instead`);
    }

    return addDoc(userMMRCollection, user);
}

export async function updateMmrUser(user: FirebaseUserMMR) {

    if (user.documentId == null) throw new Error(`Provided user does not have a document ID`);
    const ref = doc(firestore, `${FirebaseCollection.UserMMR}/${user.documentId}`)
    const existingDoc = await getDoc(ref)
        .then(snap => {if (!snap.exists()) return null; return snap})
        .catch(err => {if (err) console.error(err); return null;});
    if (existingDoc == null) return;
    updateDoc(ref, user);
    
}
