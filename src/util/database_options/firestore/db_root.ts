import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { config } from "dotenv";
config();

export enum FirebaseCollection {
    UserMMR = 'user_mmr',
    QueueStats = 'queue_stats',
    QueueModeration = 'queue_mod',
    MetaData = 'meta',
    TenmansLeaderboard = 'tens_leaderboard',
    DiscordChannel = 'discord_channel',
    DiscordRole = 'discord_role'
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