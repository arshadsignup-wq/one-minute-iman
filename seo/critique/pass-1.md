# Critique pass 1

## Critical
None found. The automated pass over all 43 hubs returned 0 Critical:
every page has a keyword-bearing H1 as a single text node, a direct-answer
block, a visible FAQ, valid JSON-LD including FAQPage, and no dashes.

## Major
- [M1] **Grading claims needed verifying, not asserting.** The copy states
  "graded ṣaḥīḥ" or "graded ḥasan" in 4 places and names 116 hadith references.
  Fix applied: checked all 116 against data/entries.json. All 116 exist on the
  site with the collection and number cited. All 4 grading claims match the
  grade the site itself shows. 0 mismatches. Qurʾan references checked against
  surah lengths: 0 out of range.

## Minor
- [m1] **7 duʿās are the headline on two hubs each** (e.g. Ṣaḥīḥ al-Bukhārī 6369
  heads anxiety, sadness and refuge).
  **Assessed, not fixed, and here is why.** Cannibalisation in the skill's
  Pattern E means two pages competing for the same query. These pages target
  different queries ("dua for anxiety" vs "dua for sadness" vs "dua for seeking
  refuge") and carry different prose, different FAQs and different entry sets.
  One hadith legitimately answering several situations is a fact about the
  material, not duplication. The single genuine near-collision is
  /s/overwhelm vs /s/distress, which both target distress-shaped queries and
  both head with Bukhārī 6345. Left in place: the user intents differ enough to
  justify both, and merging would lose a situation people actually search.
  Flagged for review if Search Console later shows the two pages swapping for
  one query.

## Still open, carried to pass 2
- [O1] **Pattern F, the entity and trust layer, is untouched.** /about,
  /contact, /author all still 404. Organization schema still carries only name
  and url. Diagnosed as ~10% of the gap and rising. This is the largest
  remaining item and it needs facts I do not have.

## Result
Critical remaining: 0. Major remaining: 0. Proceed to pass 2.
