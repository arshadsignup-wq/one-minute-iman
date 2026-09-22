"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SurahFor from "@/components/SurahFor";
import {
  matchSituations, neighboursOf, isCrisis, isHarm, otherLanguage, EXAMPLES, suggestions, matchSurah,
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

export default function Seek() {
  const [q, setQ] = useState("");
  const answerRef = useRef<HTMLDivElement | null>(null);
  // the query the page has already scrolled to, so refining a search does not
  // yank the page a second time
  const scrolledFor = useRef<string | null>(null);

  // Read ?q= after mount rather than on the server, so the page stays static
  // and the server and client agree on the first render. Setting state from an
  // effect is exactly the pattern the rule warns about, and is the right one
  // here: the value lives in the URL, which React cannot see during hydration.
  //
  // popstate as well as mount: a visitor who opens an entry and comes back
  // should find their results, not an empty box.
  useEffect(() => {
    const read = () => {
      const v = new URLSearchParams(window.location.search).get("q") ?? "";
      setQ(v.slice(0, 120));
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // Put the query back in the address bar, so a result can be sent to someone,
  // kept, or reloaded. Replacing rather than pushing: the box answers as you
  // type, and pushing would leave one history entry per keystroke between the
  // visitor and the page they came from.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const v = q.trim();
      if (v) url.searchParams.set("q", v);
      else url.searchParams.delete("q");
      if (url.toString() !== window.location.href) {
        window.history.replaceState(null, "", url.toString());
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [q]);

  const asked = q.trim().length > 1;

  const reveal = useCallback((force = false) => {
    const el = answerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Already in front of them. Moving the page under someone who can see the
    // answer is worse than not moving it at all.
    if (!force && rect.top <= window.innerHeight - 120) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // scrollTo rather than scrollIntoView: the header is sticky, so the answer
    // has to stop below it, and the offset is easier to state than to chase
    // through scroll-margin on a target that is still settling.
    const from = window.scrollY;
    window.scrollTo({
      top: Math.max(0, rect.top + from - 88),
      behavior: smooth ? "smooth" : "auto",
    });
    if (!smooth) return;
    // A smooth scroll is abandoned by the browser when content above the
    // viewport changes height, and the answer is still arriving when this runs:
    // the page asked to move a thousand pixels and did not move at all. If
    // nothing happened, finish the job without the animation. Only when nothing
    // happened — someone who has started scrolling themselves is left alone.
    window.setTimeout(() => {
      const still = answerRef.current;
      if (!still || Math.abs(window.scrollY - from) > 8) return;
      const top = still.getBoundingClientRect().top;
      if (top <= window.innerHeight - 120) return;
      window.scrollTo({ top: Math.max(0, top + window.scrollY - 88), behavior: "auto" });
    }, 450);
  }, []);

  // The answer renders below the fold, and on a phone with the keyboard open it
  // was off the screen entirely: someone typed how they felt and saw nothing
  // happen. Once they stop typing, the answer is brought to them — but only if
  // it is not already in front of them, and only once per query.
  useEffect(() => {
    if (!asked) { scrolledFor.current = null; return; }
    const t = window.setTimeout(() => {
      if (scrolledFor.current === q) return;
      scrolledFor.current = q;
      reveal();
    }, 700);
    return () => window.clearTimeout(t);
  }, [q, asked, reveal]);

  // A page can offer itself differently once it has been asked a question. The
  // home page used to keep its whole pitch below the answer, so someone who had
  // just been told what to say scrolled on into "9 areas of life" and "why you
  // can trust what you read here", as though they had not asked yet.
  useEffect(() => {
    const el = document.documentElement;
    if (asked) el.dataset.seeking = "true";
    else delete el.dataset.seeking;
    return () => { delete el.dataset.seeking; };
  }, [asked]);

  /** The phone keyboard's Go key, and Enter on a desktop. */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // put the keyboard away, or the answer opens behind it
    (document.activeElement as HTMLElement | null)?.blur?.();
    scrolledFor.current = q;
    reveal(true);
  };
  const crisis = asked && isCrisis(q);
  const harm = asked && !crisis && isHarm(q);
  const askedIn = asked && !crisis && !harm ? otherLanguage(q) : null;

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
  // Naming a supplication is unambiguous; a situation reached only through a
  // prefix or a repaired typo is not.
  const sure = !!hit || (primary[0]?.sure ?? false);
  const owned =
    hit && !named.sits.includes(primary[0]?.sit.id ?? "")
      ? sitById.get(named.sits[0])
      : primary[0]?.sit;

  return (
    <div>
      <form onSubmit={submit} role="search" className="relative">
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
          /* the box answers as you type, but a phone keyboard still offers a
             Go key and it used to do nothing at all */
          enterKeyHint="search"
          inputMode="search"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] py-[18px] pr-12 pl-[54px] text-[17px] text-[var(--ink)] shadow-[0_4px_24px_-16px_var(--shadow)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:shadow-[0_10px_36px_-18px_var(--shadow)] focus:outline-none"
        />
        {asked && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 text-[var(--ink-faint)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--green)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </form>

      {/* The hub pages carried "From the Qur'an" and the search did not, so a
          person who asked "protect my home" was told the duʿā and never that
          al-Baqarah is narrated for it. Same data, shown where the question
          was actually asked. */}
      {asked && owned && !crisis && !harm && (
        <SurahFor situation={owned.id} compact />
      )}

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

      {/* Everything that counts as an answer, so it can be brought into
          view as one thing when it appears below the fold. */}
      <div ref={answerRef} className="scroll-mt-24">
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
            the language it was asked in.
            
            It names the language it saw rather than assuming one, and it no
            longer says "nothing here has been translated" directly above a
            fluent English answer, which read as a contradiction. */}
        {askedIn && (
          <p className="rise mt-10 rounded-xl border border-[var(--line)] bg-[var(--paper-2)] px-5 py-4 text-[14px] leading-relaxed text-[var(--ink-soft)]">
            We understood what you asked for, and have answered below in English.
            The entries themselves are in Arabic and English; none of them has been
            translated into {askedIn} yet.
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
                    sure={sure}
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
    </div>
  );
}
