# One Minute Iman

Tell it how you feel, in your own words, and it gives you a du'ā, a verse, or something
the Prophet ﷺ said for exactly that moment — with its source and its authenticity grading
shown on the page.

## The point

Most "surah for anxiety" content online has no authenticated chain behind it. This site
takes the opposite approach: **nothing appears here that has not been traced to a primary
source and passed a grading rule**, and every entry shows its working.

- **The complete Qur'an**: 114 sūrahs, 6,236 āyāt, three English translations, generated
  transliteration, recitation audio, and Ibn Kathīr's commentary
- **32,251 authenticated hadith** from seven collections, each carrying its gradings,
  plus 11,300 from reference collections that carry no gradings and are labelled as such
- **1,771 verified supplications** mapped across 43 situations and 900+ ways of asking of describing them
- Arabic is extracted verbatim from the source text, never retyped
- Qur'anic text comes live from the Quran.com API in Uthmani script
- Hadith gradings are collected from the scholars recorded for that exact narration
- Where scholars disagree, the disagreement is printed rather than hidden
- Material that fails is listed publicly at `/authenticity`

See [`scripts/README.md`](scripts/README.md) for how verification runs. It is
reproducible — anyone, including a scholar reviewing this, can re-run every check.

## Matching

Search is deterministic. What you type is scored against ~900 hand-written phrasings
attached to 43 situations; each situation holds supplications already verified against
their sources. No model generates or selects religious text at runtime, so the site
cannot invent, mistranslate, or misattribute anything.

Two tiers: **67 curated** entries written out in full (Arabic, transliteration,
translation, context), and **1,704 library** entries shown with generated
transliteration and their source narration.
Both pass identical verification — the difference is presentation, not rigour.

## Develop

```bash
npm install
npm run dev
```

## Stack

Next.js 16 (App Router) · Tailwind v4 · no runtime services. Every page is prerendered:
114 sūrah pages, 337 hadith book pages, 937 du'ā pages and 43 situation pages.

The hadith corpus is sharded to `data/hadith/{collection}/{book}.json` so a page ever
loads only its own book rather than the full 47MB.

## Status

The dataset is verified but **has not yet been reviewed by a qualified scholar**. That
review is recommended before promoting the site publicly. The 31 curated entries carry
authored English and are the priority for review; the library entries carry only the
published translations of the collections they come from.
