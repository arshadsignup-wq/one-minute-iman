import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { situations, sitById, entriesFor, categories } from "@/lib/search";
import { SITE_URL, clampDescription, OG_IMAGE } from "@/lib/site";
import { EntryCard, EntryRow } from "@/components/Cards";
import hubCopy from "@/data/hub-copy.json";

type HubCopy = { answer: string; faq: string[][] };

export function generateStaticParams() {
  return situations.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = sitById.get(id);
  if (!s) return { title: "Not found", robots: { index: false, follow: false } };

  const n = entriesFor(s.id).length;
  const label = s.label.replace(/\s*&\s*/g, " and ").toLowerCase();
  // people search "dua for anxiety", not "anxiety & worry"
  const title = `Duʿā for ${label}`;
  const description = clampDescription(
    `${n} duʿās, verses and authentic hadith for ${label}, each with its source and authenticity grading shown.`,
  );
  const path = `/s/${s.id}`;

  return {
    title,
    description,
    keywords: [...(s.feelings || []).slice(0, 12), `dua for ${label}`, `islamic dua ${label}`],
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

export default async function SituationPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sit = sitById.get(id);
  if (!sit) notFound();

  const all = entriesFor(sit.id);
  const featured = all.filter((r) => r.x === 1);
  const rest = all.filter((r) => r.x === 0);
  const [catLabel] = categories[sit.cat] ?? ["", ""];


  const label = sit.label.replace(/\s*&\s*/g, " and ").toLowerCase();
  const copy = (hubCopy as unknown as Record<string, HubCopy | undefined>)[sit.id];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/s/${sit.id}#page`,
        name: `Duʿā for ${label}`,
        description: sit.blurb,
        url: `${SITE_URL}/s/${sit.id}`,
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "ItemList",
        numberOfItems: all.length,
        itemListElement: all.slice(0, 25).map((r, n) => ({
          "@type": "ListItem",
          position: n + 1,
          name: r.t,
          url: `${SITE_URL}/d/${r.id}`,
        })),
      },
      // FAQPage is only emitted when the questions are visibly on the page
      ...(copy && copy.faq.length
        ? [{
            "@type": "FAQPage",
            "@id": `${SITE_URL}/s/${sit.id}#faq`,
            mainEntity: copy.faq.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Browse", item: `${SITE_URL}/browse` },
          { "@type": "ListItem", position: 3, name: sit.label, item: `${SITE_URL}/s/${sit.id}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    <div className="mx-auto max-w-5xl px-6 pt-10 sm:pt-14">
      <Link
        href="/browse"
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← {catLabel}
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-8">
        <h1 className="display text-[40px] leading-tight text-[var(--ink)] sm:text-[50px]">
          {`Du\u02BFā for ${label}`}
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
          {sit.blurb}
        </p>
        <p className="mt-5 text-[13px] text-[var(--ink-faint)]">
          {all.length} verified {all.length === 1 ? "supplication" : "supplications"}
          {featured.length > 0 && ` · ${featured.length} written out in full`}
        </p>
      </header>

      {/* The direct answer. First thing a reader or an answer engine sees, and the
          only prose on the page that names a specific supplication and its grading. */}
      {copy && (
        <section className="mt-8 border-l-2 border-[var(--gold)] pl-5">
          <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
            The short answer
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-[1.7] text-[var(--ink)]">
            {copy.answer}
          </p>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <EntryCard key={r.id} row={r} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="mt-14 pb-8">
          <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
            From the wider collections
          </h2>
          <p className="mt-2 mb-4 max-w-lg text-[13.5px] leading-relaxed text-[var(--ink-faint)]">
            Each of these passed the same grading rule. They are shown with the source
            narration rather than a written-out translation.
          </p>
          <div>
            {rest.map((r) => (
              <EntryRow key={r.id} row={r} />
            ))}
          </div>
        </section>
      )}

      {copy && copy.faq.length > 0 && (
        <section className="mt-16 border-t border-[var(--line)] pt-10">
          <h2 className="display text-[30px] leading-tight text-[var(--ink)]">
            Common questions
          </h2>
          <dl className="mt-6 max-w-2xl space-y-7">
            {copy.faq.map(([q, a]) => (
              <div key={q}>
                <dt className="text-[17px] leading-snug text-[var(--ink)]">{q}</dt>
                <dd className="mt-2 text-[15.5px] leading-[1.75] text-[var(--ink-soft)]">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
    </>
  );
}
