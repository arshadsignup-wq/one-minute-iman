# -*- coding: utf-8 -*-
"""Merge curated entries + the harvested library, assign situations, emit the site dataset."""
import json, re, os, sys, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from lexicon import S, CATEGORIES, AR_PATTERNS
from translit import translit
import refs
import align

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

# Normalise every library record onto the printed citation scheme. The harvest
# files may predate refs.py, and for Sahih Muslim the dataset's sequential id is
# not the number the collection is cited by, nor the one sunnah.com links on.
for _r in library:
    if _r.get("coll") and str(_r.get("number", "")).isdigit():
        _ref = refs.resolve(_r["coll"], int(_r["number"]))
        _r["record_id"] = _ref["record_id"]
        _r["number"] = _ref["citation"]
        _r["url"] = _ref["url"]
        _r["resolved"] = _ref["resolved"]

# "Agreed upon as authentic (al-Bukhari / Muslim)" was applied to every entry in
# either collection, which reads as a claim that both contain it. Only the
# collection being cited was checked.
for _r in library:
    _g = _r.get("gradings")
    if _g and any("Agreed upon as authentic" in x for x in _g):
        _r["gradings"] = ["Recorded in %s, whose narrations are accepted as authentic"
                          % _r.get("collection", "this collection")]

# 3 ── assign situations to library entries from the hadith's English text
# The rule itself lives in assign.py, so that refile.py applies exactly the same
# one when it re-files an already-built data/ without the sources to hand.
from assign import assign, fallback  # noqa: E402

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
        sits = fallback(h["arabic"])
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
            "resolved": h.get("resolved", True),
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

# 4a ── tidy imported narration text.
# The source dumps carry editorial cross-references that were cut off in the
# import, e.g. "(See Hadith No)" with the number missing. Showing a reference
# that points nowhere is worse than not showing it.
import re as _re
# "(See Hadith No. 168, Vol)" points at a printed edition this site does not
# cite, and the volume number did not survive the import. The site gives its own
# source link, so the whole parenthetical goes.
_DANGLING = _re.compile(r"\s*\(\s*See\s+Hadith[^)]*\)", _re.I)
_OPEN_SEE = _re.compile(r"\s*\(\s*See\s+[^)]*$", _re.I)
_cleaned = 0
for _e in entries:
    _t = _e.get("english_full")
    if not _t:
        continue
    _new = _OPEN_SEE.sub("", _DANGLING.sub("", _t.rstrip())).rstrip()
    if _new != _t:
        _e["english_full"] = _new
        _cleaned += 1

# 4b ── does the transliteration read all of the Arabic that is displayed?
# Where it reads only part, the page says so rather than letting three stacked
# blocks imply a word-for-word correspondence that is not there.
for _e in entries:
    _ar, _tr = _e.get("arabic"), _e.get("translit")
    if not _ar or not _tr or _e.get("tier") != "curated":
        continue
    if _tr.rstrip().endswith(("\u2026", "...")):
        _e["recites"] = "part"
        continue
    _aw, _unused, _unread, _span, _matched = align.align(_ar, _tr)
    if _aw and len(_unused) > max(2, 0.2 * len(_aw)):
        _e["recites"] = "part"

# 4c ── recitation, only where a recording matches what is on the page.
# The site already serves Quran.com's Alafasy recitation on the surah pages, so
# the same verse audio is offered on Qur'anic entries. It is attached per ayah,
# which means an entry showing only part of a verse does not get it: the
# recording would say more than the page shows. There is no rights-cleared
# recitation for the hadith supplications, so none is offered and no player is
# shown for them.
_quran = json.load(open(os.path.join(os.path.dirname(HERE), "data", "quran.json"), encoding="utf-8"))
_audio = {}
for _s in _quran:
    for _v in _s["verses"]:
        if _v.get("audio"):
            _audio["%s:%s" % (_s["n"], _v["n"])] = _v["audio"]

