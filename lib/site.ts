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
