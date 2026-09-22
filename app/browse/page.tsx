import { OG_IMAGE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { categories, situationsInCategory } from "@/lib/search";
import { TOTAL } from "@/lib/corpus";
import Seek from "@/components/Seek";

export const metadata: Metadata = {
  title: "Browse duʿās, verses and hadith by feeling",
  description:
    "Every duʿā, verse and hadith grouped by the situation it speaks to: anxiety, grief, debt, illness, forgiveness and travel.",
  alternates: { canonical: "/browse" },
  openGraph: {
    title: "Browse every duʿā, verse and hadith by feeling",
    description: "Grouped by the situation it speaks to: anxiety, grief, debt, illness, forgiveness and more.",
    url: "/browse", type: "website", images: [OG_IMAGE] },
};

export default function Browse() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-8 sm:pt-16">
      <h1 className="display text-[40px] leading-tight text-[var(--ink)] sm:text-[48px]">
        Browse by situation
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
        {TOTAL.toLocaleString()} verified entries, sorted by what a person is
        actually going through.
      </p>
      <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-[var(--ink-faint)]">
        The number beside each situation counts everything filed under it. An entry
        that answers two situations is listed under both, so these overlap rather
        than add up.
      </p>

      {/* The site's SearchAction advertises /browse?q=, so the query has to do
          something here; it previously landed on the unfiltered directory. The
          value is read in the browser so this page stays static. */}
      <div className="mt-8">
        <Seek />
      </div>

      {/* 45 situations under nine headings is a long scroll to search by eye.
          These were the links the home page already pointed at; they only
          started working when the page stopped asking for a smooth scroll. */}
      <nav
        aria-label="Jump to an area of life"
        className="mt-12 flex flex-wrap gap-2 border-y border-[var(--line-soft)] py-4"
      >
        {Object.entries(categories).map(([key, [label]]) => (
          <a
            key={key}
            href={`#${key}`}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-3.5 text-[13px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)] sm:min-h-0 sm:py-1.5"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-14 space-y-16">
        {Object.entries(categories).map(([key, [label, blurb]]) => {
          const sits = situationsInCategory(key);
          return (
            <section key={key} id={key} className="scroll-mt-24">
              <div className="border-b border-[var(--line)] pb-3">
                <h2 className="display text-[27px] text-[var(--ink)]">{label}</h2>
                <p className="mt-1 text-[14px] text-[var(--ink-soft)]">{blurb}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {sits.map((s) => (
                  <Link
                    key={s.id}
                    href={`/s/${s.id}`}
                    className="group flex items-baseline justify-between gap-4 rounded-lg border border-transparent px-3 py-3 transition-all hover:border-[var(--line)] hover:bg-[var(--card)]"
                  >
                    <span>
                      <span className="display text-[19px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                        {s.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-[var(--ink-faint)]">
                        {s.blurb}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12.5px] text-[var(--ink-faint)] tabular-nums">
                      {s.count}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
