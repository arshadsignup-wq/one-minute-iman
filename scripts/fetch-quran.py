# -*- coding: utf-8 -*-
"""Fetch the complete Qur'an: Uthmani Arabic + Saheeh International translation."""
import json, os, re, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.quran.com/api/v4"
TRANSLATION = 20  # Saheeh International

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "one-minute-iman/1.0"})
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=45))
        except Exception as e:
            if attempt == 3: raise
            time.sleep(2 * (attempt + 1))

def strip(t):
    t = re.sub(r"<sup[^>]*>.*?</sup>", "", t or "", flags=re.S)
    return re.sub(r"<[^>]+>", "", t).strip()

chapters = get(f"{API}/chapters?language=en")["chapters"]
out = []
for ch in chapters:
    n = ch["id"]
    verses, page = [], 1
    while True:
        d = get(f"{API}/verses/by_chapter/{n}?fields=text_uthmani&translations={TRANSLATION}"
                f"&per_page=300&page={page}")
        for v in d["verses"]:
            verses.append({
                "n": v["verse_number"],
                "ar": v["text_uthmani"],
                "en": strip(v["translations"][0]["text"]) if v.get("translations") else "",
            })
        meta = d.get("pagination") or {}
        if not meta.get("next_page"): break
        page = meta["next_page"]
    out.append({
        "n": n,
        "name": ch["name_simple"],
        "arabic": ch["name_arabic"],
        "translated": ch["translated_name"]["name"],
        "revelation": ch["revelation_place"],
        "count": ch["verses_count"],
        "verses": verses,
    })
    print(f"  {n:>3}. {ch['name_simple']:<22} {len(verses):>3} ayat")
    time.sleep(0.12)

json.dump(out, open(f"{HERE}/quran.json", "w"), ensure_ascii=False)
total = sum(len(s["verses"]) for s in out)
print(f"\n✅ {len(out)} surahs, {total} ayat")
assert total == 6236, f"expected 6236 ayat, got {total}"
print("   verse count matches the Qur'an exactly")
