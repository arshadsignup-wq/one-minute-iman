import Link from "next/link";
import { notFound } from "next/navigation";
import { situations, sitById, entriesFor, categories } from "@/lib/search";
import { EntryCard, EntryRow } from "@/components/Cards";

export function generateStaticParams() {
  return situations.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = sitById.get(id);
  return s
    ? { title: `${s.label} · One Minute Iman`, description: s.blurb }
    : { title: "Not found" };
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

  return (
    <div className="mx-auto max-w-5xl px-6 pt-10 sm:pt-14">
      <Link
        href="/browse"
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← {catLabel}
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-8">
        <h1 className="display text-[40px] leading-tight text-[var(--ink)] sm:text-[50px]">
          {sit.label}
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
          {sit.blurb}
        </p>
        <p className="mt-5 text-[13px] text-[var(--ink-faint)]">
          {all.length} verified {all.length === 1 ? "supplication" : "supplications"}
          {featured.length > 0 && ` · ${featured.length} written out in full`}
        </p>
      </header>

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
    </div>
  );
}
