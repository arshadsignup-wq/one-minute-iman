"use client";

import { useEffect, useState } from "react";

type Choice = "system" | "light" | "dark";
const KEY = "omi.theme.v1";

/**
 * Light, dark, or whatever the device says.
 *
 * The dark palette existed but could only be reached by changing the whole
 * phone, which is not a thing to ask of someone who wants to read a page of
 * Qur'an at night. The choice is stamped on <html> before first paint by the
 * script in the layout, so there is no flash of the wrong palette; this only
 * has to keep the two in step afterwards.
 */
export default function ThemeToggle() {
  const [choice, setChoice] = useState<Choice | null>(null);

  // localStorage cannot be read while hydrating, so the saved choice arrives
  // after mount. Until it does, nothing is stamped: the script in the layout
  // has already put the right palette on the page and must not be overruled
  // for a frame by a default this component has not finished loading.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice((() => {
      try {
        const v = window.localStorage.getItem(KEY);
        return v === "light" || v === "dark" ? v : "system";
      } catch {
        return "system";
      }
    })());
  }, []);

  useEffect(() => {
    if (!choice) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const paint = () => {
      document.documentElement.dataset.theme =
        choice === "dark" || (choice === "system" && mq.matches) ? "dark" : "light";
    };
    paint();
    // On "Auto", a phone that dims itself at sunset should take the page with it.
    if (choice !== "system") return;
    mq.addEventListener("change", paint);
    return () => mq.removeEventListener("change", paint);
  }, [choice]);

  function pick(next: Choice) {
    setChoice(next);
    try {
      if (next === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch { /* private browsing: the choice just does not outlast the visit */ }
  }

  const opt = (value: Choice, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => pick(value)}
      aria-pressed={choice === value}
      className={`inline-flex min-h-[44px] items-center px-3 text-[12.5px] transition-colors sm:min-h-0 sm:py-1.5 ${
        choice === value
          ? "bg-[var(--paper)] text-[var(--green)]"
          : "text-[var(--ink-faint)] hover:text-[var(--ink-soft)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Page colours"
      className="inline-flex items-center overflow-hidden rounded-full border border-[var(--line)]"
    >
      {opt("light", "Light")}
      {opt("dark", "Dark")}
      {opt("system", "Auto")}
    </div>
  );
}
