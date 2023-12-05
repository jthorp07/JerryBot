import { QueryDocumentSnapshot, collection, getDocs, addDoc, doc, getDoc, deleteDoc } from "@firebase/firestore";
import { firestore, FirebaseCollection, getMmrForAllUsers, FirebaseUserMMR } from "./db_mmr";
import { Snowflake } from "discord.js";
import { getLastSeason } from "../../neatqueue/neatqueue";

export type LeaderboardUser = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    documentId?: string | undefined
}

const leaderboardCollection = collection(firestore, FirebaseCollection.FinalTenmansLeaderboard).withConverter({
    toFirestore: (data: LeaderboardUser) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as LeaderboardUser
        partial.documentId = snapshot.id;
        return partial;
    }
});

const dynamicLeaderboardCollection = collection(firestore, FirebaseCollection.DynamicTenmansLederboard).withConverter({
    toFirestore: (data: LeaderboardUser) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as LeaderboardUser
        partial.documentId = snapshot.id;
        return partial;
    }
});

export async function addUserToLeaderboard(user: LeaderboardUser, dynamic?: boolean) {

    if (user.documentId != null) {
        const existingDoc = doc(firestore, `${dynamic ? FirebaseCollection.DynamicTenmansLederboard : FirebaseCollection.FinalTenmansLeaderboard}/${user.documentId}`);
        const existingData = await getDoc(existingDoc);
        if (existingData.exists()) throw new Error(`User ${user.documentId} already exists - use updateUserOnLeaderboard instead`);
    }
    addDoc(dynamic ? dynamicLeaderboardCollection : leaderboardCollection, user);
}

export async function getLeaderboard(dynamic?: boolean) {
    return getDocs(dynamic ? dynamicLeaderboardCollection : leaderboardCollection).then(snap => {
        return snap.docs.map(doc => doc.data())
    });
}

export async function resetLeaderboard(dynamic?: boolean) {
    return getDocs(dynamic ? dynamicLeaderboardCollection : leaderboardCollection).then(snap => {
        snap.docs.forEach(doc => {
            deleteDoc(doc.ref);
        });
        return true;
    }).catch(err => {
        console.log(err);
        return false;
    });
}

export async function updateDynamicLeaderboard(channelId: Snowflake, guildId: Snowflake) {

    await resetLeaderboard(true);
    const initialMmrMap = new Map<Snowflake, FirebaseUserMMR>();
    const leaderboardPromise = getLastSeason(channelId, guildId);
    const previousInitialMmrPromise = getMmrForAllUsers().then(arr => {
        arr.forEach(user => {
            initialMmrMap.set(user.discordId, user);
        });
    });
    const leaderboard = await leaderboardPromise;
    await previousInitialMmrPromise;

    const promises: Promise<any>[] = [];
    for (const user of leaderboard.alltime) {
        const prevMmr = initialMmrMap.get(user.id);
        if (!prevMmr) {
            console.log('User does not exist');
            continue;
        }

        const oldMmr = prevMmr.initialMMR;
        const finalMmr = user.data.mmr;
        const delta = finalMmr - oldMmr;
        const leaderboardScore = (delta * (1 + (oldMmr / 10000))).toFixed(2) as unknown as number;

        console.log(`Old Initial MMR: ${oldMmr}\nFinal MMR: ${finalMmr}\nDelta MMR: ${delta}\nLeaderboard Score: ${leaderboardScore}\n\n`);
        const finalLeaderboardScore: LeaderboardUser = {
            discordId: user.id,
            decoupled: prevMmr.decoupled,
            score: leaderboardScore,
        }
        promises.push(addUserToLeaderboard(finalLeaderboardScore, true));
    }
    await Promise.all(promises);

}