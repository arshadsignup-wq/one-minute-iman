import fs from "node:fs";
import path from "node:path";
import booksRaw from "@/data/hadith-books.json";

export type Hadith = {
  c: string; n: number; b: number;
  ar: string; en: string; g: string; v: string[]; w: string[];
};
export type Book = { n: number; title: string; count: number };
export type Collection = { name: string; books: Book[]; count: number; graded: boolean };

export const collections = (booksRaw as unknown as {
  collections: Record<string, Collection>;
}).collections;

export const GRADED_ORDER = [
  "bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik",
];
export const UNGRADED_ORDER = [
  "riyad", "bulugh", "adab", "mishkat", "shamail", "ahmad",
  "nawawi", "qudsi", "dehlawi",
];
export const COLLECTION_ORDER = [...GRADED_ORDER, ...UNGRADED_ORDER];

/** Only graded collections count towards the authenticated total. */
export const HADITH_TOTAL = Object.values(collections)
  .filter((c) => c.graded)
  .reduce((a, c) => a + c.count, 0);
export const COMPILATION_TOTAL = Object.values(collections)
  .filter((c) => !c.graded)
  .reduce((a, c) => a + c.count, 0);

/** Read a single book's narrations. Only ever one shard per page. */
export function readBook(coll: string, book: number): Hadith[] {
  const file = path.join(process.cwd(), "data", "hadith", coll, `${book}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8")) as Hadith[];
}

export function getBook(coll: string, book: number) {
  return collections[coll]?.books.find((b) => b.n === book);
}
