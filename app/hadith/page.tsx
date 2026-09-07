import { OG_IMAGE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import {
  collections, GRADED_ORDER, UNGRADED_ORDER, HADITH_TOTAL, COMPILATION_TOTAL,
} from "@/lib/hadith";

export const metadata: Metadata = {
  title: "Hadith collections · Bukhārī, Muslim and the Sunan",
  description:
    "Browse the hadith collections book by book, with the Arabic and the authenticity grading shown on every narration.",
  alternates: { canonical: "/hadith" },
  openGraph: {
    title: "Hadith collections · Bukhārī, Muslim and the Sunan",
    description: "Browse book by book, with the Arabic and the grading shown on every narration.",
    url: "/hadith", type: "website", images: [OG_IMAGE] },
};

function Section({
  title, note, keys,
}: { title: string; note: string; keys: string[] }) {
  const present = keys.filter((k) => collections[k]);
  if (!present.length) return null;
  return (
    <section className="mt-14">
      <h2 className="display text-[26px] text-[var(--ink)]">{title}</h2>
      <p className="mt-2 mb-6 max-w-2xl text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
        {note}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {present.map((key) => {
          const c = collections[key];
          return (
            <Link
              key={key}
              href={`/hadith/${key}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sage)] hover:shadow-[0_18px_44px_-24px_var(--shadow)]"
              style={{ background: "linear-gradient(155deg, var(--card) 0%, var(--paper-2) 100%)" }}
            >
              <span
                className="pattern pointer-events-none absolute -top-4 -right-4 h-24 w-24 opacity-30 transition-opacity duration-500 group-hover:opacity-60"
                aria-hidden="true"
              />
              <h3 className="display relative text-[23px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                {c.name}
              </h3>
              <p className="relative mt-2 text-[13.5px] text-[var(--ink-soft)]">
                {c.books.length === 1 ? "A single collection" : `${c.books.length} books`}
              </p>
              <p
                className={`relative mt-auto pt-5 text-[11.5px] tracking-wide ${
                  c.graded ? "text-[var(--gold)]" : "text-[var(--ink-faint)]"
                }`}
              >
                {c.count.toLocaleString()}{" "}
                {c.graded ? "authenticated narrations" : "narrations · not graded"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function HadithIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-10 sm:pt-16">
      <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
        The six books
      </p>
      <h1 className="display text-[40px] leading-tight text-[var(--ink)] sm:text-[50px]">
        Hadith
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
        {HADITH_TOTAL.toLocaleString()} narrations from the primary collections, every one
        of them authenticated. Where a narration sits outside al-Bukhārī and Muslim, the
        verdicts of the scholars on that exact chain are printed with it. Narrations the
        graders declared weak are not shown. A further {COMPILATION_TOTAL} come from the
        classic Forty collections, which our source carries without chain gradings; those
        are marked so you know the difference.
      </p>

      <Section
        title="Graded collections"
        note="Every narration shown here passed the grading rule. Weak ones are not displayed."
        keys={GRADED_ORDER}
      />

      <Section
        title="Reference collections"
        note="Widely used and topically arranged, but our source carries no chain gradings for them. Check an individual narration before relying on it."
        keys={UNGRADED_ORDER}
      />
    </div>
  );
}