_with_audio = 0
for _e in entries:
    _src = _e["source"]
    if _src["kind"] != "quran":
        continue
    _keys = ["%s:%s" % (_src["surah"], _n)
             for _n in range(_src["ayah_start"], _src["ayah_end"] + 1)]
    _urls = [_audio[k] for k in _keys if k in _audio]
    if len(_urls) == len(_keys) and _urls:
        _e["audio"] = _urls
        # Recitation is per ayah. Where the page shows an excerpt, the recording
        # covers the whole verse it was taken from, which is worth hearing and
        # worth saying so: the reader should not think the extra words are the
        # ones in front of them.
        _partial = _e.get("recites") == "part" or bool(_e.get("passage_ar"))
        _e["audio_scope"] = "verse" if _partial else "exact"
        _e["audio_credit"] = "Recitation by Mishari Rashid al-Afasy, via Quran.com"
        _with_audio += 1

# 5 ── search index (the compact rows lib/search.ts loads)
def _ref_line(e):
    src = e["source"]
    if src["kind"] == "quran":
        return "Qur'an %s" % src.get("reference", "")
    return "%s %s" % (src["collection"], src["number"])

def _snip(t, n=90):
    t = (t or "").strip()
    return t if len(t) <= n else t[:n].rstrip() + " …"

index = [{
    "id": e["id"],
    "t": e["title"],
    "s": e["situations"],
    "x": 1 if e["tier"] == "curated" else 0,
    "g": e["source"]["grade"],
    "r": _ref_line(e),
    "l": e.get("lede") or e.get("book") or "",
    "a": _snip(e.get("arabic") or ""),
} for e in entries]

# The site reads data/. Writing anywhere else needs a copy step, and a copy step
# that is forgotten ships a fix that never reaches a reader.
DATA = os.path.join(os.path.dirname(HERE), "data")
def _emit(obj, *names):
    for n in names:
        json.dump(obj, open(n, "w"), ensure_ascii=False, indent=1)

_emit(entries, f"{HERE}/all-entries.json", f"{DATA}/entries.json")
_emit({"categories": CATEGORIES, "situations": sit_out},
      f"{HERE}/situations.json", f"{DATA}/situations.json")
_emit(index, f"{DATA}/index.json")

# 6 ── content stamp for the sitemap.
# lastmod was the build time, so every rebuild told search engines all 4,000
# pages had changed. The stamp only moves when the emitted data actually
# differs, which is what lastmod is supposed to mean.
import datetime, hashlib
_stamp_path = f"{DATA}/content-updated.json"
_digest = hashlib.sha256(
    json.dumps(entries, ensure_ascii=False, sort_keys=True).encode("utf-8")
).hexdigest()
_prev = {}
if os.path.exists(_stamp_path):
    try:
        _prev = json.load(open(_stamp_path, encoding="utf-8"))
    except ValueError:
        _prev = {}
if _prev.get("digest") != _digest:
    json.dump(
        {"digest": _digest,
         "updated": datetime.datetime.now(datetime.timezone.utc)
                     .replace(microsecond=0).isoformat()},
        open(_stamp_path, "w"), ensure_ascii=False, indent=1)
    print("   content changed: sitemap lastmod stamp updated")
else:
    print("   content unchanged: sitemap lastmod stamp left alone")

# 7 ── the composed answers the search responds with.
# Run here rather than by hand: they are derived from the entries above, and an
# answers.json left behind after a content change would quote a page that no
# longer says what it quotes.
subprocess.run([sys.executable, os.path.join(HERE, "compose.py")], check=True)

tagged = sum(1 for e in entries if e["situations"])
print(f"✅ {len(entries)} entries  ({sum(1 for e in entries if e['tier']=='curated')} curated, "
      f"{sum(1 for e in entries if e['tier']=='library')} library)")
print(f"   {tagged} carry at least one situation ({tagged*100//len(entries)}%)")
print(f"   {sum(len(x['feelings']) for x in S)} feeling phrasings across {len(S)} situations")
print(f"   {_cleaned} narration(s) had a cut-off cross-reference removed")
print(f"   {_with_audio} entr(ies) carry recitation "
      f"({sum(1 for e in entries if e.get('audio_scope') == 'verse')} of them the whole verse)")
empty = [s["id"] for s in sit_out if s["count"] == 0]
thin  = [(s["id"], s["count"]) for s in sit_out if 0 < s["count"] < 4]
if empty: print("   ⚠️  situations with no entries:", empty)
if thin:  print("   ⚠️  thin situations:", thin)
