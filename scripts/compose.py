# -*- coding: utf-8 -*-
"""Compose one answer per situation: something to say, something to know, something that happened.

Typing a feeling used to return a category heading and a grid of cards, which
reads as a directory. This builds the answer instead, so the page can respond
rather than list.

Everything here is chosen at build time and written to data/answers.json, so the
browser looks up 43 small records rather than loading the whole corpus. The
choice is deterministic: the same situation always yields the same answer.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DATA = os.path.join(os.path.dirname(HERE), "data")

entries = json.load(open(f"{DATA}/entries.json", encoding="utf-8"))
sits = json.load(open(f"{DATA}/situations.json", encoding="utf-8"))["situations"]
hub = json.load(open(f"{DATA}/hub-copy.json", encoding="utf-8"))

curated = [e for e in entries if e["tier"] == "curated"]

def ref_of(e):
    s = e["source"]
    return (f"Qur'an {s['reference']}" if s["kind"] == "quran"
            else f"{s['collection']} {s['number']}")

# ── which entry does the hand-written hub answer point at? ──────────────────
# Those answers were written by hand and already name the supplication that
# belongs to each situation, so they are better than any scoring rule.
_COLL = {"Bukhārī": "bukhari", "Muslim": "muslim", "Tirmidhī": "tirmidhi",
         "Dāwūd": "abudawud", "Nasā": "nasai", "Mājah": "ibnmajah", "Mālik": "malik"}
_by_ref = {}
for e in curated:
    s = e["source"]
    key = ("quran:" + str(s["reference"])) if s["kind"] == "quran" else f"{s['slug']}:{s['number']}"
    _by_ref.setdefault(key, []).append(e)

def editorial_pick(sit_id):
    """The entry the hand-written hub answer points at.

    Those answers name their source in prose, and not always the same way:
    "Jāmiʿ at-Tirmidhī 3563", but also "the words at 2:156" and "Surah
    al-Falaq at 113:1 to 5" with no "Qur'an" in front of them. Both forms are
    read here, because a reference written loosely is still a person's choice.
    """
    copy = hub.get(sit_id)
    if not copy:
        return None
    a = copy["answer"]

    def take(cands):
        # prefer one already filed under this situation, but a hand-written
        # answer naming an entry is reason enough on its own
        here = [c for c in cands if sit_id in c["situations"]] or list(cands)
        if not here:
            return None
        # Two entries can quote the same narration, one showing the whole
        # supplication and one showing a clause of it. As the headline answer,
        # the whole thing is better than a fragment opening with an ellipsis.
        def fullness(c):
            t = (c.get("translit") or "").strip()
            partial = t.startswith(("…", "...")) or c.get("recites") == "part"
            return (0 if partial else 1, len((c.get("arabic") or "").split()))
        here.sort(key=lambda c: (fullness(c), c["id"]), reverse=True)
        return here[0]

    m = re.search(r"(Bukhārī|Muslim|Tirmidhī|Dāwūd|Nasā\S*|Mājah|Mālik)\s+([0-9]+[a-z]?)", a)
    if m:
        coll = next((v for k, v in _COLL.items() if k in m.group(1)), None)
        got = take(_by_ref.get(f"{coll}:{m.group(2)}", []))
        if got:
            return got

    # "Qur'an 14:7", "the words at 2:156", "113:1 to 5"
    for q in re.finditer(r"(\d{1,3}):(\d{1,3})(?:\s*(?:to|-|–)\s*(\d{1,3}))?", a):
        sura, start, end = q.group(1), q.group(2), q.group(3)
        keys = [f"quran:{sura}:{start}-{end}"] if end else []
        keys.append(f"quran:{sura}:{start}")
        for k in keys:
            got = take(_by_ref.get(k, []))
            if got:
                return got
        # the answer may cite one ayah where the entry spans a range
        span = [c for k, g in _by_ref.items() if k.startswith(f"quran:{sura}:{start}")
                for c in g]
        got = take(span)
        if got:
            return got
    return None

def relevance(e, sit):
    """How central an entry is to this situation, rather than merely tagged with it.

    Membership is broad: an entry can sit under four headings, so picking by
    quality alone returns something technically filed here but about something
    else. Two signals matter. An entry filed under one situation is about that
    situation; an entry filed under six is about none of them in particular.
    And an entry whose own words carry the situation's vocabulary is about it.
    """
    score = 6.0 / max(1, len(e.get("situations") or []))
    feelings = {f.lower() for f in sit.get("feelings", [])}
    tags = {t.lower() for t in (e.get("tags") or [])}
    score += 2.5 * len(feelings & tags)
    label = sit["label"].lower().replace(" & ", " ").split()
    text = (e.get("title", "") + " " + (e.get("lede") or "")).lower()
    score += sum(1.5 for w in label if len(w) > 3 and w in text)
    return score

def say_score(e):
    """How well an entry works as the thing a person is asked to say."""
    s = 0
    if e.get("mode") == "dua": s += 6
    if e.get("translit"): s += 3
    if e.get("trans"): s += 3
    if e.get("audio"): s += 2
    if e.get("recites") == "part": s -= 4      # they could not say all of it
    words = len((e.get("arabic") or "").split())
    s += 3 if words <= 12 else (1 if words <= 25 else -2)
    return s

def know_score(e):
    s = 2 if e["source"]["kind"] == "quran" else 0
    if e.get("trans"): s += 3
    words = len((e.get("trans") or "").split())
    s += 2 if 8 <= words <= 60 else 0
    if e.get("note"): s += 1
    return s

def story_score(e):
    st = e.get("story") or ""
    n = len(st.split())
    return (3 if 25 <= n <= 160 else 1) + (1 if e.get("trans") else 0)

STEPS = json.load(open(f"{HERE}/steps.json", encoding="utf-8"))

out = {}
for sit in sits:
    sid = sit["id"]
    members = [e for e in curated if sid in e["situations"]]
    if not members:
        continue

    # The hand-written hub answer names the supplication for this situation.
    # It is a person's choice and it is trusted, including where that choice is
    # a verse rather than a hadith supplication.
    say = editorial_pick(sid)
    if say is None:
        pool = [e for e in members if e.get("translit") and e.get("trans")] or members
        say = max(pool, key=lambda e: (say_score(e) + relevance(e, sit), e["id"]))

    used = {say["id"]}
    know_pool = [e for e in members if e["id"] not in used and e.get("trans")]
    know = max(know_pool, key=lambda e: (know_score(e) + relevance(e, sit), e["id"])) if know_pool else None
    if know: used.add(know["id"])

    story_pool = [e for e in members if e["id"] not in used and e.get("story")]
    story = max(story_pool, key=lambda e: (story_score(e) + relevance(e, sit), e["id"])) if story_pool else None

    rec = {
        "say": {
            "id": say["id"], "title": say["title"],
            "arabic": say["arabic"], "translit": say.get("translit", ""),
            "trans": say.get("trans", ""), "ref": ref_of(say),
            "grade": say["source"]["grade"], "url": say["source"]["url"],
            **({"audio": say["audio"], "audio_credit": say.get("audio_credit", "")} if say.get("audio") else {}),
            **({"recites": "part"} if say.get("recites") == "part" else {}),
        },
        "step": STEPS.get(sid, ""),
    }
    if know:
        rec["know"] = {"id": know["id"], "title": know["title"],
                       "trans": know["trans"], "ref": ref_of(know),
                       "grade": know["source"]["grade"],
                       "kind": know["source"]["kind"]}
    if story:
        rec["story"] = {"id": story["id"], "title": story["title"],
                        "story": story["story"], "ref": ref_of(story)}
    out[sid] = rec

json.dump(out, open(f"{DATA}/answers.json", "w"), ensure_ascii=False, indent=1)
size = os.path.getsize(f"{DATA}/answers.json")
print(f"✅ composed {len(out)} answers  ({size // 1024} KB)")
print(f"   with a narration or verse : {sum(1 for v in out.values() if 'know' in v)}")
print(f"   with a story              : {sum(1 for v in out.values() if 'story' in v)}")
print(f"   with recitation           : {sum(1 for v in out.values() if v['say'].get('audio'))}")
missing = [k for k, v in out.items() if not v["step"]]
if missing:
    print(f"   ⚠️  no next step written for: {', '.join(missing)}")
