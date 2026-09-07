import Link from "next/link";
import { surahs, AYAT_TOTAL } from "@/lib/quran";
import QuranSearch from "@/components/QuranSearch";

export const metadata = { title: "The Qur'an · One Minute Iman" };

export default function QuranIndex() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-12 pb-10 sm:pt-16">
      <p className="mb-2 text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
        Complete
      </p>
      <h1 className="display text-[40px] leading-tight text-[var(--ink)] sm:text-[50px]">
        The Qur&apos;an
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
        All {surahs.length} sūrahs and {AYAT_TOTAL.toLocaleString()} āyāt, in the Uthmani
        script with an English translation beside each verse.
      </p>

      <QuranSearch />

      <h2 className="display mt-16 mb-6 text-[26px] text-[var(--ink)]">All sūrahs</h2>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {surahs.map((s) => (
          <Link
            key={s.n}
            href={`/quran/${s.n}`}
            className="group flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--sage)] hover:shadow-[0_12px_30px_-20px_var(--shadow)]"
          >
            <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--paper-2)] text-[13px] text-[var(--green)]">
              {s.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="display block truncate text-[17px] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                {s.name}
              </span>
              <span className="block truncate text-[12px] text-[var(--ink-faint)]">
                {s.translated} · {s.count} āyāt · {s.revelation === "makkah" ? "Makkan" : "Madinan"}
              </span>
            </span>
            <span className="arabic shrink-0 text-[17px] text-[var(--sage)]">{s.arabic}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
