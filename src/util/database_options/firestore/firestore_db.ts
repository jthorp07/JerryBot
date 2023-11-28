import { initializeApp } from 'firebase/app';
import { getFirestore, collection, QueryDocumentSnapshot, CollectionReference } from 'firebase/firestore';
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
    UserMMR = 'user_mmr'
}

const collections = new Map<FirebaseCollection, CollectionReference>();

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
const firestore = getFirestore(firebaseApp);
const userMMRCollection = collection(firestore, FirebaseCollection.UserMMR).withConverter({
    toFirestore: (data: FirebaseUserMMR) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirebaseUserMMR
});
collections.set(FirebaseCollection.UserMMR, userMMRCollection);
