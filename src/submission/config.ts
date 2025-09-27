import dotenv from "dotenv";
dotenv.config();

export const TIMES = {
  FIVE_MIN: 5 * 60 * 1000,
  DAY_MS: 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
  THIRTY_ONE_DAYS: 31 * 24 * 60 * 60 * 1000,
} as const;

export const TAGS = {
  PENDING: process.env.PENDING_TAG_ID || "1415503607817572442",
  DENIED: process.env.DENIED_TAG_ID || "1415503623059935264",
  READY_FOR_REVIEW: process.env.READY_FOR_REVIEW || "1419929042806636555",
  APPROVED: process.env.APPROVED_TAG_ID || "1415503593431105536"
} as const;

export const FORUM_FILTER: string[] = (process.env.FORUM_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const DUPLICATE_DELETE_DELAY_MS =
  Number.isFinite(Number(process.env.DUPLICATE_DELETE_DELAY_MS))
    ? Number(process.env.DUPLICATE_DELETE_DELAY_MS)
    : 30_000;

export const ALLOWED_MAPS = [
  "Bind","Haven","Split","Ascent","Icebox","Breeze","Fracture","Pearl","Lotus","Sunset","Abyss","Corrode",
].map((s) => s.toLowerCase());

export const ALLOWED_AGENTS = [
  "Brimstone","Viper","Omen","Killjoy","Cypher","Sova","Sage","Phoenix","Jett","Reyna","Raze","Breach","Skye","Yoru",
  "Astra","KAY/O","Chamber","Neon","Fade","Harbor","Gekko","Deadlock","Iso","Clove","Vyse","Tejo","Waylay","Kayo",
].map((s) => s.toLowerCase());

export const YT_RE = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/i;
export const TRACKER_RE = /https?:\/\/tracker\.gg\/valorant\/profile\/riot\/[^\s)]+/i;

export const BOT_TOKEN = process.env.BOT_TOKEN ?? "";

export const MIN_VOD_DURATION_MIN =
  Number.isFinite(Number(process.env.MIN_VOD_DURATION_MIN))
    ? Number(process.env.MIN_VOD_DURATION_MIN)
    : 20;
