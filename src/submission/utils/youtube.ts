import ytdl from "@distube/ytdl-core";
import { MIN_VOD_DURATION_MIN } from "../config";

const YT_API_KEY = process.env.YOUTUBE_API_KEY || "";
const DEBUG_YT = process.env.DEBUG_YOUTUBE === "1";

export type VideoQuickMeta = {
  ok: boolean;
  isPrivate?: boolean;
  isUnlisted?: boolean;
  durationSec?: number;
};

// --------- ID extraction (ytdl used only for validate/id) ----------
export function extractYouTubeIds(text: string): string[] {
  const urls = Array.from(text.matchAll(/https?:\/\/\S+/gi)).map((m) => m[0]);
  const ids: string[] = [];
  for (const u of urls) {
    try {
      if (ytdl.validateURL(u)) ids.push(ytdl.getURLVideoID(u));
    } catch {
      /* ignore */
    }
  }
  return Array.from(new Set(ids));
}

// --------- ISO8601 PTxxHxxMxxS -> seconds ----------
function isoToSeconds(iso?: string): number | undefined {
  if (!iso) return undefined;
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!m) return undefined;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  return h * 3600 + min * 60 + s;
}

// --------- Data API fetch (batched up to 50 IDs) ----------
async function fetchVideoParts(ids: string[]): Promise<
  Record<string, { durationSec?: number; privacy?: string }>
> {
  const out: Record<string, { durationSec?: number; privacy?: string }> = {};
  if (!YT_API_KEY || ids.length === 0) return out;

  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "contentDetails,status");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", YT_API_KEY);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
      const data: any = await res.json();
      for (const item of data?.items ?? []) {
        const id = item.id as string;
        out[id] = {
          durationSec: isoToSeconds(item?.contentDetails?.duration),
          privacy: item?.status?.privacyStatus, // public | unlisted | private
        };
      }
    } catch (e) {
      if (DEBUG_YT) console.log("[yt-api] error:", (e as Error)?.message || e);
    }
  }
  return out;
}

// --------- Public helpers used by handlers ----------
export async function getQuickMeta(textWithLinks: string): Promise<VideoQuickMeta | null> {
  const ids = extractYouTubeIds(textWithLinks);
  if (ids.length === 0) return null;

  const map = await fetchVideoParts([ids[0]]);
  const first = map[ids[0]];
  if (!first) return { ok: false };

  return {
    ok: true,
    isPrivate: first.privacy === "private",
    isUnlisted: first.privacy === "unlisted",
    durationSec: first.durationSec,
  };
}

/**
 * We can’t reliably get 1080p via the Data API. To avoid ytdl player-script parsing,
 * treat “unknown” as OK and return true. If you ever want to hard-require 1080p,
 * you’d have to reintroduce getInfo/getBasicInfo (not recommended).
 */
export async function has1080pOrUnknown(_textOrUrl: string): Promise<boolean | null> {
  return true;
}

// Map arbitrary URLs to durations (seconds) using the Data API
export async function fetchDurationsForUrls(urls: string[]): Promise<Record<string, number>> {
  const idToUrls: Record<string, string[]> = {};
  for (const u of urls) {
    try {
      if (ytdl.validateURL(u)) {
        const id = ytdl.getURLVideoID(u);
        (idToUrls[id] ??= []).push(u);
      }
    } catch {
      /* ignore bad url */
    }
  }
  const ids = Object.keys(idToUrls);
  const parts = await fetchVideoParts(ids);
  const out: Record<string, number> = {};
  for (const id of ids) {
    const dur = parts[id]?.durationSec ?? 0;
    for (const u of idToUrls[id]) out[u] = dur;
  }
  return out;
}

export function isDurationLongEnough(seconds?: number): boolean {
  if (seconds === undefined) return false;
  return seconds >= MIN_VOD_DURATION_MIN * 60;
}