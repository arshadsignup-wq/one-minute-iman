# -*- coding: utf-8 -*-
"""Ibn Kathir (abridged), one shard per sūrah.

The API groups a passage of āyāt under a single commentary, so we record which
verses a response covered and skip them, rather than asking 6,236 times.
"""
import json, os, re, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "data", "tafsir")
API = "https://api.quran.com/api/v4"
TAFSIR = 169

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "one-minute-iman/1.0"})
    for a in range(4):
        try: return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            if a == 3: return None
            time.sleep(2 * (a + 1))

def clean(t):
    t = re.sub(r"<h2[^>]*>(.*?)</h2>", r"\n\n\1\n", t or "", flags=re.S | re.I)
    t = re.sub(r"</p>|<br\s*/?>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

os.makedirs(OUT, exist_ok=True)
q = json.load(open(f"{HERE}/quran.json"))
calls = 0
for s in q:
    path = os.path.join(OUT, f"{s['n']}.json")
    if os.path.exists(path):
        continue
    blocks, covered = [], set()
    for v in s["verses"]:
        if v["n"] in covered:
            continue
        d = get(f"{API}/tafsirs/{TAFSIR}/by_ayah/{s['n']}:{v['n']}")
        calls += 1
        if not d or not d.get("tafsir"):
            covered.add(v["n"]); continue
        t = d["tafsir"]
        keys = sorted(int(k.split(":")[1]) for k in (t.get("verses") or {}))
        keys = [k for k in keys if k >= v["n"]] or [v["n"]]
        covered.update(keys)
        text = clean(t.get("text", ""))
        if text:
            blocks.append({"from": keys[0], "to": keys[-1], "text": text})
        time.sleep(0.08)
    json.dump(blocks, open(path, "w"), ensure_ascii=False)
    print(f"  {s['n']:>3}. {s['name']:<22} {len(blocks):>3} passages", flush=True)
print(f"\n✅ tafsir fetched with {calls} requests")
