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
