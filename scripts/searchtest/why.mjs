/**
 * Which lexicon word produced a match, and by which rule.
 *
 * The score alone cannot tell a good match from a bad one: "money" reaches
 * Money & provision on 3 points and "ramadan" reaches Seeking forgiveness on
 * 10. What separates them is the rule that fired, so this prints that.
 *
 * The scoring loop is mirrored here rather than imported, because lib/search.ts
 * returns only the total. Keep it in step when the scorer changes.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const tmp = resolve(here, ".build"); mkdirSync(tmp, { recursive: true });
function stage(name) {
  const src = readFileSync(resolve(root, "lib", name), "utf8")
    .replace(/@\/data\//g, resolve(root, "data") + "/")
    .replace(/@\/lib\/(\w+)/g, "./$1.ts")
    .replace(/import (\w+) from "([^"]+\.json)";/g, 'import $1 from "$2" with { type: "json" };');
  writeFileSync(resolve(tmp, name), src);
}
stage("search.ts"); stage("corpus.ts");
const S = { ...(await import(pathToFileURL(resolve(tmp, "search.ts")).href)),
            ...(await import(pathToFileURL(resolve(tmp, "corpus.ts")).href)) };

function near(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return false;
  if (a.length === b.length) {
    const diffs = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { diffs.push(i); if (diffs.length > 2) return false; }
    }
    if (diffs.length === 1) return true;
    if (diffs.length !== 2) return false;
    const [x, y] = diffs;
    return y === x + 1 && a[x] === b[y] && a[y] === b[x];
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0, j = 0, skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; continue; }
    if (skipped) return false;
    skipped = true; j++;
  }
  return i === short.length;
}

const q = process.argv.slice(2).join(" ") || "i am infertile";
const nq = S.normalise(q);
const qt = nq.split(" ").filter(Boolean);
const matches = S.matchSituations(q).slice(0, 4);
console.log(`query "${q}"  ->  ${matches.map((m) => `${m.sit.id}=${m.score.toFixed(1)}`).join("  ") || "(none)"}`);
for (const { sit } of matches) {
  const why = [];
  for (const f of sit.feelings) {
    const nf = S.normalise(f);
    if (!nf) continue;
    if (nf.includes(" ")) {
      if (nq.includes(nf)) why.push(`phrase "${nf}" +${(14 + nf.length / 5).toFixed(1)}`);
      continue;
    }
    for (const t of qt) {
      if (t === nf) why.push(`exact "${t}" +10`);
      else if (t.length >= 4 && (nf.startsWith(t) || t.startsWith(nf)) && Math.abs(t.length - nf.length) <= 3)
        why.push(`prefix "${t}"~"${nf}" +4`);
      else if (t.length >= 5 && near(t, nf)) why.push(`TYPO "${t}"~"${nf}" +7`);
      else if (S.synonymsOf(t).includes(nf)) why.push(`synonym "${t}"->"${nf}" +8`);
    }
  }
  for (const t of qt) if (t.length >= 4 && S.normalise(sit.label).includes(t)) why.push(`label "${t}" +3`);
  console.log(`   ${sit.id.padEnd(20)} ${why.join("; ") || "(intent boost only)"}`);
}
