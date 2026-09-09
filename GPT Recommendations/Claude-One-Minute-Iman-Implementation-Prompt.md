# Implementation prompt for Claude

Attach the One Minute Iman audit to the same conversation. Paste the prompt below into Claude while it has access to the existing project.

---

You helped me build One Minute Iman: https://www.oneminuteiman.xyz/

I am attaching an independent audit. Use it to improve the existing website. I want you to implement the changes in the project, not only explain what I should do.

## Product goal

When a Muslim describes a feeling or situation, the website should help them quickly find a relevant dua, Quran verse, explanation or sourced story. A visitor should be able to understand and use the first response in about one minute, with deeper reading available.

Build a complete, trustworthy experience. Keep original sources accessible and preserve appropriate directions to qualified human help. Do not promise that a particular recitation will guarantee a worldly outcome or cure a condition.

## Working approach

1. Read the audit and inspect the existing repository, content pipeline, search logic, page templates and tests.
2. Reproduce each reported issue. Label it confirmed, already fixed, not reproduced or requiring further evidence. The audit is a dated snapshot, not a substitute for checking the current project.
3. Establish a baseline build and run the existing relevant checks. Preserve unrelated work and the current stack.
4. Implement the phases below in order. Keep changes reviewable, with checkpoints and concise progress updates. Continue through work you can complete without repeatedly asking me whether to proceed.
5. For something requiring unavailable credentials, a licensed asset or qualified religious review, document that exact dependency and continue the independent work. Do not invent access, expertise or completion.
6. Finish with a working preview, validation results and an honest list of outstanding items. Do not publish or deploy to production unless I explicitly request it.

Do not restart the project, migrate frameworks, rename all URLs, mass-delete pages or expand the catalogue merely to make the change look substantial. Avoid unnecessary dependencies. Use plain language in the interface and no em dashes.

## Phase 1: Repair content integrity

Reproduce and fix these audit findings:

- `/d/afflicted`: the title, transliteration and English concern seeing someone afflicted, while the Arabic and full narration concern sleep and waking. The linked Tirmidhi 3401 is the sleep narration. Review the correct text, context and grading together. Do not merely change the reference number and retain the existing grade.
- `/d/loss-death`: the Arabic and English cover Quran 2:156–157, while the transliteration covers only the short response to loss. Separate the recitation excerpt from the full contextual passage.
- `/d/greet-the-house`: the transliteration and English contain an ending absent from the displayed Arabic. Align the three blocks using the verified source version.
- `/d/safe-city`: distinguish the recitation excerpt from the full verse and clearly label any partial transliteration.
- `/d/qadar`: the page uses Muslim 6774, while the matching narration appears on Sunnah.com as Muslim 2664. Inspect collection-wide numbering rather than patching this link alone.
- Inspect claims of comparative frequency, specific benefits, repetition counts and historical circumstances. Remove or qualify unsupported claims, including the anxiety page's claim about the most frequently used dua if its source does not establish that comparison.

Preserve the source's exact Arabic. Never invent a dua, hadith, narrator, grading, tafsir quotation, story detail or religious endorsement. Do not silently combine different textual variants. Where a correction cannot be established confidently, keep the affected entry out of featured recommendations and mark it for review rather than displaying an unjustified verification badge.

Inspect the complete dataset for systematic mapping and extraction problems. Prioritize human-readable review of every homepage feature and every leading recommendation on the ten priority situation pages listed later.

Improve the content model as necessary to distinguish:

- Dua, Quran verse, hadith instruction, story and editorial reflection.
- Exact recitation excerpt versus full source passage.
- Arabic, transliteration and translation of the same excerpt.
- Internal dataset ID versus collection/edition reference and external source URL.
- Recorded scholarly grading and its provenance versus the site's inclusion decision.
- Source-context relevance versus a modern editorial application.
- Automated checks, editorial review and actual qualified scholarly review.

Automated checks should catch missing references, text-span errors, mismatched record IDs, incomplete fields and invalid mappings. Do not claim that passing a substring test proves translation accuracy, contextual relevance or scholarly authenticity. An AI-based comparison may flag suspected discrepancies but must not certify religious correctness.

For source-link validation, verify the expected passage where feasible, not only HTTP status. Treat timeouts and access restrictions as inconclusive, not proof that a link is broken.

## Phase 2: Make trust claims accurate

