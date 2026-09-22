import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/site";
import ReportMistake from "@/components/ReportMistake";

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

      <div className="mt-10">
        <ReportMistake />
      </div>
      <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-[var(--ink-faint)]">
        The tracker is public, so you can see what has been raised and what was done
        about it &mdash; but it asks for an account, and you should not need one to
        tell us a translation is wrong. &ldquo;Copy a report&rdquo; puts the page and
        the questions worth answering on your clipboard, ready to send by any means
        you like. Every entry page carries the same options, arriving with that entry
        already identified.
      </p>
    </div>
  );
}
