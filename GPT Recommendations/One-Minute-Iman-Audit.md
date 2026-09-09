# One Minute Iman: product, content, design and SEO audit

Prepared for Arshad Hossain • 9 September 2026  
Website: [One Minute Iman](https://www.oneminuteiman.xyz/)

## The decision

Keep the concept and the current cream, green and serif visual direction. Put the next development effort into reliable content, accurate feeling search and a complete first answer. A wholesale redesign or another large content import would not address the most important problems found here.

The strongest positioning is a trusted first place to turn for Islamic comfort and guidance when a person feels something. Make an ordinary visit feel complete while keeping primary sources and qualified human help available. Success should mean a visitor finds something relevant, understands it and can return to it easily. Keeping everyone on the site at all costs is a less useful goal.

### Scope and limits

I inventoried all 4,131 sitemap URLs; retrieved all 43 situation pages and checked their structure; inspected representative dua, Quran and hadith pages; reviewed desktop screenshots; tested feeling searches, translation switching and a tafsir disclosure; and inspected public HTML, metadata, robots.txt, sitemap and selected source references. The downloaded HTML sample contains 69 unique pages. The detailed findings below come from those observations, with recommendations labelled as such.

This is not a scholarly certification of 3,371 entries, a line-by-line editorial review of every narration, or an authenticated Search Console audit. I did not inspect the source repository, analytics, backlinks, mobile device screenshots or measured Core Web Vitals. Search did not surface the site's pages in this session, but that alone cannot establish Google's index coverage or traffic.

## 1. Fix content reliability before promoting the site

### Critical: a dua page combines different texts

On [the afflicted-person page](https://www.oneminuteiman.xyz/d/afflicted), the title and English transliteration concern seeing someone afflicted. The displayed Arabic and full narration concern returning to bed, sleeping and waking. These are different passages.

The site links to [Tirmidhi 3401](https://sunnah.com/tirmidhi:3401), which is indeed the bed/sleep narration. The afflicted-person wording appears in [Tirmidhi 3431](https://sunnah.com/tirmidhi:3431), where Sunnah.com displays a different grading. Do not simply change the reference number and preserve the existing badge: the Arabic, meaning, attribution, explanatory note and grade need to be reviewed together.

**Action:** temporarily remove this entry from featured/search recommendations until corrected. Review all featured entries first, then audit the remaining corpus with the same checks.

### Critical: text matching is being presented as more verification than it provides

The [verification page](https://www.oneminuteiman.xyz/authenticity) describes checking whether Arabic is a substring of a primary source. The [About page](https://www.oneminuteiman.xyz/about) says the translations and commentary have not undergone formal scholarly review.

A substring check can establish that some Arabic appears in a source. It cannot establish that:

- The selected Arabic is the intended supplication.
- The transliteration reads that Arabic.
- The English translates the same selected words.
- The title and situation accurately describe its context.
- A claimed repetition count or benefit belongs to that passage.
- A story's added details are supported.
- The grading belongs to the exact version of the narration shown.

The confirmed afflicted-person mismatch demonstrates this gap. Replace absolute guarantees with a precise description of what was checked. Avoid unsupported claims about the proportion of unreliable content on other websites.

The method also chooses entries by counting authenticating and weakening verdicts. Present this as the site's inclusion rule. Have a qualified reviewer evaluate the policy; a numerical majority is not, by itself, evidence that this site has independently authenticated a narration. Document the editions and sources of each recorded grading, including disagreements.

### High: Quran passage and recitation excerpt need separate presentation

On [the loss page](https://www.oneminuteiman.xyz/d/loss-death), the Arabic and English include Quran 2:156–157, while the transliteration contains only the familiar short response to loss. The reader cannot follow the three blocks word for word.

On [the safe-city page](https://www.oneminuteiman.xyz/d/safe-city), the full Arabic verse and translation are paired with a shortened transliteration. On [the household-greeting page](https://www.oneminuteiman.xyz/d/greet-the-house), the transliteration and English include an ending about blessings that is absent from the displayed Arabic extract.

**Action:** show a clearly labelled recitation block whose Arabic, transliteration and translation match exactly. Put the full verse or narration in a separate context block. Keep necessary context, but make it obvious which words a beginner is learning to say.

### High: source numbering is inconsistent with the stated convention

[The qadar page](https://www.oneminuteiman.xyz/d/qadar) labels its narration Muslim 6774 and constructs a Sunnah.com link with that number. The matching narration is published by Sunnah.com as [Muslim 2664](https://sunnah.com/muslim:2664).

Access to the site's 6774 destination failed in this session, so I am not labelling it a confirmed 404. The numbering mismatch is independently visible in the matching source text. Audit the entire collection's mapping rather than assuming one isolated typo.

Store internal dataset IDs, collection/edition numbering, in-book references and external source URLs in separate fields. A dataset's sequential ID should not automatically become a Sunnah.com URL. A source-link test must check the destination's content, not just whether it returns HTTP 200.

### Other editorial problems

- The anxiety page describes a narration as the one said most often, whereas the cited Bukhari 6369 text establishes habitual use without establishing that comparison. Remove unsupported superlatives. [Source](https://sunnah.com/bukhari:6369).
- The site's source badge wording for Bukhari/Muslim is ambiguous about whether a narration occurs in one or both collections. State the actual collection and references explicitly.
- The Hadith introduction refers to six books, while its graded list also includes Muwatta Malik. Its description of the ungraded reference material as Forty collections does not fit several displayed collections. Make the introduction match the actual list. [Hadith hub](https://www.oneminuteiman.xyz/hadith).
- The corpus includes verses, instructions and general narrations as well as supplications. Calling every record a supplication misrepresents what users will receive.
- Some previews end mid-word. The anxiety narration also contains an unfinished cross-reference. Preserve imported text cleanly and use deliberate summaries.
- About describes the checking process but does not identify the people responsible. Add the creator, editor, reviewer where available, qualifications relevant to the role, correction contact and review dates. Never invent reviewer credentials.
- Add a report-an-error control beside each reference. Every correction should be traceable to the affected entry and review.

### Publication checks to implement

| Check | Required result |
|---|---|
| Arabic/source match | Correct excerpt found in the correct source version |
| Translation alignment | English covers precisely the selected Arabic |
| Transliteration alignment | Every displayed recitation phrase has a matching pronunciation |
| Context | Situation and historical claims have support |
| Practice claims | Counts, times and promised benefits have exact references |
| Grading | Source and edition recorded; disagreement displayed accurately |
| Source link | Correct destination passage, not merely a live URL |
| Editorial approval | Actual reviewer and review status recorded |
| Related content | Recommendations explain their relevance |

Use automation to flag problems and a qualified human to approve religious interpretation. An AI model can help classify a user's situation, but should retrieve approved religious text rather than generate attributed duas or hadith.

## 2. The search recognizes topics better than it selects answers

These were synthetic tests of the public homepage. They are not personal disclosures.

| Test | Observed behavior | What needs to change |
|---|---|---|
| I lost my mother | Correct loss category, plus family results including illness; loss results also include a warning about the Fire | Prioritize bereavement, comfort and prayers for the deceased. Distinguish a deceased parent from a sick parent |
| I am happy | Gratitude category, but early cards include hardship, distress and drought | Put thanksgiving first and suppress unrelated context |
| I feel lonely | Loneliness category with some relevant verses and several broad family/context results | Explain why the leading response fits loneliness |
| I am not sad, I am grateful | Gratitude followed by sadness | Respect negation instead of matching every emotion word |
| I passed my exam | Gratitude recognized, but the same broadly mismatched gratitude cards appear | Recognition is useful; result ranking still needs editorial work |
| amar mon kharap | No match | Add Banglish support if serving Bangladesh |
| মন খারাপ | No match | Add Bengali understanding alongside reviewed Bengali content |
| Explicit self-harm statement | Dedicated compassionate message, nearby-person suggestion, helpline directory and emergency direction | Preserve the special handling; improve wording, sourcing and coverage |

The observed behavior suggests broad category matching is doing much of the work. I did not inspect the implementation, so this is an inference, not a claim about the underlying search algorithm.

### Build a better result order

1. Recognize emotion, event, who it concerns and whether the user is seeking a dua, explanation or story.
2. Handle clear crisis intent separately.
3. Select one best reviewed entry for the full situation.
4. Offer two clearly relevant alternatives, with a short reason each fits.
5. Offer optional context, a story and further reading.
6. If uncertain, ask one gentle clarification rather than asserting an exact match.

Build a fixed evaluation set with ordinary wording, spelling mistakes, negation, mixed feelings, bereavement versus illness, positive events and supported languages. Review the top three results for each. Treat a correct category with irrelevant top cards as a failure to resolve.

The no-match message currently asks for plainer words. That can make the visitor feel responsible for the tool's limits. A better fallback acknowledges the failed match, offers a few feelings to choose from, and explains language support without making the person start over.

### Preserve and refine crisis handling

The tested explicit crisis input correctly changed the experience. That is a meaningful strength. Use time-neutral wording instead of assuming it is night. Keep practical support prominent. Review the accompanying religious story and add its precise source; do not make an unsourced interpretation carry the reassurance. Test indirect phrases and supported languages before claiming broad coverage. Keep serious distress from falling back to irrelevant browsing suggestions.

### Privacy belongs in the product

I did not establish how search text is stored or sent. Because visitors may enter intimate information, explain what happens to it. Prefer local processing where practical. Do not put raw feeling statements into analytics events, advertising pixels, session recordings, publicly shareable URLs or indexed pages. Measure anonymized categories and interactions instead. Add a clear privacy page and make a search-private claim only if the implementation supports it.

## 3. Make the one-minute promise real

At present, visitors often get a catalogue and must choose another page. The individual dua pages are readable, but sampled pages do not offer visible listen, save or copy actions. The site has useful source material; the missing layer is a short, complete response to the person's present situation.

### Recommended first-answer layout

| Order | Content | Purpose |
|---|---|---|
| 1 | One calm sentence acknowledging the situation | Let the visitor recognize the match |
| 2 | One suitable dua with aligned Arabic, pronunciation and meaning | Deliver immediate value |
| 3 | Source, grading where applicable and review information | Make trust inspectable |
| 4 | Listen, copy, save and text-size controls | Make it usable in real life |
| 5 | A brief explanation of relevance | Separate source context from editorial application |
| 6 | Optional Quran verse or short sourced story | Offer depth without imposing a long read |
| 7 | One realistic next step and two related choices | Help the visitor continue purposefully |

For a bereavement query, distinguish words for the grieving person from a prayer for the deceased. If offering gendered wording, explain and review the relevant variants. For a happy event, start with thankfulness. For an exam, distinguish preparing, fear before it, passing and coping with a disappointing result.

The central product principle is: a useful answer in about a minute, with deeper reading available. The brand does not need to impose a countdown or promise emotional recovery within sixty seconds.

### Repeat-use features, in order

1. Save a dua without forcing registration, with a clear explanation of device-only storage.
2. Reviewed audio and phrase-by-phrase learning for the most-used duas.
3. Recently read items and resume reading.
4. A small personal collection, such as morning, difficult days or family.
5. Optional reminders and offline access once the core experience is reliable.

Do not make accounts, points, guilt-based streaks or notifications prerequisites for comfort. Treat optional reminders as the user's choice.

### Stories and inspiration

The Yunus page already contains narrative context. Build on that rather than treating stories as an entirely missing feature. Link a small number of carefully sourced stories to the feelings they illuminate. Start with established Quranic narratives and distinguish source text, tafsir, historical material and your own reflection. Do not add imagined dialogue or dramatic details and present them as revelation or hadith.

Use qualified review for sensitive applications. For example, a verse's original context and a modern reader's reflection should not be presented as the same claim. A story can accompany support without promising that the reader's outcome will match the story's outcome.

## 4. Design critique and recommended direction

### Keep the visual identity

The current desktop design uses warm ivory, muted green, thin borders and restrained geometric ornament. The headline font is Cormorant Garamond; body text is Inter. The main homepage heading measures 68 px at the inspected desktop viewport, with 17 px introductory body text.

This is a coherent, calm foundation. It suits private reading. The settled dua view has a clear Arabic focal point, a narrow reading column and restrained source material. Keep those qualities.

Your mixed feelings about the design may come from the difference between a pleasing first impression and a less satisfying task flow. This is my interpretation: the page is visually quiet, but it becomes a large collection rather than a guided answer when someone uses it.

### Change hierarchy and behavior

| Area | Current issue | Recommended change |
|---|---|---|
| Hero wording | The wording addresses an impersonal tool and overstates exact matching | Use a direct, human question about the visitor's feeling; explain Quran and Sunnah support simply |
| Main action | Large search field with no visible submit action in the inspected state | Add a clear find-guidance action while preserving responsive suggestions |
| First screen | A large introduction consumes space before useful content | Tighten vertical spacing and show a useful example sooner |
| Suggestion chips | Initial examples focus on difficult states | Include gratitude or a positive life event |
| Navigation | Organized mainly by source type | Add an obvious feelings route; keep Quran, duas and stories easy to reach |
| Category cards | Counts dominate and overlapping group totals are hard to interpret | Lead with the situation and the kind of help available |
| Search results | Multiple similar cards and additional homepage sections compete | Give one best result priority and collapse broad exploration |
| Dua actions | Sampled detail pages lack visible listen/save/copy tools | Put these beneath the recitation block |
| Sources | Valuable, but mixed into a long reading path | Keep a compact source line visible, with details expandable |
| Reading comfort | Small, italic transliteration is less accessible to beginners | Offer larger regular-style pronunciation text and reviewed audio |
| Motion | Content briefly fades in before reaching readable opacity | Make the essential dua visible immediately |
| Category depth | Hundreds of cards create long scrolling | Curate a useful opening; paginate the reference archive |

The CSS already includes responsive breakpoints and a reduced-motion rule. Do not treat either as absent. Actual mobile usability still needs device testing: 360–430 px widths, 200% zoom, keyboard navigation, Arabic wrapping, screen-reader labels, focus states and tap targets. Do not claim an accessibility pass from desktop appearance alone.

### Design choices to make now

- Keep the current palette rather than adding more decorative colors.
- Keep a serif for a few expressive headings; use Inter for instructions and controls.
- Preserve generous line spacing and a restrained reading width.
- Use green primarily for meaningful actions and selected states.
- Make the initial dua view compact enough to deliver the complete short response promptly.
- Retain dark-mode support where already implemented, then test Arabic and control contrast in both themes.
- Keep sources reachable. Visitors should not need to leave for basic meaning or pronunciation, but should be free to verify the original.

Test the revised layout with five people. Give each a concrete situation, ask them to find something suitable, and watch where they hesitate. Ask which words they think they should recite. Their answers will be more useful than another unstructured visual preference check.

## 5. SEO: the foundation already exists

### Verified technical strengths

| Check | Finding |
|---|---|
| robots.txt | Allows crawling and names the sitemap |
| Sitemap | 4,131 URLs: 3,371 dua entries, 43 situation pages, 115 Quran URLs, 598 hadith URLs and 4 other pages |
| Sampled status codes | All 43 situation pages returned 200; deliberately nonexistent URL returned 404 |
| Canonicals | Correct production-domain canonical tags present in the inspected core/detail samples |
| Robots meta | Inspected samples declare index, follow |
| Initial HTML | Meaningful content is included in the downloaded HTML |
| Host behavior | HTTP and the non-www host resolved to HTTPS www in tested requests |
| Social preview | Open Graph metadata exists; the referenced image endpoint returned a PNG |
| Situation structure | All 43 downloaded situation pages include a short answer and common questions |
| Structured data | Website/organization and content markup already exist |

You do not need to begin by adding basic SEO tags from scratch. These checks establish eligibility-related foundations, not actual Google indexing or ranking. Google's guidance prioritizes helpful content, discoverable pages and an intelligible site structure. [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

### Priority A: establish the real search baseline

Create or verify a Google Search Console Domain property using DNS. Submit the existing sitemap. Inspect the homepage and a selection of important situation and detail URLs. Look at Page indexing, Google-selected canonical, last crawl and the rendered result. Review security/manual-action reports and performance by query, page, country and device.

Do not resubmit thousands of pages manually. Do not interpret a sitemap's URL count as an indexed-page count. Request indexing for a small set of corrected priority pages and let sitemap/internal linking support wider discovery.

No current click, impression, ranking, keyword-volume or backlink figures were available to this audit. Establish them before buying tools or diagnosing a penalty.

### Priority B: improve existing situation pages

The 43 situation pages are your strongest starting point for matching searches to a useful experience. They already have short answers and FAQs. Improve relevance, explain the first recommendation, put the complete leading dua on the page, and make the explanation specific to that situation.

A large quantity of shared Quran/hadith text is not automatically a quality problem. The question is whether the page adds useful selection, explanation, accessibility and navigation for its particular reader. Avoid mass-producing near-identical pages for keyword variations. [People-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

| Existing destination | Query theme to investigate | Distinctive job for that page |
|---|---|---|
| /s/anxiety | dua for anxiety and worry | Choose a reviewed starting dua and explain its use without promising a cure |
| /s/sadness | dua for sadness | Comfort and relevant meaning, distinct from the general anxiety page |
| /s/death | dua when someone dies; dua for a deceased parent | Separate grief, prayer for the deceased and funeral contexts |
| /s/debt | dua for debt | Relevant supplication, meaning and realistic context |
| /s/forgiveness | dua for forgiveness | Explain the selected supplications and repentance context |
| /s/loneliness | Quran verses for loneliness | Source context and a short compassionate reading path |
| /s/sleep | dua before sleeping | A clear bedtime sequence with only supported practice claims |
| /s/knowledge | dua for studying and exams | Distinguish a general request for knowledge from an exam-specific claim |
| /s/illness | dua for illness and healing | Suitable texts with careful framing |
| /s/weak-iman | dua for weak iman | Reviewed guidance for spiritual difficulty |
| /d/dua-yunus | dua Yunus meaning and pronunciation | Exact wording, meaning, pronunciation and source story |
| /d/anxiety-grief | Allahumma inni audhu bika minal hammi wal hazan | The specific supplication's wording, pronunciation and explanation |

These are research candidates based on intent, not measured search volumes or guaranteed ranking opportunities. Use Search Console to refine them. Choose one main destination for each intent. A situation hub and an individual dua can coexist when they have distinct purposes and link to each other.

### Priority C: make titles clearer without losing the voice

The detail-page titles are often emotionally effective but omit the common name of the dua. Pair the subject with the human benefit. Examples to test after the content is corrected:

| Page | Suggested title |
|---|---|
| Homepage | One Minute Iman: Duas and Quran for How You Feel |
| /d/dua-yunus | Dua Yunus: Arabic, Meaning and Transliteration |
| /d/anxiety-grief | Dua for Worry and Grief: Arabic and Meaning |
| /d/debt | Dua for Debt: Allahummakfini Bihalalika |
| /s/prayer | Duas During Salah: What to Say and When |
| /s/misc | Browse More Duas and Narrations |

Keep the warmer emotional phrasing as supporting copy where appropriate. Fix awkward templates, including the current prayer title's grammar. Write useful descriptions rather than chopping translations mid-sentence. Google recommends concise, descriptive titles and may generate title links from several page signals. [Title guidance](https://developers.google.com/search/docs/appearance/title-link).

Do not change every existing URL for cosmetic reasons. The short /s/ and /d/ paths are not the urgent issue. A future URL change needs correct redirects, canonicals, internal links and sitemap updates.

### Priority D: fix structured-data inconsistencies

- The inspected global graph repeats an About WebPage node on unrelated pages. Keep shared organization/site entities, but give each current page an appropriate URL, name and page entity.
- The SearchAction advertises /browse?q=…, but testing /browse?q=anxiety showed the general directory without applying the query. Implement a working target or remove that claim.
- Review attribution in content markup. The Yunus quotation currently identifies Prophet Muhammad as its speaker; distinguish the original speaker from a narrator who reports its virtue.
- Keep structured data consistent with visible content and actual functionality. Schema cannot certify authenticity or substitute for useful content. [Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

### Priority E: reduce heavy documents and long directories

| Sample page | Downloaded HTML size, approximately |
|---|---:|
| Homepage | 79 KB |
| Anxiety situation | 380 KB |
| Gratitude situation | 623 KB |
| Thinking about death | 1.17 MB |
| Further supplications | 1.63 MB |
| Bukhari miscellaneous chapter | 3.11 MB |
| Al-Baqarah | 3.59 MB |

These are downloaded document sizes from the audit client, not total page transfer sizes, compressed browser sizes, loading times or Core Web Vitals scores. The larger pages warrant attention, especially for mobile readers.

Paginate very long catalogues with crawlable links. Avoid rendering every archive result before a person asks for it. Consider loading optional long tafsir and alternate translations as needed while ensuring the core content and navigation remain accessible. Profile duplicated serialized data before making framework changes.

Measure representative pages with PageSpeed Insights and real-user data. Targets for good Core Web Vitals are LCP at most 2.5 seconds, INP at most 200 ms and CLS at most 0.1 at the 75th percentile. These are targets, not this site's measured results. [Web Vitals](https://web.dev/articles/vitals).

### Priority F: make the index intentional

The site labels 1,068 entries as written out in full and another 2,303 as source-narration entries. The sampled reference entry has Arabic and generated transliteration, with meaning embedded in a longer narration. That can serve reference users, but it is a weaker first answer for a beginner.

Review entries by utility and distinctiveness. Improve valuable ones; consolidate genuine duplicates; exclude unresolved incorrect material from recommendations; consider noindex only where a page should remain accessible but does not yet merit search landing-page status. Do not bulk-delete or noindex 2,303 URLs merely because of the template label.

All sitemap entries shared one lastmod timestamp during this snapshot. That may be a legitimate initial publication timestamp. Check the code and ensure future timestamps represent substantive page changes rather than every build. The 4,131-URL sitemap does not need splitting to satisfy Google's size limits; separating content types can nevertheless help monitoring. [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## 6. Traffic and return visits

Your advantage is the connection between a person's words, a suitable source and a useful explanation. Simply importing more Quran/hadith material does not create that advantage.

### A realistic distribution system

1. Improve one situation page each week after the initial reliability fixes.
2. Produce a source-checked short video, a simple Arabic/meaning card and a brief explanatory post from that page.
3. Link to that exact useful page, not always the homepage.
4. Invite relevant teachers, mosque resource teams and Muslim community educators to review and reference it when it helps their audience.
5. Use questions and failed searches to improve the page, protecting visitors' privacy.

Do not buy link packages or distribute generic AI-written articles merely to increase page count. Earn references through useful reviewed work, pronunciation aids and clear explanations.

For an audience in Bangladesh, Bengali and Banglish understanding could be a meaningful differentiator. Start with a small reviewed Bengali collection and matching search support. Expand only when you can maintain translation and religious review quality. Fully translated pages should have their own consistent language URLs and appropriate language annotations; a language switch should not just relabel English content.

Google's AI search features use the same foundational SEO principles; there is no separate magic markup requirement. Prioritize readable content, source clarity and indexing before spending on AEO/GEO hacks. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).

### Measure usefulness as well as traffic

| Metric | Why it matters |
|---|---|
| Search Console non-brand clicks | New people finding useful pages |
| Indexed priority pages | Whether your intended entry points are available in search |
| Relevance of top three results | Whether the product understands the visitor |
| No-match rate by supported language | Where coverage breaks |
| Time to the first usable dua | Whether the one-minute promise is working |
| Optional helpfulness response | Whether the result matched the need |
| Listen, copy and save use | Whether people can act on the content |
| Return visits | Whether people choose to come back |
| Confirmed content errors and time to correction | Whether trust is being maintained |

A short successful visit is valuable. Do not maximize time on site by adding friction. Do not record raw sensitive search text to measure these outcomes.

## 7. Implementation order

| When | Deliverable | Acceptance condition |
|---|---|---|
| First 48 hours | Correct/remove the confirmed mismatched entry; review other documented alignment errors | Every affected recitation block aligns and its reference is correct |
| First week | Review featured duas and source-number mappings; rewrite overclaims; establish Search Console | Visible featured content has an accountable review; search baseline recorded |
| Weeks 2–3 | Rebuild top-result selection and first-answer layout | Fixed synthetic test set produces relevant leading answers; no required extra click for a basic dua |
| Weeks 2–4 | Add core reading actions and privacy explanation | Save/copy/listen where available work clearly; no misleading privacy claim |
| Weeks 3–6 | Improve the ten main situation pages and named-dua pages | Each page resolves a distinct need with aligned wording and sources |
| Weeks 3–6 | Repair schema, long-page delivery and imported-text formatting | Markup matches pages; representative mobile performance is measured and addressed |
| Weeks 6–12 | Publish reviewed stories, test Bengali pilot and distribute useful resources | Growth comes from maintainable content and measured demand |
| Every week | Review search performance, failed matches and corrections | Next work is selected from evidence rather than page-count targets |

This is a work sequence, not a promise that traffic will arrive by a particular date. Resource it according to who can implement changes and who can review religious content.

## 8. What to provide for a deeper technical follow-up

Search Console screenshots or exports for Performance and Page indexing would establish the current search baseline. The repository would allow the source-ID mappings, search ranking, generated transliteration and page serialization to be corrected at their origin. Neither was required to identify the public-facing issues above, but they are needed to validate implementation-level causes and actual traffic.

The immediate decision is already clear: preserve the calm visual identity, repair content alignment and verification claims, and make the first response more precise and complete before expanding promotion.

## Appendix: situation-page inventory

All 43 situation pages returned HTTP 200 and contained both a short-answer section and common questions. The inventory below records the fetched page title, number of links to dua entries and downloaded HTML size. These are structural measurements, not scholarly ratings or performance scores.

| Situation page | Dua-entry links | HTML size |
|---|---:|---:|
| [Duʿā for sadness](https://www.oneminuteiman.xyz/s/sadness) | 116 | 354 KB |
| [Duʿā for anxiety and worry](https://www.oneminuteiman.xyz/s/anxiety) | 125 | 380 KB |
| [Duʿā for fear](https://www.oneminuteiman.xyz/s/fear) | 139 | 420 KB |
| [Duʿā for anger](https://www.oneminuteiman.xyz/s/anger) | 62 | 211 KB |
| [Duʿā for loneliness](https://www.oneminuteiman.xyz/s/loneliness) | 99 | 323 KB |
| [Duʿā for hopelessness](https://www.oneminuteiman.xyz/s/despair) | 79 | 276 KB |
| [Duʿā for feeling overwhelmed](https://www.oneminuteiman.xyz/s/overwhelm) | 89 | 305 KB |
| [Duʿā for joy and gratitude](https://www.oneminuteiman.xyz/s/gratitude) | 223 | 623 KB |
| [Duʿā for envy and comparison](https://www.oneminuteiman.xyz/s/envy) | 44 | 165 KB |
| [Duʿā for shame and guilt](https://www.oneminuteiman.xyz/s/shame) | 137 | 444 KB |
| [Duʿā for severe distress](https://www.oneminuteiman.xyz/s/distress) | 67 | 224 KB |
| [Duʿā for being ill](https://www.oneminuteiman.xyz/s/illness) | 119 | 343 KB |
| [Duʿā for someone you love is ill](https://www.oneminuteiman.xyz/s/someone-ill) | 21 | 90 KB |
| [Duʿā for losing someone](https://www.oneminuteiman.xyz/s/death) | 169 | 461 KB |
| [Duʿā for debt](https://www.oneminuteiman.xyz/s/debt) | 38 | 139 KB |
| [Duʿā for money and provision](https://www.oneminuteiman.xyz/s/poverty) | 159 | 450 KB |
| [Duʿā for being wronged](https://www.oneminuteiman.xyz/s/oppression) | 82 | 259 KB |
| [Duʿā for someone means you harm](https://www.oneminuteiman.xyz/s/enemy) | 63 | 224 KB |
| [Duʿā for when it did not work out](https://www.oneminuteiman.xyz/s/failure) | 43 | 167 KB |
| [Duʿā for marriage and spouse](https://www.oneminuteiman.xyz/s/marriage) | 179 | 437 KB |
| [Duʿā for children](https://www.oneminuteiman.xyz/s/children) | 187 | 475 KB |
| [Duʿā for parents and family](https://www.oneminuteiman.xyz/s/parents) | 139 | 405 KB |
| [Duʿā for conflict with someone](https://www.oneminuteiman.xyz/s/reconcile) | 90 | 286 KB |
| [Duʿā for study and exams](https://www.oneminuteiman.xyz/s/knowledge) | 91 | 281 KB |
| [Duʿā for work](https://www.oneminuteiman.xyz/s/work) | 90 | 307 KB |
| [Duʿā for a decision to make](https://www.oneminuteiman.xyz/s/decision) | 54 | 197 KB |
| [Duʿā for travelling](https://www.oneminuteiman.xyz/s/travel) | 68 | 225 KB |
| [Duʿā for seeking forgiveness](https://www.oneminuteiman.xyz/s/forgiveness) | 283 | 690 KB |
| [Duʿā for faith feeling weak](https://www.oneminuteiman.xyz/s/weak-iman) | 154 | 426 KB |
| [Duʿā for intrusive thoughts](https://www.oneminuteiman.xyz/s/waswas) | 66 | 183 KB |
| [Duʿā for staying firm](https://www.oneminuteiman.xyz/s/steadfastness) | 155 | 489 KB |
| [Duʿā for thinking about death](https://www.oneminuteiman.xyz/s/death-remembrance) | 523 | 1,170 KB |
| [Duʿā for seeking refuge](https://www.oneminuteiman.xyz/s/refuge) | 240 | 608 KB |
| [Duʿā for evil eye and envy of others](https://www.oneminuteiman.xyz/s/evil-eye) | 44 | 157 KB |
| [Duʿā for home and household](https://www.oneminuteiman.xyz/s/home) | 47 | 161 KB |
| [Duʿā for morning and evening](https://www.oneminuteiman.xyz/s/morning-evening) | 135 | 394 KB |
| [Duʿā for sleep and the night](https://www.oneminuteiman.xyz/s/sleep) | 178 | 476 KB |
| [Duʿā for food and drink](https://www.oneminuteiman.xyz/s/eating) | 103 | 281 KB |
| [Duʿā for in prayer](https://www.oneminuteiman.xyz/s/prayer) | 270 | 685 KB |
| [Duʿā for the masjid](https://www.oneminuteiman.xyz/s/mosque) | 58 | 189 KB |
| [Duʿā for rain, wind and sky](https://www.oneminuteiman.xyz/s/rain-weather) | 53 | 165 KB |
| [Duʿā for remembrance and praise](https://www.oneminuteiman.xyz/s/dhikr) | 145 | 374 KB |
| [Duʿā for further supplications](https://www.oneminuteiman.xyz/s/misc) | 825 | 1,632 KB |
