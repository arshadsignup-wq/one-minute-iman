"use client";

import { useState } from "react";
import { CORRECTIONS_EMAIL, correctionLink, correctionMailto, correctionReport } from "@/lib/site";

/**
 * Reporting a mistake without needing a GitHub account.
 *
 * The tracker stays, because a correction that anyone can check is worth more
 * than one that arrives privately. But it asks for an account, and the person
 * likeliest to notice that a translation does not match its Arabic is a reader,
 * not a developer. So there is also a report to copy: already filled in with
 * the page and the questions worth answering, and sendable by any means.
 */
export default function ReportMistake({
  entryId,
  title,
  compact = false,
}: { entryId?: string; title?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(correctionReport(entryId, title));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const quiet =
    "inline-flex min-h-[44px] items-center text-[13px] text-[var(--ink-faint)] underline underline-offset-4 transition-colors hover:text-[var(--ink-soft)] sm:min-h-0";
  const solid =
    "inline-flex min-h-[44px] items-center rounded-full bg-[var(--green)] px-5 text-[14px] font-medium text-[var(--on-green)] transition-all hover:bg-[var(--green-deep)]";
  const outline =
    "inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-5 text-[14px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]";

  if (compact) {
    return (
      <button type="button" onClick={copy} className={quiet}>
        {copied ? "Report copied — send it however you like" : "Copy a report instead"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={correctionLink(entryId ?? "", title ?? "")} target="_blank" rel="noopener noreferrer" className={solid}>
        Report on the tracker ↗
      </a>
      {CORRECTIONS_EMAIL && (
        <a href={correctionMailto(entryId, title)} className={outline}>
          Write to us instead
        </a>
      )}
      <button type="button" onClick={copy} className={outline}>
        {copied ? "Copied" : "Copy a report"}
      </button>
    </div>
  );
}
