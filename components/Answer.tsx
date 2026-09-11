"use client";

import Link from "next/link";
import answersRaw from "@/data/answers.json";
import EntryActions from "@/components/EntryActions";
import { SITE_URL } from "@/lib/site";
import type { Situation } from "@/lib/search";

type Say = {
  id: string; title: string; arabic: string; translit: string; trans: string;
  ref: string; grade: string; url: string;
  audio?: string[]; audio_credit?: string; recites?: "part";
};
type Composed = {
  say: Say;
  know?: { id: string; title: string; trans: string; ref: string; grade: string; kind: string };
  story?: { id: string; title: string; story: string; ref: string };
  step: string;
};

const answers = answersRaw as unknown as Record<string, Composed>;

/** Italic markers in the stored prose, the same convention Prose uses. */
function emphasise(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <em key={i} className="text-[var(--ink)]">{part.slice(1, -1)}</em>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
      {children}
    </h3>
  );
}

export default function Answer({
  sit,
  query,
  alternatives,
}: {
  sit: Situation;
  query: string;
  alternatives: Situation[];
}) {
  const a = answers[sit.id];
  if (!a) return null;
  const said = query.trim().replace(/\s+/g, " ");

  return (
    <section className="rise">
      {/* Say back what they typed, and name what was made of it. The site is
          guessing, and it should look like a guess rather than a verdict. */}
      <div className="border-b border-[var(--line)] pb-6">
        {said && (
          <p className="text-[15px] leading-relaxed text-[var(--ink-soft)]">
            You said{" "}
            <span className="text-[var(--ink)]">“{said}”</span>
          </p>
        )}
        <h2 className="display mt-2 text-[30px] leading-tight text-[var(--ink)] sm:text-[36px]">
          {sit.blurb}
        </h2>
        <p className="mt-2 text-[13.5px] text-[var(--ink-faint)]">
          Here is one thing to say, one thing to know, and where it comes from.
        </p>
      </div>

      {/* ── say ─────────────────────────────────────────────────────────── */}
      <div className="mt-10 text-center">
        <Label>{a.say.recites === "part" ? "The opening words" : "Say this"}</Label>
        <p className="arabic mt-5 text-[27px] leading-[2] text-[var(--ink)] sm:text-[32px]">
          {a.say.arabic}
        </p>
        {a.say.translit && (
          <>
            <p className="translit mt-6 text-[15px] leading-relaxed text-[var(--sage)]">
              {a.say.translit}
            </p>
            {a.say.recites === "part" && (
              <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                This covers the opening of the passage, not all of it
              </p>
            )}
          </>
        )}
        {a.say.trans && (
          <p className="display mx-auto mt-6 max-w-xl text-[20px] leading-relaxed text-[var(--ink)] sm:text-[22px]">
            {/* Qur'anic translations often arrive already quoted; wrapping them
                again produces "​"Our Lord ...""​. */}
            {/^\s*["“]/.test(a.say.trans) ? a.say.trans : `“${a.say.trans}”`}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-xl">
        <EntryActions
          id={a.say.id}
          title={a.say.title}
          arabic={a.say.arabic}
          translit={a.say.translit}
          trans={a.say.trans}
          reference={a.say.ref}
          grade={a.say.grade}
          url={`${SITE_URL}/d/${a.say.id}`}
          audio={a.say.audio}
          audioCredit={a.say.audio_credit}
        />
        <p className="mt-4 text-center text-[12.5px] text-[var(--ink-faint)]">
          {a.say.ref} · {a.say.grade} ·{" "}
          <Link
            href={`/d/${a.say.id}`}
            className="text-[var(--sage)] underline underline-offset-4"
          >
            the whole entry
          </Link>
        </p>
      </div>

      {/* ── know ────────────────────────────────────────────────────────── */}
      {a.know && (
        <div className="mt-14 border-t border-[var(--line)] pt-8">
          <Label>And know this</Label>
          <p className="mt-4 text-[17px] leading-[1.75] text-[var(--ink)]">
            {a.know.trans}
          </p>
          <p className="mt-3 text-[12.5px] text-[var(--ink-faint)]">
            {a.know.ref} · {a.know.grade} ·{" "}
            <Link
              href={`/d/${a.know.id}`}
              className="text-[var(--sage)] underline underline-offset-4"
            >
              read it
            </Link>
          </p>
        </div>
      )}

      {/* ── story ───────────────────────────────────────────────────────── */}
      {a.story && (
        <div className="mt-12 border-t border-[var(--line)] pt-8">
          <Label>Where this comes from</Label>
          <p className="mt-4 text-[16px] leading-[1.8] text-[var(--ink-soft)]">
            {emphasise(a.story.story)}
          </p>
          <p className="mt-3 text-[12.5px] text-[var(--ink-faint)]">
            {a.story.ref} ·{" "}
            <Link
              href={`/d/${a.story.id}`}
              className="text-[var(--sage)] underline underline-offset-4"
            >
              {a.story.title}
            </Link>
          </p>
        </div>
      )}

      {/* ── one thing to do ─────────────────────────────────────────────── */}
      {a.step && (
        <div className="mt-12 border-l-2 border-[var(--gold)] pl-5">
          <Label>One thing to do now</Label>
          <p className="mt-2.5 text-[16.5px] leading-relaxed text-[var(--ink)]">
            {a.step}
          </p>
        </div>
      )}

      {/* ── not this ────────────────────────────────────────────────────── */}
      <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-7">
        <span className="mr-1 text-[13.5px] text-[var(--ink-faint)]">
          {alternatives.length ? "Not quite it?" : "More for this"}
        </span>
        {alternatives.map((s) => (
          <Link
            key={s.id}
            href={`/s/${s.id}`}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-3.5 text-[13.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)] sm:min-h-0 sm:py-1.5"
          >
            {s.label}
          </Link>
        ))}
        <Link
          href={`/s/${sit.id}`}
          className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--sage)] px-3.5 text-[13.5px] text-[var(--green)] transition-all hover:bg-[var(--card)] sm:min-h-0 sm:py-1.5"
        >
          All {sit.count} for {sit.label.toLowerCase()} →
        </Link>
      </div>
    </section>
  );
}
