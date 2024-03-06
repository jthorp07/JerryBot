import { QueryDocumentSnapshot, collection, getDocs, getDoc, doc, query, where, setDoc } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_root";
import { Snowflake } from "discord.js";
import { EventEmitter } from "events";

type FirestoreMetaData = {
    currentSeason: number,
    guildId: string,
    roles: Map<ServerRole, FirestoreDiscordRole>,
    channels: Map<ServerChannel, FirestoreDiscordChannel>
}

type ServerRole = 
    'queue_reg' | 'iron' | 'bronze' | 'silver' | 'gold' | 
    'platinum' | 'diamond' | 'ascendant' | 'immortal' | 'radiant' | 'unranked';

type FirestoreDiscordRole = {
    name: ServerRole,
    discordId: Snowflake,
    guildId: Snowflake,
}

type ServerChannel = 
    "queue" | "queue_stats" | "queue_leaderboard";

type FirestoreDiscordChannel = {
    name: ServerChannel,
    discordId: Snowflake,
    guildId: Snowflake
}

class MetaDataManager {

    private metaCollection = collection(firestore, FirebaseCollection.MetaData).withConverter({
        toFirestore: (data: FirestoreMetaData) => data,
        fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreMetaData
    });
    private roleCollection = collection(firestore, FirebaseCollection.DiscordRole).withConverter({
        toFirestore: (data: FirestoreDiscordRole) => data,
        fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreDiscordRole
    });
    private channelCollection = collection(firestore, FirebaseCollection.DiscordChannel).withConverter({
        toFirestore: (data: FirestoreDiscordChannel) => data,
        fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as FirestoreDiscordChannel
    });

    private cached: FirestoreMetaData | undefined;
    private guildId: Snowflake;

    constructor(guildId: Snowflake) {
        this.guildId = guildId;
        this.getAllMetaData().then(() => {
            new EventEmitter().emit("meta_ready");
        });
    }

    private async getAllMetaData() {
        const roleQuery = query(this.roleCollection, where("guildId", "==", this.guildId));
        const roleSnap = await getDocs(roleQuery);
        const roleMap = new Map<ServerRole, FirestoreDiscordRole>();
        roleSnap.docs.forEach(doc => {
            const role = doc.data();
            roleMap.set(role.name, role);
        });

        const channelQuery = query(this.channelCollection, where("guildId", "==", this.guildId));
        const channelSnap = await getDocs(channelQuery);
        const channelMap = new Map<ServerChannel, FirestoreDiscordChannel>();
        channelSnap.docs.forEach(doc => {
            const channel = doc.data();
            channelMap.set(channel.name, channel);
        });

        const metaDocRef = doc(this.metaCollection, this.guildId);
        const metaSnap = await getDoc(metaDocRef);
        if (metaSnap.exists()) {
            
        }

    }

    async getRole(role: ServerRole) {
        if (!this.cached) throw new Error("MetaData not fetched");
        return this.cached.roles.get(role);
    }

    async setRole(role: ServerRole, roleId: Snowflake) {
        const docRef = doc(this.roleCollection, `${this.guildId}:${role}`);
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