Update the homepage, About page, verification page, source components and related metadata consistently.

- Describe exactly what the automated checks establish.
- Remove absolute guarantees of error-free text or an exact prophetic response for every situation.
- Remove unsupported claims about how much competing online content is unreliable.
- Explain the site's grading inclusion rule without presenting a numerical vote as independent scholarly authentication.
- Show genuine grading disagreement accurately.
- Distinguish a report in Bukhari or Muslim from a claim that both collections contain it.
- Make the Hadith hub's introduction match its actual graded and reference collections.
- Do not call every verse, instruction or narration a supplication.
- Show actual creator/editor/reviewer identities only when supplied and verified. Record missing reviewer information as a dependency.
- Add a usable correction-reporting path associated with each entry. Use an existing configured destination; do not invent an email address or show a form that cannot submit.
- Clean up truncated cross-references and previews that end mid-word.

An editorial review must never silently become a scholarly-review badge. Report dates should reflect actual checks, not automatic build times.

## Phase 3: Improve feeling search

Inspect the current algorithm first. Improve the existing system before assuming a paid AI API is necessary. If you propose semantic or AI classification, explain the benefit, privacy implications and running cost. Do not send visitors' free text to a new external provider without an approved product decision.

Search should consider emotion, event, who it concerns, negation and requested content type. Rank reviewed entries for the whole situation, not only the first keyword.

Create meaningful regression checks for these synthetic cases:

| Input | Required behavior |
|---|---|
| I lost my mother | Bereavement support first; distinguish comfort for the visitor from prayer for the deceased; suppress sick-parent recommendations |
| My mother is sick | Illness-related support; do not treat the mother as deceased |
| I am happy | Gratitude first; exclude unrelated distress and drought from leading results |
| I am not sad, I am grateful | Respect negation; do not select sadness because its word appears |
| I passed my exam | Thanksgiving for a positive event |
| I failed my exam | Support for disappointment rather than congratulations |
| I am worried about my exam | Relevant worry/study guidance without inventing an exam-specific prophetic prescription |
| I feel lonely | Relevant comfort with a brief explanation of why it fits |
| I am in debt | Relevant debt supplication and context |
| I keep sinning | Reviewed forgiveness and repentance content without shaming language |
| amar mon kharap | Recognize sadness if Banglish support is implemented |
| মন খারাপ | Recognize sadness if Bengali support is implemented |
| Ambiguous or unsupported input | Offer useful choices or one clarification instead of claiming an exact match |

Preserve existing crisis-specific handling. Test explicit and indirect crisis wording and the languages the site claims to support. Use time-neutral copy, keep human support prominent and avoid unrelated recommendations in that state. Review and precisely source religious content included in crisis messages.

Treat a correct category with irrelevant top results as a failed test. Test relevance and user-visible behavior, not merely internal function outputs.

If implementing Bengali/Banglish intent recognition before reviewed Bengali translations exist, clearly offer the relevant English content. Do not pretend the page has been translated. A full Bengali content edition is a separate reviewed expansion.

## Phase 4: Deliver a complete first answer

Improve the homepage search-result experience and the reusable detail template:

1. A brief, appropriate acknowledgement.
2. One recommended dua or verse, explicitly labelled by content type.
3. Aligned Arabic, pronunciation and meaning.
4. Compact source information and truthful review status.
5. Copy, save and text-size controls.
6. Listen where an accurate, usable audio asset is available.
7. An optional explanation, source context and relevant story.
8. A small number of closely relevant next choices.

Make the basic response usable without forcing another page visit. Keep important content available as text. Preserve source links.

Use reviewed audio with known usage rights. Do not generate unverified sacred-text audio or create a decorative player that has no functioning recording. Implement the audio component for approved assets and document missing audio separately.

Allow saving without mandatory registration, using device storage if appropriate. Explain its limitations. Make copy controls include the selected text and source. Do not copy the user's private search statement into shared content.

Preserve useful existing features, including Quran translation switching, transliteration controls, tafsir disclosures and hadith filtering. Connect existing story content to relevant situations.

Do not add accounts, public journals, paid subscriptions, points, guilt-based streaks or automatic notifications in this implementation.

## Phase 5: Refine the design

Keep the warm ivory, green accents, restrained geometry, Cormorant Garamond headings and Inter interface/body text. Improve hierarchy, reading comfort and interaction consistency.

