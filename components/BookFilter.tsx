"use client";

import { useState } from "react";

/** Filters the narrations already rendered on this page. No extra data is loaded. */
export default function BookFilter({ count }: { count: number }) {
  const [q, setQ] = useState("");

  function apply(value: string) {
    setQ(value);
    const term = value.trim().toLowerCase();
    const nodes = document.querySelectorAll<HTMLElement>("[data-hadith]");
    let shown = 0;
    nodes.forEach((el) => {
      const hit = !term || (el.dataset.hadith || "").includes(term);
      el.style.display = hit ? "" : "none";
      if (hit) shown++;
    });
    const label = document.getElementById("filter-count");
    if (label) {
      label.textContent = term ? `${shown} of ${count} shown` : "";
    }
  }

  return (
    <div className="mt-6">
      <input
        value={q}
        onChange={(e) => apply(e.target.value)}
        placeholder="Filter these narrations…"
        aria-label="Filter narrations in this book"
        className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] px-5 py-3 text-[15px] text-[var(--ink)] transition-all placeholder:text-[var(--ink-faint)] focus:border-[var(--sage)] focus:outline-none"
      />
      <p id="filter-count" className="mt-2 h-4 text-[12px] text-[var(--ink-faint)]" />
    </div>
  );
}
