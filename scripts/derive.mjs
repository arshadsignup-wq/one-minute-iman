/**
 * Small files derived from big ones, so a page need not load the big one.
 *
 * Run after anything that rewrites data/. Both outputs are pure subsets — if
 * they fall out of step with their sources, a page shows stale text.
 */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// The matcher resolves "surah mulk" from the names. The āyāt in the same file
// are 993KB and are only wanted by the search box on /quran, which imports the
// whole index itself.
const idx = JSON.parse(readFileSync(join(root, "data/quran-index.json"), "utf8"));
writeFileSync(join(root, "data/quran-names.json"), JSON.stringify({ names: idx.names }));
console.log(`✅ quran-names.json  ${Object.keys(idx.names).length} sūrah names, ${(JSON.stringify({ names: idx.names }).length / 1024).toFixed(1)}KB`);

// The search box on /quran wants the whole index, but only once somebody types
// in it, so it is served rather than bundled.
copyFileSync(join(root, "data/quran-index.json"), join(root, "public/quran-index.json"));
console.log(`✅ public/quran-index.json  ${idx.ayat.length.toLocaleString()} āyāt, fetched on the first keystroke`);
