// src/utils/fieldExtract.ts
export type ExtractedFields = {
  region?: string;
  mainRole?: string;
  hoursPerWeek?: number;
  coachingSessions?: number;
  struggles?: string;
  goals?: string;
};

const REGION_MAP: Record<string, string> = {
  eu: "EU",
  europe: "EU",
  na: "NA",
  "north america": "NA",
  latam: "LATAM",
  sa: "LATAM",
  "south america": "LATAM",
  asia: "ASIA",
  apac: "ASIA",
  oce: "OCE",
  oceania: "OCE",
  "middle east": "ME",
  me: "ME",
  africa: "AFRICA",
  sea: "ASIA",
  southeast: "ASIA",
  "south east": "ASIA",
};

const ROLE_ALIASES: Record<string, string> = {
  duelist: "Duelist",
  entry: "Duelist",
  initiator: "Initiator",
  controller: "Controller",
  smoker: "Controller",
  sentinel: "Sentinel",
  flex: "Flex",
  igl: "IGL",
  leader: "IGL",
};

const HOURS_RE = /\b(\d{1,3})(?:\+)?(?:\s*[-–]\s*(\d{1,3}))?\s*(?:h|hr|hrs|hour|hours)\b(?:\s*(?:per|\/)?\s*(?:wk|w|week))?/i;
const PER_WEEK_RE = /\b(\d{1,3})(?:\+)?(?:\s*[-–]\s*(\d{1,3}))?\s*(?:per|\/)?\s*(?:wk|w|week)\b/i;

const SESS_RE_NUM_BEFORE = /\b(\d{1,2})\s*(?:x\s*)?(?:coaching\s*)?sessions?\b/i;
const SESS_RE_NUM_AFTER = /(?:coaching\s*)?sessions?\s*[:\-]?\s*(\d{1,2})\b/i;

const SESS_KEYWORDS: Record<string, number> = {
  none: 0,
  never: 0,
  "no coaching": 0,
  "first coaching": 1,
  "first session": 1,
  "my first": 1,
  "would be my first": 1,
};

const COACH_WORD_RE = /\bcoach(?:ing|es|ed)?\b/i;

const REGION_SENTENCES = [
  /\b(i'?m|i am|i live|based|from)\s+in?\s+([a-zA-Z ]{2,})/i,
  /\bregion\s*[:\-]\s*([a-zA-Z ]{2,})/i,
  /\b(?:server|shard)\s*[:\-]\s*([a-zA-Z ]{2,})/i,
  /\b(?:eu|europe|na|north america|latam|sa|south america|asia|apac|oce(?:ania)?|middle east|me|africa|sea|south ?east)\b/i,
];

const ROLE_SENTENCES = [
  /\b(main(?:ly)?|play(?:ing)?|role)\s*[:\-]?\s*(duelist|initiator|controller|sentinel|flex|igl|entry|smoker|leader)\b/i,
  /\b(?:my|main)\s+role\s+is\s+(duelist|initiator|controller|sentinel|flex|igl)\b/i,
];

const STRUGGLE_HINTS = /\b(struggl\w*|troubl\w*|issue\w*|improve\w*|problem\w*|weakness\w*|pain\W*point\w*|stuck|confus\w*|tilt\w*|difficult\w*|hard\s*time|not\s+(?:the\s+)?best|can['’]?t|cannot|losing|bad\s+at|miss\w+\s+shots?|hardship\w*|challeng\w*|obstacle\w*|adversit\w*|burden\w*|trial\w*|tribulation\w*|conflict\w*|battle\w*|fight\w*|ordeal\w*|setback\w*|complication\w*|dilemma\w*)\b/i;
const GOAL_HINTS = /\b(goal\w*|aim\w*|objectiv\w*|improv\w*|looking to|want to|hoping to|target\w*|ambition\w*|purpose\w*|intention\w*|aspiration\w*|mission\w*|plan\w*|desire\w*|dream\w*|vision\w*|end\w*|pursuit\w*|resolution\w*|destination\w*|direction\w*|milestone\w*|agenda\w*)\b/i;

function normalizeRegion(raw: string): string | undefined {
  const s = raw.toLowerCase().trim();
  const key = Object.keys(REGION_MAP).find(k => s.includes(k));
  return key ? REGION_MAP[key] : undefined;
}

function normalizeRole(raw: string): string | undefined {
  const s = raw.toLowerCase().trim();
  const key = Object.keys(ROLE_ALIASES).find(k => s.includes(k));
  return key ? ROLE_ALIASES[key] : undefined;
}

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, " ");
}

function parseHours(text: string): number | undefined {
  const t = stripUrls(text);
  const m1 = HOURS_RE.exec(t);
  if (m1) {
    const a = Number(m1[1]);
    const b = m1[2] ? Number(m1[2]) : undefined;
    if (!isNaN(a) && !isNaN(b as number)) return Math.round((a + (b as number)) / 2);
    if (!isNaN(a)) return a;
  }
  const m2 = PER_WEEK_RE.exec(t);
  if (m2) {
    const a = Number(m2[1]);
    const b = m2[2] ? Number(m2[2]) : undefined;
    if (!isNaN(a) && !isNaN(b as number)) return Math.round((a + (b as number)) / 2);
    if (!isNaN(a)) return a;
  }
  return undefined;
}

function parseSessions(text: string): number | undefined {
  const t = stripUrls(text);
  const mBefore = SESS_RE_NUM_BEFORE.exec(t);
  if (mBefore) {
    const n = Number(mBefore[1]);
    if (!isNaN(n)) return n;
  }
  const mAfter = SESS_RE_NUM_AFTER.exec(t);
  if (mAfter) {
    const n = Number(mAfter[1]);
    if (!isNaN(n)) return n;
  }
  const lowered = t.toLowerCase();
  for (const [k, v] of Object.entries(SESS_KEYWORDS)) {
    if (lowered.includes(k)) return v;
  }
  if (COACH_WORD_RE.test(t)) return 1;
  return undefined;
}

export function extractFields(text: string): ExtractedFields {
  const out: ExtractedFields = {};
  const t = stripUrls(text);

  for (const re of REGION_SENTENCES) {
    const m = re.exec(t);
    if (m) {
      const cand = m[2] ?? m[0];
      const norm = normalizeRegion(cand);
      if (norm) { out.region = norm; break; }
    }
  }

  for (const re of ROLE_SENTENCES) {
    const m = re.exec(t);
    if (m) {
      const roleRaw = m[2] ?? m[1];
      const norm = normalizeRole(roleRaw);
      if (norm) { out.mainRole = norm; break; }
    }
  }

  const hours = parseHours(t);
  if (hours !== undefined) out.hoursPerWeek = hours;

  const sessions = parseSessions(t);
  if (sessions !== undefined) out.coachingSessions = sessions;

  if (STRUGGLE_HINTS.test(t)) {
    const s = t.split(/(?:^|\n|\.)/).find(line => STRUGGLE_HINTS.test(line));
    if (s) out.struggles = s.trim();
  }

  if (GOAL_HINTS.test(t)) {
    const g = t.split(/(?:^|\n|\.)/).find(line => GOAL_HINTS.test(line));
    if (g) out.goals = g.trim();
  }

  return out;
}
