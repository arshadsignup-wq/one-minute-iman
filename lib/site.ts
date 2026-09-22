/** Canonical origin. The apex 308s to www, so www is the indexable host. */
export const SITE_URL = "https://www.oneminuteiman.xyz";
export const SITE_NAME = "One Minute Iman";

/** Absolute URL for canonicals, OG tags and structured data. */
export function abs(path = "/") {
  return new URL(path, SITE_URL).toString();
}

/** Trim to a clean meta description without cutting a word in half. */
export function clampDescription(text: string, max = 158) {
  const s = (text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, "") + "…";
}

/** A page that declares its own openGraph replaces the parent's, images included,
 *  so every page has to name the image explicitly. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "One Minute Iman",
};

/**
 * Where a reader reports a mistake in an entry.
 *
 * This has to be a destination that actually receives messages, so it is the
 * issue tracker of the public repository rather than an invented address. Set
 * NEXT_PUBLIC_CORRECTIONS_URL to point it somewhere else.
 */
export const CORRECTIONS_URL =
  process.env.NEXT_PUBLIC_CORRECTIONS_URL ||
  "https://github.com/arshadsignup-wq/one-minute-iman/issues/new";

/**
 * An address a reader can write to without an account.
 *
 * The issue tracker receives reports and is public, which is the right default
 * for something that has to be checkable. It is also a wall: it wants a GitHub
 * account, and most of the people who will notice a wrong translation do not
 * have one and should not need one. Set NEXT_PUBLIC_CORRECTIONS_EMAIL and the
 * pages offer writing in instead; until then they offer a report to copy, which
 * can be sent by any means at all.
 */
export const CORRECTIONS_EMAIL = process.env.NEXT_PUBLIC_CORRECTIONS_EMAIL || "";

/** The body of a report, already filled in as far as the site can fill it. */
export function correctionReport(entryId?: string, title?: string) {
  const where = entryId ? `${SITE_URL}/d/${entryId}` : SITE_URL;
  return [
    entryId ? `Entry: ${title} (/d/${entryId})` : "Page:",
    `Address: ${where}`,
    "",
    "What looks wrong:",
    "",
    "",
    "What it should be, and the source that shows it:",
    "",
  ].join("\n");
}

export function correctionMailto(entryId?: string, title?: string) {
  if (!CORRECTIONS_EMAIL) return "";
  const subject = entryId ? `Correction: ${title}` : "Correction";
  return `mailto:${CORRECTIONS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(correctionReport(entryId, title))}`;
}

/** A correction link that arrives with the entry already identified. */
export function correctionLink(entryId: string, title: string) {
  const url = new URL(CORRECTIONS_URL);
  if (url.hostname === "github.com") {
    url.searchParams.set("title", `Correction: ${title} (/d/${entryId})`);
    url.searchParams.set(
      "body",
      `Page: ${SITE_URL}/d/${entryId}\n\nWhat looks wrong:\n\n\nWhat it should be, and the source that shows it:\n`,
    );
  }
  return url.toString();
}
