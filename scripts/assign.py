# -*- coding: utf-8 -*-
"""Which situations a harvested narration belongs to.

Kept in its own module because two things need it and they must not drift: the
full build (build_all.py), and refile.py, which re-applies the rule to an
already-built data/ without re-fetching 62MB of sources.
"""
import re

from lexicon import S, AR_PATTERNS

_compiled = [(x, re.compile(x["match"], re.I)) for x in S]
_AR_RX = {k: re.compile(v) for k, v in AR_PATTERNS.items()}
_DIAC = re.compile(r"[ً-ْٰـ]")


def ar_norm(t):
    t = _DIAC.sub("", t or "")
    for a, b in [("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ٱ", "ا"), ("ى", "ي"), ("ة", "ه")]:
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
    window = en[:260] + " … " + en[-560:] if len(en) > 820 else en
    scored = []
    for x, rx in _compiled:
        arx = _AR_RX.get(x["id"])
        score = 3 if (arx and arx.search(an)) else 0
        score += min(len(rx.findall(window)), 3)
        if score:
            scored.append((score, x["id"]))
    keep = [t for t in scored if t[0] >= 2]
    keep.sort(key=lambda t: (-t[0], t[1]))
    return sorted(i for _, i in keep[:3])


_GENERIC = re.compile(r"^(لا اله الا الله|سبحان|الحمد لله|استغفر الله|الله اكبر)")


def fallback(arabic):
    """Where nothing scored: a bare formula is remembrance, the rest is misc."""
    return ["dhikr"] if _GENERIC.match(ar_norm(arabic)) else ["misc"]
