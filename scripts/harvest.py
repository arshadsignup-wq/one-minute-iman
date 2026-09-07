# -*- coding: utf-8 -*-
"""Harvest every supplication-bearing hadith that passes the grade rule.

The Arabic is always cut out of the source text itself, never retyped, and the
grade rule is identical to the one used for the curated entries.
"""
import json, re, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadith")
COLLS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik"]
PRETTY = {"bukhari": "Ṣaḥīḥ al-Bukhārī", "muslim": "Ṣaḥīḥ Muslim",
          "abudawud": "Sunan Abī Dāwūd", "tirmidhi": "Jāmiʿ at-Tirmidhī",
          "nasai": "Sunan an-Nasā'ī", "ibnmajah": "Sunan Ibn Mājah",
          "malik": "Muwaṭṭa' Mālik"}
RANK = {"bukhari": 0, "muslim": 1, "abudawud": 2, "nasai": 3, "tirmidhi": 4,
        "ibnmajah": 5, "malik": 6}

DIAC = re.compile(r'[ً-ْٰـ]')
def norm(s):
    s = DIAC.sub('', s or '')
    for a, b in [('أ','ا'),('إ','ا'),('آ','ا'),('ٱ','ا'),('ى','ي'),('ة','ه'),
                 ('ئ','ي'),('ؤ','و')]:
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip()

PUNCT = re.compile(r'[،؛:.!؟\-\u200f\s"\'()\[\]]+')
def dedupe_key(s):
    """Two narrations of the same du'a differ only by punctuation or spacing."""
    return PUNCT.sub('', norm(s))

VARIANTS = {
    'ا': 'اأإآٱ', 'أ': 'اأإآٱ', 'إ': 'اأإآٱ', 'آ': 'اأإآٱ', 'ٱ': 'اأإآٱ',
    'ي': 'يى', 'ى': 'يى', 'ه': 'هة', 'ة': 'هة', 'و': 'وؤ', 'ؤ': 'وؤ',
    'ء': 'ءأإؤئ',
}

def flex(word):
    """Regex for an Arabic phrase that tolerates diacritics AND the orthographic
    variants that otherwise defeat matching (ى vs ي, ة vs ه, أ vs ا)."""
    out = []
    for ch in word:
        if ch == ' ':
            out.append(r'[\s‏]+')
        elif ch in VARIANTS:
            out.append('[' + VARIANTS[ch] + ']' + r'[ً-ْٰـ]*')
        else:
            out.append(re.escape(ch) + r'[ً-ْٰـ]*')
    return ''.join(out)

# Openings that mark the start of an actual supplication or dhikr
# Where a supplication begins. This vocabulary decides where the quoted text is cut,
# so anything missing from it silently truncates a du'a. It is deliberately broad.
OPENERS = [
    # addressing Allah
    "اللهم", "اللَّهُمَّ", "يا الله", "يا رب", "يا حي يا قيوم", "يا مقلب القلوب",
    "ربنا", "رب اغفر", "رب اجعل", "رب زدني", "رب هب", "رب اشرح", "رب انصرني",
    "رب أعوذ", "رب لا تذرني", "رب إني", "رب انزلني", "بك اللهم", "ربِ",
    # seeking refuge and help
    "أعوذ بالله", "اعوذ بالله", "أعوذ بك", "اعوذ بك", "أستعيذ", "استعيذ",
    "أجرني", "اجرني", "أعذني", "اعذني",
    # praise, glorification, testimony
    "بسم الله", "باسم الله", "الحمد لله", "سبحان", "سبحانك", "تبارك",
    "لا إله إلا الله", "لا اله الا الله", "الله أكبر", "الله اكبر",
    "أستغفر الله", "استغفر الله", "لا حول ولا قوة", "حسبي الله", "حسبنا الله",
    # "with Your name", "by You"
    "باسمك", "بِاسْمِكَ", "بسمك", "بك أعوذ", "بك اللهم",
    # states the servant declares
    "أصبحنا", "اصبحنا", "أمسينا", "امسينا", "أصبحت", "اصبحت", "أمسيت", "امسيت",
    "آمنت", "امنت", "توكلت", "رضيت", "أبوء", "ابوء", "آيبون", "ايبون",
    "إنا لله", "انا لله", "اللهم إني", "اللهم انى",
    # asking directly
    "اغفر", "ارحم", "اهدني", "ارزقني", "عافني", "اشف", "اشفه", "ثبت", "أصلح",
    "اصلح", "اكفني", "وفقني", "تقبل", "بارك", "أعنّي", "اعني", "سلّم", "زدني",
    # set formulas
    "لا بأس", "لا باس", "طهور", "ما شاء الله", "جزاك الله", "بارك الله",
    "صيبا", "اللهم صيبا",
    # short formulas and other well-known openings
    "غفرانك", "ذهب الظمأ", "ذهب الظما", "السلام عليكم", "سبحان الملك",
    "يا ذا الجلال", "يا حي يا قيوم", "يا مقلب", "يا رب", "يا الله",
    "أعوذ بكلمات", "اعوذ بكلمات", "أعيذك", "اعيذك", "أعيذكما", "اعيذكما",
    "الله أكبر", "اللهم أهله", "اللهم اهله", "تقبل منا", "حسبنا", "نعوذ",
    "أسأل الله", "اسال الله", "أستودع", "استودع", "اللهم لا سهل", "لا سهل",
    "إنا لله وإنا إليه", "انا لله وانا اليه", "رضيت بالله",
]

STRONG = ["اللهم", "أعوذ بالله", "اعوذ بالله", "غفرانك", "السلام عليكم أهل",
          "الحمد لله الذي", "سبحان الذي", "لا إله إلا الله", "لا اله الا الله",
          "بسم الله الذي"]
