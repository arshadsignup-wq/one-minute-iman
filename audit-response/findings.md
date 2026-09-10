# Response to the 9 September 2026 audit

Each finding was reproduced against the repository and the primary sources before
anything was changed. Status is one of **confirmed**, **confirmed and wider than
reported**, **partly confirmed**, or **not reproduced**.

sunnah.com returned HTTP 403 to every request from this machine (Cloudflare
interstitial), so no finding was verified by fetching a live sunnah.com page.
Verification was done against the primary-source dumps in `scripts/hadith/`,
which is what the build itself checks against.

## Phase 1: content integrity

| # | Finding | Status | What was done |
|---|---|---|---|
| 1 | `/d/afflicted` mixes two different texts | **Confirmed, and wider than reported** | The anchor `الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي` occurs in Tirmidhī 3401, 3431 and 3432. 3401 is the *waking* supplication, which opens with the same five words. The pipeline matched the anchor there and shipped the sleep narration under the afflicted-person title. The correct text was **already published** at `/d/seeing-affliction` (Tirmidhī 3431), so `/d/afflicted` was a duplicate as well as wrong. Entry deleted, its tags merged into `seeing-affliction`, and `/d/afflicted` now 308-redirects there. |
| 2 | `/d/loss-death` transliteration covers only part of the Arabic | **Confirmed** | Added a verified `recite` span. The page now shows the recited words (2:156 clause) with matching transliteration and meaning, and 2:156-157 in full under "The full verse". |
| 3 | `/d/greet-the-house` English contains an ending absent from the Arabic | **Confirmed** | Bukhārī 4793 reads `...وَرَحْمَةُ اللَّهِ` and stops. "and His blessings" / *wa barakātuh* was not in the source. Both were removed. |
| 4 | `/d/safe-city` pairs a full verse with a shortened transliteration | **Confirmed** | Added a verified `recite` span for Ibrāhīm's request, with 2:126 in full underneath. |
| 5 | `/d/qadar` cites Muslim 6774; sunnah.com publishes it as Muslim 2664 | **Confirmed, and systematic** | The dataset carries two numbering schemes. They agree for every collection **except Ṣaḥīḥ Muslim, where they differ for all 7,563 records**. The site was citing and linking the sequential English numbering throughout. This affected **692 entries, 20.5% of the corpus**, not one link. Fixed at the origin with `scripts/refs.py`. |
| 6 | Unsupported claim of comparative frequency on the anxiety page | **Partly confirmed** | Bukhārī 6369 says "used to say", which establishes habit, not a comparison. Three places were tightened to the source wording (the entry lede and two hub answers). Separately, the audit's other example is **not reproduced**: `hasanah` cites Bukhārī 6389, whose text is literally "The most frequent invocation of the Prophet ﷺ was", so that claim is supported and was kept. |
| 7 | Previews and cross-references end mid-word | **Confirmed** | 34 narrations carried a print-edition cross-reference truncated during import, e.g. `(See Hadith No. 168, Vol)`. All removed at build time. |

## Root causes behind those findings

1. **An anchor proves presence, not identity.** A short anchor can occur in more
   than one narration. Finding #1 was caused by exactly that.
2. **Two numbering schemes were treated as one.** Finding #5.
3. **`span` was optional**, so the displayed Arabic could be a whole quoted
   segment while the transliteration covered a fragment of it. Findings #2 and #4.
4. **Abbreviated cross-reference narrations were selected over their full
   parents.** Four entries pointed at narrations of the form "the same as the
   hadith of X, and he added ...", which contain only a fragment, while the
   transliteration and translation were written from the complete supplication:
   `morning`, `praise-in-the-hereafter`, `seven-heavens`, `throne-of-honour`.
   All four were repointed to sources that carry the full text.
5. **The build wrote where the site does not read.** `build_all.py` emitted
   `scripts/all-entries.json` and `scripts/situations.json`, while the site reads
   `data/`, with a manual copy step in between. `data/index.json`, which the
   search loads, had **no generator at all**. A correction could therefore pass
   every check and never reach a reader.

## Corpus-wide measurement, not just the reported pages

An alignment checker (`scripts/align.py`) transliterates the displayed Arabic and
aligns it against the written transliteration. Of 877 curated entries carrying
both blocks:

- entries whose transliteration reads words the Arabic never shows: **25 before, 20 after**,
  and the remainder were checked by hand and are limitations of the matcher, not
  content errors
- entries where the transliteration covers only part of the passage: **439**, now
  labelled on the page rather than left to imply a word-for-word match

## Guards added so these cannot recur

- `span` and `recite` must be at least two words. A one-character span is
  trivially a substring of anything and previously passed. This guard caught a
  degenerate value introduced during this work.
- `recite` must be verbatim in the source, checked the same way as `span`.
- The pipeline now writes `data/entries.json`, `data/situations.json` and
  `data/index.json` directly, so there is no copy step to forget.
- `scripts/refs.py` is the single place a sunnah.com URL is constructed. Three
  call sites previously built them by hand.

## Not yet addressed

Phases 2 to 7 of the implementation prompt. Tracked separately.

---

## Phase 2: trust claims

