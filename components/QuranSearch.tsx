"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import idxRaw from "@/data/quran-index.json";

type Row = { s: number; n: number; e: string };
const data = idxRaw as unknown as { names: Record<string, string>; ayat: Row[] };

export default function QuranSearch() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const hits = useMemo(() => {
    if (term.length < 3) return [];
    const out: Row[] = [];
    for (const a of data.ayat) {
      if (a.e.toLowerCase().includes(term)) {
        out.push(a);
        if (out.length >= 60) break;
      }
    }
    return out;
  }, [term]);

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
                  {data.names[String(a.s)]} · {a.s}:{a.n}
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
