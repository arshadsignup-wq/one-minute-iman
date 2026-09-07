import type { MetadataRoute } from "next";
import { entries } from "@/lib/entries";
import { situations } from "@/lib/search";
import { surahs } from "@/lib/quran";
import { collections, COLLECTION_ORDER } from "@/lib/hadith";
import { SITE_URL } from "@/lib/site";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${SITE_URL}${p}`;

  const core: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/browse"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/quran"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/hadith"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/authenticity"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
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
      hadith.push({
        url: url(`/hadith/${c}/${b.n}`),
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return [...core, ...sits, ...quran, ...hadith, ...ent];
}
