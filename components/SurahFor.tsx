"use client";

import Link from "next/link";
import surahForRaw from "@/data/surah-for.json";

type Ref = { collection: string; number: number; grade: string; verdicts: string[] };
type Link_ = {
  surahs: { n: number; name: string; translated: string }[];
  says: string;
  ref: Ref;
};
type Absent = {
  surahs: number[];
  situations: string[];
  claim: string;
  verdict: string;
  detail: string;
};

const DATA = surahForRaw as unknown as {
  for: Record<string, Link_[]>;
  absent: Absent[];
};

const COLLECTION: Record<string, string> = {
  bukhari: "Ṣaḥīḥ al-Bukhārī",
  muslim: "Ṣaḥīḥ Muslim",
  abudawud: "Sunan Abī Dāwūd",
  tirmidhi: "Jāmiʿ at-Tirmidhī",
  nasai: "Sunan an-Nasā'ī",
  ibnmajah: "Sunan Ibn Mājah",
  malik: "Muwaṭṭaʾ Mālik",
};

/**
 * The sūrahs a narration ties to this situation — and, where there is one, the
 * famous claim that does not hold.
 *
 * Both halves matter. Someone told to recite al-Wāqiʿah for money has been told
 * something, and an empty page does not answer them; the verdict does. Leaving
 * the unsupported claim out would look like the site had never heard of it.
 */
export default function SurahFor({
  situation,
  compact = false,
}: {
  situation: string;
  compact?: boolean;
}) {
  const links = DATA.for[situation] ?? [];
  const absent = DATA.absent.filter((a) => a.situations.includes(situation));
  if (!links.length && !absent.length) return null;

  return (
    <section
      className={
        compact
          ? "mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-6"
          : "mt-12 border-t border-[var(--line)] pt-10"
      }
    >
      <h2 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
        From the Qur&apos;an
      </h2>

      {links.length > 0 && (
        <>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">
            Sūrahs a narration names for this, with the narration beside each one.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {links.map((l, i) => (
              <div
                key={`${l.ref.collection}-${l.ref.number}-${i}`}
                className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-5"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {l.surahs.map((s, n) => (
                    <span key={s.n} className="display text-[17px] text-[var(--green)]">
                      <Link href={`/quran/${s.n}`} className="hover:underline underline-offset-4">
                        {s.name}
                      </Link>
                      {n < l.surahs.length - 1 && <span className="text-[var(--ink-faint)]">,</span>}
                    </span>
                  ))}
                  <span className="text-[12px] text-[var(--ink-faint)]">
                    {l.surahs.map((s) => `${s.n}`).join(" · ")}
                  </span>
                </div>

                <p className="mt-3 text-[14.5px] leading-[1.75] text-[var(--ink-soft)]">
                  {l.says}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--pale)] px-2.5 py-0.5 text-[11.5px] text-[var(--green)]">
                    {l.ref.grade}
                  </span>
                  <span className="text-[12px] text-[var(--ink-faint)]">
                    {COLLECTION[l.ref.collection] ?? l.ref.collection} {l.ref.number}
                  </span>
                </div>

                {l.ref.verdicts.length > 0 && (
                  <details className="mt-3 group">
                    <summary className="cursor-pointer list-none text-[12px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]">
                      Gradings ({l.ref.verdicts.length})
                    </summary>
                    <ul className="mt-2 space-y-1 border-l-2 border-[var(--pale)] pl-3">
                      {l.ref.verdicts.map((v) => (
                        <li key={v} className="text-[12px] leading-relaxed text-[var(--ink-soft)]">
                          {v}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {absent.map((a) => (
        <div
          key={a.claim}
          className="mt-6 rounded-xl border border-[var(--gold)] bg-[var(--gold-bg)] p-5"
        >
          <p className="text-[11px] tracking-[0.16em] text-[var(--gold)] uppercase">
            {a.verdict}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink)]">{a.claim}</p>
          <p className="mt-3 text-[13.5px] leading-[1.75] text-[var(--ink-soft)]">{a.detail}</p>
        </div>
      ))}
    </section>
  );
}
