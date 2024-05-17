import { initializeApp } from 'firebase/app';
import { DocumentReference, collection, doc, getFirestore } from 'firebase/firestore';
import { config } from "dotenv";
import { Snowflake } from 'discord.js';
import { FirestoreMetaDataBase } from './db_meta';
config();

export enum FirebaseCollection {
    UserMMR = 'user_mmr',
    QueueRoot = 'queue',
    QueueStats = 'queue_stats',
    QueueUserStats = 'queue_user_stats',
    QueueModeration = 'queue_mod',
    QueueLeaderboard = 'queue_leaderboard',
    MetaData = 'meta',
    TenmansLeaderboard = 'tens_leaderboard',
    DiscordChannel = 'discord_channel',
    DiscordRole = 'discord_role',
    Guilds = 'guild'
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

class FirebaseRoot {
    doc;

    constructor(guildId: Snowflake) {
        this.doc = doc(collection(firestore, FirebaseCollection.Guilds), guildId) as DocumentReference<FirestoreMetaDataBase, FirestoreMetaDataBase>;
    }
}

const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const root = new FirebaseRoot(process.env.WORTHY_SERVER || "710741097126821970");