# -*- coding: utf-8 -*-
import json, re, os, sys, urllib.request, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from manifest import ENTRIES

# Two entries sharing an id silently collapse into one static page and the
# other becomes unreachable. Catch it here rather than in the rendered site.
_ids = [e["id"] for e in ENTRIES]
_dupes = sorted({i for i in _ids if _ids.count(i) > 1})
if _dupes:
    raise SystemExit("DUPLICATE ID in manifest: " + ", ".join(_dupes))

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadith")
PRETTY = {"malik":"Muwaṭṭa' Mālik",
          "bukhari":"Ṣaḥīḥ al-Bukhārī","muslim":"Ṣaḥīḥ Muslim","abudawud":"Sunan Abī Dāwūd",
          "tirmidhi":"Jāmiʿ at-Tirmidhī","nasai":"Sunan an-Nasā'ī","ibnmajah":"Sunan Ibn Mājah"}
SAHIHAYN = {"bukhari","muslim"}
DIAC = re.compile(r'[ً-ْٰـ]')
PUNCT = re.compile(r'[،؛؟:\.!\-\u200f\u200e]+')
def norm(s):
    """Anchors must survive punctuation differences: al-Bukhārī 6403 writes
    'لا إله إلا الله، وحده' with a comma where other narrations do not."""
    s = DIAC.sub('', s or '')
    for a,b in [('أ','ا'),('إ','ا'),('آ','ا'),('ٱ','ا'),('ى','ي'),('ة','ه'),
                ('ئ','ي'),('ؤ','و')]: s = s.replace(a,b)
    s = PUNCT.sub(' ', s)
    return re.sub(r'\s+',' ', s)

_cache = {}
def load(lang, coll):
    k=(lang,coll)
    if k not in _cache: _cache[k] = json.load(open(f"{BASE}/{lang}-{coll}.json"))
    return _cache[k]

def find(coll, num, lang):
    for h in load(lang, coll)["hadiths"]:
        if h["hadithnumber"] == num: return h
    return None

WEAK = re.compile(r"da'?if|weak|munkar|mawdu|fabricat", re.I)
STRONG = re.compile(r"sahih|hasan", re.I)
def classify(grades):
    verdicts=[]
    for g in grades:
        gr = g.get("grade","")
        if WEAK.search(gr): verdicts.append(("weak", g))
        elif STRONG.search(gr): verdicts.append(("strong", g))
        else: verdicts.append(("other", g))
    return verdicts

def quoted_segments(txt):
    return [re.sub(r'\s+',' ', p.replace('‏','')).strip()
            for p in re.findall(r'‏\s*"‏(.*?)‏\s*"‏', txt, re.S)]

CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "quran-cache.json")
try:
    _CACHE = json.load(open(CACHE_PATH))
except Exception:
    _CACHE = {}

def qfetch(url):
    """The Qur'an API drops connections occasionally; a single failure must not
    take down a whole verification run. Verses are cached on disk, so a re-run
    needs the network only for references it has not seen before."""
    if url in _CACHE:
        return _CACHE[url]
    req = urllib.request.Request(url, headers={"User-Agent": "one-minute-iman/1.0"})
    last = None
    for attempt in range(5):
        try:
            data = json.load(urllib.request.urlopen(req, timeout=45))
            _CACHE[url] = data
            json.dump(_CACHE, open(CACHE_PATH, "w"), ensure_ascii=False)
            return data
        except Exception as exc:
            last = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Qur'an API failed after 5 attempts: {url}") from last

