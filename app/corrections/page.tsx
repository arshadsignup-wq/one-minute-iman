import type { Metadata } from "next";
import { CORRECTIONS_URL, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Report a mistake",
  description:
    "How to report an error in a translation, a reference, a grading or a transliteration on One Minute Iman.",
  alternates: { canonical: "/corrections" },
  openGraph: {
    title: "Report a mistake on One Minute Iman",
    description: "How to report an error in a translation, reference, grading or transliteration.",
    url: "/corrections",
    type: "article",
    images: [OG_IMAGE],
  },
};

const kinds = [
  ["The Arabic does not match the translation", "The commonest kind of error, and the one hardest to see from the outside."],
  ["The reference points to the wrong narration", "A number, a collection, or a link that lands somewhere other than the text quoted."],
  ["The transliteration does not read the Arabic", "Including a pronunciation that covers words the Arabic does not show."],
  ["The grading is wrong or incomplete", "A verdict attributed to the wrong scholar, or a disagreement not shown."],
  ["The situation is wrong", "An entry offered for a circumstance it does not fit."],
  ["Something is claimed that the source does not say", "A repetition count, a time of day, or a promised outcome."],
];

export default function Corrections() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-10 pb-20 sm:pt-16">
      <h1 className="display text-[38px] leading-tight text-[var(--ink)] sm:text-[46px]">
        Report a mistake
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-soft)]">
        Mistakes here are not typos. A wrong reference or a translation that does not
        match its Arabic is a religious problem, and errors of exactly that kind have
        already been found on this site and fixed. If you have found another, please say
        so. You do not need to be certain, and you do not need to be a scholar.
      </p>

      <h2 className="display mt-14 text-[24px] text-[var(--ink)]">What is worth reporting</h2>
      <ul className="mt-5 space-y-4">
        {kinds.map(([h, p]) => (
          <li key={h}>
            <p className="text-[15px] font-medium text-[var(--ink)]">{h}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-soft)]">{p}</p>
          </li>
        ))}
      </ul>

      <h2 className="display mt-14 text-[24px] text-[var(--ink)]">What helps most</h2>
      <p className="mt-4 text-[15px] leading-[1.75] text-[var(--ink-soft)]">
        The address of the page, what looks wrong, and where the correct wording can be
        read. A link to the narration on a primary source is the single most useful thing
        you can include, because it lets the correction be checked rather than taken on
        trust.
      </p>

      <a
        href={CORRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex min-h-[44px] items-center rounded-full bg-[var(--green)] px-6 text-[15px] text-[var(--paper)] transition-opacity hover:opacity-90"
      >
        Report a mistake ↗
      </a>
      <p className="mt-4 text-[13px] leading-relaxed text-[var(--ink-faint)]">
        Reports go to the public issue tracker for this site, so you can see what has been
        raised and what was done about it. Every entry page carries the same link, which
        arrives with that entry already identified.
      </p>
    </div>
  );
}
