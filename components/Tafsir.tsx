import type { TafsirBlock } from "@/lib/tafsir";

export default function Tafsir({
  blocks, surah,
}: { blocks: TafsirBlock[]; surah: number }) {
  if (!blocks.length) return null;
  return (
    <section className="mt-16 border-t border-[var(--line)] pt-10">
      <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
        Commentary
      </p>
      <h2 className="display text-[27px] text-[var(--ink)]">Ibn Kathīr, abridged</h2>
      <p className="mt-2 mb-7 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
        Passage by passage. Open a section to read it.
      </p>

      <div className="space-y-3">
        {blocks.map((b) => (
          <details
            key={`${b.from}-${b.to}`}
            className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-5 py-4"
          >
            <summary className="cursor-pointer list-none text-[14px] text-[var(--green)] transition-colors hover:text-[var(--sage)]">
              {b.from === b.to
                ? `Āyah ${surah}:${b.from}`
                : `Āyāt ${surah}:${b.from}–${b.to}`}
            </summary>
            <div className="mt-4 space-y-3 border-t border-[var(--line-soft)] pt-4">
              {b.text.split("\n\n").map((para, i) => (
                <p key={i} className="text-[14.5px] leading-[1.85] text-[var(--ink-soft)]">
                  {para}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
