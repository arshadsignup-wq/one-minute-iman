"use client";

import { useEffect, useState } from "react";
import type { Ayah } from "@/lib/quran";

const OPTIONS = [
  ["en", "Saheeh International"],
  ["abdelhaleem", "Abdel Haleem"],
  ["pickthall", "Pickthall"],
] as const;

export default function AyahView({ verses }: { verses: Ayah[] }) {
  const [which, setWhich] = useState<(typeof OPTIONS)[number][0]>("en");
  const [showTr, setShowTr] = useState(true);
  // which āyah the one player on this page is currently sounding, if any
  const [reciting, setReciting] = useState<number | null>(null);

  useEffect(() => {
    const on = (e: Event) =>
      setReciting((e as CustomEvent<{ n: number | null }>).detail?.n ?? null);
    window.addEventListener("omi:reciting", on);
    return () => window.removeEventListener("omi:reciting", on);
  }, []);

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-5">
        {OPTIONS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setWhich(key)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3.5 text-[12.5px] transition-all sm:min-h-0 sm:py-1.5 ${
              which === key
                ? "bg-[var(--green)] text-[var(--on-green)]"
                : "border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--sage)] hover:text-[var(--green)]"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowTr((v) => !v)}
          className="ml-auto inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-3.5 text-[12.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)] sm:min-h-0 sm:py-1.5"
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
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("omi:recite", { detail: { n: v.n } }),
                      )
                    }
                    aria-label={
                      reciting === v.n
                        ? `Pause the recitation from āyah ${v.n}`
                        : `Play the recitation from āyah ${v.n} onwards`
                    }
                    className={`mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 text-[12.5px] transition-all sm:min-h-0 sm:py-1.5 ${
                      reciting === v.n
                        ? "border-[var(--sage)] text-[var(--green)]"
                        : "border-[var(--line)] text-[var(--ink-faint)] hover:border-[var(--sage)] hover:text-[var(--green)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                      {reciting === v.n ? (
                        <path d="M8 5h3v14H8zm5 0h3v14h-3z" />
                      ) : (
                        <path d="M8 5.5v13l11-6.5z" />
                      )}
                    </svg>
                    {reciting === v.n ? "Reciting" : "Play from here"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
