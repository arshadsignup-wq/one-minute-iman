#!/usr/bin/env python3
"""Search / fetch hadith from local corpora with full scholar gradings."""
import json, sys, re, os, functools

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadith")
COLLECTIONS = ["bukhari","muslim","abudawud","tirmidhi","nasai","ibnmajah"]
PRETTY = {"bukhari":"Sahih al-Bukhari","muslim":"Sahih Muslim","abudawud":"Sunan Abi Dawud",
          "tirmidhi":"Jami` at-Tirmidhi","nasai":"Sunan an-Nasa'i","ibnmajah":"Sunan Ibn Majah"}

@functools.lru_cache(maxsize=None)
def load(lang, coll):
    p = os.path.join(BASE, f"{lang}-{coll}.json")
    if not os.path.exists(p): return None
    return json.load(open(p))

def arabic_for(coll, num):
    d = load("ara", coll)
    if not d: return None
    for h in d["hadiths"]:
        if h["hadithnumber"] == num: return h["text"]
    return None

def fmt_grades(h):
    gs = h.get("grades") or []
    return " | ".join(f"{g.get('name')}: {g.get('grade')}" for g in gs) or "(none listed)"

def show(coll, num, arabic=True):
    d = load("eng", coll)
    hits = [h for h in d["hadiths"] if h["hadithnumber"] == num]
    for h in hits:
        print(f"=== {PRETTY[coll]} {h['hadithnumber']}  (book {h['reference']['book']}:{h['reference']['hadith']}) ===")
        print("GRADES:", fmt_grades(h))
        print("EN:", h["text"])
        if arabic:
            a = arabic_for(coll, num)
            if a: print("AR:", a)
        print()

def search(pattern, colls=None, limit=8, ctx=260):
    rx = re.compile(pattern, re.I)
    for coll in (colls or COLLECTIONS):
        d = load("eng", coll)
        if not d: continue
        n = 0
        for h in d["hadiths"]:
            m = rx.search(h["text"])
            if not m: continue
            n += 1
            if n > limit: 
                print(f"  ... more matches in {coll} truncated\n"); break
            s = max(0, m.start()-ctx//2); e = min(len(h['text']), m.end()+ctx)
            print(f"--- {PRETTY[coll]} {h['hadithnumber']} --- {fmt_grades(h)}")
            print("   ", h["text"][s:e].replace("\n"," "))
        if n: print()

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "get":
        show(sys.argv[2], int(sys.argv[3]))
    elif cmd == "search":
        colls = sys.argv[3].split(",") if len(sys.argv) > 3 else None
        search(sys.argv[2], colls)
