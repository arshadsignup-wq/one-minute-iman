// Names only. quran-index.json also carries every āyah of every translation,
// 993KB of it, and importing the whole file to look up "surah mulk" put that
// megabyte in the bundle of every page that shows a search box.
import quranNamesRaw from "@/data/quran-names.json";
import sitsRaw from "@/data/situations.json";

/* The entries themselves live in lib/corpus.ts. Nothing here reads them, which
   is what keeps the 0.9MB index out of the bundle of every page that shows a
   search box. */

export type Situation = {
  id: string; label: string; cat: string; blurb: string;
  feelings: string[]; count: number;
};

export const situations = (sitsRaw as unknown as { situations: Situation[] }).situations;
export const categories = (sitsRaw as unknown as {
  categories: Record<string, [string, string]>;
}).categories;

export const sitById = new Map(situations.map((s) => [s.id, s]));

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



/** Sūrahs, findable by the names people actually use for them.
 *
 *  "surah mulk" reached nothing. So did "yaseen", "ayatul kursi" and every
 *  other way of naming a chapter — the site carries all 114 and none of them
 *  could be asked for by name, only browsed to. The transliterations differ by
 *  a letter in every direction (Waqi'ah / Waqia / Waqiah, Ya-Sin / Yaseen), so
 *  matching is done on a stripped form with the article removed.
 */
const SURAH_NAMES = (quranNamesRaw as unknown as { names: Record<string, string> }).names;

/** "Al-Waqi'ah" → "waqiah"; also yields "alwaqiah" so both are askable. */
function surahKeys(name: string): string[] {
  const bare = name.toLowerCase().replace(/[^a-z\s]/g, "");
  const noArticle = bare.replace(/^(al|an|as|ash|ad|at|az)\s*/, "");
  const squashed = bare.replace(/\s+/g, "");
  return [...new Set([bare, noArticle, squashed, noArticle.replace(/\s+/g, "")])]
    .filter((k) => k.length >= 3);
}

/** Spellings and by-names that are not the transliteration on the page. */
const SURAH_ALIASES: Record<string, number> = {
  yaseen: 36, yasin: 36, yseen: 36,
  baqara: 2, bakarah: 2, baqrah: 2,
  kahaf: 18, kehf: 18,
  waqia: 56, waqiya: 56, waqiah: 56,
  ikhlaas: 112, ikhlas: 112, tawhid: 112,
  fatiha: 1, fateha: 1, faatiha: 1, "opening": 1,
  nas: 114, naas: 114,
  falak: 113,
  mulk: 67, tabarak: 67,
  rahmaan: 55,
  kursi: 2, ayatulkursi: 2, ayatalkursi: 2, "throne verse": 2,
};

const SURAH_INDEX: Map<string, number> = (() => {
  const m = new Map<string, number>();
  for (const [num, name] of Object.entries(SURAH_NAMES)) {
    for (const k of surahKeys(name)) if (!m.has(k)) m.set(k, Number(num));
  }
  for (const [k, n] of Object.entries(SURAH_ALIASES)) m.set(normalise(k).replace(/\s+/g, ""), n);
  return m;
})();

