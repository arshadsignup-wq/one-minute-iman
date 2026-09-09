# -*- coding: utf-8 -*-
"""Source references: internal record id, printed citation, and external URL.

These are three different things and the site had been treating them as one.

The hadith dataset carries two numbering schemes per record:

  hadithnumber   sequential English numbering (Kitab Bhavan and similar)
  arabicnumber   the standard printed numbering scholars cite

For every collection except Sahih Muslim the two agree, so the distinction was
invisible. For Muslim they differ for all 7,563 records: the narration this site
displayed as "Sahih Muslim 6774" is cited everywhere as Sahih Muslim 2664.

sunnah.com keys its canonical URLs on the standard numbering, and marks
sub-narrations with a letter suffix, which the dataset records as a fraction
(2723.02 -> 2723b).
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
_cache = {}

def _table(coll):
    if coll not in _cache:
        path = os.path.join(HERE, "hadith", "ara-%s.json" % coll)
        if not os.path.exists(path):
            _cache[coll] = {}
        else:
            hs = json.load(open(path, encoding="utf-8"))["hadiths"]
            _cache[coll] = {h["hadithnumber"]: h for h in hs}
    return _cache[coll]

def _fmt(arabicnumber):
    """2664 -> ('2664', '2664');  2723.02 -> ('2723b', '2723b')."""
    s = str(arabicnumber)
    if "." not in s:
        return s
    whole, frac = s.split(".", 1)
    try:
        n = int(frac.ljust(2, "0")[:2])
    except ValueError:
        return whole
    if n <= 0:
        return whole
    # .01 -> a, .02 -> b ...
    return "%s%s" % (whole, chr(ord("a") + n - 1)) if n <= 26 else whole

def resolve(coll, hadithnumber):
    """Return the citation and link details for one hadith record.

    citation   the number to print, in the scheme the collection is cited in
    url        canonical sunnah.com address
    record_id  the dataset's own sequential id, kept so the pipeline can
               still find the record it verified against
    book/hadith  in-book reference where the dataset supplies one
    """
    rec = _table(coll).get(hadithnumber)
    citation = _fmt(rec["arabicnumber"]) if rec and rec.get("arabicnumber") is not None \
               else str(hadithnumber)
    ref = (rec or {}).get("reference") or {}
    return dict(
        citation=citation,
        url="https://sunnah.com/%s:%s" % (coll, citation),
        record_id=hadithnumber,
        book=ref.get("book"),
        hadith=ref.get("hadith"),
    )

if __name__ == "__main__":
    for coll, n in [("muslim", 6774), ("muslim", 6908), ("muslim", 340),
                    ("bukhari", 6346), ("tirmidhi", 3431)]:
        print(coll, n, "->", resolve(coll, n))
