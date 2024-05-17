import { QueryDocumentSnapshot, collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { FirebaseUserMmrLegacy, mmrManager } from "../db_queue_stats";
import { firestore, FirebaseCollection } from "../db_root";
import { writeFile } from "fs";
import { join } from "path";

async function migrate() {

    console.log("Fetching Old User MMR Data");
    const oldData = await mmrManager.legacy_getAll();

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

    console.log("Sending old user data for validation, translation, and reuploading to new schema");
    const result = await mmrManager.legacy_migrate(oldData);

}

migrate();