"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rows } from "@/lib/corpus";
import { EntryCard } from "@/components/Cards";
import { getSaved, onSavedChange, removeSaved } from "@/lib/saved";

export default function SavedList() {
  // Rendered after mount: what is saved lives in the browser, so the server has
  // nothing to render and guessing would flash the wrong thing.
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setIds(getSaved());
    sync();
    return onSavedChange(sync);
  }, []);

  if (ids === null) return <div className="mt-10 h-24" aria-hidden />;

  const found = ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean);

  if (!found.length) {
    return (
      <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8">
        <p className="display text-[22px] text-[var(--ink)]">Nothing saved yet.</p>
        <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
          Every entry has a Save button under the words. Use it for the ones you want to
          come back to.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-5 text-[14px] text-[var(--green)] transition-all hover:border-[var(--sage)]"
        >
          Browse every situation →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {found.map((r) => (
        // Remove sits under the card rather than over it: floated on top it
        // covered the Arabic, which is the one thing the card is for.
        <div key={r!.id} className="flex flex-col">
          <EntryCard row={r!} />
          <button
            type="button"
            onClick={() => removeSaved(r!.id)}
            className="mt-1.5 inline-flex min-h-[44px] items-center self-start px-1 text-[13px] text-[var(--ink-faint)] underline underline-offset-4 transition-colors hover:text-[var(--green)]"
            aria-label={`Remove ${r!.t} from saved`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
