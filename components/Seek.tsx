"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { matchSituations, entriesFor, neighboursOf, EXAMPLES } from "@/lib/search";
import { EntryCard } from "@/components/Cards";

export default function Seek() {
  const [q, setQ] = useState("");
  const asked = q.trim().length > 1;

  const { primary, related } = useMemo(() => {
    const all = matchSituations(q);
    if (!all.length) return { primary: [], related: [] };
    const top = all[0].score;
    // Only what genuinely answers the query leads. Everything else is "related".
    const lead = all.filter((m) => m.score >= top * 0.82).slice(0, 2);
    const leadIds = lead.map((m) => m.sit.id);
    const scored = all.slice(lead.length, lead.length + 5).map((m) => m.sit);
    // if the query matched one thing only, offer its neighbours rather than nothing
    const filled =
      scored.length >= 3
        ? scored
        : [...scored, ...neighboursOf(leadIds[0], [...leadIds, ...scored.map((s) => s.id)], 4)];
    return { primary: lead, related: filled.slice(0, 5) };
  }, [q]);

  return (
    <div>
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-5 h-[19px] w-[19px] -translate-y-1/2 text-[var(--sage)]"
          fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="I feel alone…"
          aria-label="Describe how you feel or what you are going through"
          autoComplete="off"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] py-[18px] pr-12 pl-[54px] text-[17px] text-[var(--ink)] shadow-[0_4px_24px_-16px_var(--shadow)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:shadow-[0_10px_36px_-18px_var(--shadow)] focus:outline-none"
        />
        {asked && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 text-[var(--ink-faint)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--green)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {!asked && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-[var(--ink-faint)]">Try</span>
          {EXAMPLES.slice(0, 5).map((p) => (
            <button
              key={p}
              onClick={() => setQ(p)}
              className="rounded-full border border-[var(--line)] bg-[var(--card)]/70 px-3.5 py-1.5 text-[13px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)] hover:text-[var(--green)]"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {asked && (
        <div className="mt-12">
          {primary.length === 0 ? (
            <div className="rise rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 text-center">
              <p className="display text-[24px] text-[var(--ink)]">
                Nothing matched those words.
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
                Try a plainer word like <em>sad</em>, <em>afraid</em>, <em>debt</em>,{" "}
                <em>alone</em> or <em>sick</em>. You can also{" "}
                <Link href="/browse" className="text-[var(--sage)] underline underline-offset-4">
                  browse every situation
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              {primary.map(({ sit }, i) => {
                const found = entriesFor(sit.id, 6);
                return (
                  <section key={sit.id} className="rise mb-14" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-4">
                      <div>
                        <p className="mb-1.5 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
                          For what you said
                        </p>
                        <h2 className="display text-[32px] leading-tight text-[var(--ink)]">
                          {sit.label}
                        </h2>
                        <p className="mt-1.5 text-[14.5px] text-[var(--ink-soft)]">{sit.blurb}</p>
                      </div>
                      <Link
                        href={`/s/${sit.id}`}
                        className="shrink-0 rounded-full bg-[var(--green)] px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-[var(--green-deep)]"
                      >
                        All {sit.count}
                      </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {found.map((r) => (
                        <EntryCard key={r.id} row={r} />
                      ))}
                    </div>
                  </section>
                );
              })}

              {related.length > 0 && (
                <section className="rise border-t border-[var(--line-soft)] pt-8">
                  <p className="text-[11.5px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
                    You might also look at
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {related.map((sit) => (
                      <Link
                        key={sit.id}
                        href={`/s/${sit.id}`}
                        className="group rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-[13.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]"
                      >
                        {sit.label}
                        <span className="ml-2 text-[12px] text-[var(--ink-faint)]">{sit.count}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