out, problems = [], []
for e in ENTRIES:
    src = e["src"]; rec = dict(e); rec.pop("src")
    if src["kind"] == "hadith":
        coll, num = src["coll"], src["num"]
        ar = find(coll, num, "ara"); en = find(coll, num, "eng")
        if not ar: problems.append((e["id"], "HADITH NOT FOUND", f"{coll}:{num}")); continue
        anchor = src.get("anchor","")
        if anchor and norm(anchor) not in norm(ar["text"]):
            problems.append((e["id"], "ANCHOR NOT IN SOURCE", f"{coll}:{num} :: {anchor}")); continue
        segs = quoted_segments(ar["text"])
        seg = next((s for s in segs if norm(anchor) in norm(s)), None)
        # Narrow to the du'a itself. The span must be a real substring of the source.
        span = src.get("span"); span_from = src.get("span_from")
        if span:
            if norm(span) not in norm(ar["text"]):
                problems.append((e["id"], "SPAN NOT IN SOURCE", f"{coll}:{num} :: {span}")); continue
            seg = span
        elif span_from and seg:
            i = norm(seg).find(norm(span_from))
            if i < 0:
                problems.append((e["id"], "SPAN_FROM NOT IN SEGMENT", f"{coll}:{num} :: {span_from}")); continue
            # map normalised index back to raw by counting non-diacritic chars
            cnt, raw_i = 0, 0
            for j,ch in enumerate(seg):
                if cnt == i: raw_i = j; break
                if not DIAC.match(ch): cnt += 1
            seg = seg[raw_i:]
        grades = en.get("grades") or []
        vs = classify(grades)
        if coll in SAHIHAYN:
            grade_label = "Ṣaḥīḥ"; grade_detail = ["Agreed upon as authentic (al-Bukhārī / Muslim)"]
        else:
            weak = [g for k,g in vs if k=="weak"]; strong=[g for k,g in vs if k=="strong"]
            grade_detail = [f"{g.get('name')}: {g.get('grade')}" for g in grades]
            # Tiered policy: require a clear majority of authenticating verdicts.
            # Dissent is never hidden; it is recorded and surfaced on the page.
            if not strong or len(weak) >= len(strong):
                problems.append((e["id"], "FAILS GRADE RULE", f"{coll}:{num} :: " + "; ".join(grade_detail))); continue
            grade_label = "Ḥasan" if all("hasan" in (g.get("grade","")).lower() for g in strong) else "Ṣaḥīḥ"
            if weak:
                rec["dissent"] = ("Scholars differ on this chain. "
                    + "; ".join(f"{g.get('name')} grades it {g.get('grade')}" for g in weak)
                    + f". The majority ({len(strong)} of {len(grades)}) authenticate it.")
        rec["source"] = dict(kind="hadith", collection=PRETTY[coll], slug=coll, number=num,
                             url=f"https://sunnah.com/{coll}:{num}",
                             grade=grade_label, gradings=grade_detail)
        rec["arabic"] = seg or ""
        if not seg: problems.append((e["id"], "NO QUOTED SEGMENT (using narrative)", f"{coll}:{num}"))
        rec["english_full"] = en["text"]
        rec.setdefault("mode","dua")
    else:
        s,a,b = src["surah"], src["start"], src["end"]
        keys = [f"{s}:{i}" for i in range(a,b+1)]
        ars, trs = [], []
        for k in keys:
            d = qfetch(f"https://api.quran.com/api/v4/verses/by_key/{k}?fields=text_uthmani&translations=20")
            v = d["verse"]
            ars.append(v["text_uthmani"])
            trs.append(re.sub(r'<[^>]+>','', v["translations"][0]["text"]))
            time.sleep(0.15)
        rec["arabic"] = " ".join(ars)
        rec["trans"] = " ".join(trs)
        ref = f"{s}:{a}" if a==b else f"{s}:{a}-{b}"
        rec["source"] = dict(kind="quran", collection="The Qur'an", surah=s, ayah_start=a, ayah_end=b,
                             reference=ref, url=f"https://quran.com/{s}/{a}",
                             grade="Qur'an", gradings=["Qur'anic text in the Uthmani script via Quran.com; translation: Saheeh International"])
    out.append(rec)

json.dump(out, open(f"{os.path.dirname(os.path.abspath(__file__))}/verified.json","w"), ensure_ascii=False, indent=1)
print(f"✅ verified & written: {len(out)}/{len(ENTRIES)}")
if problems:
    print(f"\n⚠️  {len(problems)} PROBLEM(S):")
    for pid, kind, detail in problems: print(f"  [{kind}] {pid}\n      {detail}")
