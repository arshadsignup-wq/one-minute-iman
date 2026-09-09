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

/** Clauses the writer is denying: "I am not sad, I am grateful".
 *
 *  Matching every emotion word in a sentence means the denial counts for as
 *  much as the statement, so the site answers "not sad" with material on
 *  sadness. Clauses are split on commas and on "but", because that is where
 *  people turn a sentence around, and a clause carrying a negator has its
 *  words withheld from scoring.
 */
/** Only denials. "I can't stop crying" and "I can't breathe" are not denials:
 *  they are distress stated in the negative, and treating them as denials
 *  silences the very feelings people most often type. */
const NEGATOR = /^(not|never|isnt|arent|wasnt|werent|neither|nor)$/;

function negatedWords(query: string) {
  const out = new Set<string>();
  // split before normalising: normalise strips the punctuation that marks
  // where one clause ends and the next begins
  for (const raw of query.split(/[,;.]|\bbut\b|\bhowever\b|\byet\b|\brather\b/i)) {
    const words = normalise(raw).split(" ").filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      const isNoLonger = words[i] === "no" && words[i + 1] === "longer";
      if (!NEGATOR.test(words[i]) && !isNoLonger) continue;
      // only what is actually being denied: the next couple of content words
      let taken = 0;
      for (let j = i + (isNoLonger ? 2 : 1); j < words.length && taken < 2; j++) {
        if (STOP.has(words[j])) continue;
        out.add(words[j]);
        taken++;
      }
    }
  }
  return out;
}

/** What happened, as distinct from what it is about.
 *
 *  "I failed my exam" and "I passed my exam" share every topic word, so topic
 *  matching alone sends both to the same page. The outcome is the thing that
 *  decides which answer is wanted, so it is scored separately and heavily.
 */
const INTENT: [RegExp, string[], number][] = [
  [/\b(failed|flunked|didnt pass|did not pass|messed up|screwed up|didnt get|did not get|rejected|turned down|didnt work out|fell through)\b/,
    ["failure"], 22],
  [/\b(passed|aced|got in|got the job|accepted|succeeded|graduated|good news|it worked out|alhamdulillah)\b/,
    ["gratitude"], 22],
  // A named person plus an illness word is someone else being ill, which is a
  // different need from being ill yourself and from having lost them.
  [/\b(mother|mum|mom|father|dad|wife|husband|son|daughter|brother|sister|friend|child|baby|parent|grandmother|grandfather|nan|granddad)\b[\s\S]{0,24}\b(is |has |been |got )?(sick|ill|unwell|hospital|hospitalised|cancer|diagnosed|diagnosis|surgery|operation|dying|in pain)\b/,
    ["someone-ill"], 24],
  [/\b(sick|ill|unwell|hospital|cancer|diagnosed|surgery|operation)\b[\s\S]{0,20}\b(mother|mum|mom|father|dad|wife|husband|son|daughter|brother|sister|friend|child|baby|parent)\b/,
    ["someone-ill"], 24],
  // Bereavement wording, so a lost parent does not read as a sick parent.
  [/\b(lost|died|passed away|passed on|funeral|janazah|buried|burial|no longer with us)\b/,
    ["death"], 18],
];

/** Phrasings in Bengali and in Banglish, the romanised form people type.
 *
 *  These route the visitor to the English entries that fit. Nothing on this
 *  site has been translated into Bengali, and the results are not presented as
 *  though it had been.
 */
const OTHER_LANGUAGE: [RegExp, string[]][] = [
  [/মন খারাপ|মনখারাপ|বিষণ্ণ|কষ্ট পাচ্ছি|দুঃখ/, ["sadness"]],
  [/\b(mon kharap|mon-kharap|monkharap|mon kharab|kosto|koshto|dukkho|dukho)\b/, ["sadness"]],
  [/দুশ্চিন্তা|চিন্তা হচ্ছে|ভয় লাগছে/, ["anxiety"]],
  [/\b(chinta|dushchinta|tension lagche|voy lagche|bhoy lagche)\b/, ["anxiety"]],
  [/একা লাগছে|একাকীত্ব/, ["loneliness"]],
  [/\b(eka lagche|একা|eka lagse)\b/, ["loneliness"]],
  [/ঋণ|দেনা/, ["debt"]],
  [/\b(rin|dena|taka nei)\b/, ["debt"]],
  [/অসুস্থ|অসুখ/, ["illness"]],
  [/\b(osukh|osustho)\b/, ["illness"]],
  [/ক্ষমা|তওবা/, ["forgiveness"]],
  [/\b(khoma|toba|tawba)\b/, ["forgiveness"]],
  [/শুকরিয়া|কৃতজ্ঞ|আলহামদুলিল্লাহ/, ["gratitude"]],
  [/\b(shukriya|kritoggo|alhamdulillah)\b/, ["gratitude"]],
];

/** True when the query used a language the site has no translated content in. */
export function isOtherLanguage(query: string) {
  const raw = query.toLowerCase();
  const n = normalise(query);
  return OTHER_LANGUAGE.some(([rx]) => rx.test(raw) || rx.test(n));
}

function intentBoosts(query: string) {
  const raw = query.toLowerCase();
  const n = normalise(query);
  const boosts = new Map<string, number>();
  const add = (ids: string[], w: number) => {
    for (const id of ids) boosts.set(id, Math.max(boosts.get(id) ?? 0, w));
  };
  for (const [rx, ids, w] of INTENT) if (rx.test(n)) add(ids, w);
  for (const [rx, ids] of OTHER_LANGUAGE) if (rx.test(raw) || rx.test(n)) add(ids, 20);
  return boosts;
}

export function matchSituations(query: string) {
  const q = normalise(query);
  const qt = toks(query);
  const negated = negatedWords(query);
  const boosts = intentBoosts(query);
  if ((!q || !qt.length) && !boosts.size) return [] as { sit: Situation; score: number }[];

  const scored: { sit: Situation; score: number }[] = [];
  for (const sit of situations) {
    let score = 0;
    for (const f of sit.feelings) {
      const nf = normalise(f);
      if (!nf) continue;
      if (nf.includes(" ")) {
        // An exact phrase from the lexicon wins over the negation heuristic:
        // "im not okay" is written there deliberately and means what it says.
        if (q.includes(nf)) score += 14 + nf.length / 5;
        continue;
      }
      for (const t of qt) {
        if (negated.has(t)) continue;
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
      if (negated.has(t)) continue;
      if (t.length >= 4 && normalise(sit.label).includes(t)) score += 3;
    }
    // what happened outranks what it is about
    const boost = boosts.get(sit.id);
    if (boost) score += boost;
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

/** The first five are the ones shown as chips. They led with grief, debt and
 *  sin alone, which tells a visitor this is a place for bad days only. */
export const EXAMPLES = [
  "I feel alone", "I can't stop worrying", "Something good happened", "I'm in debt",
  "I lost my mother", "I keep sinning", "I can't decide", "I'm angry",
  "I have an exam", "someone wronged me", "I can't sleep", "I feel far from Allah",
  "I'm travelling",
];
