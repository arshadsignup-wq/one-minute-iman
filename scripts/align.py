# -*- coding: utf-8 -*-
"""Alignment audit: does the transliteration read the Arabic that is displayed?

The recitation block stacks Arabic, transliteration and translation with no
labels, so a reader takes them as one unit. This checks that they are one.

Method: auto-transliterate the displayed Arabic word by word, reduce both the
auto and the manual transliteration to consonant skeletons, and align them.
Reports three outcomes per entry:

  ok            every Arabic word is read, and nothing is read that is not there
  arabic_extra  Arabic is displayed that the transliteration never reads
  translit_extra  the transliteration reads words the Arabic never shows  <- worst
"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from translit import translit

# Latin consonant skeleton. Vowels and length carry the least information and
# the most disagreement between romanisation schemes.
_DROP = str.maketrans("", "", "aeiouāīūáéíóúʿʾ'`-–—.,;:!?…\"“”()[]")
def skel(tok):
    t = tok.lower().translate(_DROP)
    t = (t.replace("ṣ","s").replace("ḍ","d").replace("ṭ","t").replace("ẓ","z")
           .replace("ḥ","h").replace("ḵ","kh").replace("š","sh").replace("ġ","gh")
           .replace("ṯ","th").replace("ḏ","dh").replace("ñ","n").replace("ṇ","n"))
    t = re.sub(r"(.)\1+", r"\1", t)          # shadda / gemination
    t = re.sub(r"^(al|l|el)(?=.)", "", t)    # article, however attached
    return t

def toks(s):
    return [w for w in re.split(r"[\s…]+", (s or "").strip()) if skel(w)]

def arabic_words(ar):
    return [w for w in re.split(r"\s+", (ar or "").strip()) if w]

def _cands(m, auto):
    """Arabic indices whose auto-transliteration could be this manual token."""
    out = []
    for j, a in enumerate(auto):
        if not a: continue
        if a == m or a.startswith(m) or m.startswith(a) \
           or (len(m) > 2 and m in a) or (len(a) > 2 and a in m):
            out.append(j)
    return out

def align(arabic, manual):
    """Order-respecting alignment of manual tokens onto Arabic words.

    The recited portion may start anywhere in the passage (a leading ellipsis,
    or a narrative preamble such as "the master of seeking forgiveness is to
    say ..."), so position is found rather than assumed. A manual token may
    also fuse two Arabic words ("wa-l-hamdu"), which the pair pass handles.
    """
    aw = arabic_words(arabic)
    auto = [skel(translit(w)) for w in aw]
    pair = ["".join(auto[j:j+2]) for j in range(len(auto))]
    man = [skel(w) for w in toks(manual)]
    man = [m for m in man if m and not m.startswith("×")]

    # candidate Arabic positions per manual token, singles then fused pairs
    cand = []
    for m in man:
        c = _cands(m, auto)
        if not c:
            c = [j+1 for j, p in enumerate(pair)
                 if p and j+1 < len(aw) and (m in p or p in m)]
        cand.append(c)

    # longest increasing (non-decreasing start) subsequence over candidates:
    # maximise how many manual tokens are read in order.
    best = {}                       # last Arabic index -> (count, matched set)
    chosen = [None]*len(man)
    seq = []                        # (manual index, arabic index)
    last = -1
    # dynamic programming over tokens, greedy-optimal for this shape
    dp = [(0, -1, None)]            # (matched count, last ar index, backpointer)
    states = [(0, -1, [])]
    for ti, c in enumerate(cand):
        nxt = []
        for cnt, li, path in states:
            nxt.append((cnt, li, path))                  # skip this token
            for j in c:
                if j > li:
                    nxt.append((cnt+1, j, path+[(ti, j)]))
        # prune: keep the best count for each last-index
        bestby = {}
        for cnt, li, path in nxt:
            if li not in bestby or cnt > bestby[li][0]:
                bestby[li] = (cnt, li, path)
        states = sorted(bestby.values(), key=lambda s: -s[0])[:40]
    cnt, li, path = max(states, key=lambda s: s[0])
    matched_man = {ti for ti, _ in path}
    matched_ar = set()
    prev = None
    for ti, j in path:
        matched_ar.add(j)
        if prev is not None:
            # Arabic words skipped between two matched tokens are genuinely unread
            pass
        prev = j
    unread = [man[i] for i in range(len(man)) if i not in matched_man]
    span = (path[0][1], path[-1][1]) if path else (0, -1)
    unused = [aw[k] for k in range(len(aw)) if k not in matched_ar]
    return aw, unused, unread, span, matched_ar

def classify(e):
    ar, tr = e.get("arabic",""), e.get("translit","")
    if not ar or not tr: return None
    aw, unused, unread, span, matched = align(ar, tr)
    # tail-only unused = the transliteration stops early (truncation)
    # Arabic outside the recited span is context; inside it, it is skipped text.
    lo, hi = span
    inside = [k for k in range(lo, hi+1) if k not in matched] if hi >= lo else []
    before, after = lo, len(aw)-1-hi if hi >= lo else 0
    return dict(id=e["id"], title=e.get("title",""),
                n_ar=len(aw), n_unused=len(unused), n_unread=len(unread),
                n_inside=len(inside), before=before, after=after, unread=unread[:8],
                ellipsis=tr.rstrip().endswith(("…","...")))

if __name__ == "__main__":
    entries = json.load(open("data/entries.json", encoding="utf-8"))
    rows = [r for r in (classify(e) for e in entries if e.get("tier")=="curated") if r]
    severe  = [r for r in rows if r["n_unread"] >= 2]
    partial = [r for r in rows if r["n_unread"] < 2 and r["n_unused"] > 0]
    clean   = [r for r in rows if r["n_unread"] < 2 and r["n_unused"] == 0]
    print("curated entries with Arabic + transliteration: %d" % len(rows))
    print("  aligned                                    : %d" % len(clean))
    print("  Arabic shown but not read (partial recite) : %d" % len(partial))
    print("  transliteration reads unshown words        : %d   <-- severe" % len(severe))
    severe.sort(key=lambda r: -r["n_unread"])
    print("\n--- severe: reciting words the Arabic never shows ---")
    for r in severe[:40]:
        print("  %-30s unread=%2d  %s" % (r["id"], r["n_unread"], " ".join(r["unread"])[:70]))
    print("\n--- partial: how much Arabic goes unread ---")
    partial.sort(key=lambda r: -r["n_unused"])
    for r in partial[:20]:
        print("  %-30s ar=%3d unread_ar=%3d trailing=%3d %s" %
              (r["id"], r["n_ar"], r["n_unused"], r["trailing"], "…" if r["ellipsis"] else ""))
