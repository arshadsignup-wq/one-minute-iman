# SEO changelog

Work done in the SEO turnaround pass. Diagnosis, strategy and critique files
are in `seo/`.

## Root causes found
1. Not indexed. Domain three days old, `site:` empty, sitemap and robots 404
   until this pass. Judged ~70% of the gap.
2. Format mismatch. Situation hubs targeted "dua for anxiety" style queries with
   a card grid and 12 words of prose. Every page winning those queries is a
   written article. Judged ~20%.
3. No entity or trust layer. /about, /contact, /author all 404, Organization
   schema carried name and url only. Judged ~10%, rising.

## Shipped
- `app/sitemap.ts`, 4,131 URLs, priority weighted toward hubs and written entries
- `app/robots.ts`, nothing blocked so Google can render JS and CSS
- `metadataBase`, title template, canonical on every page pointing at the www host
- OpenGraph and Twitter cards across all page types, generated 1200x630 image
- JSON-LD: WebSite + SearchAction, Organization, WebPage, Quotation,
  BreadcrumbList, CollectionPage, ItemList, FAQPage
- Titles rewritten toward intent ("Duʿā for anxiety and worry"), all under 60
- Descriptions all under 155
- **43 situation hubs rebuilt**: keyword-bearing H1, a direct-answer block naming
  a specific supplication with its source and grading, and three FAQs, all
  visible and mirrored in FAQPage schema
- `/about` page, built only from facts checkable in this repo
- `public/llms.txt` for AI answer engines
- Removed every em and en dash from client-facing copy, metadata and data

## Verification run on the copy
- 116 hadith citations in the hub copy checked against `data/entries.json`:
  all 116 present with the collection and number cited
- 4 explicit grading claims checked against the grade the site shows: 0 mismatches
- Qurʾan references checked against surah lengths: 0 out of range

## Needs a human
- **Search Console.** Verify the property and submit the sitemap. Nothing here
  ranks until Google is told the pages exist. This is the single highest-value
  action remaining and I cannot do it.
- **Who runs this.** The About page states the method and the limits honestly but
  names no person, because I will not invent one. Adding a real name, a short bio
  and a contact route would materially strengthen the E-E-A-T position for
  religious content. Add `sameAs` links to real profiles in the Organization
  schema in `app/layout.tsx` once those exist.
- **Scholarly review.** The translations and commentary are this site's own work.
  The About page says so. A named reviewer would change what the site can claim.
