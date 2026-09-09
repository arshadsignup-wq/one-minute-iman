import type { Metadata } from "next";
import Link from "next/link";
import { entries } from "@/lib/entries";
import { AYAT_TOTAL } from "@/lib/quran";
import { SITE_URL, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About One Minute Iman",
  description:
    "Who makes this, where every text comes from, and the rule that decides what is allowed on the site and what is refused.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About One Minute Iman",
    description: "Where every text comes from, and the rule that decides what is published.",
    url: "/about",
    type: "article",
    images: [OG_IMAGE],
  },
};

const curated = entries.filter((e) => e.tier === "curated").length;
const sahih = entries.filter((e) => e.source.grade === "Ṣaḥīḥ").length;
const hasan = entries.filter((e) => e.source.grade === "Ḥasan").length;

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="display text-[34px] leading-none text-[var(--green)]">{n}</div>
      <div className="mt-2 text-[13px] text-[var(--ink-faint)]">{label}</div>
    </div>
  );
}

export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-12 pb-16 sm:pt-16">
      <h1 className="display text-[40px] leading-tight text-[var(--ink)] sm:text-[48px]">
        About One Minute Iman
      </h1>
      <p className="mt-5 text-[17px] leading-[1.7] text-[var(--ink-soft)]">
        One Minute Iman exists to answer one question quickly and honestly: what did the
        Prophet say for the thing I am carrying right now, and can I trust that he said it?
      </p>

      <div className="mt-10 grid grid-cols-2 gap-8 border-y border-[var(--line)] py-8 sm:grid-cols-4">
        <Stat n={entries.length.toLocaleString()} label="verified entries" />
        <Stat n={curated.toLocaleString()} label="written out in full" />
        <Stat n={AYAT_TOTAL.toLocaleString()} label="Qurʾan verses" />
        <Stat n={(sahih + hasan).toLocaleString()} label="graded ṣaḥīḥ or ḥasan" />
      </div>

      <h2 className="display mt-14 text-[28px] text-[var(--ink)]">Where the texts come from</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        Qurʾanic text is the Uthmani script from Quran.com, with three English translations
        (Saheeh International, Abdel Haleem and Pickthall), transliteration, recitation by
        Mishari al-ʿAfasy, and the abridged tafsir of Ibn Kathīr on all {AYAT_TOTAL.toLocaleString()} verses.
        Hadith come from the primary collections, following the numbering used by Sunnah.com,
        with the gradings of four scholars recorded against each narration.
      </p>

      <h2 className="display mt-12 text-[28px] text-[var(--ink)]">The rule</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        Nothing reaches a page unless two things are true. The Arabic must appear in the
        primary source word for word, checked as a substring rather than retyped from
        memory. And the grading must pass: al-Bukhārī and Muslim are taken as authentic,
        and everywhere else the scholars who graded it strong must outnumber those who
        graded it weak. Where scholars disagree, the disagreement is stored and shown on
        the entry rather than hidden.
      </p>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        This is enforced by a script, not by judgement, and it runs on every build. It has
        caught real errors, including well known supplications that turned out to be graded
        weak by every grader consulted. Those were removed rather than published with a
        caveat.{" "}
        <Link href="/authenticity" className="text-[var(--sage)] underline underline-offset-4">
          The method is written out in full here
        </Link>
        , including examples of what was refused.
      </p>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        The rule has a blind spot worth naming. Checking that a passage appears in a
        source does not check that it is the <em>right</em> passage. One entry here was
        published against a narration that opened with the same five words as the
        supplication it was meant to show, and the check passed. It was found, corrected,
        and the pipeline now guards against it, but that is the kind of mistake software
        cannot be relied on to catch. If you spot one,{" "}
        <Link href="/corrections" className="text-[var(--sage)] underline underline-offset-4">
          please report it
        </Link>
        .
      </p>

      <h2 className="display mt-12 text-[28px] text-[var(--ink)]">What this site is not</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        It is not a fatwa service and it does not give rulings. Translations and the short
        commentary beside each entry are the work of this site, not of a scholar, and they
        have not been through formal scholarly review. Where you need a ruling on your own
        situation, ask someone qualified. Where a duʿā matters to you, the reference is
        printed beside it so you can check it against the source yourself.
      </p>
    </div>
  );
}
