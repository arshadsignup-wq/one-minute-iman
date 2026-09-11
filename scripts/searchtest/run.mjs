/**
 * Regression checks for the feeling search.
 *
 * lib/search.ts uses the "@/" alias, which plain node will not resolve, so the
 * module is copied with the alias rewritten to a relative path and run through
 * node's own TypeScript stripping. Nothing about the logic is duplicated here:
 * the real module is what gets exercised.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const tmp = resolve(here, ".build");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const src = readFileSync(resolve(root, "lib/search.ts"), "utf8")
  .replace(/@\/data\//g, resolve(root, "data") + "/")
  .replace(/from\s+"([^"]+\.json)"/g, 'with { type: "json" } from "$1"')
  .replace(/import (\w+) with \{ type: "json" \} from/g, 'import $1 from');
// json imports need the attribute after the specifier
const fixed = src.replace(
  /import (\w+) from "([^"]+\.json)";/g,
  'import $1 from "$2" with { type: "json" };',
);
const out = resolve(tmp, "search.ts");
writeFileSync(out, fixed);

const S = await import(pathToFileURL(out).href);

/** Mirrors how components/Seek.tsx turns matches into what a visitor sees. */
function results(q) {
  if (S.isCrisis(q)) return { mode: "crisis", lead: [], related: [] };
  if (S.isHarm(q)) return { mode: "harm", lead: [], related: [] };
  const all = S.matchSituations(q);
  if (!all.length) return { mode: "empty", lead: [], related: [] };
  const top = all[0].score;
  const lead = all.filter((m) => m.score >= top * 0.82).slice(0, 2);
  const leadIds = lead.map((m) => m.sit.id);
  const scored = all.slice(lead.length, lead.length + 5).map((m) => m.sit);
  const filled =
    scored.length >= 3
      ? scored
      : [...scored, ...S.neighboursOf(leadIds[0], [...leadIds, ...scored.map((s) => s.id)], 4)];
  return {
    mode: "results",
    lead: leadIds,
    related: filled.slice(0, 5).map((s) => s.id),
    cards: leadIds.length ? S.entriesFor(leadIds[0], 6).map((r) => r.id) : [],
    titles: leadIds.length ? S.entriesFor(leadIds[0], 6).map((r) => r.t) : [],
  };
}

// [query, must-lead-with, must-not-lead-with, note]
const CASES = [
  ["I lost my mother",            ["death"],            ["illness", "someone-ill"], "bereavement, not a sick parent"],
  ["my mother is sick",           ["someone-ill", "illness"], ["death"],            "illness, not bereavement"],
  ["I am happy",                  ["gratitude"],        ["distress", "sadness", "poverty"], "thanksgiving leads"],
  ["I am not sad, I am grateful", ["gratitude"],        ["sadness"],                "negation respected"],
  ["I passed my exam",            ["gratitude"],        ["failure"],                "positive event"],
  ["I failed my exam",            ["failure"],          ["gratitude"],              "disappointment, not congratulation"],
  ["I am worried about my exam",  ["knowledge", "anxiety"], ["gratitude"],          "worry about study"],
  ["I feel lonely",               ["loneliness"],       [],                         "loneliness"],
  ["I am in debt",                ["debt"],             [],                         "debt"],
  ["I keep sinning",              ["forgiveness", "shame"], [],                     "repentance without shaming"],
  ["amar mon kharap",             ["sadness"],          [],                         "Banglish sadness"],
  ["মন খারাপ",                     ["sadness"],          [],                         "Bengali sadness"],
  ["I want to kill myself",       ["__crisis__"],       [],                         "crisis path"],
  ["my husband hits me",          ["__harm__"],         [],                         "harm path"],
  ["cut myself shaving",          ["__not_crisis__"],   [],                         "not a crisis"],
  ["asdkjhasd",                   ["__empty__"],        [],                         "unmatched"],

  // A sentence that names both a symptom and what is behind it is about the
  // latter. Before this, money worry was answered with a bedtime supplication.
  ["I can't sleep for worrying about money", ["poverty", "debt"], ["sleep"],  "cause outranks symptom"],
  ["I keep thinking about my debts at night", ["debt"],           ["sleep"],  "cause outranks symptom"],
  ["I can't sleep",               ["sleep"],            [],                         "plain symptom still works"],
  ["I am anxious about my exam",  ["knowledge"],        [],                         "subject is the exam"],
  ["worried about my mother",     ["parents"],          ["anxiety"],                "subject is the person"],
  ["stressed about work",         ["work"],             [],                         "subject is work"],

  // "passed" is good news; "passed away" is not. The positive-outcome rule was
  // scoring a bereavement as a celebration and offering gratitude alongside it.
  ["my mother passed away last week", ["death"],        ["gratitude"],              "passed away is not good news"],
  ["my grandfather passed on",    ["death"],            ["gratitude"],              "passed on is not good news"],
];

let pass = 0, fail = 0;
const failures = [];
for (const [q, want, avoid, note] of CASES) {
  const r = results(q);
  let ok;
  if (want[0] === "__crisis__") ok = r.mode === "crisis";
  else if (want[0] === "__harm__") ok = r.mode === "harm";
  else if (want[0] === "__not_crisis__") ok = r.mode !== "crisis";
  else if (want[0] === "__empty__") ok = r.mode === "empty";
  else {
    // The page now answers with one situation and offers the rest as "not quite
    // it?" chips, so what must not lead is the first one, not the whole set.
    ok = want.some((w) => r.lead.includes(w)) && !avoid.includes(r.lead[0]);
  }
  if (ok) { pass++; }
  else {
    fail++;
    failures.push({ q, note, want, avoid, got: r.mode === "results" ? r.lead : r.mode, cards: r.titles?.slice(0, 3) });
  }
  const mark = ok ? "pass" : "FAIL";
  console.log(`${mark}  ${q.padEnd(30)} -> ${r.mode === "results" ? r.lead.join(", ") : r.mode}`);
}
console.log(`\n${pass} passed, ${fail} failed of ${CASES.length}`);
if (failures.length) {
  console.log("\n--- failures in detail ---");
  for (const f of failures) {
    console.log(`\n  "${f.q}"  (${f.note})`);
    console.log(`     wanted one of: ${f.want.join(", ")}`);
    if (f.avoid.length) console.log(`     must not lead: ${f.avoid.join(", ")}`);
    console.log(`     got          : ${Array.isArray(f.got) ? f.got.join(", ") : f.got}`);
    if (f.cards?.length) console.log(`     top cards    : ${f.cards.join(" | ")}`);
  }
}
process.exitCode = fail ? 1 : 0;
