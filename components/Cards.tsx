import Link from "next/link";
import type { Row } from "@/lib/search";

export function Grade({ g }: { g: string }) {
  const quran = g === "Qur'an";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-medium ${
        quran
          ? "bg-[var(--gold-bg)] text-[var(--gold)]"
          : "bg-[var(--paper-2)] text-[var(--green)]"
      }`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current opacity-70" />
      {g}
    </span>
  );
}

/** A verified entry. The Arabic leads, because it is the thing itself. */
export function EntryCard({ row }: { row: Row }) {
  const curated = row.x === 1;
  return (
    <Link
      href={`/d/${row.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sage)] hover:shadow-[0_18px_44px_-24px_var(--shadow)]"
    >
      {/* a thread of gold that lights up on hover */}
      <span className="gold-rule absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {row.a && (
        <p
          className={`arabic text-[var(--green)] ${
            curated ? "mb-4 line-clamp-2 text-[20px]" : "mb-5 line-clamp-3 text-[21px]"
          }`}
        >
          {row.a}
        </p>
      )}

      {curated ? (
        <>
          <h3 className="display text-[20px] leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
            {row.t}
          </h3>
          {row.l && (
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
              {row.l}
            </p>
          )}
        </>
      ) : (
        row.l && (
          <p className="line-clamp-1 text-[12px] tracking-wide text-[var(--ink-faint)]">{row.l}</p>
        )
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-5">
        <Grade g={row.g} />
        <span className="text-[11.5px] text-[var(--ink-faint)]">{row.r}</span>
      </div>
    </Link>
  );
}

/** Compact row for dense lists. */
export function EntryRow({ row }: { row: Row }) {
  return (
    <Link
      href={`/d/${row.id}`}
      className="group flex items-center justify-between gap-6 rounded-xl px-4 py-4 transition-colors hover:bg-[var(--card)]"
    >
      <div className="min-w-0 flex-1">
        {row.a && (
          <p className="arabic line-clamp-1 text-[18px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
            {row.a}
          </p>
        )}
        <p className="mt-1 truncate text-[12px] text-[var(--ink-faint)]">
          {row.r}
          {row.l ? ` · ${row.l}` : ""}
        </p>
      </div>
      <Grade g={row.g} />
    </Link>
  );
}

/** Large category tile: gradient plus pattern, so the page has some life in it. */
export function CategoryCard({
  href, label, blurb, tags, count,
}: { href: string; label: string; blurb: string; tags: string[]; count: number }) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sage)] hover:shadow-[0_18px_44px_-24px_var(--shadow)]"
      style={{
        background:
          "linear-gradient(155deg, var(--card) 0%, var(--paper-2) 100%)",
      }}
    >
      <span
        className="pattern pointer-events-none absolute -top-4 -right-4 h-24 w-24 opacity-30 transition-opacity duration-500 group-hover:opacity-60"
        aria-hidden="true"
      />
      <h3 className="display relative text-[22px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
        {label}
      </h3>
      <p className="relative mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">{blurb}</p>
      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-[var(--card)]/80 px-2.5 py-1 text-[11.5px] text-[var(--ink-soft)] ring-1 ring-[var(--line-soft)]"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="relative mt-auto pt-5 text-[11.5px] tracking-wide text-[var(--gold)]">
        {count.toLocaleString()} supplications
      </p>
    </Link>
  );
}
