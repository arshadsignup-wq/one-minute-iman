# -*- coding: utf-8 -*-
"""Second source: collections that carry no chain gradings.

These are added because they are widely used and topically organised, but they are
never counted as authenticated and every page says so.
"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "extra")

BOOKS = {
    "riyad":   ("riyad_assalihin",       "Riyāḍ aṣ-Ṣāliḥīn"),
    "bulugh":  ("bulugh_almaram",        "Bulūgh al-Marām"),
    "adab":    ("aladab_almufrad",       "al-Adab al-Mufrad"),
    "mishkat": ("mishkat_almasabih",     "Mishkāt al-Maṣābīḥ"),
    "shamail": ("shamail_muhammadiyah",  "ash-Shamā'il al-Muḥammadiyya"),
    "ahmad":   ("ahmed",                 "Musnad Aḥmad"),
    # ad-Dārimī is Arabic-only in this source, with no translation at all,
    # so it is left out rather than shipped as unreadable entries.
}
NOTE = ("Our source carries no chain grading for this collection. Treat it as a "
        "reference, and verify an individual narration before relying on it.")

def clean(t):
    return re.sub(r"\s+", " ", (t or "").replace("‏", "")).strip()

out, index = [], {}
for slug, (fname, pretty) in BOOKS.items():
    p = os.path.join(SRC, f"{fname}.json")
    if not os.path.exists(p):
        print(f"  !! missing {fname}.json"); continue
    d = json.load(open(p))
    chapters = {c["id"]: (c.get("english") or c.get("arabic") or "").strip()
                for c in d.get("chapters", [])}
    seen, kept, blank = {}, 0, 0
    for h in d.get("hadiths", []):
        ar = clean(h.get("arabic"))
        en_obj = h.get("english") or {}
        en = clean(" ".join(x for x in [en_obj.get("narrator"), en_obj.get("text")] if x)) \
             if isinstance(en_obj, dict) else clean(str(en_obj))
        if not ar or not en:
            blank += 1
            continue
        ch = h.get("chapterId") or 0
        title = chapters.get(ch) or "Miscellaneous"
        num = h.get("idInBook") or h.get("id")
        seen.setdefault(ch, {"n": ch, "title": title, "count": 0})["count"] += 1
        out.append({"c": slug, "n": num, "b": ch, "ar": ar, "en": en,
                    "g": "Not graded here", "v": [NOTE], "w": []})
        kept += 1
    index[slug] = {"name": pretty, "books": sorted(seen.values(), key=lambda b: b["n"]),
                   "count": kept, "graded": False}
    print(f"   {pretty:<30} {kept:>5,} kept  {blank:>4} blank  {len(seen):>3} chapters")

json.dump(out, open(f"{HERE}/hadith-extra.json", "w"), ensure_ascii=False)
json.dump(index, open(f"{HERE}/hadith-extra-books.json", "w"), ensure_ascii=False)
print(f"\n✅ {len(out):,} narrations from {len(index)} ungraded collections")
