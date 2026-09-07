import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { entries, getEntry, type Entry } from "@/lib/entries";
import { SITE_URL, clampDescription, OG_IMAGE } from "@/lib/site";
import { sitById } from "@/lib/search";
import Prose from "@/components/Prose";
import { Grade } from "@/components/Cards";

export function generateStaticParams() {
  return entries.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = getEntry(id);
  if (!e) return { title: "Not found", robots: { index: false, follow: false } };

  const src =
    e.source.kind === "quran"
      ? `Qur'an ${e.source.reference}`
      : `${e.source.collection} ${e.source.number}`;
  // lead with the meaning, then the reference and grading, which is what people scan for
  const description = clampDescription(
    [e.trans || e.lede, `${src}, graded ${e.source.grade}.`].filter(Boolean).join(" "),
  );
  const path = `/d/${e.id}`;

  return {
    title: e.title,
    description,
    alternates: { canonical: path },
    openGraph: { title: e.title, description, url: path, type: "article", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: e.title, description, images: [OG_IMAGE] },
  };
}

/** Marks the page up as a quotation with its source, so the grading can surface. */
function entrySchema(e: Entry) {
  const src =
    e.source.kind === "quran"
      ? `Qur'an ${e.source.reference}`
      : `${e.source.collection} ${e.source.number}`;
  return {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "@id": `${SITE_URL}/d/${e.id}#quote`,
    name: e.title,
    text: e.trans || e.arabic,
    inLanguage: "en",
    spokenByCharacter: e.source.kind === "hadith" ? "Prophet Muhammad" : undefined,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    citation: src,
    url: `${SITE_URL}/d/${e.id}`,
    ...(e.story || e.note
      ? { description: clampDescription(e.story || e.note || "", 300) }
      : {}),
  };
}

function breadcrumb(e: Entry) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Browse", item: `${SITE_URL}/browse` },
      { "@type": "ListItem", position: 3, name: e.title, item: `${SITE_URL}/d/${e.id}` },
    ],
  };
}

function Rule() {
  return (
    <div className="my-12 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-12 bg-[var(--line)]" />
      <span className="h-1 w-1 rotate-45 bg-[var(--pale)]" />
      <span className="h-px w-12 bg-[var(--line)]" />
    </div>
  );
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getEntry(id);
  if (!d) notFound();

  const ref =
    d.source.kind === "quran"
      ? `The Qur'an · ${d.source.reference}`
      : `${d.source.collection} · ${d.source.number}`;

  const sits = d.situations.map((s) => sitById.get(s)).filter(Boolean);
  const isTeaching = (d as { mode?: string }).mode === "teaching";
  // Qur'anic translations often already carry quotation marks; do not double them
  const alreadyQuoted = /["“”']\s*$/.test(d.trans || "") || /^\s*["“”']/.test(d.trans || "");
  const isLibrary = d.tier === "library";


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entrySchema(d)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb(d)) }}
      />
    <article className="mx-auto max-w-2xl px-6 pt-8 sm:pt-12">
      <Link
        href={sits[0] ? `/s/${sits[0]!.id}` : "/browse"}
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← {sits[0] ? sits[0]!.label : "Browse"}
      </Link>

      <header className="mt-7">
        {isLibrary ? (
          <>
            <p className="text-[12px] tracking-[0.14em] text-[var(--sage)] uppercase">
              {d.lede || "From the collections"}
            </p>
            <h1 className="display mt-2 text-[30px] leading-tight text-[var(--ink)] sm:text-[36px]">
              {d.title}
            </h1>
          </>
        ) : (
          <>
            <h1 className="display text-[34px] leading-[1.15] text-[var(--ink)] sm:text-[44px]">
              {d.title}
            </h1>
            {d.lede && (
              <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-soft)]">
                {d.lede}
              </p>
            )}
          </>
        )}
      </header>

      <Rule />

      <section className="rise">
        <p className="arabic text-center text-[28px] text-[var(--ink)] sm:text-[34px]">
          {d.arabic}
        </p>

        {d.translit && (
          <div className="mt-8 text-center">
            <p className="text-[15px] leading-relaxed text-[var(--sage)] italic">
              {d.translit}
            </p>
            {(d as { translit_auto?: boolean }).translit_auto && (
              <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                Transliteration generated from the Arabic vowel marks
              </p>
            )}
          </div>
        )}

        {d.trans && (
          <p
            className={`mx-auto mt-8 max-w-xl text-center leading-relaxed text-[var(--ink)] ${
              isTeaching ? "text-[17px]" : "display text-[21px] sm:text-[23px]"
            }`}
          >
            {isTeaching || alreadyQuoted ? d.trans : `“${d.trans}”`}
          </p>
        )}
      </section>

      {d.note && (
        <Prose
          text={d.note}
          className="mx-auto mt-10 max-w-xl border-l-2 border-[var(--pale)] pl-5 text-[14px] leading-relaxed text-[var(--ink-soft)]"
        />
      )}

      {d.story && (
        <>
          <Rule />
          <section>
            <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
              Where this comes from
            </h2>
            <Prose text={d.story} className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]" />
          </section>
        </>
      )}

      {/* the full narration: the context the supplication sits in */}
      {d.english_full && (
        <section className="mt-14">
          <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
            The full narration
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-[var(--ink-soft)]">
            {d.english_full}
          </p>
        </section>
      )}

      <section className="mt-14 rounded-xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-7">
        <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
          Source
        </h2>
        <p className="display mt-3 text-[21px] text-[var(--ink)]">{ref}</p>
        <div className="mt-4">
          <Grade g={d.source.grade} />
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-[var(--line-soft)] pt-5">
          {d.source.gradings.map((g) => (
            <li key={g} className="text-[13px] leading-relaxed text-[var(--ink-soft)]">
              {g}
            </li>
          ))}
        </ul>

        {d.dissent && (
          <p className="mt-5 rounded-md bg-[var(--paper-2)] p-4 text-[13px] leading-relaxed text-[var(--ink-soft)]">
            <strong className="font-medium text-[var(--ink)]">Note on the chain. </strong>
            {d.dissent}
          </p>
        )}
        {d.parallel && (
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--ink-faint)]">{d.parallel}</p>
        )}

        <a
          href={d.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-[13px] text-[var(--sage)] underline underline-offset-4 transition-colors hover:text-[var(--green)]"
        >
          Read it at the source ↗
        </a>
      </section>

      {sits.length > 0 && (
        <section className="mt-12 pb-6">
          <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
            Turn to this when
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {sits.map((s) => (
              <Link
                key={s!.id}
                href={`/s/${s!.id}`}
                className="rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[13px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]"
              >
                {s!.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
    </>
  );
}
