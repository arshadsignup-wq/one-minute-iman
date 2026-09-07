# -*- coding: utf-8 -*-
"""Build the full hadith library: every narration in the six books that is
authenticated, with its Arabic, its English and every scholar verdict recorded."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, "hadith")
COLLS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah",
         "malik", "nawawi", "qudsi", "dehlawi"]
# Compilations whose source carries no chain grading. Included, but never counted
# as authenticated, and labelled as such on the page.
UNGRADED = {"nawawi", "qudsi", "dehlawi"}
PRETTY = {"bukhari": "Ṣaḥīḥ al-Bukhārī", "muslim": "Ṣaḥīḥ Muslim",
          "abudawud": "Sunan Abī Dāwūd", "tirmidhi": "Jāmiʿ at-Tirmidhī",
          "nasai": "Sunan an-Nasā'ī", "ibnmajah": "Sunan Ibn Mājah",
          "malik": "Muwaṭṭa' Mālik", "nawawi": "Forty Ḥadīth of an-Nawawī",
          "qudsi": "Forty Ḥadīth Qudsī", "dehlawi": "Forty Ḥadīth of Shāh Walīullāh"}
SAHIHAYN = {"bukhari", "muslim"}
WEAK = re.compile(r"da'?if|weak|munkar|mawdu|fabricat", re.I)
STRONG = re.compile(r"sahih|hasan", re.I)

def verdict(coll, h):
    gs = h.get("grades") or []
    if coll in UNGRADED:
        return "Not graded here", [
            "Our source carries no chain grading for this compilation. "
            "Most of these narrations are drawn from al-Bukhārī and Muslim, but verify "
            "any individual narration before relying on it."], []
    if coll in SAHIHAYN:
        return "Ṣaḥīḥ", ["Agreed upon as authentic (al-Bukhārī / Muslim)"], []
    weak = [g for g in gs if WEAK.search(g.get("grade", ""))]
    strong = [g for g in gs if STRONG.search(g.get("grade", ""))]
    if not strong or len(weak) >= len(strong):
        return None, None, None
    label = "Ḥasan" if all("hasan" in g.get("grade", "").lower() for g in strong) else "Ṣaḥīḥ"
    return label, [f"{g.get('name')}: {g.get('grade')}" for g in gs], weak

books, out, stats = {}, [], {}
for coll in COLLS:
    eng = json.load(open(f"{BASE}/eng-{coll}.json"))
    ara = json.load(open(f"{BASE}/ara-{coll}.json"))
    amap = {h["hadithnumber"]: h["text"] for h in ara["hadiths"]}
    sections = eng["metadata"]["sections"]
    kept = rejected = blank = 0
    seen_books = {}
    for h in eng["hadiths"]:
        label, gradings, weak = verdict(coll, h)
        if not label:
            rejected += 1
            continue
        num = h["hadithnumber"]
        ar_text = re.sub(r"\s+", " ", (amap.get(num) or "").replace("‏", "")).strip()
        en_text = re.sub(r"\s+", " ", h["text"]).strip()
        if not ar_text or not en_text:
            blank += 1          # empty in the source; never render an empty entry
            continue
        bk = h["reference"]["book"]
        title = sections.get(str(bk), "") or "Miscellaneous"
        seen_books.setdefault(bk, {"n": bk, "title": title, "count": 0})["count"] += 1
        out.append({
            "c": coll, "n": num, "b": bk,
            "ar": ar_text,
            "en": en_text,
            "g": label,
            "v": gradings,
            "w": [f"{g.get('name')} grades it {g.get('grade')}" for g in (weak or [])],
        })
        kept += 1
    books[coll] = sorted(seen_books.values(), key=lambda b: b["n"])
    stats[coll] = (kept, rejected, blank)

json.dump(out, open(f"{HERE}/hadith-all.json", "w"), ensure_ascii=False)
json.dump({"collections": {c: {"name": PRETTY[c], "books": books[c],
                               "count": stats[c][0],
                               "graded": c not in UNGRADED} for c in COLLS}},
          open(f"{HERE}/hadith-books.json", "w"), ensure_ascii=False)

graded_k = sum(v[0] for c, v in stats.items() if c not in UNGRADED)
other_k = sum(v[0] for c, v in stats.items() if c in UNGRADED)
total_r = sum(v[1] for v in stats.values()); total_b = sum(v[2] for v in stats.values())
print(f"✅ {graded_k:,} authenticated hadith")
print(f"   + {other_k} from ungraded compilations, labelled as such")
print(f"   {total_r:,} refused by the grading rule")
print(f"   {total_b:,} dropped as empty in the source")
for c in COLLS:
    k, r, b = stats[c]
    tag = " (ungraded)" if c in UNGRADED else ""
    print(f"   {PRETTY[c]:<32} {k:>6,} kept  {r:>5,} refused  {b:>4} blank{tag}")
