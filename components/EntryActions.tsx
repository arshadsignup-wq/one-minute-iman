"use client";

import { useEffect, useState } from "react";
import { isSaved, toggleSaved, onSavedChange } from "@/lib/saved";
import Listen from "@/components/Listen";

type Props = {
  id: string;
  title: string;
  arabic: string;
  translit?: string;
  trans?: string;
  reference: string;
  grade: string;
  url: string;
  audio?: string[];
  audioCredit?: string;
};

/** What gets copied: the words and where they are from, and nothing else.
 *  Whatever the reader typed into the search box is theirs and stays on the
 *  page it was typed on. */
function copyText(p: Props) {
  return [
    p.arabic,
    p.translit,
    p.trans && `"${p.trans}"`,
    "",
    `${p.reference} (${p.grade})`,
    p.url,
  ]
    .filter(Boolean)
    .join("\n");
}

const SIZES = ["Aa", "Aa", "Aa"];
const SIZE_LABEL = ["Normal text size", "Larger text size", "Largest text size"];

export default function EntryActions(props: Props) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState(0);

  useEffect(() => {
    setSaved(isSaved(props.id));
    return onSavedChange(() => setSaved(isSaved(props.id)));
  }, [props.id]);

  // The Arabic and the pronunciation are what people enlarge, so the control
  // drives those and leaves the layout of the page alone.
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.recitationSize = String(size);
    return () => { delete el.dataset.recitationSize; };
  }, [size]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText(props));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const btn =
    "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-4 text-[13.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]";

  return (
    <div className="mt-9 flex flex-wrap items-center gap-2.5">
      {props.audio?.length ? (
        <Listen urls={props.audio} credit={props.audioCredit ?? ""} />
      ) : null}

      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>

      <button
        type="button"
        onClick={() => setSaved(toggleSaved(props.id))}
        aria-pressed={saved}
        className={`${btn} ${saved ? "border-[var(--sage)] text-[var(--green)]" : ""}`}
      >
        {saved ? "Saved" : "Save"}
      </button>

      <div
        className="ml-auto inline-flex items-center overflow-hidden rounded-full border border-[var(--line)]"
        role="group"
        aria-label="Text size"
      >
        {SIZES.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSize(i)}
            aria-label={SIZE_LABEL[i]}
            aria-pressed={size === i}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 transition-colors ${
              size === i ? "bg-[var(--paper-2)] text-[var(--green)]" : "text-[var(--ink-faint)]"
            }`}
            style={{ fontSize: `${12 + i * 3}px` }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
