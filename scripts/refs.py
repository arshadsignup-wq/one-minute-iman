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

# Records the dataset leaves unnumbered, resolved by fetching candidate pages
# from sunnah.com and matching the narration text word for word. Interpolation
# alone was not safe: the records around these are not always in order, and a
# confident guess produces a link that resolves to the wrong hadith, which is
# worse than one that resolves to nothing.
_VERIFIED = {
    ("muslim", 2232): "963a",    # the funeral prayer, 'Awf b. Malik
    ("muslim", 6879): "2708b",   # the perfect words of Allah, Khawla bint Hakim
    ("muslim", 6625): "2602c",   # "I am a human being", Jabir b. 'Abdullah
    ("muslim", 7017): "2769a",   # the expedition to Tabuk, Ibn Shihab
    ("muslim", 6414): "2506a",   # forgiveness for the Ansar, Zayd b. Arqam
    ("muslim", 6981): "2756b",   # the man who sinned beyond measure, Abu Hurayra
    ("muslim", 7354): "2930a",   # 'Umar and the Messenger, Ibn 'Umar
}



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

def _interpolate(coll, hadithnumber):
    """Recover a citation for a record the dataset left unnumbered.

    A few hundred Sahih Muslim records carry no standard number. Their
    sunnah.com links were being built from the sequential id and did not
    resolve: /muslim:6879 answers "resource urn not available or invalid".

    The records are in order, so the number is recoverable from the nearest
    numbered record before it: 6878 is 2708.01 and 6880 is 2709.01, so 6879 is
    2708.02, which sunnah.com serves as muslim:2708b. Verified against the
    site for the entries this affects.
    """
    tbl = _table(coll)
    if not tbl:
        return None
    keys = sorted(tbl)
    try:
        i = keys.index(hadithnumber)
    except ValueError:
        return None

    def parts(v):
        if v is None:
            return None
        t = str(v)
        if "." not in t:
            return t, 0
        w, f = t.split(".", 1)
        try:
            return w, int(f.ljust(2, "0")[:2])
        except ValueError:
            return None

    def letter(whole, n):
        return "%s%s" % (whole, chr(ord("a") + n - 1)) if 1 <= n <= 26 else None

    # Look forward first. When the next record is the second of a group, this
    # one starts that group: 2233 is 963.02, so 2232 is 963a. Reading backwards
    # there would give 962f, which sunnah.com does not serve.
    for j in range(i + 1, min(len(keys), i + 12)):
        p = parts(tbl[keys[j]].get("arabicnumber"))
        if p is None:
            continue
        whole, frac = p
        gap = j - i
        if frac - gap >= 1:
            return letter(whole, frac - gap)
        break

    # Otherwise continue the group before it: 6878 is 2708.01, so 6879 is 2708b.
    step = 0
    for j in range(i - 1, max(-1, i - 12), -1):
        step += 1
        p = parts(tbl[keys[j]].get("arabicnumber"))
        if p is None:
            continue
        whole, frac = p
        return letter(whole, frac + step) if frac else None
    return None

def resolve(coll, hadithnumber):
    """Return the citation and link details for one hadith record.

    citation   the number to print, in the scheme the collection is cited in
    url        canonical sunnah.com address
    record_id  the dataset's own sequential id, kept so the pipeline can
               still find the record it verified against
    book/hadith  in-book reference where the dataset supplies one
    """
    rec = _table(coll).get(hadithnumber)
    verified = _VERIFIED.get((coll, hadithnumber))
    if verified:
        citation, resolved = verified, True
    elif rec and rec.get("arabicnumber") is not None:
        citation, resolved = _fmt(rec["arabicnumber"]), True
    else:
        # No standard number, and none recoverable. sunnah.com answers the
        # sequential id with "resource urn not available or invalid", so no
        # deep link is offered for these.
        citation, resolved = str(hadithnumber), False
    ref = (rec or {}).get("reference") or {}
    return dict(
        citation=citation,
        resolved=resolved,
        url=("https://sunnah.com/%s:%s" % (coll, citation)) if resolved
            else "https://sunnah.com/%s" % coll,
        record_id=hadithnumber,
        book=ref.get("book"),
        hadith=ref.get("hadith"),
    )

if __name__ == "__main__":
    for coll, n in [("muslim", 6774), ("muslim", 6908), ("muslim", 340),
                    ("bukhari", 6346), ("tirmidhi", 3431)]:
        print(coll, n, "->", resolve(coll, n))