/** A query naming a chapter, rather than describing a feeling. */
export function matchSurah(query: string): { n: number; name: string } | null {
  const q = normalise(query);
  if (!q) return null;
  // "surah 67", "chapter 18"
  const byNumber = /\b(surah?|surat|chapter)\s*(\d{1,3})\b/.exec(q);
  if (byNumber) {
    const n = Number(byNumber[2]);
    if (n >= 1 && n <= 114) return { n, name: SURAH_NAMES[String(n)] };
  }
  // strip the word "surah" and any article, then look the rest up whole
  const bare = q
    .replace(/\b(surah?|surat|sura|chapter|read|recite|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const cand of [bare, bare.replace(/\s+/g, ""), bare.replace(/^(al|an|as)\s*/, "")]) {
    const hit = SURAH_INDEX.get(cand);
    if (hit) return { n: hit, name: SURAH_NAMES[String(hit)] };
  }
  return null;
}

/** Words that mean the same thing to the person typing them.
 *
 *  The lexicon lists what someone might type, but it cannot list every way of
 *  saying one thing under every situation that answers it. "sex" was written
 *  into the intimacy vocabulary and "intimate" was not, so one of them found
 *  the duʿā and the other found nothing — for the same question.
 *
 *  Each row is a set of words that should reach whatever any of them reaches.
 *  A synonym scores below a word the lexicon actually lists, so a deliberate
 *  phrasing still outranks an inferred one.
 *
 *  The Arabic and Urdu terms are here because people type them: someone asking
 *  about rizq is asking about provision, and the site should not need them to
 *  translate themselves first.
 */
const SYNONYMS: string[][] = [
  ["sex", "intimacy", "intimate", "lovemaking", "conjugal", "consummation"],
  ["lust", "desire", "temptation", "urge", "craving", "shahwa"],
  ["chastity", "modesty", "purity", "haya", "iffah"],
  ["zina", "adultery", "fornication"],
  ["rizq", "provision", "sustenance", "livelihood", "income", "earnings"],
  ["money", "wealth", "finances", "cash", "funds"],
  ["debt", "loan", "owing", "qarz", "qard"],
  ["sabr", "patience", "endurance", "steadfastness", "perseverance"],
  ["shukr", "gratitude", "thankfulness", "thanks"],
  ["tawbah", "repentance", "repent", "istighfar", "forgiveness"],
  ["dua", "duaa", "supplication", "invocation", "prayer"],
  ["salah", "salat", "namaz", "prayer"],
  ["iman", "eman", "faith", "belief"],
  ["sadness", "grief", "sorrow", "gham", "dukh"],
  ["anxiety", "worry", "stress", "tension", "pareshani"],
  ["fear", "khawf", "dread", "terror"],
  ["anger", "ghadab", "rage", "fury"],
  ["illness", "sickness", "disease", "ailment", "bimari"],
  ["death", "dying", "passing", "maut", "bereavement"],
  // "burial" and "funeral" are about a person who has died; "grave" and
  // "qabr" are about what follows, which is a different question.
  ["grave", "qabr", "barzakh"],
  ["burial", "funeral", "janazah", "buried"],
  ["protection", "refuge", "shelter", "safety", "hifz"],
  ["evil eye", "nazar", "ayn", "hasad"],
  ["magic", "sihr", "witchcraft", "black magic"],
  ["marriage", "nikah", "wedding", "shaadi", "matrimony"],
  ["children", "kids", "offspring", "aulad", "progeny"],
  ["parents", "mother", "father", "walidayn", "ammi", "abbu"],
  ["knowledge", "study", "exam", "ilm", "learning"],
  ["work", "job", "career", "employment", "business"],
  ["travel", "journey", "safar", "trip"],
  ["guidance", "hidayah", "direction", "istikhara"],
  ["oppression", "injustice", "zulm", "wronged"],
  ["loneliness", "lonely", "alone", "isolated", "abandoned"],
  ["hopelessness", "despair", "hopeless", "giving up"],
  ["satan", "shaytan", "devil", "iblis", "waswas", "whispers"],
];

/** token → every word that should also be tried for it. */
const SYNONYM_INDEX: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const row of SYNONYMS) {
    const words = row.map((w) => normalise(w)).filter(Boolean);
    for (const w of words) {
      // multi-word entries ("evil eye") join the index under each of their
      // words too, so "nazar" reaches "evil" and "eye" alike
      for (const key of [w, ...w.split(" ")]) {
        if (!key) continue;
        const set = m.get(key) ?? new Set<string>();
        for (const other of words) if (other !== key) set.add(other);
        m.set(key, set);
      }
    }
  }
  return m;
})();

/** Every word that should also be tried in place of this one. */
export function synonymsOf(token: string): string[] {
  return [...(SYNONYM_INDEX.get(token) ?? [])];
}

