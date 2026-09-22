import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, readBook, getBook } from "@/lib/hadith";
import { Grade } from "@/components/Cards";
import BookFilter from "@/components/BookFilter";

/**
 * One book of hadith, in pages.
 *
 * The largest book here holds 921 narrations, and rendering them all produced
 * 5.7MB of HTML — a blank screen for half a minute on a phone away from wifi,
 * before a word of it could be read. Ninety-five pages on this site were over a
 * megabyte. A book is now served a page at a time; /hadith/x/y is still the
 * first page, so nothing that was linked or indexed has moved.
 */
export const PER_PAGE = 80;

export function bookPageCount(collection: string, book: number) {
  return Math.max(1, Math.ceil(readBook(collection, book).length / PER_PAGE));
}

export default async function BookView({
  collection,
  book,
  page,
}: { collection: string; book: number; page: number }) {
  const c = collections[collection];
  const b = getBook(collection, book);
  if (!c || !b) notFound();

  const all = readBook(collection, book);
  const pageCount = Math.max(1, Math.ceil(all.length / PER_PAGE));
  if (page < 1 || page > pageCount) notFound();
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const books = c.books;
  const i = books.findIndex((x) => x.n === b.n);
  const prev = i > 0 ? books[i - 1] : null;
  const next = i < books.length - 1 ? books[i + 1] : null;
  const href = (p: number) =>
    p === 1 ? `/hadith/${collection}/${book}` : `/hadith/${collection}/${book}/${p}`;

  return (
    <div className="mx-auto max-w-3xl px-6 pt-10 pb-10 sm:pt-14">
      <Link
        href={`/hadith/${collection}`}
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← {c.name}
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-7">
        <h1 className="display text-[32px] leading-tight text-[var(--ink)] sm:text-[40px]">
          {b.title}
        </h1>
        <p className="mt-3 text-[13.5px] text-[var(--ink-faint)]">
          {c.name} · {all.length}{" "}
          {c.graded ? "authenticated narrations" : "narrations"}
          {pageCount > 1 && ` · page ${page} of ${pageCount}`}
        </p>
        {!c.graded && (
          <p className="mt-4 rounded-lg bg-[var(--gold-bg)] p-4 text-[13px] leading-relaxed text-[var(--ink-soft)]">
            Our source carries no chain grading for this compilation. Most of these
            narrations are drawn from al-Bukhārī and Muslim, but check any individual one
            before relying on it.
          </p>
        )}
      </header>

      <BookFilter count={items.length} page={page} pageCount={pageCount} />

      <div className="divide-y divide-[var(--line-soft)]">
        {items.map((h) => (
          <article
            key={h.n}
            id={`h${h.n}`}
            data-hadith={`${h.n} ${h.en.toLowerCase()}`}
            className="scroll-mt-24 py-9"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <a
                href={`#h${h.n}`}
                className="display text-[13px] text-[var(--green)] transition-colors hover:text-[var(--sage)]"
              >
                {c.name} {h.n}
              </a>
              <Grade g={h.g} />
            </div>

            {h.ar && (
              <p className="arabic text-right text-[21px] leading-[2.15] text-[var(--ink)]">
                {h.ar}
              </p>
            )}
            <p className="mt-5 text-[15.5px] leading-[1.8] text-[var(--ink-soft)]">{h.en}</p>

            {h.v.length > 0 && (
              <details className="mt-5 group">
                <summary className="cursor-pointer list-none text-[12.5px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]">
                  Gradings ({h.v.length})
                </summary>
                <ul className="mt-3 space-y-1.5 border-l-2 border-[var(--pale)] pl-4">
                  {h.v.map((g) => (
                    <li key={g} className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                      {g}
                    </li>
                  ))}
                </ul>
                {h.w.length > 0 && (
                  <p className="mt-3 rounded-md bg-[var(--paper-2)] p-3 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                    Scholars differ on this chain. {h.w.join("; ")}. The majority
                    authenticate it.
                  </p>
                )}
              </details>
            )}

            <a
              href={`https://sunnah.com/${collection}:${h.n}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-[12.5px] text-[var(--sage)] underline underline-offset-4"
            >
              Read it at the source ↗
            </a>
          </article>
        ))}
      </div>

      {pageCount > 1 && (
        <nav
          className="mt-10 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-8"
          aria-label={`Pages of ${b.title}`}
        >
          {Array.from({ length: pageCount }, (_, k) => k + 1).map((p) => (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 text-[13.5px] transition-all ${
                p === page
                  ? "border-[var(--sage)] bg-[var(--card)] text-[var(--green)]"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--sage)] hover:text-[var(--green)]"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-8">
        {prev ? (
          <Link
            href={`/hadith/${collection}/${prev.n}`}
            className="max-w-[45%] truncate rounded-full border border-[var(--line)] px-4 py-2 text-[13px] text-[var(--green)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)]"
          >
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link
            href={`/hadith/${collection}/${next.n}`}
            className="max-w-[45%] truncate rounded-full border border-[var(--line)] px-4 py-2 text-[13px] text-[var(--green)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)]"
          >
            {next.title} →
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
