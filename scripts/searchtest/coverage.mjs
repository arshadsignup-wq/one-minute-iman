/** Every phrasing the lexicon claims for a situation must still reach it. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const tmp = resolve(here, ".build"); mkdirSync(tmp, { recursive: true });
const src = readFileSync(resolve(root, "lib/search.ts"), "utf8")
  .replace(/@\/data\//g, resolve(root, "data") + "/")
  .replace(/import (\w+) from "([^"]+\.json)";/g, 'import $1 from "$2" with { type: "json" };');
const out = resolve(tmp, "search.ts"); writeFileSync(out, src);
const S = await import(pathToFileURL(out).href);

let total = 0, top1 = 0, top2 = 0, miss = 0;
const misses = [];
for (const sit of S.situations) {
  for (const f of sit.feelings) {
    total++;
    const m = S.matchSituations(f);
    const ids = m.slice(0, 2).map((x) => x.sit.id);
    if (ids[0] === sit.id) top1++;
    else if (ids.includes(sit.id)) top2++;
    else { miss++; if (misses.length < 12) misses.push([f, sit.id, ids.join(",") || "(none)"]); }
  }
}
console.log(`phrasings tested : ${total}`);
console.log(`  lead result    : ${top1} (${(top1 / total * 100).toFixed(1)}%)`);
console.log(`  in top two     : ${top2}`);
console.log(`  not found      : ${miss}`);
if (misses.length) {
  console.log("\n  examples not reaching their own situation:");
  for (const [f, want, got] of misses) console.log(`    "${f}" -> wanted ${want}, got ${got}`);
}
