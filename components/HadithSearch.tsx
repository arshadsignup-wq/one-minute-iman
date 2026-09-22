"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Grade } from "@/components/Cards";

type Meta = {
  /** Words in more than one narration in twelve: skipped, not missing. */
  common: string[];
  buckets: number;
  shard: number;
  docs: number;
  collections: { slug: string; name: string; graded: boolean }[];
};
/** [collection index, book, number, grade, English] */
type Doc = [number, number, number, string, string];
type Hit = { id: string; slug: string; name: string; book: number; n: number; grade: string; en: string };
type RefHit = { slug: string; name: string; book: number; n: number };
/** Keyed by the query it answers, so a stale result is never shown against a
 *  newer one and nothing has to be cleared as the visitor types. */
type Result = { q: string; hits: Hit[]; total: number; ref: RefHit | null; missing: string[] };

const STOP = new Set(
  ("the a an and or of to in is was were be been being that this it he she they we you i his her "
   + "their our your my me him them who whom which what when where how why not no nor but if then "
   + "than so as at by for from with without on off up down out over under again further once here "
   + "there all any both each few more most other some such only own same too very can will just "
   + "should now said says say narrated allah messenger prophet pbuh peace upon him has have had "
   + "would could may might one two also about after before").split(" "),
);

/** Must match bucketOf() in scripts/build-hadith-search.mjs. */
function hashTerm(term: string, buckets: number) {
  let h = 5381;
  for (let i = 0; i < term.length; i++) h = ((h * 33) ^ term.charCodeAt(i)) >>> 0;
  return h % buckets;
}

function words(q: string) {
  return [...new Set(
    q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w.length >= 3 && w.length <= 20 && !STOP.has(w)),
  )].slice(0, 6);
}

const cache = new Map<string, Promise<unknown>>();
function get<T>(path: string): Promise<T | null> {
  let p = cache.get(path) as Promise<T | null> | undefined;
  if (!p) {
    p = fetch(path).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    cache.set(path, p as Promise<unknown>);
  }
  return p;
}

/**
 * Searching all 43,551 narrations, from a site with no server.
 *
 * The corpus is 47MB and the pages are prerendered, so the index is split at
 * build time and only the pieces a query needs are fetched: one small file per
 * search word, and one per handful of results. Nothing is downloaded until
 * somebody types.
 */
