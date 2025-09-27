// src/validators/title.ts
import { ALLOWED_AGENTS, ALLOWED_MAPS } from "../config";
import { cap } from "../utils/format";

export function validateTitle(rawTitle: string): string | null {
  const parts = rawTitle.split("|").map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 4) return "Make sure the title has **four parts** separated by `|`.";
  const [discordName, map, agent, rank] = parts;
  const problems: string[] = [];
  if (!ALLOWED_MAPS.includes(map.toLowerCase())) {
    problems.push(`• **Map** must be one of: ${ALLOWED_MAPS.map(cap).join(", ")}`);
  }
  if (!ALLOWED_AGENTS.includes(agent.toLowerCase())) {
    problems.push(`• **Agent** must be one of: ${ALLOWED_AGENTS.map(cap).join(", ")}`);
  }
  if (!isRankValid(rank)) {
    problems.push(
      "• **Rank** must be one of: iron, bronze, silver, gold, platinum, diamond, ascendant, immortal, radiant " +
      "(abbrevs allowed: plat, asc, immo, rad), or shorthand tiers like `i1..i3`, `b1..b3`, `s1..s3`, `g1..g3`, `p1..p3`, `d1..d3`, `a1..a3`, `r1..r3`. " +
      "Full ranks with numbers like `Diamond 3`, `gold2` are fine."
    );
  }
  if (problems.length) {
    return [...problems, `\nYou wrote: \`${discordName} | ${map} | ${agent} | ${rank}\``].join("\n");
  }
  return null;
}

export function isRankValid(rankRaw: string): boolean {
  const r = rankRaw.trim().toLowerCase();
  const fullRankPattern =
    /^(iron|bronze|silver|gold|platinum|plat|diamond|ascendant|ascendent|asc|immortal|immo|radiant|rad)\s*([1-3])?$/i;
  if (fullRankPattern.test(r)) return true;
  const shorthandPattern = /^[ibsgpdar][1-3]$/i;
  return shorthandPattern.test(r);
}