| Finding | Status | What was done |
|---|---|---|
| Text matching presented as more verification than it provides | **Confirmed** | `/authenticity` now carries a section headed "What these checks do not establish", listing six things a substring test cannot show, including that the passage is the one the title describes and that nothing has had scholarly review. The claim that a slip "is not possible" is gone. |
| Unsupported claim about other websites | **Confirmed** | "A great deal of what circulates ... has no authenticated chain behind it" and "Most du'ā for anxiety content online has no authenticated chain" both removed. Neither was measured. |
| Grading rule presented as authentication | **Confirmed** | The rule is now stated as the site's inclusion rule, with the sentence "It is not itself a scholarly authentication." |
| Bukhārī/Muslim badge ambiguous about whether both collections carry it | **Confirmed, 1,117 entries** | "Agreed upon as authentic (al-Bukhārī / Muslim)" named two collections when only one was checked. Now "Recorded in Ṣaḥīḥ al-Bukhārī..." or "...Ṣaḥīḥ Muslim..." as applicable: 670 and 447. |
| Hadith hub says six books but lists seven | **Confirmed** | The graded set is the six books plus Muwaṭṭa' Mālik, and the ungraded set is nine works, not only the Forty collections. Both corrected. |
| Every record called a supplication | **Confirmed** | 455 entries are marked `dua`, 289 `teaching`, and most carry no mode at all. Category counts, the browse page and the situation hubs now say "entries". |
| No correction-reporting path | **Confirmed** | `/corrections` added, linked from the footer, from `/authenticity`, and from every entry page with the entry pre-identified. It points at the public issue tracker, which is a destination that actually receives messages; no address was invented. Configurable via `NEXT_PUBLIC_CORRECTIONS_URL`. |
| Previews end mid-word | **Confirmed** | See Phase 1, 34 narrations. |
| No named reviewer | **Open, needs the owner** | Cannot be fixed without real details. No name, credential or review date has been invented. |

## Phase 3: feeling search

A regression harness (`scripts/searchtest/`) drives the real `lib/search.ts` through
the audit's own test table plus every phrasing in the lexicon.

| Query | Before | After |
|---|---|---|
| I lost my mother | death, parents | **death** |
| my mother is sick | parents | **someone-ill** |
| I am not sad, I am grateful | gratitude, **sadness** | **gratitude** |
| I failed my exam | knowledge | **failure** |
| I passed my exam | gratitude | gratitude |
| amar mon kharap | no match | **sadness** |
| মন খারাপ | no match | **sadness** |

16 of 16 cases pass, from 11 of 16. Across the whole lexicon, 1,228 of 1,318
phrasings lead with their own situation and 8 reach nothing; those eight are
phrases made entirely of stop words, such as "what if".

Three mechanisms were added: denial detection that suppresses only what is
actually being denied, outcome scoring so "failed" and "passed" outrank the
shared topic word, and a small Bengali and Banglish table. A first attempt at
negation was too blunt and silenced "I can't stop crying" and "I can't breathe";
it now fires only on real denials, and the coverage test is what caught it.

Also: the crisis panel no longer assumes it is night, and both the crisis and
harm panels now cite their narration precisely and link to it. The empty state
no longer tells the visitor to use plainer words.

## Phase 4: the first answer

- **Copy** puts the Arabic, pronunciation, meaning, reference and grading on the
  clipboard. What the reader typed is never included.
- **Save** works without an account, in device storage, with a `/saved` page that
  says plainly what that does and does not mean.
- **Text size** enlarges the Arabic and the pronunciation only, so the page does
  not reflow around them. The transliteration is no longer italic.
- **Listen** appears on **78 entries**: the Qur'anic ones where the site already
  has rights-cleared recitation (Alafasy via Quran.com, already used on the surah
  pages) *and* the page shows the whole verse. Entries showing an excerpt are
  excluded, because the recording would say more than the page shows. There is no
  rights-cleared recitation for the hadith supplications, so none is claimed and
  no empty player is drawn.

## Phases 5 to 7: design, SEO, performance

| Finding | Status | What was done |
|---|---|---|
| About WebPage entity repeated on unrelated pages | **Confirmed** | Removed from the site-wide graph. |
| SearchAction advertises `/browse?q=` but the query does nothing | **Confirmed** | `/browse?q=` now applies the query. Read in the browser so the page stays static. |
| Yunus quotation attributes the Prophet as speaker | **Confirmed** | Every hadith-sourced entry was marked `spokenByCharacter: "Prophet Muhammad"`, which is wrong wherever he was narrating someone else's words. Nothing in the data separates speaker from narrator, so no speaker is asserted at all. |
| Sitemap lastmod identical on every URL, reset each build | **Confirmed** | `lastmod` now comes from a content digest and only moves when the emitted data actually changes. |
| Very long catalogue pages | **Confirmed** | The wider-collection list is paged at 60 rows with crawlable path-based links. `/s/misc` 1,595 KB to **190 KB**, `/s/death-remembrance` 1,144 KB to **478 KB**. Continuation pages are `noindex, follow`, so they are crawlable but are not competing landing pages. |
| Starting examples all difficult states | **Confirmed** | "Something good happened" added to the visible chips. |
| Privacy not explained | **Confirmed** | `/privacy` added. The claim is verifiable: the homepage loads nothing from any third-party host, there is no analytics of any kind, and the site has three dependencies. |

