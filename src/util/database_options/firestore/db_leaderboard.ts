import { QueryDocumentSnapshot, collection, getDocs, addDoc, doc, getDoc, deleteDoc } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_mmr";
import { Snowflake } from "discord.js";

export type LeaderboardUser = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    documentId?: string | undefined
}

const leaderboardCollection = collection(firestore, FirebaseCollection.TenmansLeaderboard).withConverter({
    toFirestore: (data: LeaderboardUser) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as LeaderboardUser
        partial.documentId = snapshot.id;
        return partial;
    }
});

export async function addUserToLeaderboard(user: LeaderboardUser) {

    if (user.documentId != null) {
        const existingDoc = doc(firestore, `${FirebaseCollection.TenmansLeaderboard}/${user.documentId}`);
        const existingData = await getDoc(existingDoc);
        if (existingData.exists()) throw new Error(`User ${user.documentId} already exists - use updateUserOnLeaderboard instead`);
    }
    addDoc(leaderboardCollection, user);
}

export async function getLeaderboard() {
    return getDocs(leaderboardCollection).then(snap => {
        return snap.docs.map(doc => doc.data())
    });
}

export async function resetLeaderboard() {
    return getDocs(leaderboardCollection).then(snap => {
        snap.docs.forEach(doc => {
            deleteDoc(doc.ref);
        });
        return true;
    }).catch(err => {
        console.log(err);
        return false;
    });
}