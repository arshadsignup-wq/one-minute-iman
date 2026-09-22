"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Narrows the narrations already rendered on this page. Nothing is fetched.
 *
 * A book is served a page at a time, so this sees one page of it. That was the
 * stated reason not to paginate at all: a filter that quietly misses fourteen
 * fifteenths of a book is worse than a heavy page. It does not miss them
 * quietly. It says which page it is reading, and hands over the search that
 * reads all 43,551 narrations, carrying the words already typed.
 */
export default function BookFilter({
  count,
  page = 1,
  pageCount = 1,
}: { count: number; page?: number; pageCount?: number }) {
  const [q, setQ] = useState("");
  const [shown, setShown] = useState<number | null>(null);
  const scoped = pageCount > 1;

  function apply(value: string) {
    setQ(value);
    const term = value.trim().toLowerCase();
    let hits = 0;
    document.querySelectorAll<HTMLElement>("[data-hadith]").forEach((el) => {
      const hit = !term || (el.dataset.hadith || "").includes(term);
      el.style.display = hit ? "" : "none";
      if (hit) hits++;
    });
    setShown(term ? hits : null);
  }

  return (
    <div className="mt-6">
      <input
        value={q}
        onChange={(e) => apply(e.target.value)}
        placeholder={scoped ? `Filter the ${count} narrations on this page…` : "Filter these narrations…"}
        aria-label={
          scoped
            ? `Filter the narrations on page ${page} of ${pageCount}`
            : "Filter narrations in this book"
        }
        className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] px-5 py-3 text-[15px] text-[var(--ink)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:outline-none"
      />
      <p aria-live="polite" className="mt-2 min-h-4 text-[12px] leading-relaxed text-[var(--ink-faint)]">
        {shown !== null && (
          <>
            {shown === 0 ? "Nothing on this page matches" : `${shown} of ${count} shown`}
            {scoped && (
              <>
                {" "}· this is page {page} of {pageCount} ·{" "}
                <Link
                  href={`/hadith?q=${encodeURIComponent(q.trim())}`}
                  className="text-[var(--sage)] underline underline-offset-4"
                >
                  search every narration
                </Link>
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}