Pagination was first built on `searchParams`, which silently turned all 43 hub
pages and `/browse` from static into server-rendered. That was caught in the
build output and rewritten as path-based paging. All 4,176 pages are static.

## Second pass: the limitations from the first pass

Three of the four were fixable. Working through them turned up a defect the
first pass had missed entirely.

### Eleven duplicate pairs, found because the first duplicate check was wrong

The first pass compared **hadith** sources only, so it never looked at Qur'anic
entries. Comparing the normalised Arabic of every curated entry found **11 pairs
showing the identical verse**, with the same Arabic and the same translation,
differing only in framing: 22 pages competing for the same intent, which is the
problem the audit's SEO section warned about.

Each pair was merged into the stronger page, tags and situations merged, the
note from the retired entry kept where the survivor had none, and a 308 added.

| Retired | Kept |
|---|---|
| `/d/hardship-with-ease` | `/d/ease-after-hardship` |
| `/d/do-not-despair-of-mercy` | `/d/never-despair` |
| `/d/say-my-lord-increase-me` | `/d/knowledge` |
| `/d/if-you-are-grateful` | `/d/gratitude` |
| `/d/lightened-after` | `/d/burden` |
| `/d/do-not-despair-of-relief` | `/d/never-give-up-hope` |
| `/d/reward-without-measure` | `/d/patience-reward` |
| `/d/he-answers-the-call` | `/d/i-am-near` |
| `/d/softened-toward-them` | `/d/once-decided` |
| `/d/hold-to-forgiveness` | `/d/repel-with-better` |
| `/d/a-goodly-life-for-both` | `/d/a-good-life` |

Curated entries: 1,067 to 1,056.

### `/d/own-pain`

Its transliteration read "Bismillāh (×3), then: ... (×7)" over Arabic that showed
neither the Bismillāh nor the counts, and its "translation" was instructional
prose rather than a translation. Muslim 2202 supports all of it, so the span was
widened to the whole instruction, the recited words are shown as the recitation,
and the instruction moved to a note.

### The 18 unverifiable Muslim citations

The count was wrong. For library entries the earlier scan read the printed
citation as though it were the dataset's row id, which produced false matches.
The real set was **five curated entries and two library ones**.

sunnah.com blocked scripted requests, but a browser reaches it, so each was
resolved by fetching candidate pages and matching the narration text word for
word. Interpolating from neighbouring records was not safe on its own: the
records around these are not always in order, and one plausible guess for
`janazah` gave `962f`, which does not exist.

| Entry | Was | Now | Confirmed by |
|---|---|---|---|
| `janazah` | muslim:2232 (dead) | **muslim:963a** | the funeral prayer, 'Awf b. Malik |
| `refuge-at-a-stop`, `the-perfect-words` | muslim:6879 (dead) | **muslim:2708b** | the perfect words, Khawla bint Hakim |
| `a-covenant-i-made` | muslim:6625 (dead) | **muslim:2602c** | "I am a human being", Jabir |
| `a-word-carried` | muslim:7017 (dead) | **muslim:2769a** | the expedition to Tabuk |

Two library entries (records 5971 and 7512) have no standard number and no page
on sunnah.com under any candidate tried. They no longer carry a deep link that
404s: they link to the collection and the page says why. 14 links sampled at
random across all collections were checked and all resolve.

### The alignment checker's false positives

All 20 were read by hand and none was a content error. The matcher was failing on
its own terms: hand transliterations hyphenate clitics (`li-ḥayyinā`,
`bi-ḥamdih`) and it treated each hyphenated string as one token, and it could not
equate `-ah` with `-atan` on a tāʾ marbūṭa.

It was rewritten, and a second, order-free check added: transliteration words with
no counterpart *anywhere* in the Arabic. That is the signal that catches text a
page claims but never shows.

Validated against the actual defects from the first pass rather than assumed:

| Defect | Caught |
|---|---|
| `afflicted` against the wrong hadith | yes |
| `greet-the-house` with "and His blessings" | yes |
| `morning` with the Arabic truncated | yes |
| `throne-of-honour` with one clause of three | yes |
| two correctly aligned controls | clean |

False positives fell from 20 to **32 of 866 entries at a stricter threshold**,
each one or two tokens. It now runs on every build as a warning, not a gate,
because the comparison is approximate and a handful of correct entries surface.

## Known limitations, not fixed


- **Two library entries have no resolvable source reference** (Muslim records
  5971 and 7512). They link to the collection rather than to a dead page, and
  say so.
- **The alignment checker reports 32 entries** it cannot clear automatically.
  All were read and none is a content error, but the comparison is approximate
  and it stays a warning rather than a gate.
- **Nothing here has had scholarly review.** That is stated on the site and is
  not something this work could change.
- **No mobile device testing.** Layout was measured in a real browser, but the
  tab's viewport would not follow a window resize, so the mobile header width was
  computed from element measurements rather than seen at 360px.
