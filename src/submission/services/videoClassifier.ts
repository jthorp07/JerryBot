// src/services/videoClassifier.ts
import { MIN_VOD_DURATION_MIN } from "../config";
import { getQuickMeta } from "../utils/youtube";

export type ClassifiedVideos = {
  mainVodUrl?: string;
  dmVodUrl?: string;
  durations: Record<string, number>;
  dmMentionedInsideMain: boolean;
};

const VOD_MIN_SECONDS = MIN_VOD_DURATION_MIN * 60;

const YT_LINK_RE =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w\-]+(?:[^\s)]*)?|youtu\.be\/[\w\-]+(?:[^\s)]*)?)/gi;

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function detectDmMentionInside(text: string): boolean {
  const s = text.toLowerCase();
  return (
    /(?:dm|death ?match).*(?:in|inside|within|included)/i.test(s) ||
    /(?:include(?:d)?|inside|within).*(?:dm|death ?match)/i.test(s) ||
    (/(?:dm|death ?match)/i.test(s) && /\bvod|video\b/i.test(s) && /\b(in|inside|include|within)\b/i.test(s))
  );
}

export async function classifyVodLinks(text: string): Promise<ClassifiedVideos> {
  const urls = unique((text.match(YT_LINK_RE) || []).map(u => u.trim()));
  const durations: Record<string, number> = {};

  await Promise.all(
    urls.map(async (url) => {
      try {
        const meta = await getQuickMeta(url);
        if (meta?.ok && typeof meta.durationSec === "number" && meta.durationSec > 0) {
          durations[url] = meta.durationSec;
        }
      } catch {
      }
    })
  );

  let mainVodUrl: string | undefined;
  const sorted = Object.entries(durations).sort((a, b) => b[1] - a[1]);
  for (const [u, sec] of sorted) {
    if (sec >= VOD_MIN_SECONDS) {
      mainVodUrl = u;
      break;
    }
  }

  let dmVodUrl: string | undefined;
  const dmCandidates = sorted
    .filter(([u]) => u !== mainVodUrl)
    .filter(([, sec]) => sec < VOD_MIN_SECONDS)
    .sort((a, b) => a[1] - b[1]);
  if (dmCandidates.length) dmVodUrl = dmCandidates[0][0];

  const dmMentionedInsideMain = detectDmMentionInside(text);

  return { mainVodUrl, dmVodUrl, durations, dmMentionedInsideMain };
}
