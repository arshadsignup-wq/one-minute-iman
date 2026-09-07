#!/usr/bin/env python3
"""Search Arabic corpora (diacritic-insensitive), report number + English grades."""
import json, sys, re, os
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadith")
COLLS = ["bukhari","muslim","abudawud","tirmidhi","nasai","ibnmajah"]
PRETTY = {"bukhari":"Bukhari","muslim":"Muslim","abudawud":"Abu Dawud",
          "tirmidhi":"Tirmidhi","nasai":"Nasai","ibnmajah":"Ibn Majah"}
DIAC = re.compile(r'[ً-ْٰـ]')
def norm(s):
    s = DIAC.sub('', s)
    s = s.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ٱ','ا')
    s = s.replace('ى','ي').replace('ة','ه')
    return s
def run(pat, limit=6):
    rx = re.compile(norm(pat))
    for c in COLLS:
        ap = f"{BASE}/ara-{c}.json"
        if not os.path.exists(ap): continue
        ad = json.load(open(ap)); ed = json.load(open(f"{BASE}/eng-{c}.json"))
        gmap = {h["hadithnumber"]: h for h in ed["hadiths"]}
        n = 0
        for h in ad["hadiths"]:
            t = norm(h["text"])
            m = rx.search(t)
            if not m: continue
            n += 1
            if n > limit: print(f"  (more in {c})"); break
            num = h["hadithnumber"]
            eh = gmap.get(num, {})
            gs = " | ".join(f"{g.get('name')}: {g.get('grade')}" for g in (eh.get("grades") or [])) or "(sahihayn)"
            print(f"--- {PRETTY[c]} {num} --- {gs}")
            print("    AR:", t[max(0,m.start()-60):m.end()+200].replace("\n"," "))
            if eh.get("text"): print("    EN:", eh["text"][:340].replace("\n"," "))
            print()
if __name__ == "__main__": run(sys.argv[1])