export default function HadithSearch() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const meta = useRef<Meta | null>(null);

  const run = useCallback(async (query: string) => {
    const m = meta.current ?? (await get<Meta>("/hsearch/meta.json"));
    if (!m) return;
    meta.current = m;

    // "bukhari 6345", "sahih muslim 2756" — a reference, not a phrase.
    const refMatch = /([a-zā-ūḥṣḍṭẓʿ' ]{3,})\s+(\d{1,5})\s*$/i.exec(query.trim());
    let found: RefHit | null = null;
    if (refMatch) {
      const name = refMatch[1].toLowerCase().replace(/[^a-z]/g, "");
      const c = m.collections.find(
        (x) => name.includes(x.slug) || x.slug.includes(name) ||
               x.name.toLowerCase().replace(/[^a-z]/g, "").includes(name),
      );
      if (c) {
        const map = await get<Record<string, number>>(`/hsearch/r/${c.slug}.json`);
        const book = map?.[refMatch[2]];
        if (book !== undefined) found = { slug: c.slug, name: c.name, book, n: Number(refMatch[2]) };
      }
    }
    // "bukhari 6345" is answered by the reference, not by every narration whose
    // text happens to contain the word bukhari. What is left once the
    // collection and the number are taken out decides whether there is also a
    // phrase to look for.
    const rest = found && refMatch
      ? query.replace(refMatch[0], " ")
      : query;
    const tooCommon = new Set(m.common);
    const terms = words(rest).filter((t) => !tooCommon.has(t));
    if (!terms.length) {
      setResult({ q: query, hits: [], total: 0, ref: found, missing: [] });
      return;
    }

    const lists = await Promise.all(
      terms.map((t) => get<Record<string, number[]>>(`/hsearch/t/${hashTerm(t, m.buckets)}.json`)
        .then((b) => (b?.[t] ?? null))),
    );

    // A word that appears in no narration at all is not a word to quietly drop.
    // Dropping it answers a question nobody asked: "zzzqqq nothing" came back
    // with 951 narrations, every one of them about something else.
    const missing = terms.filter((_, i) => !lists[i]);
    if (missing.length) {
      setResult({ q: query, hits: [], total: 0, ref: found, missing });
      return;
    }

    // How many of the words a narration carries is the whole ranking: one shared
    // word is a coincidence, all of them is the thing being looked for.
    const score = new Map<number, number>();
    for (const list of lists) {
      if (!list) continue;
      for (const id of list) score.set(id, (score.get(id) ?? 0) + 1);
    }
    const wanted = lists.filter(Boolean).length;
    const ranked = [...score.entries()]
      .filter(([, n]) => n === wanted || (wanted > 2 && n >= wanted - 1))
      .sort((a, b) => b[1] - a[1] || a[0] - b[0]);

    // Everything that carries all the words scores the same, and the tie was
    // being broken by where the narration sits in the corpus, which is not a
    // measure of anything. A wider pool is fetched and settled on what the
    // opening of each narration actually says.
    const top = ranked.slice(0, 24);
    const shards = [...new Set(top.map(([id]) => Math.floor(id / m.shard)))];
    const loaded = new Map<number, Doc[]>();
    await Promise.all(shards.map(async (k) => {
      const d = await get<Doc[]>(`/hsearch/d/${k}.json`);
      if (d) loaded.set(k, d);
    }));

    // Collection names are resolved here, where the index is in hand, so the
    // rendered list needs nothing but itself.
    const hits = top
      .flatMap(([id, n]) => {
        const doc = loaded.get(Math.floor(id / m.shard))?.[id % m.shard];
        if (!doc) return [];
        const c = m.collections[doc[0]];
        const opening = doc[4].toLowerCase();
        // A narration that says the words in its first breath is likelier to be
        // the one being looked for than one that says them somewhere in a long
        // account of something else.
        const near = terms.filter((t) => opening.includes(t)).length;
        return [{
          rank: n * 4 + near,
          hit: {
            id: String(id), slug: c.slug, name: c.name,
            book: doc[1], n: doc[2], grade: doc[3], en: doc[4],
          },
        }];
      })
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 12)
      .map((x) => x.hit);
    setResult({ q: query, hits, total: ranked.length, ref: found, missing: [] });
  }, []);

  // A book page hands its filter text over here when the reader wants the whole
  // corpus rather than the page in front of them.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v) setQ(v.slice(0, 120));
  }, []);

  const asked = q.trim();
  const shown = result && result.q === asked ? result : null;
  const busy = asked.length >= 3 && !shown;

  useEffect(() => {
    if (asked.length < 3) return;
    const t = window.setTimeout(() => { void run(asked); }, 350);
    return () => window.clearTimeout(t);
  }, [asked, run]);

  return (
    <div className="mt-8">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search every narration — a phrase, or “bukhari 6345”…"
          aria-label="Search all narrations"
          enterKeyHint="search"
          inputMode="search"
          autoComplete="off"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] px-5 py-3.5 text-[15.5px] text-[var(--ink)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:outline-none"
        />
      </form>

      <p aria-live="polite" className="mt-2 min-h-[1.1rem] text-[12.5px] text-[var(--ink-faint)]">
        {busy
          ? "Searching…"
          : shown
            ? shown.missing.length
              ? `No narration here contains ${shown.missing.map((w) => `\u201C${w}\u201D`).join(" or ")}.`
              : shown.total === 0
                ? shown.ref
                  ? ""
                  : "No narration here carries all of those words."
                : `${shown.total.toLocaleString()} narration${shown.total === 1 ? "" : "s"} carry those words${shown.total > 12 ? " · closest 12 shown" : ""}`
            : ""}
      </p>

      {shown?.ref && (
        <Link
          href={`/hadith/${shown.ref.slug}/${shown.ref.book}`}
          className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[var(--sage)] bg-[var(--card)] p-5 transition-all hover:shadow-[0_10px_36px_-18px_var(--shadow)]"
        >
          <span>
            <span className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
              By reference
            </span>
            <span className="display mt-1 block text-[20px] text-[var(--green)]">
              {shown.ref.name} {shown.ref.n}
            </span>
          </span>
          <span className="shrink-0 text-[13px] text-[var(--sage)]">Open the book →</span>
        </Link>
      )}

      {shown && shown.hits.length > 0 && (
        <ul className="mt-4 divide-y divide-[var(--line-soft)]">
          {shown.hits.map((h) => (
            <li key={h.id}>
              <Link
                href={`/hadith/${h.slug}/${h.book}`}
                className="group block rounded-xl px-4 py-4 transition-colors hover:bg-[var(--card)]"
              >
                <p className="text-[14.5px] leading-relaxed text-[var(--ink-soft)]">{h.en}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--ink-faint)]">
                  <span className="text-[var(--green)] group-hover:underline">
                    {h.name} {h.n}
                  </span>
                  {h.grade && <Grade g={h.grade} />}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
