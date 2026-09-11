/** Does a query that names a supplication reach that supplication? */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const rows = JSON.parse(readFileSync(resolve(root, "public/entry-keywords.json"), "utf8"));

const normalise = s => s.toLowerCase().replace(/['’`]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const ASKING = /\b(du'?aa?s?|supplications?|adhkar|dhikr|azkar|surah|ayah|verse|hadith)\b|\bwhat (do i|to|should i) (say|read|recite)\b|\bhow (do i|to) (say|read|recite)\b|\bwords? (to say|for)\b|\brecite\b/i;
const ASK = new Set(["dua","duaa","duas","supplication","supplications","prayer","read","recite","say","saying","said","what","which","before","after","during","while","any","some","there","please","need","want","looking"]);
const toks = q => normalise(q).split(" ").filter(t => t.length > 2 && !ASK.has(t));

function findEntry(query, prefer = []) {
  if (!(ASKING.test(normalise(query)) || ASKING.test(query))) return null;
  const q = normalise(query), qt = toks(query);
  if (!qt.length) return null;
  let best = null;
  for (const row of rows) {
    let score = 0, distinct = 0, phrase = false;
    for (const k of row.k) {
      if (k.includes(" ")) { if (q.includes(k)) { score += 8 + k.length/6; phrase = true; } }
      else if (qt.includes(k)) { score += 4; distinct++; }
    }
    if (!score) continue;
    if (prefer.some(s => row.s.includes(s))) score += 2;
    if (!phrase && distinct < 2) continue;
    if (!best || score > best.score || (score === best.score && row.i < best.id)) best = { id: row.i, score };
  }
  return best && best.score >= 7 ? best : null;
}

const CASES = [
  ["dua before sex",              "before-intimacy"],
  ["dua for entering the toilet", "entering-toilet"],
  ["dua for wearing new clothes", "you-clothed-me-in-it"],
  ["dua for breaking fast",       "iftar"],
  ["dua for looking in the mirror", null],
  // a plain feeling must NOT be hijacked by one entry
  ["I feel sad",                  null],
  ["I am anxious",                null],
  ["I feel alone",                null],
  ["my mother passed away",       null],
];
let pass = 0, fail = 0;
for (const [q, want] of CASES) {
  const got = findEntry(q);
  const ok = want === null ? got === null || true : got?.id === want;
  const strictOk = want === null ? got === null : got?.id === want;
  if (strictOk) pass++; else fail++;
  console.log(`${strictOk ? "pass" : "FAIL"}  ${q.padEnd(30)} -> ${got ? got.id + " (" + got.score.toFixed(1) + ")" : "(situation answer)"}${want && got?.id !== want ? "   wanted " + want : ""}`);
}
console.log(`\n${pass} passed, ${fail} failed of ${CASES.length}`);
