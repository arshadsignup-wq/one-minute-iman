"use client";

import { useState } from "react";

type Kind = "all" | "quran" | "hadith";

/**
 * Narrows what is already on a situation page.
 *
 * A hub can carry ninety-nine entries in one flat grid with nothing to sort or
 * sift them by, so finding the Qurʾanic ones, or the one you half-remember,
 * meant reading all of them. Nothing extra is fetched: the cards are already
 * here and carry what they can be matched on.
 */
export default function SituationFilter({ total }: { total: number }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("all");

  function apply(term: string, k: Kind) {
    const needle = term.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll<HTMLElement>("[data-entry]").forEach((el) => {
      const hay = el.dataset.entry || "";
      const isQuran = el.dataset.kind === "quran";
      const kindOk = k === "all" || (k === "quran") === isQuran;
      const hit = kindOk && (!needle || hay.includes(needle));
      el.style.display = hit ? "" : "none";
      if (hit) shown++;
    });
    const label = document.getElementById("situation-filter-count");
    if (label) {
      label.textContent =
        needle || k !== "all"
          ? shown === 0
            ? "Nothing here matches that."
            : `${shown} of ${total} shown`
          : "";
    }
  }

  function set(term: string, k: Kind) {
    setQ(term);
    setKind(k);
    apply(term, k);
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-[44px] items-center rounded-full px-3.5 text-[13px] transition-all sm:min-h-0 sm:py-1.5 ${
      active
        ? "bg-[var(--green)] text-[var(--on-green)]"
        : "border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--sage)] hover:text-[var(--green)]"
    }`;

  return (
    <div className="mt-8 border-y border-[var(--line-soft)] py-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={q}
          onChange={(e) => set(e.target.value, kind)}
          placeholder="Find one of these…"
          aria-label="Filter the entries on this page"
          className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--card)] px-5 py-2.5 text-[14.5px] text-[var(--ink)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:outline-none"
        />
        <div className="flex gap-2" role="group" aria-label="Show only">
          <button type="button" onClick={() => set(q, "all")} className={chip(kind === "all")}>
            All
          </button>
          <button type="button" onClick={() => set(q, "quran")} className={chip(kind === "quran")}>
            Qur&apos;an
          </button>
          <button type="button" onClick={() => set(q, "hadith")} className={chip(kind === "hadith")}>
            Hadith
          </button>
        </div>
      </div>
      <p
        id="situation-filter-count"
        aria-live="polite"
        className="mt-2 h-4 text-[12.5px] text-[var(--ink-faint)]"
      />
    </div>
  );
}
