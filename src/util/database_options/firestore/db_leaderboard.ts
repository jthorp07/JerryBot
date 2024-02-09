import { QueryDocumentSnapshot, collection, getDocs, addDoc, doc, getDoc, deleteDoc, where, query, updateDoc } from "@firebase/firestore";
import { firestore, FirebaseCollection, getMmrForAllUsers, FirebaseUserMMR } from "./db_mmr";
import { Snowflake } from "discord.js";
import { getLastSeason } from "../../neatqueue/neatqueue";

export type LeaderboardUser = {
    discordId: Snowflake,
    decoupled: boolean,
    score: number,
    documentId?: string,
    gamesPlayed?: number
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
        const leaderboardScore = (delta * (delta < 0 ? 1 - (oldMmr / 10000) : 1 + (oldMmr / 10000))).toFixed(2) as unknown as number;

        console.log(`Old Initial MMR: ${oldMmr}\nFinal MMR: ${finalMmr}\nDelta MMR: ${delta}\nLeaderboard Score: ${leaderboardScore}\n\n`);
        const finalLeaderboardScore: LeaderboardUser = {
            discordId: user.id,
            decoupled: prevMmr.decoupled,
            score: leaderboardScore,
            gamesPlayed: (user.data.totalgames | 0) + prevMmr.gamesPlayed
        }
        promises.push(addUserToLeaderboard(finalLeaderboardScore, true));
    }
    await Promise.all(promises);

}

export async function __getLeaderboardUser(discordId: Snowflake, dynamic?: boolean) {
    const col = dynamic ? dynamicLeaderboardCollection : leaderboardCollection;
    const q = query(col, where('discordId', '==', discordId));
    const snap = (await getDocs(q)).docs;
    if (snap.length == 0) return null;
    return snap[0].data();
}

export async function __updateUserOnLeaderboard(discordId: Snowflake, gamesPlayed: number, dynamic?: boolean) {
    const col = dynamic ? dynamicLeaderboardCollection : leaderboardCollection;
    const q = query(col, where('discordId', '==', discordId));
    const snap = (await getDocs(q)).docs;
    if (snap.length == 0) return false;
    const ref = doc(firestore, `${FirebaseCollection.FinalTenmansLeaderboard}/${snap[0].id}`);
    const existingDoc = await getDoc(ref)
        .then(snap => {if (!snap.exists()) return null; return snap})
        .catch(err => {if (err) console.error(err); return null;});
    if (existingDoc == null) return false;
    updateDoc(ref, {gamesPlayed: gamesPlayed});
    return true;
}