"use client";

import { normalise } from "@/lib/search";

/**
 * Finding a specific entry by its own words.
 *
 * Matching ran only against the 43 situation lexicons, so anything named
 * precisely fell through: "du'a before sex" returned an empty page while
 * Sahih al-Bukhari 141 sat in the corpus, filed under marriage. A situation is
 * the right answer to a feeling; it is the wrong answer to a request for a
 * particular supplication.
 *
 * The keyword file is fetched once on the first search and the text of an entry
 * only when that entry wins, so nothing is downloaded before it is needed.
 */

export type EntryDoc = {
  i: string; t: string; a: string; r: string; g: string;
  p?: string; m?: string;
  u?: string[]; us?: "exact" | "verse"; uc?: string;
  x?: 1;
};
type KeyRow = { i: string; k: string[]; s: string[] };
export type EntryHit = { id: string; score: number; situations: string[] };

let keysPromise: Promise<KeyRow[]> | null = null;
const docCache = new Map<string, EntryDoc | null>();

function loadKeys() {
  if (!keysPromise) {
    keysPromise = fetch("/entry-keywords.json")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [] as KeyRow[]);
  }
  return keysPromise;
}

export async function loadEntry(id: string): Promise<EntryDoc | null> {
  if (docCache.has(id)) return docCache.get(id) ?? null;
  try {
    const r = await fetch(`/entry/${encodeURIComponent(id)}.json`);
    const doc = r.ok ? ((await r.json()) as EntryDoc) : null;
    docCache.set(id, doc);
    return doc;
  } catch {
    docCache.set(id, null);
    return null;
  }
}

/** Words that describe the asking rather than the thing asked for. */
const ASK = new Set([
  "dua", "duaa", "dua'a", "duas", "supplication", "supplications", "prayer",
  "read", "recite", "say", "saying", "said", "what", "which", "before", "after",
  "during", "while", "any", "some", "there", "please", "need", "want", "looking",
]);

function tokens(q: string) {
  return normalise(q).split(" ").filter((t) => t.length > 2 && !ASK.has(t));
}

/** Is the person asking for a text, or telling us how they feel?
 *
 *  "I feel sad" wants the answer written for sadness. "du'a before sex" wants
 *  one particular supplication. Without this distinction a bereavement query
 *  was being answered with a supplication for parents, because the words
 *  overlapped: the entry matched, but it was not what was being asked for.
 */
const ASKING = /\b(du'?aa?s?|supplications?|adhkar|dhikr|azkar|surah|ayah|verse|hadith)\b|\bwhat (do i|to|should i) (say|read|recite)\b|\bhow (do i|to) (say|read|recite)\b|\bwords? (to say|for)\b|\brecite\b/i;

export function isAskingForText(query: string) {
  return ASKING.test(normalise(query)) || ASKING.test(query);
}

/**
 * The entry a query names, if it names one.
 *
 * Deliberately hard to satisfy. A feeling must keep reaching the situation
 * answer, which is written for it; only a query that points at something
 * particular should override that.
 */
export async function findEntry(
  query: string,
  preferSituations: string[] = [],
): Promise<EntryHit | null> {
  if (!isAskingForText(query)) return null;
  const q = normalise(query);
  const qt = tokens(query);
  if (qt.length === 0) return null;

  const rows = await loadKeys();
  if (!rows.length) return null;

  let best: EntryHit | null = null;
  for (const row of rows) {
    let score = 0;
    let distinct = 0;
    let phrase = false;

    for (const k of row.k) {
      if (k.includes(" ")) {
        // a multi-word tag is a strong signal: "entering the toilet"
        if (q.includes(k)) { score += 8 + k.length / 6; phrase = true; }
      } else if (qt.includes(k)) {
        score += 4;
        distinct += 1;
      }
    }
    if (!score) continue;

    // an entry already filed under what the query looks like is likelier right
    if (preferSituations.some((s) => row.s.includes(s))) score += 2;

    // One shared word is a coincidence. Require a phrase, or two of them.
    if (!phrase && distinct < 2) continue;

    if (!best || score > best.score || (score === best.score && row.i < best.id)) {
      best = { id: row.i, score, situations: row.s };
    }
  }

  // The asking gate above already excludes anyone describing a feeling, so what
  // reaches here is a request for a text and a modest match is enough.
  return best && best.score >= 7 ? best : null;
}
