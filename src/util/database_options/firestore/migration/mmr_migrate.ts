import { QueryDocumentSnapshot, collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { FirebaseUserMmr } from "../db_mmr";
import { firestore, FirebaseCollection } from "../db_root";
import { writeFile } from "fs";
import { join } from "path";

async function migrate() {

    

    console.log("Fetching User MMR Collection");
    const userCollection = collection(firestore, FirebaseCollection.UserMMR).withConverter({
        toFirestore: (data: FirebaseUserMmr) => data,
        fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirebaseUserMmr 
    });

    console.log("Fetching Documents From User MMR Collection");
    const oldDocs = (await getDocs(userCollection)).docs;
    const oldData = oldDocs.map(doc => doc.data());

    console.log("Checking Data Cleanliness");
    const ids = new Set();
    let dupes = false;
    for (const user of oldData) {
        if (ids.has(user.discordId)) {
            console.log("Duplicate user found: " + user.discordId);
            dupes = true;
        }
        ids.add(user.discordId);
    }
    if (dupes) {
        console.log("Duplicates Found: Aborting");
        process.exit(0);
    }

    console.log("Deleting Documents From User MMR Collection");
    let promises = [];
    for (const user of oldDocs) {
        promises.push((async () => {
            await deleteDoc(user.ref);
            console.log(">   Deleting Document " + user.id);
        }).call(null));
    }
    await Promise.all(promises);

    console.log("Adding New Documents With New Format");
    promises = [];
    for (const user of oldData) {
        promises.push((async () => {
            const ref = doc(userCollection, user.discordId);
            await setDoc(ref, user);
            console.log(">   Added Document " + user.discordId);
        }).call(null));
    }
    await Promise.all(promises);

    console.log("Checking old versus new document count");
    const newDocs = (await getDocs(userCollection)).docs;
    const oldLen = oldDocs.length
    const newLen = newDocs.length;
    console.log(`>   Old Document Count: ${oldLen}`);
    console.log(`>   New Document Count: ${newLen}`);
    if (oldLen != newLen) {
        console.log("Old And New Document Count Does Not Match. Saving Old Document Data.");
        writeFile(join(__dirname, "oldDocData.json"), JSON.stringify(oldData), (err) => console.error(err));
    } else {

    }

}

migrate();