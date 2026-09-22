"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Row = { s: number; n: number; e: string };
type Index = { names: Record<string, string>; ayat: Row[] };

/** Every āyah of the translation is a megabyte, and it was bundled into the
 *  page: the index of the Qurʾan cost that much to open whether or not anybody
 *  searched it. It is fetched on the first keystroke instead, once. */
let pending: Promise<Index | null> | null = null;
function load() {
  if (!pending) {
    pending = fetch("/quran-index.json")
      .then((r) => (r.ok ? (r.json() as Promise<Index>) : null))
      .catch(() => null);
  }
  return pending;
}

export default function QuranSearch() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Index | null>(null);
  const term = q.trim().toLowerCase();

  useEffect(() => {
    if (term.length < 3 || data) return;
    let live = true;
    void load().then((d) => { if (live && d) setData(d); });
    return () => { live = false; };
  }, [term, data]);

  const hits = useMemo(() => {
    if (term.length < 3 || !data) return [];
    const out: Row[] = [];
    for (const a of data.ayat) {
      if (a.e.toLowerCase().includes(term)) {
        out.push(a);
        if (out.length >= 60) break;
      }
    }
    return out;
  }, [term, data]);

  function highlight(text: string) {
    const i = text.toLowerCase().indexOf(term);
    if (i < 0) return text;
    const start = Math.max(0, i - 90);
    return (
      <>
        {start > 0 && "… "}
        {text.slice(start, i)}
        <mark className="bg-[var(--gold-bg)] text-[var(--gold)]">
          {text.slice(i, i + term.length)}
        </mark>
        {text.slice(i + term.length, i + term.length + 130)}
        {text.length > i + term.length + 130 && " …"}
      </>
    );
  }

  return (
    <div className="mt-10">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-5 h-[18px] w-[18px] -translate-y-1/2 text-[var(--sage)]"
          fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the translation, for example mercy, patience, orphan…"
          aria-label="Search the Qur'an translation"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] py-3.5 pr-5 pl-[52px] text-[15.5px] text-[var(--ink)] shadow-[0_4px_24px_-18px_var(--shadow)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:outline-none"
        />
      </div>

      {term.length >= 3 && (
        <div className="mt-6">
          <p className="mb-3 text-[12px] tracking-[0.14em] text-[var(--ink-faint)] uppercase">
            {hits.length === 0
              ? "No āyah matched"
              : `${hits.length}${hits.length === 60 ? "+" : ""} āyāt`}
          </p>
          <div className="divide-y divide-[var(--line-soft)]">
            {hits.map((a) => (
              <Link
                key={`${a.s}:${a.n}`}
                href={`/quran/${a.s}#v${a.n}`}
                className="group block py-4"
              >
                <span className="text-[11.5px] tracking-wide text-[var(--gold)]">
                  {data?.names[String(a.s)]} · {a.s}:{a.n}
                </span>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--ink-soft)] transition-colors group-hover:text-[var(--ink)]">
                  {highlight(a.e)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
