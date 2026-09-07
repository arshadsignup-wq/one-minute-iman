import entriesRaw from "@/data/entries.json";

export type Source = {
  kind: "hadith" | "quran";
  collection: string; slug?: string; number?: number;
  surah?: number; ayah_start?: number; ayah_end?: number; reference?: string;
  url: string; grade: string; gradings: string[];
};
export type Entry = {
  id: string; tier: "curated" | "library";
  title: string; lede?: string;
  arabic: string; translit?: string; translit_auto?: boolean; trans: string;
  english_full?: string; story?: string; note?: string;
  parallel?: string; dissent?: string;
  tags: string[]; situations: string[];
  source: Source;
};

export const entries = entriesRaw as unknown as Entry[];
const byId = new Map(entries.map((e) => [e.id, e]));
export function getEntry(id: string) { return byId.get(id); }
export const curated = entries.filter((e) => e.tier === "curated");
