import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clampDescription, OG_IMAGE } from "@/lib/site";
import { collections, COLLECTION_ORDER, getBook } from "@/lib/hadith";
import BookView, { bookPageCount } from "@/components/BookView";

/** Pages two and up. Page one stays at /hadith/{collection}/{book}, so every
 *  link and every indexed URL that existed before still lands where it did. */
export function generateStaticParams() {
  return COLLECTION_ORDER.flatMap((collection) =>
    (collections[collection]?.books ?? []).flatMap((b) => {
      const count = bookPageCount(collection, b.n);
      return Array.from({ length: Math.max(0, count - 1) }, (_, i) => ({
        collection,
        book: String(b.n),
        page: String(i + 2),
      }));
    }),
  );
}

export async function generateMetadata({
  params,
}: { params: Promise<{ collection: string; book: string; page: string }> }): Promise<Metadata> {
  const { collection, book, page } = await params;
  const c = collections[collection];
  const b = getBook(collection, Number(book));
  if (!c || !b) return { title: "Not found", robots: { index: false, follow: false } };

  const title = `${b.title} · page ${page} · ${c.name}`;
  const description = clampDescription(
    `${b.title}, book ${b.n} of ${c.name}, page ${page}. Arabic and English with the authenticity grading on each narration.`,
  );
  const path = `/hadith/${collection}/${b.n}/${page}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "article", images: [OG_IMAGE] },
  };
}

export default async function BookPagePaged({
  params,
}: { params: Promise<{ collection: string; book: string; page: string }> }) {
  const { collection, book, page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();
  return <BookView collection={collection} book={Number(book)} page={n} />;
}
