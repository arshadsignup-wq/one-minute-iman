import notEstablished from "@/data/not-established.json";
import { TOTAL, CURATED } from "@/lib/search";

export const metadata = { title: "How we verify · One Minute Iman" };

const steps = [
  {
    n: "01",
    h: "Primary sources only",
    p: "Nothing here was copied from a dua website, a social post, or a video. Qur'anic text comes from Quran.com in the Uthmani script. Hadith come from the primary collections (al-Bukhārī, Muslim, Abū Dāwūd, at-Tirmidhī, an-Nasā'ī and Ibn Mājah), following Sunnah.com's numbering.",
  },
  {
    n: "02",
    h: "The Arabic is extracted, not typed",
    p: "For every entry, the Arabic shown is pulled directly out of the source text and machine-checked to be a genuine substring of it. It is never transcribed from memory, so a slip of a letter or a vowel is not possible.",
  },
  {
    n: "03",
    h: "Every grading is read, not assumed",
    p: "For each hadith outside al-Bukhārī and Muslim, we collect the verdicts of the scholars recorded for that exact narration, among them al-Albānī, Shuʿayb al-Arnaʾūṭ, Aḥmad Muḥammad Shākir and Zubair Ali Zai, and show them to you in full on the entry's page.",
  },
  {
    n: "04",
    h: "Weak material is left out",
    p: "An entry is admitted only where the authenticating verdicts clearly outweigh any weakening ones. 273 narrations were refused by this rule while the library was built. Where scholars genuinely differ, we keep the entry but print the disagreement plainly rather than quietly choosing a side.",
  },
];

export default function Authenticity() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-10 sm:pt-16">
      <h1 className="display text-[38px] leading-tight text-[var(--ink)] sm:text-[46px]">
        How we verify
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-soft)]">
        A great deal of what circulates as “the du&apos;ā for wealth” or “the sūrah for
        anxiety” has no authenticated chain behind it. Because this is a matter of
        religion, every one of the {TOTAL.toLocaleString()} supplications here had to earn its place.
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
          It is not a fatwa, and it is not a scholar. The verification here is careful and
          it is transparent, and every claim is shown with its source so you can check it in
          one click. But for anything that bears on a real decision in your life, ask
          someone qualified. What this site can do is make sure that the words you are
          given actually come from where they are said to come from.
        </p>
      </section>
    </div>
  );
}
