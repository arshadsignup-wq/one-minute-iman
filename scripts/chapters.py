# -*- coding: utf-8 -*-
"""Candidate puller scoped to the human-facing chapters.

The duʿā harvester only ever looked for supplication openers, so the
character/heart material was never surfaced. This walks named chapters
instead, applies the same grade rule as build.py, and drops anything whose
wording is already curated.
"""
import json, re, sys, os
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadith")
DIAC = re.compile(r'[ً-ْٰـ]')
def k(s):
    s = DIAC.sub('', s or '')
    for a,b in [('أ','ا'),('إ','ا'),('آ','ا'),('ٱ','ا'),('ى','ي'),('ة','ه'),('ئ','ي'),('ؤ','و')]:
        s = s.replace(a,b)
    return re.sub(r'[^ء-ي]','', s)

# chapter numbers per collection, chosen for material about how a person lives
SCOPE = {
 "bukhari":  [46,51,55,67,68,78,79,81],
 "muslim":   [16,18,24,25,38,45,48,49,50,52,53,55],
 "abudawud": [12,13,18,42,43],
 "tirmidhi": [11,13,27,30,31,36,37,38,43,49],
 "nasai":    [26,27,30,32],
 "ibnmajah": [9,10,14,22,34,37],
}
WEAK = re.compile(r"da'?if|weak|munkar|mawdu|fabricat", re.I)
STRONG = re.compile(r"sahih|hasan", re.I)
def graded(coll, h):
    if coll in ("bukhari","muslim"): return True
    g = [x.get("grade","") for x in (h.get("grades") or [])]
    return sum(1 for x in g if STRONG.search(x) and not WEAK.search(x)) > sum(1 for x in g if WEAK.search(x))

QUOTE = re.compile(r'‏\s*"‏(.*?)‏\s*"‏', re.S)

def load_curated():
    e = json.load(open(os.path.join(os.path.dirname(BASE), "..", "data", "entries.json")))
    cur = [x for x in e if x["tier"] == "curated"]
    keys = [k(x["arabic"]) for x in cur]
    used = {(x["source"].get("slug"), x["source"].get("number"))
            for x in cur if x["source"]["kind"] == "hadith"}
    return keys, {c[:14] for c in keys if c}, used

def pull(limit=None, offset=0, colls=None):
    curk, curset, used = load_curated()
    seen = set(); out = []
    for coll, books in SCOPE.items():
        if colls and coll not in colls: continue
        ar = {h["hadithnumber"]: h for h in json.load(open(f"{BASE}/ara-{coll}.json"))["hadiths"]}
        en = json.load(open(f"{BASE}/eng-{coll}.json"))
        sec = en["metadata"]["sections"]
        for h in en["hadiths"]:
            b = (h.get("reference") or {}).get("book")
            if b not in books: continue
            n = h["hadithnumber"]
            if (coll, n) in used: continue
            a = ar.get(n)
            if not a or not graded(coll, a): continue
            for seg in QUOTE.findall(a["text"]):
                seg = re.sub(r'\s+', ' ', seg.replace('‏','')).strip()
                kk = k(seg)
                if not (40 < len(kk) < 200): continue
                key = kk[:14]
                if key in seen or key in curset: continue
                if any(key in c for c in curk if c): continue
                seen.add(key)
                out.append(dict(coll=coll, num=n, book=sec.get(str(b), ""),
                                ar=seg, en=(h.get("text") or "")))
                break
    return out[offset:offset+limit] if limit else out

if __name__ == "__main__":
    rows = pull()
    print(f"HUMAN-FACING CHAPTER POOL: {len(rows)}")
    import collections
    print(collections.Counter(r["book"] for r in rows).most_common(20))
