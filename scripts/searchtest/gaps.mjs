/**
 * Queries the lexicon was never told about.
 *
 * coverage.mjs asks whether every phrasing written into the lexicon still
 * reaches its situation. It is worth having, but it cannot find a gap: a
 * phrasing nobody wrote down is not in the list being tested, so the score
 * stays at 92% while someone typing "sex" gets an empty page.
 *
 * This asks the opposite question. Two sources, neither of them the lexicon:
 *
 *   1. The site's own content. If an entry is about being unable to sleep, then
 *      "cant sleep" must reach something. Anything the corpus talks about is a
 *      thing a visitor may type, and the content is therefore a specification
 *      for the search rather than a separate concern from it.
 *
 *   2. A list of how people put things, written from outside the vocabulary —
 *      plain speech, other registers, transliterated Arabic and Urdu, and the
 *      blunt words someone uses when they are not composing a sentence for a
 *      website.
 *
 * A miss here is not a bug in the matcher. It is a question the site can answer
 * and cannot be asked.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const tmp = resolve(here, ".build");
mkdirSync(tmp, { recursive: true });
const src = readFileSync(resolve(root, "lib/search.ts"), "utf8")
  .replace(/@\/data\//g, resolve(root, "data") + "/")
  .replace(/import (\w+) from "([^"]+\.json)";/g,
           'import $1 from "$2" with { type: "json" };');
const mod = resolve(tmp, "search.ts");
writeFileSync(mod, src);
const S = await import(pathToFileURL(mod).href);

/** How people say it, written without looking at the lexicon. */
const SPOKEN = [
  // plain, blunt, and the words used when not composing a sentence
  "sex", "intimacy", "making love", "sleeping with my wife", "wedding night",
  "horny", "cant stop watching", "addicted", "relapsed", "i keep failing",
  "broke", "skint", "no money", "cant pay rent", "bills", "salary", "laid off",
  "fired", "redundant", "made redundant", "unemployed", "cant find work",
  "exam tomorrow", "failed my exam", "results day", "interview tomorrow",
  "job interview", "new job", "promotion", "boss is horrible",
  "my mum is sick", "my dad died", "miscarriage", "lost the baby", "infertile",
  "cant get pregnant", "ivf", "pregnant", "giving birth", "labour", "newborn",
  "my kid is sick", "my son is struggling", "teenager", "my daughter",
  "divorce", "separated", "my husband left", "my wife left", "cheated on me",
  "he cheated", "she cheated", "in laws", "mother in law", "forced marriage",
  "cant find a spouse", "rejected proposal", "istikhara", "should i marry him",
  "anxious", "panic attack", "cant breathe", "chest tight", "burnt out",
  "burnout", "exhausted", "cant get out of bed", "no motivation", "empty",
  "numb", "crying every day", "cant stop crying", "hate myself", "worthless",
  "failure", "everyone is better than me", "jealous", "compare myself",
  "cant sleep", "insomnia", "nightmares", "bad dreams", "sleep paralysis",
  "scared of the dark", "scared to die", "afraid of death", "what happens after death",
  "punishment of the grave", "grave", "qabr", "akhirah", "judgement day",
  "sick", "ill", "hospital", "surgery tomorrow", "cancer", "diagnosis",
  "chronic pain", "migraine", "disabled", "recovering",
  "moving house", "new home", "travelling tomorrow", "flight", "long journey",
  "exam stress", "study", "memorising quran", "hifz", "learning arabic",
  "missed fajr", "cant pray", "cant focus in salah", "khushu", "distracted in prayer",
  "sinned", "major sin", "cant forgive myself", "tawbah", "repent", "guilt",
  "backbiting", "gossiped", "lied", "stole", "riba", "interest",
  "someone did black magic", "jinn", "possessed", "waswas", "whispers",
  "evil eye", "nazar", "someone is jealous of me", "protect my family",
  "protect my home", "leaving the house", "entering the house", "before eating",
  "after eating", "new clothes", "looking in the mirror", "rain", "thunder",
  "wind", "eclipse", "friday", "jummah", "ramadan", "fasting", "iftar", "suhoor",
  "eid", "hajj", "umrah", "makkah", "madinah", "tawaf",
  // other registers and transliterations
  "rizq", "barakah", "sabr", "shukr", "tawakkul", "istighfar", "salawat",
  "namaz", "dua qunoot", "ayatul kursi", "surah mulk", "surah yaseen",
  "surah waqiah", "surah kahf", "manzil", "ruqyah", "shifa",
  "pareshani", "gham", "dukh", "bimari", "maut", "shaadi", "aulad", "zulm",
  "dushman", "hasad", "taqdeer", "qismat", "sabar", "tauba",
  // questions rather than statements
  "what do i say before sleeping", "what to read for protection",
  "which surah for money", "which surah for the grave",
  "dua for my parents", "dua for someone who died", "dua for anxiety",
  "is there a dua for this", "what did the prophet say when he was sad",
];


