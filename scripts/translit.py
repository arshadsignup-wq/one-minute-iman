# -*- coding: utf-8 -*-
"""Rule-based Arabic to Latin transliteration, driven by the vowel marks.

This is generated, not hand-written, and the site labels it as such. It follows a
light ALA-LC style: long vowels ā ī ū, emphatics ḥ ṣ ḍ ṭ ẓ, ʿayn ʿ and hamza ʾ.
"""
import re

CONS = {
    'ا': '', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ',
    'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
    'ة': 'h', 'ى': 'ā', 'ء': 'ʾ', 'أ': 'ʾ', 'إ': 'ʾ', 'ؤ': 'ʾ', 'ئ': 'ʾ',
    'آ': 'ʾā', 'ٱ': '',
}
FATHA, KASRA, DAMMA, SUKUN, SHADDA = 'َ', 'ِ', 'ُ', 'ْ', 'ّ'
FATHATAN, KASRATAN, DAMMATAN = 'ً', 'ٍ', 'ٌ'
SHORT = {FATHA: 'a', KASRA: 'i', DAMMA: 'u'}
TANWIN = {FATHATAN: 'an', KASRATAN: 'in', DAMMATAN: 'un'}
SUN = set('تثدذرزسشصضطظلن')
DAGGER = 'ٰ'
MARKS = set(SHORT) | set(TANWIN) | {SUKUN, SHADDA, DAGGER, 'ـ'}

SPECIAL = {
    'الله': 'Allāh', 'اللهم': 'Allāhumma', 'لله': 'lillāh', 'بالله': 'billāh',
    'والله': 'wallāh', 'تالله': 'tallāh', 'اللهُمَّ': 'Allāhumma',
}

def _strip(w):
    w = w.replace('ٱ', 'ا').replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
    return ''.join(c for c in w if c not in MARKS)

def _word(w):
    w = w.replace('ٱ', 'ا')
    bare = _strip(w)
    if bare in SPECIAL:
        return SPECIAL[bare]
    # conjunction / preposition prefixes carry their own syllable
    for pre, lat in (('و', 'wa-'), ('ف', 'fa-'), ('ب', 'bi-'), ('ل', 'li-'), ('ك', 'ka-')):
        if bare[1:] in SPECIAL and len(bare) > 1 and bare[0] == pre:
            return lat + SPECIAL[bare[1:]]
        if bare.startswith(pre + 'ال') and len(bare) > 3:
            rest = w[w.index('ا', 1):] if 'ا' in w[1:] else w[1:]
            return lat + _word(rest)
    out = []
    i = 0
    # definite article, with sun-letter assimilation
    if w.startswith('ال') and len(w) > 2:
        j = 2
        while j < len(w) and w[j] in MARKS:
            j += 1
        if j < len(w) and w[j] in SUN:
            out.append('a' + CONS.get(w[j], '') + '-')
            i = j
        else:
            out.append('al-')
            i = 2
    while i < len(w):
        ch = w[i]
        if ch in MARKS:
            i += 1
            continue
        base = CONS.get(ch)
        if base is None:
            i += 1
            continue
        # alif maqṣūra written mid-word with sukūn is a yāʾ: شَىْءٌ is shayʾ, not shāʾ
        if ch == 'ى' and SUKUN in [w[x] for x in range(i + 1, len(w)) if w[x] in MARKS][:1]:
            base = 'y'
        # gather the marks attached to this letter
        j = i + 1
        marks = []
        while j < len(w) and w[j] in MARKS:
            marks.append(w[j]); j += 1
        if ch == 'ة':
            base = 't' if any(m in TANWIN for m in marks) else 'h'
        # a shadda written on an alif belongs to the consonant before it:
        # إِلاَّ is illā, not ila
        if ch == 'ا' and SHADDA in marks:
            for x in range(len(out) - 1, -1, -1):
                if out[x] and out[x][-1] not in 'aiuāīū-':
                    out[x] = out[x] + out[x][-1]
                    break
            marks = [m for m in marks if m != SHADDA]
        assimilated = bool(out) and out[-1].endswith('-') and ch in SUN
        if SHADDA in marks and base and not assimilated:
            base = base + base if len(base) == 1 else base
        # long vowels: the letter carries no vowel mark of its own
        prev = out[-1] if out else ''
        if ch == 'ا' and (not marks or marks == [FATHA]):
            if prev.endswith('a'): out[-1] = prev[:-1] + 'ā'
            elif prev and prev[-1] not in 'aiuāīū': out.append('ā')
            else: out.append('ā')
            i = j; continue
        if ch == 'و' and (SUKUN in marks or not marks) and prev.endswith('u'):
            out[-1] = prev[:-1] + 'ū'; i = j; continue
        if ch == 'ي' and (SUKUN in marks or not marks) and prev.endswith('i'):
            out[-1] = prev[:-1] + 'ī'; i = j; continue
        out.append(base)
        for m in marks:
            if m in SHORT: out.append(SHORT[m])
            elif m in TANWIN: out.append(TANWIN[m])
            elif m == DAGGER: out.append('ā')
        # a bare alif written after tanwīn is silent
        if FATHATAN in marks and j < len(w) and w[j] in ('ا', 'ى'):
            j += 1
        i = j
    s = ''.join(out)
    s = re.sub(r'([aiu])\1+', r'\1', s)
    s = s.replace('aā', 'ā').replace('iā', 'ā').replace('uā', 'ā')
    s = s.replace('ʾā', 'ā')
    # a long vowel never doubles
    s = re.sub(r'ā{2,}', 'ā', s)
    s = re.sub(r'ī{2,}', 'ī', s)
    s = re.sub(r'ū{2,}', 'ū', s)
    return s

def translit(text):
    if not text: return ''
    words = re.split(r'(\s+|[،.؛:!؟"\'()\[\]])', text)
    PUNCT = {'،': ',', '؛': ';', '؟': '?'}
    parts = [(_word(w) if re.search(r'[ء-ي]', w) else PUNCT.get(w, w)) for w in words]
    s = ''.join(parts)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s*-\s*', '-', s)
    # wa-al-ḥamd reads better as wa-l-ḥamd
    s = re.sub(r'\b(wa|fa|bi|li|ka)-al-', r'\1-l-', s)
    # hamzat wasl after a prefix is not pronounced
    s = re.sub(r'\b(bi|li|wa|fa|ka)ā', r'\1', s)
    s = re.sub(r'\bwaʾ', 'wa-', s)
    s = re.sub(r'\bfaʾ', 'fa-', s)
    # a word-final tāʾ marbūṭa is read in pause: ʿāʾishahu -> ʿāʾishah
    s = re.sub(r'ah[ui]\b', 'ah', s)
    # word-initial hamza is not marked in this style: ʾinnahum -> innahum
    s = re.sub(r'(^|[\s\-"(])ʾ', r'\1', s)
    # the article after a vowel-final word elides: mina Allāh -> mina-Llāh
    s = re.sub(r'([aiuāīū])\s+Allāh', r'\1-Llāh', s)
    return s

if __name__ == "__main__":
    tests = [
      "لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
      "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      "اللَّهُمَّ اكْفِنِي بِحَلاَلِكَ عَنْ حَرَامِكَ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    ]
    for t in tests:
        print(f"  {t}\n  -> {translit(t)}\n")
