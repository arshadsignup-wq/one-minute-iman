"use client";

import { useState } from "react";
import type { Ayah } from "@/lib/quran";

const OPTIONS = [
  ["en", "Saheeh International"],
  ["abdelhaleem", "Abdel Haleem"],
  ["pickthall", "Pickthall"],
] as const;

export default function AyahView({ verses }: { verses: Ayah[] }) {
  const [which, setWhich] = useState<(typeof OPTIONS)[number][0]>("en");
  const [showTr, setShowTr] = useState(true);

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-5">
        {OPTIONS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setWhich(key)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] transition-all ${
              which === key
                ? "bg-[var(--green)] text-white"
                : "border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--sage)] hover:text-[var(--green)]"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowTr((v) => !v)}
          className="ml-auto rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[12.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]"
        >
          {showTr ? "Hide" : "Show"} transliteration
        </button>
      </div>

      <div className="divide-y divide-[var(--line-soft)]">
        {verses.map((v) => (
          <div key={v.n} id={`v${v.n}`} className="scroll-mt-24 py-9">
            <p className="arabic text-right text-[27px] leading-[2.15] text-[var(--ink)] sm:text-[30px]">
              {v.ar}
            </p>

            {showTr && v.tr && (
              <p className="mt-4 text-right text-[14px] leading-relaxed text-[var(--sage)] italic">
                {v.tr}
              </p>
            )}

            <div className="mt-5 flex gap-4">
              <a
                href={`#v${v.n}`}
                className="display mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--paper-2)] text-[11.5px] text-[var(--green)] transition-colors hover:bg-[var(--pale)]"
                aria-label={`Āyah ${v.n}`}
              >
                {v.n}
              </a>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] leading-[1.8] text-[var(--ink-soft)]">
                  {(v[which] as string) || v.en}
                </p>
                {v.audio && (
                  <audio
                    controls
                    preload="none"
                    src={v.audio}
                    className="mt-3 h-8 w-full max-w-xs"
                    aria-label={`Recitation of āyah ${v.n}`}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