/** The span of a life, by category, written by asking "what happens to people"
 *  rather than "what does the lexicon cover". This is the list that took the
 *  site from 75% to 100%, and it is kept so that it stays there.
 *
 *  Categories are only for reading the failure report — a gap in one column is
 *  a subject the site cannot be asked about, which is more useful to see than
 *  a flat percentage.
 */
const LIFE = {
  addiction: ["addicted to drugs", "alcohol", "drinking", "smoking", "cant quit smoking",
    "vaping", "gambling", "betting", "addicted to my phone", "social media addiction",
    "video games", "cant stop scrolling"],
  mental: ["ocd", "obsessive thoughts", "bipolar", "adhd", "cant concentrate",
    "eating disorder", "anorexia", "binge eating", "body image", "hate my body",
    "overweight", "self esteem", "therapy", "medication", "psychiatrist"],
  fertility: ["infertile", "cant conceive", "miscarriage", "stillbirth", "lost the baby",
    "ivf", "pregnancy", "morning sickness", "labour pains", "breastfeeding",
    "postnatal", "c section"],
  family: ["caring for my mother", "elderly parents", "dementia", "my parents are fighting",
    "siblings fighting", "cut off my family", "estranged from family", "adopted",
    "orphan", "step parent", "custody"],
  money: ["bankrupt", "business failed", "cant pay my staff", "investment lost", "scammed",
    "fraud", "stock market", "crypto", "inheritance", "zakat", "charity", "sadaqah", "tax"],
  work: ["hate my job", "toxic workplace", "discriminated at work", "overworked",
    "night shift", "started a business", "first day", "made a mistake at work",
    "office politics"],
  migration: ["visa rejected", "immigration", "deported", "asylum", "refugee",
    "moving country", "homesick", "far from family", "living abroad", "cant go home"],
  conflict: ["war", "bombing", "genocide", "occupation", "famine", "earthquake", "flood",
    "hurricane", "lost my home", "displaced", "natural disaster"],
  legal: ["court case", "prison", "arrested", "police", "lawsuit", "wrongly accused",
    "jail", "released from prison"],
  social: ["bullied", "cyberbullied", "no friends", "social anxiety", "public speaking",
    "presentation", "betrayed by a friend", "friend stopped talking", "fell out"],
  practice: ["new muslim", "revert", "convert", "first ramadan", "hijab",
    "started wearing hijab", "stopped praying", "missed prayers", "cant wake for fajr",
    "beard", "music", "doubts about islam", "questioning my faith", "apostasy",
    "cant feel anything when i pray"],
  worship: ["ramadan", "laylatul qadr", "eid", "jummah", "friday", "fasting",
    "breaking fast", "hajj", "umrah", "qurbani", "eid al adha", "tarawih", "itikaf"],
  illness: ["depression", "anxiety disorder", "cancer diagnosis", "chemotherapy", "dialysis",
    "transplant", "chronic illness", "long covid", "heart attack", "stroke", "paralysed",
    "blind", "deaf", "disability"],
  children: ["my child wont listen", "teenage son", "rebellious daughter",
    "child with autism", "special needs", "school problems", "bullied at school",
    "exam results", "university"],
  grief: ["my father died", "my mother died", "lost my child", "lost my spouse",
    "lost a friend", "pet died", "anniversary of death", "visiting the grave", "funeral"],
  daily: ["before eating", "after eating", "entering the toilet", "leaving the toilet",
    "wearing new clothes", "looking in the mirror", "sneezing", "yawning", "waking up",
    "going to sleep", "leaving home", "entering home", "riding", "boarding a plane",
    "seeing the moon", "hearing a rooster", "hearing a dog bark", "strong wind",
    "first fruit of the season"],
  unseen: ["black magic", "sihr", "jinn", "possessed", "haunted", "nightmare",
    "sleep paralysis", "evil eye on my child", "someone cursed me", "hasad"],
  character: ["arrogant", "proud", "impatient", "short tempered", "lazy", "procrastinating",
    "ungrateful", "stingy", "judgemental", "gossiping", "jealous of my friend"],
  hope: ["dua not answered", "been asking for years", "allah is not listening",
    "feel abandoned", "why me", "lost hope", "istikhara result", "waiting for an answer"],
};

