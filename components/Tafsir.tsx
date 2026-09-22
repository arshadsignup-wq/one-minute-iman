"use client";

import { useState } from "react";
import type { TafsirBlock } from "@/lib/tafsir";

/**
 * Ibn Kathīr, fetched when somebody opens it.
 *
 * Every block used to be written into the page inside a collapsed <details>.
 * On al-Baqarah that is 1.2MB of commentary arriving before the first āyah can
 * be read, almost all of it never unfolded. The headings are here from the
 * start — they are the part a reader scans — and the text of the whole sūrah's
 * commentary is fetched once, the first time a section is opened.
 */
export default function Tafsir({
  ranges,
  surah,
}: { ranges: { from: number; to: number }[]; surah: number }) {
  const [blocks, setBlocks] = useState<Map<string, string> | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (blocks || loading) return;
    setLoading(true);
    try {
      const r = await fetch(`/tafsir/${surah}.json`);
      if (!r.ok) throw new Error(String(r.status));
      const list = (await r.json()) as TafsirBlock[];
      setBlocks(new Map(list.map((b) => [`${b.from}-${b.to}`, b.text])));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  if (!ranges.length) return null;

  return (
    <section className="mt-16 border-t border-[var(--line)] pt-10">
      <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
        Commentary
      </p>
      <h2 className="display text-[27px] text-[var(--ink)]">Ibn Kathīr, abridged</h2>
      <p className="mt-2 mb-7 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
        Passage by passage. Open a section to read it.
      </p>

      <div className="space-y-3">
        {ranges.map((b) => {
          const key = `${b.from}-${b.to}`;
          const text = blocks?.get(key);
          return (
            <details
              key={key}
              onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) void load(); }}
              className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-[14px] text-[var(--green)] transition-colors hover:text-[var(--sage)]">
                {b.from === b.to
                  ? `Āyah ${surah}:${b.from}`
                  : `Āyāt ${surah}:${b.from} to ${b.to}`}
              </summary>
              <div className="mt-4 space-y-3 border-t border-[var(--line-soft)] pt-4">
                {text ? (
                  text.split("\n\n").map((para, i) => (
                    <p key={i} className="text-[14.5px] leading-[1.85] text-[var(--ink-soft)]">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-[13.5px] text-[var(--ink-faint)]">
                    {failed
                      ? "The commentary could not be loaded. Try again in a moment."
                      : "Loading the commentary…"}
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
