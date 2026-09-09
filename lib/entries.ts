import entriesRaw from "@/data/entries.json";

export type Source = {
  kind: "hadith" | "quran";
  // number is the printed citation, which for Sahih Muslim is not the dataset's
  // own row id; record_id keeps that, and book/in_book the in-book reference.
  collection: string; slug?: string; number?: number | string;
  record_id?: number; book?: number; in_book?: number;
  surah?: number; ayah_start?: number; ayah_end?: number; reference?: string;
  url: string; grade: string; gradings: string[];
};
export type Entry = {
  id: string; tier: "curated" | "library";
  title: string; lede?: string;
  arabic: string; translit?: string; translit_auto?: boolean; trans: string;
  // "part" when the transliteration reads only some of the Arabic shown
  recites?: "part";
  // the surrounding verse or narration, when the recited words are an excerpt
  passage_ar?: string; passage_trans?: string;
  // recitation, only where a recording covers exactly what the page shows
  audio?: string[]; audio_credit?: string;
  english_full?: string; story?: string; note?: string;
  parallel?: string; dissent?: string;
  tags: string[]; situations: string[];
  source: Source;
};

export const entries = entriesRaw as unknown as Entry[];
const byId = new Map(entries.map((e) => [e.id, e]));
export function getEntry(id: string) { return byId.get(id); }
export const curated = entries.filter((e) => e.tier === "curated");
