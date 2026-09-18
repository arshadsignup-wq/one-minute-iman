"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  matchSituations, neighboursOf, isCrisis, isHarm, isOtherLanguage, EXAMPLES, suggestions, matchSurah,
} from "@/lib/search";
import Answer from "@/components/Answer";
import { findEntry, loadEntry, type EntryDoc } from "@/lib/entryhits";
import { sitById } from "@/lib/search";

/** Offered when nothing matched, so the visitor is not sent away empty. */
const FALLBACK: [string, string][] = [
  ["anxiety", "Worry"],
  ["sadness", "Sadness"],
  ["gratitude", "Something good happened"],
  ["forgiveness", "Seeking forgiveness"],
  ["illness", "Being ill"],
  ["death", "Losing someone"],
  ["poverty", "Money"],
];

/** Compares a chip's word with the heading it belongs to, so the heading is
 *  only repeated when it adds something. */
function normaliseLabel(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function Seek(
  { readQueryFromUrl = false }: { readQueryFromUrl?: boolean } = {},
) {
  const [q, setQ] = useState("");

  // Read ?q= after mount rather than on the server, so /browse stays static
  // and the server and client agree on the first render. Setting state from an
  // effect is exactly the pattern the rule warns about, and is the right one
  // here: the value lives in the URL, which React cannot see during hydration.
  useEffect(() => {
    if (!readQueryFromUrl) return;
    const v = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v) setQ(v.slice(0, 120));
  }, [readQueryFromUrl]);
  const asked = q.trim().length > 1;
  const crisis = asked && isCrisis(q);
  const harm = asked && !crisis && isHarm(q);
  const otherLanguage = asked && !crisis && !harm && isOtherLanguage(q);

  // A query can name a particular supplication rather than describe a feeling.
  // The keyword file and the entry are fetched only when that happens, so a
  // plain search downloads nothing extra.
  // Keyed by the query it was found for, so a result from a previous keystroke
  // is never shown against the current one, and nothing has to be cleared
  // synchronously when the query changes.
  const [named, setNamed] = useState<{ q: string; doc: EntryDoc | null; sits: string[] }>(
    { q: "", doc: null, sits: [] },
  );

  // A query can name a chapter instead of describing a feeling.
  const surah = useMemo(() => (crisis || harm ? null : matchSurah(q)), [q, crisis, harm]);

  // Offered while typing, so a half-finished word has somewhere to go.
  const suggested = useMemo(
    () => (crisis || harm ? [] : suggestions(q, 6)),
    [q, crisis, harm],
  );

  const { primary, related } = useMemo(() => {
    const all = matchSituations(q);
    if (!all.length) return { primary: [], related: [] };
    const top = all[0].score;
    // Only what genuinely answers the query leads. Everything else is "related".
    const lead = all.filter((m) => m.score >= top * 0.82).slice(0, 2);
    const leadIds = lead.map((m) => m.sit.id);
    const scored = all.slice(lead.length, lead.length + 5).map((m) => m.sit);
    // if the query matched one thing only, offer its neighbours rather than nothing
    const filled =
      scored.length >= 3
        ? scored
        : [...scored, ...neighboursOf(leadIds[0], [...leadIds, ...scored.map((s) => s.id)], 4)];
    return { primary: lead, related: filled.slice(0, 5) };
  }, [q]);

  useEffect(() => {
    if (!asked || crisis || harm) return;
    let live = true;
    const leadIds = primary.map((m) => m.sit.id);
    findEntry(q, leadIds)
      .then(async (hit) =>
        hit ? { doc: await loadEntry(hit.id), sits: hit.situations } : { doc: null, sits: [] })
      .then(({ doc, sits }) => { if (live) setNamed({ q, doc, sits }); })
      .catch(() => { if (live) setNamed({ q, doc: null, sits: [] }); });
    return () => { live = false; };
  }, [q, asked, crisis, harm, primary]);

  // Resolved once, because the empty state and the answer both depend on it: a
  // query can name a supplication without matching any situation at all, and
  // "du'a before sex" did exactly that.
  const hit = named.q === q ? named.doc : null;
  const owned =
    hit && !named.sits.includes(primary[0]?.sit.id ?? "")
      ? sitById.get(named.sits[0])
      : primary[0]?.sit;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-5 h-[19px] w-[19px] -translate-y-1/2 text-[var(--sage)]"
          fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="I feel alone…"
          aria-label="Describe how you feel or what you are going through"
          autoComplete="off"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] py-[18px] pr-12 pl-[54px] text-[17px] text-[var(--ink)] shadow-[0_4px_24px_-16px_var(--shadow)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:shadow-[0_10px_36px_-18px_var(--shadow)] focus:outline-none"
        />
        {asked && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 text-[var(--ink-faint)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--green)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {asked && surah && (
        <Link
          href={`/quran/${surah.n}`}
          className="rise mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--sage)] bg-[var(--card)] p-5 transition-all hover:shadow-[0_10px_36px_-18px_var(--shadow)]"
        >
          <span>
            <span className="text-[11px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
              Sūrah {surah.n}
            </span>
            <span className="display mt-1 block text-[22px] text-[var(--green)]">
              {surah.name}
            </span>
          </span>
          <span className="shrink-0 text-[13px] text-[var(--sage)]">Read it →</span>
        </Link>
      )}

      {asked && suggested.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-[var(--ink-faint)]">Did you mean</span>
          {suggested.map(({ sit, hint }) => (
            <button
              key={sit.id}
              onClick={() => setQ(hint)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card)] px-3.5 text-[13px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)] sm:min-h-0 sm:py-1.5"
            >
              {hint}
              {/* the heading it leads to, when the word typed is not the heading */}
              {normaliseLabel(hint) !== normaliseLabel(sit.label) && (
                <span className="text-[var(--ink-faint)]">· {sit.label}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {!asked && (
        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2.5">
          <span className="text-[13px] text-[var(--ink-faint)]">Try</span>
          {EXAMPLES.slice(0, 12).map((p) => (
            <button
              key={p}
              onClick={() => setQ(p)}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] bg-[var(--card)]/70 px-3.5 text-[13px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)] hover:text-[var(--green)] sm:min-h-0 sm:py-1.5"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {crisis && (
        <div className="rise mt-12 rounded-2xl border border-[var(--gold)] bg-[var(--card)] p-7 sm:p-9">
          <p className="display text-[24px] leading-snug text-[var(--ink)] sm:text-[27px]">
            Please talk to someone now.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-[1.75] text-[var(--ink-soft)]">
            What you have just typed matters more than anything this page can hand you.
            You are not a burden for feeling it, and you are not far from Allah for
            feeling it. But a website is not enough right now, and you deserve more
            than a website.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-[1.75] text-[var(--ink-soft)]">
            Tell one person who is actually near you. If there is nobody, there are
            people whose whole job is to pick up, free, at any hour, in almost every
            country:{" "}
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--green)] underline underline-offset-4"
            >
              findahelpline.com
            </a>
            . If you are in immediate danger, call your local emergency number.
          </p>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-[var(--ink-faint)]">
            There is a man in Ṣaḥīḥ Muslim who was so certain he was beyond forgiving
            that he asked to be burnt and scattered so that Allah could not find him. He
            was forgiven, for the fear itself. Despair about yourself has never been the
            same thing as the truth about you.{" "}
            <Link
              href="/d/never-did-good"
              className="text-[var(--green)] underline underline-offset-4"
            >
              Ṣaḥīḥ Muslim 2756a
            </Link>
            .
          </p>
        </div>
      )}

      {harm && (
        <div className="rise mt-12 rounded-2xl border border-[var(--gold)] bg-[var(--card)] p-7 sm:p-9">
          <p className="display text-[24px] leading-snug text-[var(--ink)] sm:text-[27px]">
            You are not required to endure this.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-[1.75] text-[var(--ink-soft)]">
            Being hurt by someone in your own home is not a test you are failing,
            and patience does not mean staying where you are being harmed. Nothing
            in what follows asks you to.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-[1.75] text-[var(--ink-soft)]">
            Tell someone you trust, today. If you are in immediate danger, call your
            local emergency number. Trained people will talk it through with you
            confidentially, free, wherever you are:{" "}
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--green)] underline underline-offset-4"
            >
              findahelpline.com
            </a>
            .
          </p>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-[var(--ink-faint)]">
            The Prophet ﷺ warned to beware the supplication of the one who has been
            wronged, because there is no veil between it and Allah. Your position in this
            is not the weak one.{" "}
            <Link href="/d/oppressed" className="text-[var(--green)] underline underline-offset-4">
              Ṣaḥīḥ al-Bukhārī 2448
            </Link>
            .
          </p>
        </div>
      )}

      {/* The query was understood, but nothing here has been translated. Saying
          so is better than returning English as though it were an answer in
          the language it was asked in. */}
      {otherLanguage && (
        <p className="rise mt-10 rounded-xl border border-[var(--line)] bg-[var(--paper-2)] px-5 py-4 text-[14px] leading-relaxed text-[var(--ink-soft)]">
          We understood what you asked for, but the entries themselves are in Arabic and
          English. Nothing on this site has been translated into Bengali yet.
        </p>
      )}

      {asked && (
        <div className="mt-12">
          {/* A sūrah counts as having found something. Without this the page
              answered "surah mulk" with the chapter and, underneath it, "we
              could not find that one". */}
          {primary.length === 0 && !hit && !surah && !crisis && !harm ? (
            /* The failure here is the site's, not the visitor's. Saying "try a
               plainer word" hands them the problem; offering somewhere to go
               does not. */
            <div className="rise rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8">
              <p className="display text-[24px] text-[var(--ink)]">
                We could not find that one.
              </p>
              <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
                That is a gap on our side, not a mistake on yours. Here is what people
                most often come here for:
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {FALLBACK.map(([id, label]) => (
                  <Link
                    key={id}
                    href={`/s/${id}`}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-4 text-[14px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)] sm:min-h-0 sm:py-2"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--ink-faint)]">
                Or{" "}
                <Link href="/browse" className="text-[var(--sage)] underline underline-offset-4">
                  browse every situation
                </Link>
                . The site reads English, and understands some Bengali and Banglish.
              </p>
            </div>
          ) : (
            <>
              {/* One answer, not a shelf. The grid that used to sit here made
                  the site read as a directory: it named a category and left
                  the visitor to pick. This responds instead, and keeps the
                  fuller list a click away. */}
              {owned && (
                <Answer
                  sit={owned}
                  query={q}
                  alternatives={primary.map((m) => m.sit).filter((x) => x.id !== owned.id)}
                  named={hit}
                />
              )}

              {related.length > 0 && (
                <section className="rise mt-16 border-t border-[var(--line-soft)] pt-8">
                  <p className="text-[11.5px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
                    You might also look at
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {related.map((sit) => (
                      <Link
                        key={sit.id}
                        href={`/s/${sit.id}`}
                        className="group inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-[13.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)] sm:min-h-0 sm:py-2"
                      >
                        {sit.label}
                        <span className="ml-2 text-[12px] text-[var(--ink-faint)]">{sit.count}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