- Make the hero more concise and human.
- Add a clear search action while preserving useful immediate suggestions.
- Include a positive feeling among the starting examples.
- Reduce oversized empty space before useful content.
- De-emphasize catalogue counts, especially overlapping counts that can mislead.
- Give the leading answer visual priority; keep broader exploration secondary.
- Make a feelings route obvious in navigation.
- Make transliteration readable for beginners; offer larger text without breaking Arabic layout.
- Keep essential recitation content visible immediately rather than waiting for a fade-in.
- Preserve existing responsive, dark-mode and reduced-motion support and validate them.
- Paginate large reference lists using accessible, crawlable navigation.

Verify representative desktop and 360–430 px mobile layouts, 200% zoom, keyboard operation, visible focus, labels, Arabic direction/wrapping, contrast and touch targets. Capture screenshots of the homepage, a searched result, a dua page and a long reference page. Report checks actually completed and unresolved problems.

## Phase 6: Improve existing SEO assets

The audit found crawling allowed, a sitemap, production canonicals, initial HTML content, metadata and short answers/FAQs on all 43 situation pages. Preserve and verify these foundations.

Prioritize these existing pages:

`/s/anxiety`, `/s/sadness`, `/s/death`, `/s/debt`, `/s/forgiveness`, `/s/loneliness`, `/s/sleep`, `/s/knowledge`, `/s/illness`, `/s/weak-iman`.

Give each a distinct user purpose, a directly usable leading answer, suitable explanation, relevant internal links and genuinely useful questions. Review substantive religious wording before presenting it as established. Do not pad pages to a word-count target.

Improve named-dua pages, particularly `/d/dua-yunus`, `/d/anxiety-grief` and `/d/debt`. Use descriptive titles that identify the dua, meaning or pronunciation. Retain warm emotional language as supporting copy. Fix awkward generated titles and cut-off descriptions.

Distinguish situation hubs from individual-dua pages to avoid creating interchangeable pages for the same intent. Preserve existing URLs unless there is a demonstrated reason to change them. Any approved URL change needs redirects, canonicals, internal-link and sitemap updates.

Fix these structured-data findings if still present:

- An About WebPage entity repeated on unrelated pages.
- SearchAction pointing to `/browse?q=...` without a working query-driven search result.
- Speaker/narrator attribution that fails to distinguish Yunus's supplication from a narration about it.

Ensure schema describes visible content and functioning features. Do not add false review data or promise rich results from markup.

Check sitemap lastmod generation. Update dates only for genuine substantive changes. Do not reset every page's date on every build. Keep only appropriate canonical, indexable pages in the sitemap. Do not mass-noindex reference entries based solely on their template or length.

## Phase 7: Performance and privacy

The audit downloaded roughly 3.59 MB of HTML for `/quran/2`, 3.11 MB for `/hadith/bukhari/0`, and 1.63 MB for `/s/misc`. These are document sizes, not Core Web Vitals measurements.

Profile those routes and the main user journey. Look for excessively large initial lists, unnecessarily eager tafsir/translation delivery and duplicate serialized content. Improve delivery while preserving core content, source navigation, accessibility and crawlability. Do not merely hide content with CSS and claim a payload reduction.

Record comparable before/after measurements using the available tools. Do not invent Lighthouse scores, field metrics or testing on a physical phone.

Inspect how search text is handled. Keep raw emotional statements out of advertising pixels, session recording, analytics parameters and public/indexable URLs. Explain actual processing and retention in a privacy page. If adding anonymous measurement, use broad categories and interactions rather than raw disclosures, and respect existing consent requirements.

Search Console requires the owner's access. If unavailable, prepare a short setup checklist identifying the sitemap and priority URLs. Do not claim that Google has indexed pages or that rankings improved based on local checks.

## Final delivery

Provide:

1. A concise explanation of the resulting user experience.
2. An issue table showing each audit finding, the implemented correction and its verification status.
3. The files/components and content records changed.
4. Build/test results and the search relevance test outcomes.
5. Desktop/mobile previews and actual performance measurements where available.
6. A list of entries still requiring qualified religious review, separated from technical blockers.
7. Any assets, credentials or owner decisions still needed.
8. A small prioritized backlog for later features and content growth.

Start by inspecting the current project and reproducing the highest-risk content issues, then implement the phases. Be explicit about what is fixed, what remains uncertain and what you could not verify.
