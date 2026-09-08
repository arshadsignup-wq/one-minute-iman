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

/** Phrasings that mean someone may be in danger.
 *
 *  The site answers a feeling with a supplication. That is the wrong and
 *  frankly careless response to this one, and the empty state ("try a plainer
 *  word") was worse. When these match, the page leads with a human answer and
 *  a route to real help, and offers the material on hope underneath rather
 *  than instead.
 */
const CRISIS = new RegExp(
  [
    "kill(ing)? (myself|me)", "end(ing)? (it|my life|things)", "take my (own )?life",
    "want(ing)? to die", "wanna die", "wish i (was|were) dead", "better off dead",
    "better off without me", "dont want to (live|be here|exist)",
    "no reason to live", "nothing to live for", "cant go on", "cant do this anymore",
    "suicid", "self harm", "harm(ing)? myself", "hurt(ing)? myself",
    "cut(ting)? myself", "overdose",
  ].join("|"),
  "i",
);

/** Everyday accidents that use the same words. Kept deliberately short: the
 *  cost of showing this panel to someone who nicked themselves shaving is a
 *  moment of confusion, and the cost of missing someone who meant it is not
 *  comparable. When in doubt this errs toward showing it. */
const NOT_CRISIS = /(shaving|shave|cooking|chopping|on (a )?(knife|glass|paper)|paper cut|by accident)/i;

export function isCrisis(query: string) {
  const q = normalise(query);
  return CRISIS.test(q) && !NOT_CRISIS.test(q);
}


/** True when two words are one edit apart (a swap, an insertion, a deletion or
 *  a substitution). Bounded to short words and bailing early, so it stays cheap
 *  enough to run over the whole lexicon on every keystroke. */
function near(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return false;
  // adjacent transposition, the most common typo
  if (a.length === b.length) {
    let diff = -1;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        if (diff >= 0) {
          return diff === i - 1 && a[diff] === b[i] && a[i] === b[diff];
        }
        diff = i;
      }
    }
    return diff >= 0;
  }
  // one insertion or deletion
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0, j = 0, skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; continue; }
    if (skipped) return false;
    skipped = true; j++;
  }
  return true;
}


/** Someone describing violence or coercion at home.
 *
 *  Same reasoning as the crisis path: a supplication is not the first thing
 *  this person needs, and telling them to be patient would be actively
 *  harmful. The page leads with a route out and offers the material on being
 *  wronged underneath.
 */
const HARM = new RegExp(
  [
    "domestic (abuse|violence)",
    "(he|she|they|husband|wife|dad|father|mum|mother|partner|brother) (hits|hit|beats|beat|hurts|hurt|chokes|strangl)",
    "(hitting|beating|hurting) me", "physically abus", "sexually abus", "emotionally abus",
    "abusive (husband|wife|marriage|relationship|home|parent|partner|father|mother)",
    "being abused", "abused me", "im scared of (him|her|them|my husband|my wife|my dad|my father)",
    "not safe at home", "afraid to go home", "threatens? to kill me", "forced marriage",
  ].join("|"),
  "i",
);

export function isHarm(query: string) {
  return HARM.test(normalise(query));
}

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
        // "anxeity", "depresion", "greif": a transposed or dropped letter is not
        // a prefix, so prefix matching alone never catches a typo.
        else if (t.length >= 5 && near(t, nf)) score += 7;
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
