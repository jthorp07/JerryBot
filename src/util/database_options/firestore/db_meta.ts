import { QueryDocumentSnapshot, collection, getDocs, addDoc } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_root";
import { Snowflake } from "discord.js";

type FirestoreMetaData = {
    currentSeason?: number,
    documentId?: string,
    roles? : FirestoreDiscordRole[]
}

type ServerRole = 
    'queue_reg' | 'iron' | 'bronze' | 'silver' | 'gold' | 
    'platinum' | 'diamond' | 'ascendant' | 'immortal' | 'radiant' | 'unranked';

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



const metaCollection = collection(firestore, FirebaseCollection.MetaData).withConverter({
    toFirestore: (data: FirestoreMetaData) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreMetaData
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

class MetaDataManager {

    private _collection = collection(firestore, FirebaseCollection.MetaData).withConverter({
        toFirestore: (data: FirestoreMetaData) => data,
        fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreMetaData
    });
    private cached: FirestoreMetaData | undefined;

    
}

export const metaDataManager = new MetaDataManager();