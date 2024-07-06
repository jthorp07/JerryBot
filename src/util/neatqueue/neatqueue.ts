import { Snowflake } from "discord.js";

const token = process.env.NEATQUEUE_API_TOKEN || '';
const worthyGuildId = process.env.WORTHY_SERVER || '';
const baseApiPath = 'https://api.neatqueue.com/api'

if (token === '' || worthyGuildId === '') throw new Error('NeatQueue API token not set (env var NEATQUEUE_API_TOKEN)\nWorthy\'s server ID not set (env var WORTHY_SERVER)');

function _headers() {
    const headers = new Headers();
    headers.set('Authorization', token);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
}

function _getRequest(path: string, body?: object) {
    return new Request(path, {
        headers: _headers(),
        method: 'GET',
        body: JSON.stringify(body ? body : undefined)
    })
}

function _postRequest(path: string, body?: object) {
    return new Request(path, {
        headers: _headers(),
        method: 'POST',
        body: JSON.stringify(body ? body : undefined)
    })
}

/**
 * Sets player's MMR to the provided value
 * 
 * @param playerId Discord ID of target player
 * @param channelId Discord ID of the channel of target queue
 * @param mmr Target MMR value
 * @returns 
 */
export async function setPlayerMmr(playerId: Snowflake, channelId: Snowflake, mmr: number) {

    const req = _postRequest(`${baseApiPath}/player/rating`, {
        player_id: playerId,
        channel_id: channelId,
        mmr: mmr,
    });
    return fetch(req).then(res => res.json()).then(res => res);
}

/**
 * Pulls a NeatQueue
 * 
 * @param channelId 
 * @param guildId 
 */
export async function getLastSeason(channelId: Snowflake, guildId: Snowflake) {
    const req = _getRequest(`${baseApiPath}/channelstats/${guildId}/${channelId}`);
    return fetch(req).then(res => res.json()).then(res => res as NeatQueueApiLeaderboard);
}



export type NeatQueueApiLeaderboard = {
    alltime: NeatQueueApiLeaderboardUser[]
}

export type NeatQueueApiLeaderboardUser = {
    id: Snowflake,
    data: {
        mmr: number,
        wins: number,
        losses: number,
        streak: number,
        totalgames: number,
        games: null,
        matchups: null,
        decay: number,
        ign: null,
        peak_mmr: number,
        peak_streak: number,
        rank: null,
        global_rank: null,
        winrate: number
    },
    name: string
}