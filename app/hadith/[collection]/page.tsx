import type { Metadata } from "next";
import { clampDescription, OG_IMAGE } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, COLLECTION_ORDER } from "@/lib/hadith";

export function generateStaticParams() {
  return COLLECTION_ORDER.map((collection) => ({ collection }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection } = await params;
  const c = collections[collection];
  if (!c) return { title: "Not found", robots: { index: false, follow: false } };

  const title = `${c.name} · all books and narrations`;
  const description = clampDescription(
    `${c.name}, ${c.count.toLocaleString()} narrations across ${c.books.length} books. Read the Arabic with the authenticity grading shown on every hadith.`,
  );
  const path = `/hadith/${collection}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", images: [OG_IMAGE] },
  };
}

export default async function CollectionPage({
  params,
}: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const c = collections[collection];
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-10 sm:pt-14">
      <Link
        href="/hadith"
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← Hadith
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-7">
        <h1 className="display text-[36px] leading-tight text-[var(--ink)] sm:text-[44px]">
          {c.name}
        </h1>
        <p className="mt-3 text-[13.5px] text-[var(--ink-faint)]">
          {c.count.toLocaleString()} authenticated narrations across {c.books.length} books
        </p>
      </header>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        {c.books.map((b) => (
          <Link
            key={b.n}
            href={`/hadith/${collection}/${b.n}`}
            className="group flex items-baseline justify-between gap-4 rounded-lg border border-transparent px-4 py-3 transition-all hover:border-[var(--line)] hover:bg-[var(--card)]"
          >
            <span className="min-w-0">
              <span className="display text-[16.5px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                {b.title}
              </span>
            </span>
            <span className="shrink-0 text-[12px] text-[var(--ink-faint)] tabular-nums">
              {b.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
