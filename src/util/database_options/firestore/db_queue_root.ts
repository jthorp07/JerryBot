import { CollectionReference, DocumentReference, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { WCAQueue } from "../../queue/queue_manager";
import { Snowflake } from "discord.js";
import { FirebaseCollection, root } from "./db_root";

export type FbQueuePartial = {
    queue: WCAQueue,
    active: boolean,
    season: number,
    channelId: Snowflake,
    messageId: Snowflake,
}

class QueueRoot {

    private rootRef: CollectionReference<FbQueuePartial, FbQueuePartial>;
    queueRefs: Map<WCAQueue, DocumentReference<FbQueuePartial, FbQueuePartial>> = new Map();

    constructor() {
        this.rootRef = collection(root.doc, FirebaseCollection.QueueRoot).withConverter({
            toFirestore: (data: FbQueuePartial) => data,
            fromFirestore: (snapshot) => snapshot.data() as FbQueuePartial
        });
    }

    /**
     * Marks the target queue as active and updates its season, channelId, and messageId values as necessary.
     * 
     * @param queue The queue to activate
     * @param channelId The channel the queue is hosted in
     * @param messageId The message being used as the queue interface
     * @param newSeason If true, increments the queue's season number
     * @param resetSeason [OPTIONAL: Default=false]: If true, sets the queue's season number to 0. Overrides newSeason.
     */
    async activateQueue(queue: WCAQueue, channelId: Snowflake, messageId: Snowflake, newSeason: boolean, resetSeason: boolean = false) {

        const refs = await this.getQueue(queue);
        const queueRef = refs.ref;
        const queueDoc = refs.doc!;

        // Reactivate existing queue
        await setDoc(queueRef, {
            queue: queue,
            active: true,
            season: resetSeason ? 0 : newSeason ? queueDoc.data()!.season + 1 : queueDoc.data()!.season,
            channelId: channelId,
            messageId: messageId,
        });
    }

    /**
     * Marks the target queue as inactive. In order to reactivate,
     * a new Discord Message must first be reserved
     * 
     * @param queue The queue to deactivate
     */
    async deactivateQueue(queue: WCAQueue) {

        const refs = await this.getQueue(queue);
        const queueRef = refs.ref;
        await updateDoc(queueRef, {
            active: false,
        });
    }

    /**
     * Ensures that a reference to `queue` is valid, then returns a reference to the base document for `queue`
     * for this instance's guild.
     * 
     * @param queue Target queue
     * @param keepDoc If set, will also return the document data. Will re-query the document if the reference was initially invalid.
     * @param messageId If applicable, `FbQueuePartial.messageId` to set for `queue`
     * @param channelId If applicable, `FbQueuePartial.channelId` to set for `queue`
     * @returns A valid (`DocumentReference<FbQueuePartial, FbQueuePartial>`) reference to the queue
     */
    async getQueue(queue: WCAQueue, keepDoc: boolean = false, messageId?: Snowflake, channelId?: Snowflake) {

        if (this.queueRefs.has(queue) && !keepDoc) {
            return { ref: this.queueRefs.get(queue) as DocumentReference<FbQueuePartial, FbQueuePartial>, doc: null };
        } else {
            const queueRef = doc(this.rootRef, queue);
            const queueDoc = await getDoc(queueRef);
            if (!queueDoc.exists()) {
                setDoc(queueRef, {
                    queue: queue,
                    active: messageId ? true : false,
                    season: 0,
                    channelId: channelId || "",
                    messageId: messageId || "",
                });
                
            }
            this.queueRefs.set(queue, queueRef);
            return { ref: queueRef, doc: keepDoc ? queueDoc.exists() ? queueDoc : await getDoc(queueRef) : null }; // What in the ternary tarnation
        }
    }
}

export const queueRoot = new QueueRoot();