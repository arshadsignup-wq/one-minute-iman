import quranRaw from "@/data/quran.json";

export type Ayah = {
  n: number; ar: string; en: string; tr?: string;
  abdelhaleem?: string; pickthall?: string; audio?: string;
};
export type Surah = {
  n: number; name: string; arabic: string; translated: string;
  revelation: string; count: number; verses: Ayah[];
};

export const surahs = quranRaw as unknown as Surah[];
export const AYAT_TOTAL = surahs.reduce((a, s) => a + s.verses.length, 0);
export function getSurah(n: number) {
  return surahs.find((s) => s.n === n);
}
