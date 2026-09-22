/**
 * The entry corpus: every verified entry, and the counts drawn from it.
 *
 * Kept apart from lib/search.ts on purpose. Matching a feeling needs the
 * situation lexicon and nothing else, but it used to live in the same module as
 * this 0.9MB index — so every page on the site, including ones with no search
 * on them, shipped the whole corpus to the browser to render a text box. A
 * bundler cannot drop a JSON import that an exported constant is computed from.
 *
 * Import from here only where the entries themselves are needed. Almost
 * everywhere that is a server component, and costs the reader nothing.
 */
import indexRaw from "@/data/index.json";
import { situationsInCategory } from "@/lib/search";

export type Row = {
  id: string; t: string; l?: string; s: string[];
  x: 0 | 1; g: string; r: string; a?: string;
};

export const rows = indexRaw as Row[];
export const TOTAL = rows.length;
export const CURATED = rows.filter((r) => r.x === 1).length;

/** Entries belonging to a situation: curated first, then the wider library. */
export function entriesFor(sitId: string, limit?: number) {
  const out = rows.filter((r) => r.s.includes(sitId));
  out.sort((a, b) => b.x - a.x);
  return limit ? out.slice(0, limit) : out;
}

/** How many entries a category holds, counting each one once.
 *
 *  Adding the situations inside a category counts an entry again for every
 *  situation it answers, and most answer more than one. The home page was
 *  offering "1,151 entries" under The heart on a site that holds 3,359
 *  altogether, and the nine cards summed to 6,189. Every number on a site whose
 *  argument is that it counts honestly has to survive being added up.
 */
export function entriesInCategory(cat: string) {
  const ids = new Set(situationsInCategory(cat).map((s) => s.id));
  let n = 0;
  for (const r of rows) if (r.s.some((s) => ids.has(s))) n++;
  return n;
}
