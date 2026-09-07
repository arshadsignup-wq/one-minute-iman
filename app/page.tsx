import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a duʿā for how you feel · verified from Qurʾan and hadith",
  description:
    "Type how you feel and get the duʿā, Qurʾan verse or authentic hadith for that moment. Anxiety, grief, debt, illness, forgiveness. Every entry shows its source and grading.",
  alternates: { canonical: "/" },
};

import Link from "next/link";
import Seek from "@/components/Seek";
import { EntryCard, CategoryCard } from "@/components/Cards";
import { categories, situationsInCategory, rows, TOTAL, CURATED } from "@/lib/search";
import { AYAT_TOTAL, surahs } from "@/lib/quran";
import { HADITH_TOTAL } from "@/lib/hadith";

const FEATURED = ["dua-yunus", "anxiety-grief", "debt", "sayyidul-istighfar"];

export default function Home() {
  const featured = FEATURED.map((id) => rows.find((r) => r.id === id)!).filter(Boolean);

  return (
    <div>
      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--line-soft)]">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, var(--paper-2) 0%, var(--paper) 100%)" }}
          aria-hidden="true"
        />
        <span
          className="pattern pointer-events-none absolute inset-0 opacity-[0.42]"
          style={{
            maskImage: "radial-gradient(ellipse 75% 60% at 50% -5%, #000 5%, transparent 68%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 50% -5%, #000 5%, transparent 68%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-24">
          <h1 className="display text-[46px] leading-[1.02] text-[var(--ink)] sm:text-[68px]">
            Tell it how you feel.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-[var(--ink-soft)]">
            Say it in your own words. You&apos;ll be shown what the Prophet ﷺ said for
            exactly that, with its source and its authenticity grading beside it, so you
            never have to wonder whether it&apos;s real.
          </p>

          <div className="mt-10">
            <Seek />
          </div>
        </div>
      </section>

      {/* ── categories ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
              {Object.keys(categories).length} areas of life
            </p>
            <h2 className="display text-[34px] leading-tight text-[var(--ink)]">
              Or start from where you are
            </h2>
          </div>
          <Link
            href="/browse"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-[13px] text-[var(--green)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)]"
          >
            Every situation →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categories).map(([key, [label, blurb]]) => {
            const sits = situationsInCategory(key);
            return (
              <CategoryCard
                key={key}
                href={`/browse#${key}`}
                label={label}
                blurb={blurb}
                tags={sits.filter((s) => s.id !== "misc" && s.id !== "dhikr").slice(0, 3).map((s) => s.label)}
                count={sits.reduce((a, s) => a + s.count, 0)}
              />
            );
          })}
        </div>
      </section>

      {/* ── featured ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-[var(--line-soft)] bg-[var(--paper-2)]">
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
            Written out in full
          </p>
          <h2 className="display text-[34px] text-[var(--ink)]">Begin with these</h2>
          <p className="mt-3 mb-9 max-w-lg text-[15px] leading-relaxed text-[var(--ink-soft)]">
            Arabic, how to say it, what it means, and the story it came from.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((r) => (
              <EntryCard key={r.id} row={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── the two libraries ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
          Read it in full
        </p>
        <h2 className="display text-[34px] leading-tight text-[var(--ink)]">
          The whole text, not just the extracts
        </h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <Link
            href="/quran"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sage)] hover:shadow-[0_18px_44px_-24px_var(--shadow)]"
            style={{ background: "linear-gradient(155deg, var(--card) 0%, var(--paper-2) 100%)" }}
          >
            <span className="pattern pointer-events-none absolute -top-4 -right-4 h-28 w-28 opacity-30 transition-opacity duration-500 group-hover:opacity-60" aria-hidden="true" />
            <h3 className="display relative text-[26px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
              The Qur&apos;an
            </h3>
            <p className="relative mt-2.5 max-w-sm text-[14px] leading-relaxed text-[var(--ink-soft)]">
              All {surahs.length} sūrahs in the Uthmani script, with an English translation
              beside every verse.
            </p>
            <p className="relative mt-6 text-[11.5px] tracking-wide text-[var(--gold)]">
              {AYAT_TOTAL.toLocaleString()} āyāt
            </p>
          </Link>

          <Link
            href="/hadith"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sage)] hover:shadow-[0_18px_44px_-24px_var(--shadow)]"
            style={{ background: "linear-gradient(155deg, var(--card) 0%, var(--paper-2) 100%)" }}
          >
            <span className="pattern pointer-events-none absolute -top-4 -right-4 h-28 w-28 opacity-30 transition-opacity duration-500 group-hover:opacity-60" aria-hidden="true" />
            <h3 className="display relative text-[26px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
              Hadith
            </h3>
            <p className="relative mt-2.5 max-w-sm text-[14px] leading-relaxed text-[var(--ink-soft)]">
              The six primary collections, filtered to what the graders authenticated, each
              narration carrying its verdicts.
            </p>
            <p className="relative mt-6 text-[11.5px] tracking-wide text-[var(--gold)]">
              {HADITH_TOTAL.toLocaleString()} narrations
            </p>
          </Link>
        </div>
      </section>

      {/* ── trust ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="gold-rule mx-auto mb-7 block h-px w-24" aria-hidden="true" />
          <h2 className="display text-[34px] leading-tight text-[var(--ink)]">
            Why you can trust what you read here
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-[var(--ink-soft)]">
            Most “duʿā for anxiety” content online has no authenticated chain behind it.
            Everything here had to earn its place.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {[
            ["Nothing was copied", "Every Arabic word is cut straight from the primary source text and machine-checked against it, never retyped from memory."],
            ["Every grading is shown", "You see the verdicts of the scholars on that exact narration. Where they disagree, we print the disagreement."],
            ["Weak material is refused", "273 narrations were rejected by the grading rule while this was built. The best-known ones are listed publicly."],
          ].map(([h, p], i) => (
            <div key={h} className="text-center sm:text-left">
              <span className="display mb-3 block text-[15px] text-[var(--gold-mid)]">
                0{i + 1}
              </span>
              <h3 className="display text-[20px] text-[var(--green)]">{h}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.75] text-[var(--ink-soft)]">{p}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/authenticity"
            className="inline-block rounded-full bg-[var(--green)] px-6 py-3 text-[14px] font-medium text-white transition-all hover:bg-[var(--green-deep)]"
          >
            Read the full method
          </Link>
          <p className="mt-5 text-[13px] text-[var(--ink-faint)]">
            {CURATED} written out in full · {(TOTAL - CURATED).toLocaleString()} shown with
            their source narration
          </p>
        </div>
      </section>
    </div>
  );
}
