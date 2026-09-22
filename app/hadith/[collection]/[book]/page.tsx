import type { Metadata } from "next";
import { clampDescription, OG_IMAGE } from "@/lib/site";
import { collections, COLLECTION_ORDER, getBook } from "@/lib/hadith";
import BookView from "@/components/BookView";

export function generateStaticParams() {
  return COLLECTION_ORDER.flatMap((collection) =>
    (collections[collection]?.books ?? []).map((b) => ({
      collection,
      book: String(b.n),
    }))
  );
}

export async function generateMetadata({
  params,
}: { params: Promise<{ collection: string; book: string }> }): Promise<Metadata> {
  const { collection, book } = await params;
  const c = collections[collection];
  const b = getBook(collection, Number(book));
  if (!c || !b) return { title: "Not found", robots: { index: false, follow: false } };

  const title = `${b.title} · ${c.name}`;
  const description = clampDescription(
    `${b.title}, book ${b.n} of ${c.name}, ${b.count} narrations. Arabic and English with the authenticity grading on each one.`,
  );
  const path = `/hadith/${collection}/${b.n}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "article", images: [OG_IMAGE] },
  };
}

export default async function BookPage({
  params,
}: { params: Promise<{ collection: string; book: string }> }) {
  const { collection, book } = await params;
  return <BookView collection={collection} book={Number(book)} page={1} />;
}
