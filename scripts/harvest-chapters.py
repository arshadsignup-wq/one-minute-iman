# -*- coding: utf-8 -*-
"""Harvest the human-facing chapters into the library tier.

Same shape as harvested.json so build_all.py can merge it unchanged.
Every record is grade-checked with the same rule build.py applies, and the
Arabic is a verbatim quoted segment from the source text.
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chapters import SCOPE, graded, k, QUOTE

BASE = os.path.join(HERE, "hadith")
PRETTY = {"malik": "Muwaṭṭa' Mālik", "bukhari": "Ṣaḥīḥ al-Bukhārī", "muslim": "Ṣaḥīḥ Muslim",
          "abudawud": "Sunan Abī Dāwūd", "tirmidhi": "Jāmiʿ at-Tirmidhī",
          "nasai": "Sunan an-Nasā'ī", "ibnmajah": "Sunan Ibn Mājah"}
URL = {"bukhari": "https://sunnah.com/bukhari:%d", "muslim": "https://sunnah.com/muslim:%d",
       "abudawud": "https://sunnah.com/abudawud:%d", "tirmidhi": "https://sunnah.com/tirmidhi:%d",
       "nasai": "https://sunnah.com/nasai:%d", "ibnmajah": "https://sunnah.com/ibnmajah:%d",
       "malik": "https://sunnah.com/malik:%d"}
WEAK = re.compile(r"da'?if|weak|munkar|mawdu|fabricat", re.I)
STRONG = re.compile(r"sahih|hasan", re.I)
UNGRADED = {"nawawi", "qudsi", "dehlawi"}

def grade_label(coll, h):
    if coll in ("bukhari", "muslim"):
        return "Ṣaḥīḥ", []
    gs = [g.get("grade", "") for g in (h.get("grades") or []) if g.get("grade")]
    if not gs:
        return "Not graded here", []
    strong = [g for g in gs if STRONG.search(g) and not WEAK.search(g)]
    label = "Ṣaḥīḥ" if any(re.search(r"sahih", g, re.I) for g in strong) else "Ḥasan"
    return label, gs

def main():
    cur = [x for x in json.load(open(os.path.join(HERE, "..", "data", "entries.json")))
           if x["tier"] == "curated"]
    curk = [k(x["arabic"]) for x in cur]
    curset = {c[:14] for c in curk if c}
    used = {(x["source"].get("slug"), x["source"].get("number")) for x in cur
            if x["source"]["kind"] == "hadith"}
    seen, out = set(), []
    for coll, books in SCOPE.items():
        ar = {h["hadithnumber"]: h for h in json.load(open(f"{BASE}/ara-{coll}.json"))["hadiths"]}
        en = json.load(open(f"{BASE}/eng-{coll}.json"))
        sections = en["metadata"]["sections"]
        for h in en["hadiths"]:
            b = (h.get("reference") or {}).get("book")
            if b not in books:
                continue
            n = h["hadithnumber"]
            if (coll, n) in used:
                continue
            a = ar.get(n)
            if not a or not graded(coll, a):
                continue
            for seg in QUOTE.findall(a["text"]):
                seg = re.sub(r"\s+", " ", seg.replace("‏", "")).strip()
                kk = k(seg)
                if not (40 < len(kk) < 200):
                    continue
                key = kk[:14]
                if key in seen or key in curset:
                    continue
                if any(key in c for c in curk if c):
                    continue
                seen.add(key)
                label, gs = grade_label(coll, a)
                out.append({
                    "arabic": seg,
                    "coll": coll,
                    "number": n,
                    "collection": PRETTY[coll],
                    "book": sections.get(str(b), ""),
                    "english": h.get("text") or "",
                    "url": URL[coll] % n,
                    "grade": label,
                    "gradings": gs,
                })
                break
    json.dump(out, open(os.path.join(HERE, "harvested-chapters.json"), "w"), ensure_ascii=False)
    print(f"harvested {len(out)} chapter records")
    import collections
    for kk, v in collections.Counter(r["coll"] for r in out).most_common():
        print(f"  {kk:10} {v}")

if __name__ == "__main__":
    main()
