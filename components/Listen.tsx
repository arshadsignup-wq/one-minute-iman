"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Verse recitation, where a recording exists that matches the words on screen.
 *
 * Several verses play in turn from one element rather than stacking players,
 * so a two-verse passage sounds the way it reads.
 */
export default function Listen({ urls, credit }: { urls: string[]; credit: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = () => {
      if (at + 1 < urls.length) setAt(at + 1);
      else { setPlaying(false); setAt(0); }
    };
    const stop = () => setPlaying(false);
    const oops = () => { setFailed(true); setPlaying(false); };
    el.addEventListener("ended", next);
    el.addEventListener("pause", stop);
    el.addEventListener("error", oops);
    return () => {
      el.removeEventListener("ended", next);
      el.removeEventListener("pause", stop);
      el.removeEventListener("error", oops);
    };
  }, [at, urls.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !playing) return;
    el.play().catch(() => setFailed(true));
  }, [at, playing]);

  if (failed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (playing) { el.pause(); setPlaying(false); }
          else { setPlaying(true); el.play().catch(() => setFailed(true)); }
        }}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-4 text-[13.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]"
        aria-label={playing ? "Pause recitation" : "Play recitation"}
      >
        {playing ? "Pause" : "Listen"}
      </button>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={ref} src={urls[at]} preload="none" title={credit} />
    </>
  );
}
