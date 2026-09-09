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
const q = process.argv[2] || "I am not sad, I am grateful";
console.log("query      :", JSON.stringify(q));
console.log("normalised :", S.normalise(q));
const m = S.matchSituations(q);
console.log("matches    :", m.slice(0,6).map(x => `${x.sit.id}=${x.score.toFixed(1)}`).join("  ") || "(none)");
