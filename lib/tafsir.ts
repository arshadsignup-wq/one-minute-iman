import fs from "node:fs";
import path from "node:path";

export type TafsirBlock = { from: number; to: number; text: string };

/** Ibn Kathir, one shard per sūrah. Absent shards simply render nothing. */
export function readTafsir(surah: number): TafsirBlock[] {
  const file = path.join(process.cwd(), "data", "tafsir", `${surah}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as TafsirBlock[];
  } catch {
    return [];
  }
}

/** Just the passage ranges, without the commentary on them.
 *
 *  The whole of Ibn Kathīr on al-Baqarah is 1.2MB, and it was being written
 *  into the page inside collapsed <details>: every reader downloaded all of it
 *  to read one āyah, and most never opened a single section. The headings are
 *  a few hundred bytes and render on the server; the commentary is fetched from
 *  /tafsir/{surah}.json the first time somebody actually opens one.
 */
export function readTafsirRanges(surah: number): { from: number; to: number }[] {
  return readTafsir(surah).map((b) => ({ from: b.from, to: b.to }));
}
