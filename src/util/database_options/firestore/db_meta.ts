import { QueryDocumentSnapshot, collection, getDocs, addDoc } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_mmr";
import { Snowflake } from "discord.js";

type FirestoreMetaData = {
    currentSeason?: number,
    documentId?: string,
    roles? : FirestoreDiscordRole[]
}

type FirestoreDiscordRole = {
    name: ServerRole,
    discordId: Snowflake,
    documentId: string
}

let metaReady = false;
let metaData: FirestoreMetaData | undefined;
__getMetaData().then(data => {
    if (!data) {
        process.exit(1);
    }
    metaData = data;
    metaReady = true;
});

enum ServerRole {
    QueueRegistered = 'queue_reg',
    IronRank = 'iron',
    BronzeRank = 'bronze',
    SilverRank = 'silver',
    GoldRank = 'gold',
    PlatinumRank = 'platinum',
    DiamondRank = 'diamond',
    AscendantRank = 'ascendant',
    ImmortalRank = 'immortal',
    RadiantRank = 'radiant',
    UnrankedRank = 'unranked',
}

const metaCollection = collection(firestore, FirebaseCollection.MetaData).withConverter({
    toFirestore: (data: FirestoreMetaData) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as FirestoreMetaData
        partial.documentId = snapshot.id;
        return partial;
    }
});

const roleCollection = collection(firestore, FirebaseCollection.DiscordRole).withConverter({
    toFirestore: (data: FirestoreDiscordRole) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as FirestoreDiscordRole
        partial.documentId = snapshot.id;
        return partial;
    }
});

async function __getMetaData() {
    return getDocs(metaCollection).then(snap => {
        const metaDataDocs = snap.docs.map(doc => doc.data());
        if (metaDataDocs.length == 0) {
            addDoc(metaCollection, {});
        }
        return metaDataDocs[0];
    });
}

export async function getMetaData() {
    if (!metaReady || !metaData) {
        return false;
    }
    return metaData;
}

export async function updateMetaData(datum: FirestoreMetaData) {

    const metaQuery = getDocs(metaCollection).then(snapshot => {
        if (!snapshot.empty) {
            return;
        }
    });
    const roleQuery = getDocs(roleCollection);

}

export async function setDiscordRole(role: ServerRole, discordId: Snowflake) {

}