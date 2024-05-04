/**
 * 
 * Metadata Layout:
 *  
 *      ~/meta/                             [Meta]
 *      ~/meta/{guildId}                    [Meta.guildId]
 *                                          [Meta.mapPool]
 * 
 *      ~/meta/{guildId}/discord_channel/   [Meta.channels]
 *      ~/meta/{guildId}discord_role/       [Meta.roles]
 * 
 */
import { QueryDocumentSnapshot, collection, getDocs, getDoc, doc, query, where, setDoc, DocumentReference, CollectionReference } from "@firebase/firestore";
import { firestore, FirebaseCollection } from "./db_root";
import { Snowflake } from "discord.js";


type FirestoreMetaDataBase = {
    guildId: string,
    mapPool: ValorantMap[],
}

type FirestoreMetaData = {
    guildId: string,
    roles: Map<ServerRole, FirestoreDiscordRole>,
    channels: Map<ServerChannel, FirestoreDiscordChannel>,
    mapPool: Set<ValorantMap>,
}

export type ValorantMap = "Bind" | "Ascent" | "Split" | "Pearl" | "Fracture" | "Breeze" | "Lotus" | "Icebox"

type ServerRole =
    'queue_reg' | 'iron' | 'bronze' | 'silver' | 'gold' |
    'platinum' | 'diamond' | 'ascendant' | 'immortal' | 'radiant' | 'unranked';

type FirestoreDiscordRole = {
    name: ServerRole,
    discordId: Snowflake,
}

export type ServerChannel =
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

    private fullToBase(full: FirestoreMetaData) {
        const mapPool: ValorantMap[] = [];
        full.mapPool.forEach(map => {
            mapPool.push(map);
        });
        const base: FirestoreMetaDataBase = {
            guildId: full.guildId,
            mapPool: mapPool
        }
        return base;
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
        if (!metaSnap.exists()) {
            this.cached = {
                guildId: this.guildId,
                roles: roleMap,
                channels: channelMap,
                mapPool: new Set(),
            }
        } else {
            const data = metaSnap.data();
            const mapPool = new Set<ValorantMap>();
            data.mapPool.map(mapVal => mapPool.add(mapVal));
            this.cached = {
                guildId: data.guildId,
                roles: roleMap,
                channels: channelMap,
                mapPool: mapPool,
            }
        }
    }

    getRole(role: ServerRole) {
        if (!this.cached) throw new Error("MetaData not fetched");
        return this.cached.roles.get(role);
    }

    async setRole(role: ServerRole, roleId: Snowflake) {
        if (!this.cached) throw new Error("MetaData not fetched");
        const docRef = doc(this.roleCollection, role);
        const data = { name: role, discordId: roleId };
        return await setDoc(docRef, data).then(() => {
            this.cached!.roles.set(role, data);
            return true;
        }).catch(err => {
            console.error(err);
            return false;
        });
    }

    getChannel(channel: ServerChannel) {
        if (!this.cached) throw new Error("MetaData not fetched");
        return this.cached.channels.get(channel);
    }

    async setChannel(channel: ServerChannel, channelId: Snowflake) {
        if (!this.cached) throw new Error("MetaData not fetched");
        const docRef = doc(this.channelCollection, channel);
        const data = { name: channel, discordId: channelId };
        return await setDoc(docRef, data).then(() => {
            this.cached!.channels.set(channel, data);
            return true;
        }).catch(err => {
            console.error(err);
            return false;
        });
    }


    getMapPool() {
        if (!this.cached) throw new Error("MetaData not fetched");
        const mapPool: ValorantMap[] = [];
        this.cached.mapPool.forEach(map => { mapPool.push(map); });
        return mapPool;
    }

    async addMap(map: ValorantMap) {
        if (!this.cached) throw new Error("MetaData not fetched");
        if (this.cached.mapPool.has(map)) return;
        this.cached.mapPool.add(map);
        await setDoc(this.rootRef, this.fullToBase(this.cached))
            .catch(err => {
                this.cached!.mapPool.delete(map);
                throw new Error("Failed to save map upstream");
            });
    }

    async removeMap(map: ValorantMap) {
        if (!this.cached) throw new Error("MetaData not fetched");
        const result = this.cached.mapPool.delete(map);
        if (!result) return;
        await setDoc(this.rootRef, this.fullToBase(this.cached))
            .catch(err => {
                this.cached!.mapPool.add(map);
                throw new Error("Failed to save map upstream");
            });
    }
}

export const metaDataManager = new MetaDataManager("710741097126821970");