/** Words the site's own entries lean on, which a visitor may therefore type.
 *
 *  An earlier version of this counted any word appearing four times or more,
 *  and so spent most of its budget failing "have", "feel" and "words". Those
 *  are not gaps: a situation lexicon *should* ignore them, and a test that
 *  calls their absence a failure reports 30% while nothing is wrong.
 *
 *  What is worth testing is a distinctive word — one used by a handful of
 *  entries rather than by the whole corpus, which is what a topic looks like.
 *  Those are also answered by the entry search rather than by the situation
 *  lexicon, so that is what they are checked against.
 */
function fromContent() {
  const rows = JSON.parse(readFileSync(resolve(root, "data/index.json"), "utf8"));
  const stop = new Set(("the a an and or of to in on at for with from by is are was were be been being " +
    "what when how why who which that this these those it its his her their our your my me i you " +
    "he she they we said say says saying prophet allah god messenger peace upon him narrated had has have " +
    "reported one two three man woman people there here then than not no yes if so as but also more most " +
    "very much many such own same other another each every all any some few both into over under after " +
    "before again once only just even still yet about against between through during without within " +
    "words word turned used naming done revealed comfort hardest promise repeated twice carry gone " +
    "themselves calls rises knew would take away taught could felt seven times asked told first last " +
    "made make made give given gives come came goes went know known think thought like likes wanted " +
    "thing things part parts place places time day days night nights").split(" "));
  const freq = new Map();
  for (const r of rows) {
    for (const w of String(r.t || "").toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)) {
      if (w.length < 5 || stop.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  // used by a few entries, not by all of them: that is a topic, not filler
  return [...freq.entries()].filter(([, n]) => n >= 2 && n <= 40).map(([w]) => w);
}

const content = fromContent();
const groups = [["spoken", SPOKEN], ...Object.entries(LIFE), ["content", content]];

// The entry index is what answers a query naming something specific.
const entryKeywords = JSON.parse(
  readFileSync(resolve(root, "public/entry-keywords.json"), "utf8"));
const inEntries = (w) => entryKeywords.some((row) =>
  (row.k || []).some((k) => String(k).toLowerCase().includes(w)));

let grand = 0, grandMiss = 0;
const misses = [];
for (const [name, list] of groups) {
  let miss = 0;
  for (const q of list) {
    const reached = S.matchSituations(q).length > 0 || !!S.matchSurah(q) ||
                    (name === "content" && inEntries(q));
    if (!reached) { miss++; misses.push([name, q]); }
  }
  grand += list.length; grandMiss += miss;
  const pct = ((list.length - miss) / list.length * 100).toFixed(1);
  console.log(`${name.padEnd(9)} ${String(list.length).padStart(4)} queries   ${pct}% reach something   ${miss} find nothing`);
}
console.log(`${"total".padEnd(9)} ${String(grand).padStart(4)} queries   ` +
            `${((grand - grandMiss) / grand * 100).toFixed(1)}% reach something   ${grandMiss} find nothing`);

if (misses.length) {
  console.log("\nfinds nothing:");
  for (const [g, q] of misses.slice(0, 60)) console.log(`  [${g}] ${q}`);
  if (misses.length > 60) console.log(`  … and ${misses.length - 60} more`);
}
writeFileSync(resolve(here, "gaps.json"), JSON.stringify(misses, null, 1));
process.exitCode = 0;
