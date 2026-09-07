# -*- coding: utf-8 -*-
"""Add further translations and recitation audio to the Qur'an data."""
import json, os, re, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.quran.com/api/v4"
EXTRA = {85: "abdelhaleem", 19: "pickthall"}
RECITER = 7  # Mishari Rashid al-Afasy
AUDIO_BASE = "https://verses.quran.com/"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "one-minute-iman/1.0"})
    for a in range(4):
        try: return json.load(urllib.request.urlopen(req, timeout=45))
        except Exception:
            if a == 3: raise
            time.sleep(2 * (a + 1))

def strip(t):
    t = re.sub(r"<sup[^>]*>.*?</sup>", "", t or "", flags=re.S)
    return re.sub(r"<[^>]+>", "", t).strip()

q = json.load(open(f"{HERE}/quran.json"))
ids = ",".join(str(i) for i in EXTRA)

for s in q:
    by = {}
    page = 1
    while True:
        d = get(f"{API}/verses/by_chapter/{s['n']}?translations={ids}&per_page=300&page={page}")
        for v in d["verses"]:
            by[v["verse_number"]] = {
                EXTRA[t["resource_id"]]: strip(t["text"])
                for t in (v.get("translations") or []) if t.get("resource_id") in EXTRA
            }
        nxt = (d.get("pagination") or {}).get("next_page")
        if not nxt: break
        page = nxt
    audio = {}
    d = get(f"{API}/recitations/{RECITER}/by_chapter/{s['n']}?per_page=300")
    for a in d.get("audio_files", []):
        n = int(a["verse_key"].split(":")[1])
        audio[n] = AUDIO_BASE + a["url"]
    for v in s["verses"]:
        v.update(by.get(v["n"], {}))
        if v["n"] in audio: v["audio"] = audio[v["n"]]
    print(f"  {s['n']:>3}. {s['name']:<22} +{len(by)} translations, +{len(audio)} audio")
    time.sleep(0.1)

json.dump(q, open(f"{HERE}/quran.json", "w"), ensure_ascii=False)
json.dump(q, open(os.path.join(os.path.dirname(HERE), "data", "quran.json"), "w"), ensure_ascii=False)
tot = sum(len(s["verses"]) for s in q)
withaudio = sum(1 for s in q for v in s["verses"] if v.get("audio"))
witht = sum(1 for s in q for v in s["verses"] if v.get("abdelhaleem"))
print(f"\n✅ {tot:,} ayat · {witht:,} with extra translations · {withaudio:,} with audio")
