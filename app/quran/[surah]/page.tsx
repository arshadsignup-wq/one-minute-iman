import type { Metadata } from "next";
import { clampDescription, OG_IMAGE } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { surahs, getSurah } from "@/lib/quran";
import AyahView from "@/components/AyahView";
import Tafsir from "@/components/Tafsir";
import { readTafsir } from "@/lib/tafsir";

export function generateStaticParams() {
  return surahs.map((s) => ({ surah: String(s.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ surah: string }> }): Promise<Metadata> {
  const { surah } = await params;
  const s = getSurah(Number(surah));
  if (!s) return { title: "Not found", robots: { index: false, follow: false } };

  const title = `Surah ${s.name} (${s.translated}) · Arabic, translation and tafsir`;
  const description = clampDescription(
    `Surah ${s.name}, chapter ${s.n} of the Qurʾan, ${s.count} verses revealed in ${s.revelation === "makkah" ? "Makkah" : "Madinah"}. Arabic with three English translations, transliteration, recitation and Ibn Kathīr's tafsir.`,
  );
  const path = `/quran/${s.n}`;

  return {
    title,
    description,
    keywords: [`surah ${s.name}`, `surah ${s.name} translation`, `surah ${s.name} tafsir`, s.translated, `chapter ${s.n} quran`],
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "article", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

export default async function SurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = await params;
  const n = Number(surah);
  const s = getSurah(n);
  if (!s) notFound();

  const tafsir = readTafsir(n);
  const prev = getSurah(n - 1);
  const next = getSurah(n + 1);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-10 pb-10 sm:pt-14">
      <Link
        href="/quran"
        className="text-[13px] text-[var(--ink-faint)] transition-colors hover:text-[var(--green)]"
      >
        ← The Qur&apos;an
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-8 text-center">
        <p className="arabic text-[36px] text-[var(--green)]">{s.arabic}</p>
        <h1 className="display mt-3 text-[34px] leading-tight text-[var(--ink)] sm:text-[40px]">
          {s.n}. {s.name}
        </h1>
        <p className="mt-2 text-[14.5px] text-[var(--ink-soft)]">{s.translated}</p>
        <p className="mt-3 text-[12.5px] text-[var(--ink-faint)]">
          {s.count} āyāt · {s.revelation === "makkah" ? "Revealed in Makkah" : "Revealed in Madinah"}
        </p>
      </header>

      <AyahView verses={s.verses} />

      <Tafsir blocks={tafsir} surah={n} />

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-8">
        {prev ? (
          <Link
            href={`/quran/${prev.n}`}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] text-[var(--green)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)]"
          >
            ← {prev.name}
          </Link>
        ) : <span />}
        {next ? (
          <Link
            href={`/quran/${next.n}`}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-[13.5px] text-[var(--green)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)]"
          >
            {next.name} →
          </Link>
        ) : <span />}
      </nav>

      <p className="mt-8 text-center text-[12px] text-[var(--ink-faint)]">
        Text, translations and recitation via Quran.com · recitation by Mishari Rashid
        al-ʿAfasy · transliteration generated from the vowel marks
      </p>
    </div>
  );
}
