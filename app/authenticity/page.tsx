import { OG_IMAGE } from "@/lib/site";
import type { Metadata } from "next";
import notEstablished from "@/data/not-established.json";
import { TOTAL, CURATED } from "@/lib/corpus";

export const metadata: Metadata = {
  title: "How every entry is verified",
  description:
    "What is checked automatically before an entry is published, what those checks establish, and what they cannot establish.",
  alternates: { canonical: "/authenticity" },
  openGraph: {
    title: "How every entry on One Minute Iman is verified",
    description: "What the automated checks establish, what they do not, and what was refused.",
    url: "/authenticity", type: "article", images: [OG_IMAGE] },
};

const steps = [
  {
    n: "01",
    h: "Primary sources only",
    p: "Nothing here was copied from a du'ā website, a social post, or a video. Qur'anic text comes from Quran.com in the Uthmani script. Hadith come from the primary collections (al-Bukhārī, Muslim, Abū Dāwūd, at-Tirmidhī, an-Nasā'ī, Ibn Mājah and Muwaṭṭa' Mālik).",
  },
  {
    n: "02",
    h: "The Arabic is extracted, not typed",
    p: "The Arabic shown is pulled out of the source text and machine-checked to be a verbatim substring of it. Nothing is transcribed by hand, so the wording on the page is the wording in the collection.",
  },
  {
    n: "03",
    h: "Every grading is read, not assumed",
    p: "For each hadith outside al-Bukhārī and Muslim we record the verdicts of the scholars listed for that exact narration, among them al-Albānī, Shuʿayb al-Arnāʾūṭ, Aḥmad Muḥammad Shākir, Bashār ʿAwwād Maʿrūf and Zubair Ali Zai, and print them in full on the entry's page.",
  },
  {
    n: "04",
    h: "Weak material is left out",
    p: "An entry is admitted only where the authenticating verdicts outnumber the weakening ones. 273 narrations were refused by this rule while the library was built. Where scholars genuinely differ we keep the entry and print the disagreement rather than quietly choosing a side. This is the site's rule for what to include. It is not itself a scholarly authentication.",
  },
];


export default function Authenticity() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-10 sm:pt-16">
      <h1 className="display text-[38px] leading-tight text-[var(--ink)] sm:text-[46px]">
        How we verify
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-soft)]">
        Because this is a matter of religion, every one of the {TOTAL.toLocaleString()} entries here
        had to pass the same checks before it was published. Those entries are
        supplications, Qur&apos;anic verses and narrations, and not all of them are things
        you say. This page sets out what is checked, and what those checks do not settle.
      </p>

      <div className="mt-14 space-y-11">
        {steps.map((s) => (
          <section key={s.n} className="flex gap-5 sm:gap-7">
            <span className="display shrink-0 text-[19px] text-[var(--pale)]">{s.n}</span>
            <div>
              <h2 className="display text-[23px] text-[var(--ink)]">{s.h}</h2>
              <p className="mt-2.5 text-[15px] leading-[1.75] text-[var(--ink-soft)]">{s.p}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-[var(--line)] pt-12">
        <h2 className="display text-[26px] text-[var(--ink)]">What these checks do not establish</h2>
        <p className="mt-4 text-[15px] leading-[1.75] text-[var(--ink-soft)]">
          The checks above are run by software. They can show that a passage of Arabic
          really appears in the collection it is credited to, and that the gradings
          recorded for it were read rather than assumed. They cannot show any of the
          following, and it would be wrong to imply otherwise:
        </p>
        <ul className="mt-5 space-y-2.5 text-[15px] leading-[1.7] text-[var(--ink-soft)]">
          {[
            "That the passage selected is the one the title and situation describe. A short anchor can occur in more than one narration.",
            "That the English translates the same words as the Arabic shown.",
            "That the transliteration reads the Arabic shown. Where it covers only part of a passage, the page says so.",
            "That a repetition count, a time of day, or a promised benefit belongs to that narration.",
            "That the situation an entry is filed under is the right one for your circumstances.",
            "That the translations, explanations and notes have been reviewed by a qualified scholar. They have not.",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--pale)]" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[15px] leading-[1.75] text-[var(--ink-soft)]">
          Errors of that kind have been found on this site and corrected. If you find
          another, please{" "}
          <a href="/corrections" className="text-[var(--sage)] underline underline-offset-4">
            report it
          </a>
          .
        </p>
      </section>

      <section className="mt-20 border-t border-[var(--line)] pt-12">
        <h2 className="display text-[30px] text-[var(--ink)]">
          Widely shared, but not established
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-soft)]">
          These are kept off the site on purpose. They are printed here because knowing
          what did <em>not</em> pass is part of trusting what did.
        </p>

        <div className="mt-10 space-y-9">
          {notEstablished.map((n) => (
            <article
              key={n.where}
              className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-6"
            >
              <p className="display text-[19px] leading-snug text-[var(--ink)]">{n.claim}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--paper-2)] px-3 py-1 text-[12px] text-[var(--ink-soft)]">
                  {n.verdict}
                </span>
                <span className="text-[12px] text-[var(--ink-faint)]">{n.where}</span>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--ink-soft)]">{n.detail}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink-faint)] italic">
                {n.note}
              </p>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-[13px] text-[var(--sage)] underline underline-offset-4"
              >
                Check it yourself ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-[var(--line)] pt-12">
        <h2 className="display text-[26px] text-[var(--ink)]">What this site is not</h2>
        <p className="mt-4 text-[15px] leading-[1.75] text-[var(--ink-soft)]">
          It is not a fatwa, and it is not a scholar. The checking here is careful and it
          is transparent, and every entry carries its source so you can read the original
          in one click. But no part of this site has been through scholarly review, and
          for anything bearing on a real decision in your life you should ask someone
          qualified. What the site can reasonably claim is that the Arabic it shows you
          is drawn from the collection it names.
        </p>
      </section>
    </div>
  );
}
