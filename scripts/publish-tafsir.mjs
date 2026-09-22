/**
 * Put the commentary where the browser can ask for it.
 *
 * The sūrah pages used to carry Ibn Kathīr inline — 1.2MB of it on al-Baqarah,
 * inside <details> most readers never open. The text is served from public/
 * instead and fetched when a section is opened. Run after fetch-tafsir.py.
 */
import { readdirSync, copyFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "data", "tafsir");
const to = join(root, "public", "tafsir");

rmSync(to, { recursive: true, force: true });
mkdirSync(to, { recursive: true });

let n = 0, bytes = 0;
for (const f of readdirSync(from)) {
  if (!f.endsWith(".json")) continue;
  copyFileSync(join(from, f), join(to, f));
  bytes += statSync(join(from, f)).size;
  n++;
}
console.log(`✅ ${n} sūrahs of commentary published (${(bytes / 1024 / 1024).toFixed(1)}MB), fetched only when opened`);
