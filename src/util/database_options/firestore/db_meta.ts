import { QueryDocumentSnapshot, collection, getDocs, getDoc, doc, query, where, setDoc, DocumentReference, CollectionReference } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_root";
import { Snowflake } from "discord.js";
import { EventEmitter } from "events";

type FirestoreMetaDataBase = {
    currentSeason: number,
    guildId: string,
    mapPool: ValorantMap[],
}

type FirestoreMetaData = {
    currentSeason: number,
    guildId: string,
    roles: Map<ServerRole, FirestoreDiscordRole>,
    channels: Map<ServerChannel, FirestoreDiscordChannel>,
    mapPool: Set<ValorantMap>,
}

type ValorantMap = "Bind" | "Ascent" | "Split" | "Pearl" | "Fracture" | "Breeze" | "Lotus" | "Icebox"

type ServerRole =
    'queue_reg' | 'iron' | 'bronze' | 'silver' | 'gold' |
    'platinum' | 'diamond' | 'ascendant' | 'immortal' | 'radiant' | 'unranked';

type FirestoreDiscordRole = {
    name: ServerRole,
    discordId: Snowflake,
}

type ServerChannel =
    "queue" | "queue_stats" | "queue_leaderboard";

type FirestoreDiscordChannel = {
    name: ServerChannel,
    discordId: Snowflake,
}

class MetaDataManager {

    private cached: FirestoreMetaData | undefined;
    private guildId: Snowflake;
    private rootRef: DocumentReference<FirestoreMetaDataBase, FirestoreMetaDataBase>;
    private roleCollection: CollectionReference<FirestoreDiscordRole, FirestoreDiscordRole>;
    private channelCollection: CollectionReference<FirestoreDiscordChannel, FirestoreDiscordChannel>;

    constructor(guildId: Snowflake) {
        this.guildId = guildId;
        const metaCollection = collection(firestore, FirebaseCollection.MetaData).withConverter({
            toFirestore: (data: FirestoreMetaDataBase) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreMetaDataBase
        });
        this.rootRef = doc(metaCollection, guildId);
        this.roleCollection = collection(this.rootRef, FirebaseCollection.DiscordRole).withConverter({
            toFirestore: (data: FirestoreDiscordRole) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreDiscordRole
        });
        this.channelCollection = collection(this.rootRef, FirebaseCollection.DiscordChannel).withConverter({
            toFirestore: (data: FirestoreDiscordChannel) => data,
            fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreDiscordChannel
        });
        this.getAllMetaData().then(() => {
            // When merged with startup, emit to startup
        });
    }

    private async getAllMetaData() {
        const roleSnap = await getDocs(this.roleCollection);
        const roleMap = new Map<ServerRole, FirestoreDiscordRole>();
        roleSnap.docs.forEach(doc => {
            const role = doc.data();
            roleMap.set(role.name, role);
        });

        const channelSnap = await getDocs(this.channelCollection);
        const channelMap = new Map<ServerChannel, FirestoreDiscordChannel>();
        channelSnap.docs.forEach(doc => {
            const channel = doc.data();
            channelMap.set(channel.name, channel);
        });

        const metaSnap = await getDoc(this.rootRef);
        if (metaSnap.exists()) {

        }

    }

    async getRole(role: ServerRole) {
        if (!this.cached) throw new Error("MetaData not fetched");
        return this.cached.roles.get(role);
    }

    async setRole(role: ServerRole, roleId: Snowflake) {
        const docRef = doc(this.roleCollection, role);
        const data = { guildId: this.guildId, name: role, discordId: roleId };
        return await setDoc(docRef, data).then(() => {
            this.cached?.roles.set(role, data);
            return true;
        }).catch(err => {
            console.error(err);
            return false;
        });
    }
}

export const metaDataManager = new MetaDataManager("710741097126821970");