STRONG_RX = re.compile(r"(?<![\u0621-\u064A])(?:" + "|".join(flex(o) for o in STRONG) + r")")
OPEN_RX = re.compile(r"(?<![\u0621-\u064A])(?:" + "|".join(flex(o) for o in OPENERS) + r")")

WEAK = re.compile(r"da'?if|weak|munkar|mawdu|fabricat", re.I)
STRONG = re.compile(r"sahih|hasan", re.I)

def quoted(txt):
    return [m for m in re.finditer(r'‏\s*"‏(.*?)‏\s*"‏', txt, re.S)]

LETTER = re.compile(r'[\u0621-\u064A]')
MARK = re.compile(r'[\u064B-\u0652\u0670\u0640]')

def starts_word(text, i):
    """True if position i begins a word. The regex lookbehind cannot do this on
    its own, because vowel marks sit between the previous letter and this one:
    without skipping them, 'رب' matches inside الْمَغْرِبِ."""
    j = i - 1
    while j >= 0 and MARK.match(text[j]):
        j -= 1
    return j < 0 or not LETTER.match(text[j])

def clean(s):
    s = s.replace('‏', '')
    s = re.sub(r'\s+', ' ', s)
    return s.strip(' .،؛:')

def grade_of(coll, h):
    gs = h.get("grades") or []
    if coll in ("bukhari", "muslim"):
        return "Ṣaḥīḥ", ["Agreed upon as authentic (al-Bukhārī / Muslim)"], []
    weak = [g for g in gs if WEAK.search(g.get("grade", ""))]
    strong = [g for g in gs if STRONG.search(g.get("grade", ""))]
    if not strong or len(weak) >= len(strong):
        return None, None, None
    label = "Ḥasan" if all("hasan" in g.get("grade", "").lower() for g in strong) else "Ṣaḥīḥ"
    detail = [f"{g.get('name')}: {g.get('grade')}" for g in gs]
    return label, detail, weak

def run():
    found, skipped_grade = {}, 0
    for coll in COLLS:
        eng = json.load(open(f"{BASE}/eng-{coll}.json"))
        ara = json.load(open(f"{BASE}/ara-{coll}.json"))
        amap = {h["hadithnumber"]: h["text"] for h in ara["hadiths"]}
        sections = eng["metadata"]["sections"]

        for h in eng["hadiths"]:
            num = h["hadithnumber"]
            araw = amap.get(num)
            if not araw:
                continue

            duas = []
            segments = quoted(araw)
            if not segments:
                # Some narrations carry no quote markers at all. Fall back to the raw
                # text, but only from a strong opening, and stop at the next narrator
                # cue so we never trail off into the chain.
                for om in (m for m in STRONG_RX.finditer(araw) if starts_word(araw, m.start())):
                    tail = araw[om.start():om.start() + 260]
                    tail = re.split(r'\s(?:قَالَ|قال|عَنْ|عن|حَدَّثَنَا|حدثنا|أَخْبَرَنَا|اخبرنا)\s',
                                    tail)[0]
                    cand = clean(tail)
                    if 7 <= len(cand) <= 300:
                        duas.append(cand)
                    break
            for m in segments:
                seg = m.group(1)
                hits = [m for m in OPEN_RX.finditer(seg) if starts_word(seg, m.start())]
                if not hits:
                    continue
                # slice from the FIRST marker, never a later one: starting at a
                # marker further in would drop the opening words of the du'a
                cand = clean(seg[hits[0].start():])
                if 7 <= len(cand) <= 900:
                    duas.append(cand)
            if not duas:
                continue

            label, detail, weak = grade_of(coll, h)
            if not label:
                skipped_grade += 1
                continue

            for d in duas:
                full = dedupe_key(d)
                if len(full) < 18:
                    continue
                # collapse near-variants: same opening is the same supplication
                key = full[:48]
                rec = {
                    "arabic": d,
                    "coll": coll,
                    "number": num,
                    "book": sections.get(str(h["reference"]["book"]), ""),
                    "english": h["text"],
                    "grade": label,
                    "gradings": detail,
                    "dissent": [f"{g.get('name')} grades it {g.get('grade')}" for g in (weak or [])],
                }
                prev = found.get(key)
                better = prev is not None and (
                    RANK[coll] < RANK[prev["coll"]]
                    or (RANK[coll] == RANK[prev["coll"]] and len(d) > len(prev["arabic"]))
                )
                if prev is None or better:
                    if prev:
                        rec["parallels"] = prev.get("parallels", []) + [f"{PRETTY[prev['coll']]} {prev['number']}"]
                    found[key] = rec
                else:
                    prev.setdefault("parallels", []).append(f"{PRETTY[coll]} {num}")

    out = list(found.values())
    for r in out:
        r["collection"] = PRETTY[r["coll"]]
        r["url"] = f"https://sunnah.com/{r['coll']}:{r['number']}"
        r["parallels"] = sorted(set(r.get("parallels", [])))[:6]
    out.sort(key=lambda r: (RANK[r["coll"]], r["number"]))
    json.dump(out, open(f"{os.path.dirname(os.path.abspath(__file__))}/harvested.json", "w"),
              ensure_ascii=False, indent=1)
    print(f"✅ harvested {len(out)} distinct verified supplications")
    print(f"   (skipped {skipped_grade} hadith that failed the grade rule)")
    from collections import Counter
    for c, n in Counter(r["coll"] for r in out).most_common():
        print(f"   {PRETTY[c]}: {n}")

if __name__ == "__main__":
    run()
