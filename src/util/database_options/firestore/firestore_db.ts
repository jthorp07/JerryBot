import { initializeApp } from 'firebase/app';
import { config } from 'dotenv';
config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: "jerry-bot-wca.firebaseapp.com",
    projectId: "jerry-bot-wca",
    storageBucket: "jerry-bot-wca.appspot.com",
    messagingSenderId: "845331301457",
    appId: "1:845331301457:web:bc10568277fee73f34a470",
    measurementId: "G-VS9JMB9ZG7"
};

const firebase = initializeApp(firebaseConfig);

const requestQueue = [];

let state = {
    locked: false
}

function getDatabase() {
    return {
        db: {},
        release: () => {
            state.locked = false
        }
    }
}