# -*- coding: utf-8 -*-
"""Merge curated entries + the harvested library, assign situations, emit the site dataset."""
import json, re, os, sys, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from lexicon import S, CATEGORIES, AR_PATTERNS
from translit import translit

def norm(s):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", " ", (s or "").lower())).strip()

# 1 ── curated (already verified by build.py)
curated = json.load(open(f"{HERE}/verified.json"))

# 2 ── harvested library
library = json.load(open(f"{HERE}/harvested.json"))
# the human-facing chapters, harvested by scripts/harvest-chapters.py
_chapters = f"{HERE}/harvested-chapters.json"
if os.path.exists(_chapters):
    library += json.load(open(_chapters))

# 3 ── assign situations to library entries from the hadith's English text
compiled = [(x, re.compile(x["match"], re.I)) for x in S]
AR_RX = {k: re.compile(v) for k, v in AR_PATTERNS.items()}
DIAC = re.compile(r"[ً-ْٰـ]")
def ar_norm(t):
    t = DIAC.sub("", t or "")
    for a, b in [("أ","ا"),("إ","ا"),("آ","ا"),("ٱ","ا"),("ى","ي"),("ة","ه")]:
        t = t.replace(a, b)
    return t

def assign(english, arabic):
    """Score each situation; a single passing word is not evidence.

    A boolean OR over a whole narration files one hadith under four unrelated
    headings, because "they ascribe children to Him" contains the word child.
    So evidence is weighted and a floor is applied: either the quoted Arabic
    carries the situation's own vocabulary (worth 3), or the English mentions
    it more than once. Anything weaker falls through to the misc fallback,
    which is better than a confident wrong heading polluting real searches.
    """
    an = ar_norm(arabic)
    en = english or ""
    window = en[:260] + " \u2026 " + en[-560:] if len(en) > 820 else en
    scored = []
    for x, rx in compiled:
        arx = AR_RX.get(x["id"])
        score = 3 if (arx and arx.search(an)) else 0
        score += min(len(rx.findall(window)), 3)
        if score:
            scored.append((score, x["id"]))
    keep = [t for t in scored if t[0] >= 2]
    keep.sort(key=lambda t: (-t[0], t[1]))
    return sorted(i for _, i in keep[:3])

feel_index = {}
for x in S:
    for f in x["feelings"]:
        feel_index.setdefault(norm(f), set()).add(x["id"])

entries = []

for c in curated:
    sits = set()
    for t in c["tags"]:
        sits |= feel_index.get(norm(t), set())
    if not sits:
        for x, rx in compiled:
            if rx.search(c["title"] + " " + c["lede"]):
                sits.add(x["id"])
    e = dict(c)
    e["tier"] = "curated"
    e["situations"] = sorted(sits)
    entries.append(e)

seen_ar = {re.sub(r"[ً-ْٰـ\s]", "", c["arabic"]) for c in curated}

for i, h in enumerate(library):
    bare = re.sub(r"[ً-ْٰـ\s]", "", h["arabic"])
    if bare in seen_ar:
        continue  # already covered by a curated entry
    sits = assign(h["english"], h["arabic"])
    if not sits:
        an = ar_norm(h["arabic"])
        sits = ["dhikr"] if re.match(r"^(لا اله الا الله|سبحان|الحمد لله|استغفر الله|الله اكبر)", an) else ["misc"]
    entries.append({
        "id": f"{h['coll']}-{h['number']}-{i}",
        "tier": "library",
        "title": f"{h['collection']} {h['number']}",
        "lede": h["book"],
        "arabic": h["arabic"],
        "translit": translit(h["arabic"]),
        "translit_auto": True,
        "trans": "",
        "english_full": h["english"],
        "tags": [],
        "situations": sits,
        "source": {
            "kind": "hadith",
            "collection": h["collection"],
            "slug": h["coll"],
            "number": h["number"],
            "url": h["url"],
            "grade": h["grade"],
            "gradings": h["gradings"],
        },
        **({"dissent": "Scholars differ on this chain. " + "; ".join(h["dissent"]) + "."} if h.get("dissent") else {}),
        **({"parallel": "Also narrated in " + ", ".join(h["parallels"]) + "."} if h.get("parallels") else {}),
    })

# 4 ── situation index
sit_out = []
for x in S:
    members = [e["id"] for e in entries if x["id"] in e["situations"]]
    members.sort(key=lambda i: 0 if any(e["id"] == i and e["tier"] == "curated" for e in entries) else 1)
    sit_out.append({
        "id": x["id"], "label": x["label"], "cat": x["cat"], "blurb": x["blurb"],
        "feelings": x["feelings"], "count": len(members),
    })

json.dump(entries, open(f"{HERE}/all-entries.json", "w"), ensure_ascii=False, indent=1)
json.dump({"categories": CATEGORIES, "situations": sit_out},
          open(f"{HERE}/situations.json", "w"), ensure_ascii=False, indent=1)

tagged = sum(1 for e in entries if e["situations"])
print(f"✅ {len(entries)} entries  ({sum(1 for e in entries if e['tier']=='curated')} curated, "
      f"{sum(1 for e in entries if e['tier']=='library')} library)")
print(f"   {tagged} carry at least one situation ({tagged*100//len(entries)}%)")
print(f"   {sum(len(x['feelings']) for x in S)} feeling phrasings across {len(S)} situations")
empty = [s["id"] for s in sit_out if s["count"] == 0]
thin  = [(s["id"], s["count"]) for s in sit_out if 0 < s["count"] < 4]
if empty: print("   ⚠️  situations with no entries:", empty)
if thin:  print("   ⚠️  thin situations:", thin)
