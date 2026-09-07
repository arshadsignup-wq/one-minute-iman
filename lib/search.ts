import indexRaw from "@/data/index.json";
import sitsRaw from "@/data/situations.json";

export type Row = {
  id: string; t: string; l?: string; s: string[];
  x: 0 | 1; g: string; r: string; a?: string;
};
export type Situation = {
  id: string; label: string; cat: string; blurb: string;
  feelings: string[]; count: number;
};

export const rows = indexRaw as Row[];
export const situations = (sitsRaw as unknown as { situations: Situation[] }).situations;
export const categories = (sitsRaw as unknown as {
  categories: Record<string, [string, string]>;
}).categories;

export const sitById = new Map(situations.map((s) => [s.id, s]));
export const TOTAL = rows.length;
export const CURATED = rows.filter((r) => r.x === 1).length;

const STOP = new Set([
  "i","im","am","is","are","a","an","the","my","me","to","of","and","so","feel",
  "feeling","feels","felt","very","really","too","just","today","right","now",
  "been","being","have","has","had","get","getting","got","it","its","this","that",
  "for","in","on","at","with","about","but","was","were","do","does","did","what",
  "when","how","why","need","like","some","any","from","all","by","as","if","up",
]);

export function normalise(s: string) {
  return s.toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();
}
function toks(s: string) {
  return normalise(s).split(" ").filter((t) => t && !STOP.has(t));
}

/** Query → the situations a person is describing, best first. */
export function matchSituations(query: string) {
  const q = normalise(query);
  const qt = toks(query);
  if (!q || !qt.length) return [] as { sit: Situation; score: number }[];

  const scored: { sit: Situation; score: number }[] = [];
  for (const sit of situations) {
    let score = 0;
    for (const f of sit.feelings) {
      const nf = normalise(f);
      if (!nf) continue;
      if (nf.includes(" ")) {
        if (q.includes(nf)) score += 14 + nf.length / 5;
        continue;
      }
      for (const t of qt) {
        if (t === nf) score += 10;
        else if (
          t.length >= 4 && (nf.startsWith(t) || t.startsWith(nf)) &&
          Math.abs(t.length - nf.length) <= 3
        ) score += 4;
      }
    }
    for (const t of qt) {
      if (t.length >= 4 && normalise(sit.label).includes(t)) score += 3;
    }
    if (score > 0) scored.push({ sit, score });
  }
  scored.sort((a, b) => b.score - a.score || b.sit.count - a.sit.count);
  return scored;
}

/** Entries belonging to a situation: curated first, then the wider library. */
export function entriesFor(sitId: string, limit?: number) {
  const out = rows.filter((r) => r.s.includes(sitId));
  out.sort((a, b) => b.x - a.x);
  return limit ? out.slice(0, limit) : out;
}

export function situationsInCategory(cat: string) {
  return situations.filter((s) => s.cat === cat).sort((a, b) => b.count - a.count);
}

/** Neighbours worth offering when a query matches only one thing. */
export function neighboursOf(sitId: string, exclude: string[], take = 4) {
  const sit = sitById.get(sitId);
  if (!sit) return [];
  const skip = new Set([...exclude, sitId, "misc", "dhikr"]);
  return situations
    .filter((s) => s.cat === sit.cat && !skip.has(s.id))
    .sort((a, b) => b.count - a.count)
    .slice(0, take);
}

export const EXAMPLES = [
  "I feel alone", "I can't stop worrying", "I'm in debt", "I lost my mother",
  "I keep sinning", "I can't decide", "I'm angry", "I have an exam",
  "someone wronged me", "I can't sleep", "I feel far from Allah", "I'm travelling",
];