/** True when two words are one edit apart (a swap, an insertion, a deletion or
 *  a substitution). Bounded to short words and bailing early, so it stays cheap
 *  enough to run over the whole lexicon on every keystroke.
 *
 *  Both branches used to answer on the first difference they found and never
 *  look at the rest of the word. A transposed opening pair was therefore enough
 *  on its own: "infertile" was read as a typo of "nightmare", "salawat" of
 *  "ashamed", "ramadan" of "aroused" and "breaking" of "bereaved". Someone who
 *  could not have children was offered a supplication against bad dreams. The
 *  remainder has to agree as well, so both branches now run to the end.
 */
function near(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return false;

  if (a.length === b.length) {
    // one substitution, or one adjacent transposition, and nothing else
    const diffs: number[] = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        diffs.push(i);
        if (diffs.length > 2) return false;
      }
    }
    if (diffs.length === 1) return true;
    if (diffs.length !== 2) return false;
    const [x, y] = diffs;
    return y === x + 1 && a[x] === b[y] && a[y] === b[x];
  }

  // one insertion or deletion: the shorter word must be consumed entirely
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0, j = 0, skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; continue; }
    if (skipped) return false;
    skipped = true; j++;
  }
  return i === short.length;
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
  // "passed" must not match "passed away" or "passed on": someone reporting a
  // death was being scored as someone reporting good news.
  [/\b(passed(?!\s+(away|on)\b)|aced|got in|got the job|accepted|succeeded|graduated|good news|it worked out|alhamdulillah)\b/,
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

/** Phrasings in a language the entries have not been translated into.
 *
 *  These route the visitor to the English entries that fit, and the page says
 *  plainly that the entries are not in the language they asked in. Each row
 *  carries that language's name: the notice used to be hard-coded to Bengali
 *  and so told a Turk, an Arab and a Pakistani alike that nothing here has been
 *  translated into Bengali.
 *
 *  Words that belong to no one language in particular are deliberately absent.
 *  "alhamdulillah" and "tawba" are Arabic, said by everybody, and typing either
 *  used to produce the Bengali notice above an answer in fluent English. They
 *  are in the ordinary lexicon instead, where they reach the same entries
 *  without a claim about the reader attached.
 */
const OTHER_LANGUAGE: [RegExp, string[], string][] = [
  [/মন খারাপ|মনখারাপ|বিষণ্ণ|কষ্ট পাচ্ছি|দুঃখ/, ["sadness"], "Bengali"],
  [/\b(mon kharap|mon-kharap|monkharap|mon kharab|kosto|koshto|dukkho|dukho)\b/, ["sadness"], "Bengali"],
  [/দুশ্চিন্তা|চিন্তা হচ্ছে|ভয় লাগছে/, ["anxiety"], "Bengali"],
  [/\b(dushchinta|tension lagche|voy lagche|bhoy lagche)\b/, ["anxiety"], "Bengali"],
  [/একা লাগছে|একাকীত্ব/, ["loneliness"], "Bengali"],
  [/\b(eka lagche|একা|eka lagse)\b/, ["loneliness"], "Bengali"],
  [/ঋণ|দেনা/, ["debt"], "Bengali"],
  [/\b(rin|dena|taka nei)\b/, ["debt"], "Bengali"],
  [/অসুস্থ|অসুখ/, ["illness"], "Bengali"],
  [/\b(osukh|osustho)\b/, ["illness"], "Bengali"],
  [/ক্ষমা|তওবা/, ["forgiveness"], "Bengali"],
  [/\b(khoma)\b/, ["forgiveness"], "Bengali"],
  [/শুকরিয়া|কৃতজ্ঞ|আলহামদুলিল্লাহ/, ["gratitude"], "Bengali"],
  [/\b(kritoggo)\b/, ["gratitude"], "Bengali"],
];

/** The language a query was asked in, when the site holds nothing in it. */
export function otherLanguage(query: string): string | null {
  const raw = query.toLowerCase();
  const n = normalise(query);
  for (const [rx, , lang] of OTHER_LANGUAGE) {
    if (rx.test(raw) || rx.test(n)) return lang;
  }
  return null;
}

/** The thing a sentence is actually about, when it names both a symptom and a cause.
 *
 *  "I can't sleep for worrying about money" is not a question about sleep. The
 *  symptom is stated first and loudest, and the lexicon scores it highest,
 *  which is how the site came to answer money worry with a bedtime
 *  supplication. Where a sentence names what is behind the symptom, the words
 *  after that marker are what it is about.
 */
const CAUSE = /\b(because of|because|due to|on account of|worrying about|worried about|stressed about|thinking about|over|about)\b|\bfor\s+\w+ing\b/;

function subject(query: string) {
  const q = normalise(query);
  const m = CAUSE.exec(q);
  if (!m) return null;
  // "at night", "all day", "lately" say when, not what, and they carry the
  // vocabulary of situations the sentence is not about
  const after = q
    .slice(m.index + m[0].length)
    .replace(/\b(at night|at bedtime|in the morning|in the evening|all day|all night|every night|every day|lately|these days|right now|today|tonight|recently|constantly)\b/g, " ")
    .replace(/^(about|of|with|my|the)\s+/, "")
    .trim();
  const before = q.slice(0, m.index).trim();
  if (!after) return null;
  return { after, before };
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
  const subj = subject(query);
  // Not `!qt.length`: "why me", "what now", "is this it" are made entirely of
  // stop words, so tokenising leaves nothing and the function used to return
  // before the phrase path ran — even with the phrase written in the lexicon.
  // Someone typing three small words is still asking something.
  if (!q && !boosts.size) return [] as { sit: Situation; score: number; sure: boolean }[];

  const scored: { sit: Situation; score: number; sure?: boolean; onSubject?: boolean }[] = [];
  for (const sit of situations) {
    let score = 0;
    // Whether anything the visitor actually wrote was recognised, as opposed to
    // guessed at. A word the lexicon lists, a phrase, a curated synonym or the
    // situation's own label is recognition. A prefix or a repaired typo is an
    // inference, and an answer resting on nothing else should not be presented
    // as though the site understood the question.
    let sure = false;
    for (const f of sit.feelings) {
      const nf = normalise(f);
      if (!nf) continue;
      if (nf.includes(" ")) {
        // An exact phrase from the lexicon wins over the negation heuristic:
        // "im not okay" is written there deliberately and means what it says.
        if (q.includes(nf)) { score += 14 + nf.length / 5; sure = true; }
        // "evil eye" is listed, "nazar" is what was typed.
        else if (qt.some((t) => SYNONYM_INDEX.get(t)?.has(nf))) { score += 9; sure = true; }
        continue;
      }
      for (const t of qt) {
        if (negated.has(t)) continue;
        if (t === nf) { score += 10; sure = true; }
        else if (
          t.length >= 4 && (nf.startsWith(t) || t.startsWith(nf)) &&
          Math.abs(t.length - nf.length) <= 3
        ) score += 4;
        // "anxeity", "depresion", "greif": a transposed or dropped letter is not
        // a prefix, so prefix matching alone never catches a typo.
        else if (t.length >= 5 && near(t, nf)) score += 7;
        // A word the lexicon never listed, meaning the same as one it did.
        // Scored below an exact listing so a deliberate phrasing still leads.
        else if (SYNONYM_INDEX.get(t)?.has(nf)) { score += 8; sure = true; }
      }
    }
    for (const t of qt) {
      if (negated.has(t)) continue;
      if (t.length >= 4 && normalise(sit.label).includes(t)) { score += 3; sure = true; }
    }
    // what happened outranks what it is about
    const boost = boosts.get(sit.id);
    if (boost) { score += boost; sure = true; }

    // and what it is about outranks the symptom it is described through
    let onSubject = false;
    if (subj && score > 0) {
      const subjectWords = subj.after.split(" ").filter((t) => t.length > 3 && !STOP.has(t));
      onSubject =
        sit.feelings.some((f) => {
          const nf = normalise(f);
          return !!nf && (subj.after.includes(nf) || nf.includes(subj.after));
        }) ||
        // a feeling is usually a phrase ("no money", "cant pay"), so the test is
        // whether a word of the subject appears in one, not whether it equals one
        subjectWords.some((t) =>
          sit.feelings.some((f) => normalise(f).split(" ").includes(t)));
      if (onSubject) score += 16;
    }

    if (score > 0) scored.push({ sit, score, sure, onSubject });
  }
  // Once the sentence has told us what it is about, everything it matched only
  // in passing steps back. Without this, "thinking about my debts at night"
  // still leads with sleep, because "at night" is a louder phrase than "debts".
  if (subj && scored.some((x) => x.onSubject)) {
    for (const x of scored) if (!x.onSubject) x.score *= 0.55;
  }

  scored.sort((a, b) => b.score - a.score || b.sit.count - a.sit.count);
  return scored.map(({ sit, score, sure }) => ({ sit, score, sure: !!sure }));
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
  // Ordered deliberately: these are the first thing a visitor reads, and five
  // of them used to be grief, worry, debt and a death. That is a true picture
  // of some days and a narrow picture of the site, which also answers a good
  // morning, a wedding, an exam, and "which sūrah for the grave".
  //
  // The spread is the point — a person who sees only sorrow here assumes the
  // site is for emergencies, and does not come back on an ordinary Tuesday.
  "I feel alone",
  "Something good happened",
  "I can't stop worrying",
  "I'm getting married",
  "I have an exam",
  "which surah for the grave",
  "I'm in debt",
  "protect my home",
  "I keep sinning",
  "I lost my mother",
  "I can't sleep",
  "I'm travelling",
  // the rest stay available to the suggestion code, just below the fold
  "someone wronged me", "I can't decide", "I'm angry", "I feel far from Allah",
  "someone is ill", "thinking about death", "I can't stop looking",
  "my child is sick",
];

/** What to offer while someone is still typing.
 *
 *  The examples only showed on an empty box, so the moment a visitor started
 *  typing they were on their own — and a half-typed word matches nothing, which
 *  reads as "we have nothing for you" rather than "keep going". These are the
 *  situations a partial word is heading towards, offered as somewhere to land.
 *
 *  Prefix matching on the vocabulary, not the scorer: this answers "what could
 *  you mean" while the scorer answers "what did you mean", and half a word is
 *  not yet a question.
 */
export function suggestions(query: string, take = 6) {
  const q = normalise(query);
  if (q.length < 2) return [] as { sit: Situation; hint: string }[];
  const last = q.split(" ").filter(Boolean).pop() ?? "";
  if (!last) return [];

  const out: { sit: Situation; hint: string; rank: number }[] = [];
  for (const sit of situations) {
    if (sit.id === "misc") continue;
    let best: { hint: string; rank: number } | null = null;
    const consider = (hint: string, rank: number) => {
      if (!best || rank < best.rank) best = { hint, rank };
    };
    const label = normalise(sit.label);
    if (label.startsWith(last)) consider(sit.label, 0);
    else if (label.includes(last)) consider(sit.label, 3);
    for (const f of sit.feelings) {
      const nf = normalise(f);
      if (!nf) continue;
      if (nf === last) consider(f, 1);
      else if (nf.startsWith(last)) consider(f, 2);
      // a word the visitor knows, for a situation named differently
      else if (SYNONYM_INDEX.get(last)?.has(nf)) consider(f, 4);
    }
    if (best) out.push({ sit, hint: (best as { hint: string }).hint, rank: (best as { rank: number }).rank });
  }
  out.sort((a, b) => a.rank - b.rank || b.sit.count - a.sit.count);
  // One word, one chip. "alhamdulillah" is written into both Joy & gratitude
  // and Remembrance & praise, so the row offered it twice — two buttons that
  // put the identical text in the box and produce the identical page.
  const offered = new Set<string>();
  return out
    .filter(({ hint }) => {
      const key = normalise(hint);
      if (offered.has(key)) return false;
      offered.add(key);
      return true;
    })
    .slice(0, take)
    .map(({ sit, hint }) => ({ sit, hint }));
}
