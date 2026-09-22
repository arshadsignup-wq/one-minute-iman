import type { MetadataRoute } from "next";
import { entries } from "@/lib/entries";
import { situations } from "@/lib/search";
import { surahs } from "@/lib/quran";
import { collections, COLLECTION_ORDER } from "@/lib/hadith";
import { bookPageCount } from "@/components/BookView";
import { SITE_URL } from "@/lib/site";
import stamp from "@/data/content-updated.json";

// Required by `output: export`: these Metadata routes compile to Route
// Handlers, which must declare themselves static to be prerendered.
export const dynamic = "force-static";

// The date the content last actually changed, not the time of this build.
// Rebuilding without a content change used to restamp every URL, which claims
// four thousand pages were revised when none were.
const now = new Date((stamp as { updated: string }).updated);

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${SITE_URL}${p}`;

  const core: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/browse"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/quran"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/hadith"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/authenticity"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: url("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: url("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/corrections"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    // /saved is different for every reader and carries noindex, so it is not listed.
    // /s/<id>/<n> are continuations of a list, also noindex, and reachable by
    // crawlable links from the hub they continue.
  ];

  // situation hubs are the pages that answer a searched feeling, so they rank highest
  const sits: MetadataRoute.Sitemap = situations.map((s) => ({
    url: url(`/s/${s.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const ent: MetadataRoute.Sitemap = entries.map((e) => ({
    url: url(`/d/${e.id}`),
    lastModified: now,
    changeFrequency: "yearly",
    // a written-out entry is worth more to a reader than a library record
    priority: e.tier === "curated" ? 0.8 : 0.5,
  }));

  const quran: MetadataRoute.Sitemap = surahs.map((s) => ({
    url: url(`/quran/${s.n}`),
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const hadith: MetadataRoute.Sitemap = [];
  for (const c of COLLECTION_ORDER) {
    const coll = collections[c];
    if (!coll) continue;
    hadith.push({
      url: url(`/hadith/${c}`),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    });
    for (const b of coll.books) {
      // A long book is served a page at a time. Every page carries narrations
      // the others do not, and all of them were indexable when the book was one
      // enormous page, so each is listed rather than treated as a continuation.
      const pages = bookPageCount(c, b.n);
      for (let p = 1; p <= pages; p++) {
        hadith.push({
          url: url(p === 1 ? `/hadith/${c}/${b.n}` : `/hadith/${c}/${b.n}/${p}`),
          lastModified: now,
          changeFrequency: "yearly",
          priority: p === 1 ? 0.5 : 0.4,
        });
      }
    }
  }

  return [...core, ...sits, ...quran, ...hadith, ...ent];
}
