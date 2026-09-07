#!/usr/bin/env python3
"""Extract the quoted du'a segment(s) from a hadith, stripping the isnad."""
import json, sys, re, os
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadith")
def get(coll, num, lang="ara"):
    d = json.load(open(f"{BASE}/{lang}-{coll}.json"))
    for h in d["hadiths"]:
        if h["hadithnumber"] == num: return h
    return None
def quoted(txt):
    # sunnah.com marks Prophetic speech with U+200F " U+200F
    parts = re.findall(r'‏\s*"‏(.*?)‏\s*"‏', txt, re.S)
    return [re.sub(r'\s+', ' ', p.replace('\u200f','')).strip() for p in parts]
if __name__ == "__main__":
    for spec in sys.argv[1:]:
        coll, num = spec.split(":"); num = int(num)
        h = get(coll, num)
        if not h: print(f"!! {spec} NOT FOUND"); continue
        qs = quoted(h["text"])
        print(f"===== {spec} =====")
        if qs:
            for i,q in enumerate(qs): print(f"  [{i}] {q}")
        else:
            print("  (no quote markers) RAW:", h["text"][-400:])
        print()
