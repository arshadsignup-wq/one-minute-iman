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
  audioScope?: "exact" | "verse";
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
  const [shared, setShared] = useState<"" | "sent" | "link">("");
  const [size, setSize] = useState(0);

  // What is saved lives in localStorage, which React cannot read while
  // hydrating, so the first value has to be picked up after mount. That is the
  // pattern the rule warns about and the right one here: rendering it on the
  // server would make the markup disagree with the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  /** Send it to someone.
   *
   *  Copy puts the words on the clipboard; this passes the page itself to
   *  whatever the reader shares with. People find these for somebody else at
   *  least as often as for themselves, and there was no way to hand one on
   *  except by copying the address out of the bar. Where the browser has no
   *  share sheet it falls back to copying the link, and says which it did.
   */
  async function share() {
    const data = { title: props.title, text: props.trans || props.title, url: props.url };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(data);
        setShared("sent");
      } else {
        await navigator.clipboard.writeText(props.url);
        setShared("link");
      }
      window.setTimeout(() => setShared(""), 2000);
    } catch {
      // the sheet was dismissed, or the clipboard refused: say nothing
      setShared("");
    }
  }

  const btn =
    "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-4 text-[13.5px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]";

  return (
    <div className="mt-9 flex flex-wrap items-center gap-2.5">
      {props.audio?.length ? (
        <Listen urls={props.audio} credit={props.audioCredit ?? ""} scope={props.audioScope} />
      ) : null}

      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>

      <button type="button" onClick={share} className={btn} aria-live="polite">
        {shared === "sent" ? "Shared" : shared === "link" ? "Link copied" : "Share"}
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
