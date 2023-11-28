import { QueryDocumentSnapshot, collection, getDocs } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_mmr";

type FirestoreMetaData = {
    currentSeason: number,
    documentId: string,
}

const metaCollection = collection(firestore, FirebaseCollection.MetaData).withConverter({
    toFirestore: (data: FirestoreMetaData) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        let partial = snapshot.data() as FirestoreMetaData
        partial.documentId = snapshot.id;
        return partial;
    }
});

export async function getMetaData() {
    return getDocs(metaCollection).then(snap => {
        const metaDataDocs = snap.docs.map(doc => doc.data());
        if (metaDataDocs.length == 0) return null;
        return metaDataDocs[0];
    });
}