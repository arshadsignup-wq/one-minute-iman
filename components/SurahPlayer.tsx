"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plays a whole sūrah without asking for a click between āyāt.
 *
 * The per-āyah players are still there for anyone who wants one verse on its
 * own. This is for the other way of listening, where you put the sūrah on and
 * follow the text down the page.
 *
 * One <audio> element is reused and its src swapped, rather than a player per
 * āyah: 286 elements would each hold a connection, and Safari refuses to start
 * a fresh element without a gesture, which is exactly what continuous play is
 * meant to avoid.
 *
 * It preloads. An earlier version set preload="none" to be frugal, and the
 * result was a player that said "Pause" and produced silence: with the src
 * swapped under it, the element never ran resource selection and play() sat at
 * readyState 0 indefinitely. Only the current āyah is ever loaded, so there is
 * nothing to save here anyway.
 */
export default function SurahPlayer({
  verses,
  surahName,
}: {
  verses: { n: number; audio?: string }[];
  surahName: string;
}) {
  const playable = verses.filter((v) => v.audio);
  const ref = useRef<HTMLAudioElement | null>(null);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  /** play() rejects for reasons that are not failures.
   *
   *  Swapping src aborts a pending play with AbortError, and a browser that
   *  wants a fresh gesture answers NotAllowedError. Neither means the
   *  recitation is unavailable, and tearing the player out of the page over
   *  one is how a working sūrah ended up with no controls at all. Only a real
   *  media error, raised on the element itself, retires it. */
  const settle = useCallback((err: unknown) => {
    setPlaying(false);
    const name = (err as { name?: string })?.name;
    if (name !== "AbortError" && name !== "NotAllowedError") setFailed(true);
  }, []);
  const [follow, setFollow] = useState(true);

  const current = playable[at];

  // The audio listeners need the live index without re-subscribing each āyah.
  const atRef = useRef(at);
  useEffect(() => { atRef.current = at; }, [at]);

  // Scroll the āyah being recited into view, unless the reader has turned that
  // off because they are reading somewhere else on the page.
  useEffect(() => {
    if (!playing || !follow || !current) return;
    document
      .getElementById(`v${current.n}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [at, playing, follow, current]);

  // Mark the verse being recited so the page can show where the voice is.
  useEffect(() => {
    document
      .querySelectorAll("[data-reciting]")
      .forEach((el) => el.removeAttribute("data-reciting"));
    if (playing && current) {
      document.getElementById(`v${current.n}`)?.setAttribute("data-reciting", "true");
    }
    return () => {
      document
        .querySelectorAll("[data-reciting]")
        .forEach((el) => el.removeAttribute("data-reciting"));
    };
  }, [at, playing, current]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Advance, or stop at the end. The decision is made outside the state
    // updater: React may invoke an updater more than once, and pausing the
    // recitation from inside one would fire that twice.
    const advance = () => {
      const i = atRef.current;
      if (i + 1 < playable.length) setAt(i + 1);
      else { setPlaying(false); setAt(0); }
    };
    const onEnded = advance;
    // A single missing recording should not end the sūrah.
    const onError = advance;
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [playable.length]);

  // Advancing the index changes src; play it, since we are mid-recitation.
  //
  // No load() call here. Forcing one aborts the pending play and rejects it
  // with AbortError, which an earlier version treated as fatal — clicking play
  // removed the whole player from the page. preload="auto" on the element makes
  // it unnecessary: the src is already being fetched by the time this runs.
  useEffect(() => {
    const el = ref.current;
    if (!el || !playing) return;
    el.play().catch(settle);
  }, [at, playing, settle]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      el.play().catch(settle);
    }
  }, [playing, settle]);

  const restart = useCallback(() => {
    setAt(0);
    setPlaying(true);
  }, []);

  // "Play from here", asked for by the āyah rows.
  //
  // Each row used to carry its own <audio controls>: eighty-three grey browser
  // widgets down Yā Sīn, each reading 0:00 / 0:00 because nothing had loaded,
  // each stopping dead at the end of its verse. There is one player on this
  // page and this is how a row reaches it — a custom event rather than lifted
  // state, the same way lib/saved.ts talks to the header.
  useEffect(() => {
    const onRecite = (e: Event) => {
      const n = (e as CustomEvent<{ n: number }>).detail?.n;
      const i = playable.findIndex((v) => v.n === n);
      if (i < 0) return;
      setAt(i);
      setPlaying(true);
    };
    window.addEventListener("omi:recite", onRecite);
    return () => window.removeEventListener("omi:recite", onRecite);
  }, [playable]);

  // Rows need to know which one is sounding, and whether it is still sounding.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("omi:reciting", {
      detail: { n: playing ? current?.n ?? null : null },
    }));
  }, [playing, current]);

  if (playable.length === 0 || failed) return null;

  return (
    <div className="sticky top-2 z-20 -mx-2 mb-2 rounded-full border border-[var(--line)] bg-[var(--card)]/95 px-3 py-2 backdrop-blur sm:mx-0">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--green)] px-5 text-[13.5px] text-[var(--on-green)] transition-all hover:opacity-90"
          aria-label={
            playing
              ? `Pause the recitation of Surah ${surahName}`
              : `Play the whole of Surah ${surahName} without stopping`
          }
        >
          {playing ? "Pause" : at > 0 ? "Resume" : "Play the whole sūrah"}
        </button>

        {at > 0 && (
          <button
            type="button"
            onClick={restart}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-3.5 text-[12.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]"
            aria-label="Start again from the first āyah"
          >
            Start again
          </button>
        )}

        <span
          className="text-[12.5px] text-[var(--ink-faint)]"
          aria-live="polite"
          aria-atomic="true"
        >
          {playing || at > 0
            ? `Āyah ${current?.n ?? 1} of ${playable.length}`
            : `${playable.length} āyāt`}
        </span>

        <label className="ml-auto inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-[12.5px] text-[var(--ink-soft)]">
          <input
            type="checkbox"
            checked={follow}
            onChange={(e) => setFollow(e.target.checked)}
            className="h-4 w-4 accent-[var(--green)]"
          />
          Follow along
        </label>
      </div>

      <audio
        ref={ref}
        src={current?.audio}
        preload="auto"
        title={`Surah ${surahName}, recitation`}
      />
    </div>
  );
}
