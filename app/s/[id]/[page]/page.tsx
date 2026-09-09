import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { situations, sitById, entriesFor } from "@/lib/search";
import { EntryRow } from "@/components/Cards";

/** Kept in step with the first page of the hub. */
const PER_PAGE = 60;

function pagesFor(sitId: string) {
  const rest = entriesFor(sitId).filter((r) => r.x === 0);
  return Math.max(1, Math.ceil(rest.length / PER_PAGE));
}

export function generateStaticParams() {
  const out: { id: string; page: string }[] = [];
  for (const s of situations) {
    // page 1 is the hub itself at /s/<id>
    for (let n = 2; n <= pagesFor(s.id); n++) out.push({ id: s.id, page: String(n) });
  }
  return out;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string; page: string }> }): Promise<Metadata> {
  const { id, page } = await params;
  const sit = sitById.get(id);
  if (!sit) return { title: "Not found", robots: { index: false, follow: false } };
  const label = sit.label.replace(/\s*&\s*/g, " and ").toLowerCase();
  return {
    title: `Duʿā for ${label}, page ${page}`,
    description: `More narrations for ${label}, continued from the main page.`,
    alternates: { canonical: `/s/${id}/${page}` },
    // A continuation of a list, with no prose of its own. It stays crawlable so
    // the entries on it are reachable, but it is not a landing page.
    robots: { index: false, follow: true },
  };
}

export default async function SituationPageN({
  params,
}: { params: Promise<{ id: string; page: string }> }) {
  const { id, page } = await params;
  const sit = sitById.get(id);
  if (!sit) notFound();

  const rest = entriesFor(sit.id).filter((r) => r.x === 0);
  const pageCount = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const n = Number.parseInt(page, 10);
  if (!Number.isFinite(n) || n < 2 || n > pageCount) notFound();

  const slice = rest.slice((n - 1) * PER_PAGE, n * PER_PAGE);
  const label = sit.label.replace(/\s*&\s*/g, " and ").toLowerCase();

  return (
    <div className="mx-auto max-w-5xl px-6 pt-10 pb-8 sm:pt-14">
      <Link
        href={`/s/${sit.id}`}
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← {sit.label}
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-6">
        <h1 className="display text-[32px] leading-tight text-[var(--ink)] sm:text-[38px]">
          {`Duʿā for ${label}`}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--ink-faint)]">
          From the wider collections · page {n} of {pageCount}
        </p>
      </header>

      <div className="mt-8">
        {slice.map((r) => (
          <EntryRow key={r.id} row={r} />
        ))}
      </div>

      <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label="Pages">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={p === 1 ? `/s/${sit.id}` : `/s/${sit.id}/${p}`}
            aria-current={p === n ? "page" : undefined}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 text-[13.5px] transition-all ${
              p === n
                ? "border-[var(--sage)] bg-[var(--card)] text-[var(--green)]"
                : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--sage)] hover:text-[var(--green)]"
            }`}
          >
            {p}
          </Link>
        ))}
        <span className="ml-2 text-[13px] text-[var(--ink-faint)]">
          {rest.length.toLocaleString()} in total
        </span>
      </nav>
    </div>
  );
}
