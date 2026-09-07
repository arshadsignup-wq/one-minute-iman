# Diagnosis: oneminuteiman.xyz

## Verdict

The site is not ranking because it is three days old and Google has not indexed a
single page of it yet. That is the whole story today. Underneath that, two
problems will stop it ranking even after indexation: the pages built to answer
"dua for anxiety" are card grids with twelve words of prose, while every page
that currently wins those queries is a written, numbered article; and there is no
About page, no named person, and no organisation detail anywhere, which is the
weakest possible position for religious content that lives or dies on trust.

## Root causes (ranked)

### 1. Pattern A + B: not indexed, no authority yet
**Evidence.**
- `site:oneminuteiman.xyz` on Google returns zero pages from the domain (search run 07 Sep 2026).
- WHOIS creation date 2026-09-04. The domain is three days old.
- `/sitemap.xml` and `/robots.txt` returned 404 until commit 6f297ca went live today;
  before that Google had no URL list for 4,130 pages.
- Zero referring domains known. No exports provided to verify.

**Share of gap: ~70% (judgment, not measured).** Nothing else can matter until
pages are in the index.

**Fixed by:** roadmap W1-1 (Search Console + sitemap submission), W1-2 (llms.txt),
and time. Indexation of a new domain is typically days to weeks; authority is months.

### 2. Pattern C: format mismatch on every money page
**Evidence.**
- `/s/anxiety` renders as H1 "Anxiety & worry", a one-line blurb, then ~100 entry
  cards. Editorial prose on the page totals 12 words. Measured word count is 2,812
  but that is card content (Arabic, titles, gradings), not writing that answers the query.
- The SERP for "dua for anxiety and worry authentic hadith" is owned by written
  articles: amaliah.com "13 Duas for Anxiety, Worry and Stress", islamqa.info Q&A,
  abuaminaelias.com hadith pages, deenup.app and jibreel.app blog posts.
- The amaliah page that wins is ~1,200 to 1,400 words, a numbered list of 13 duas,
  each with translation, Arabic and transliteration.

**Share of gap: ~20% (judgment).** This is what stops the site winning once indexed.

**Fixed by:** roadmap W1-4. The hubs need a direct answer, named recommended duas
and an FAQ above the grid, not a replacement of the grid.

### 3. Pattern F: no entity or trust layer
**Evidence.**
- `/about`, `/contact`, `/author`, `/team` and `/llms.txt` all return 404.
- No named person appears anywhere in the codebase or on the site.
- Organization schema exists but carries only name and url. No logo, no sameAs,
  no contact point.
- `/authenticity` explains the method well but never says who applied it.

**Share of gap: ~10% (judgment), rising over time.** Religious guidance is
YMYL-adjacent. Google quality raters and AI answer engines both key on
"who is behind this and why should they be believed."

**Fixed by:** roadmap W1-3.

## What is already working, and must be protected

- **The differentiator is real and rare.** Every entry carries a primary-source
  citation and an authenticity grading. The amaliah page that outranks everything
  for this query carries neither: it gives no gradings at all and cites a source on
  only one of its thirteen duas. This is a defensible advantage that is currently
  invisible in search.
- Technical foundation is sound: SSG, fast, one H1 per page, clean canonical host,
  4,130 URLs in a valid sitemap, structured data present and valid.
- 3,371 entries is genuine depth no competitor in this niche matches.

## Secondary issues (hygiene)

- 85 of 120 crawled pages breach title (>60) or meta (>155) length. Introduced by
  my own metadata commit earlier today; my error, fixed in W1-0.
- Situation hub H1s do not contain the target keyword ("Anxiety & worry", not
  "Duʿā for anxiety").
- No `llms.txt`.
- No internal links from entry pages back up to their situation hub beyond one
  breadcrumb link.

## Unknowns (stated, not guessed)

- No Search Console, GA4 or backlink data was provided, so indexed count,
  impressions, positions and referring domains are all unverified.
- Core Web Vitals not measured; no PageSpeed data supplied. The 1.8 GB build and
  4,133 pages are worth watching but I have not measured field performance.
- Whether Bing/other engines have indexed anything was not checked.
