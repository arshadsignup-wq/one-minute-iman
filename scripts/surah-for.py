# -*- coding: utf-8 -*-
"""Sūrahs a narration ties to a situation, checked against the collections.

People arrive knowing there is "a sūrah for this" without knowing which, and
the ones they have heard of are not always the ones the graders accept. Al-Mulk
really is narrated for what follows death. Al-Wāqiʿah for wealth is the most
repeated of these claims and the least supported — the corpus here contains no
such narration at all, which is itself the answer.

So the candidates below are written with the reference they rest on, and this
script refuses any it cannot find and grade. What it emits is not a list of
sūrahs; it is a list of narrations that happen to name one.

Claims are worded to say what the text says. The Mulk hadith says the sūrah
intercedes until its reader is forgiven. It does not say "protects from the
punishment of the grave", however often it is quoted that way, so neither does
this.
"""
import json, os, glob, re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")

# (surah numbers, situations, collection, number, what the narration says)
CANDIDATES = [
    ([67], ["death-remembrance", "forgiveness"], "ibnmajah", 3786,
     "A sūrah of thirty verses that intercedes for whoever reads it until he is forgiven."),
    ([67], ["death-remembrance"], "abudawud", 1400,
     "Narrated again in Abū Dāwūd, with the same thirty verses and the same intercession."),
    ([2], ["protection", "sleep", "home"], "tirmidhi", 2881,
     "Whoever recites the last two āyāt of al-Baqarah at night, they will suffice him."),
    ([2], ["protection", "sleep", "refuge"], "tirmidhi", 2880,
     "Āyat al-Kursī, recited at night, and what was said to guard the one who reads it."),
    ([2], ["dhikr"], "tirmidhi", 2884,
     "Āyat al-Kursī named as the greatest āyah in the Book."),
    ([113, 114], ["refuge", "evil-eye", "protection", "sleep"], "tirmidhi", 3402,
     "Recited into the hands and wiped over the body, every night, before sleep."),
    ([1], ["illness"], "tirmidhi", 2064,
     "Recited over a man who had been stung, and he got up as though nothing had ailed him."),
    ([1], ["illness"], "abudawud", 3896,
     "The same practice, narrated again: the Opening of the Book used as a cure."),
    ([112], ["dhikr"], "tirmidhi", 2896,
     "Equal to a third of the Qur'an."),
    ([18], ["protection", "refuge"], "tirmidhi", 2885,
     "Recited by a man when tranquillity descended, and his horse startled at it."),
    ([109], ["sleep"], "abudawud", 5055,
     "Recited at bedtime, and finished as you fall asleep: a declaration of "
     "freedom from associating anything with Allah."),
    ([112, 113, 114], ["morning-evening", "refuge"], "tirmidhi", 3575,
     "Three times as the morning comes and three times as the evening does."),
    ([1], ["prayer", "dhikr"], "bukhari", 4474,
     "Named by the Prophet ﷺ as the greatest sūrah in the Qur'an, before he "
     "left the mosque."),
    ([87, 109, 112], ["prayer"], "tirmidhi", 463,
     "What ʿĀ'ishah said he recited in witr, one sūrah to each rakʿah."),
]

# Checked and rejected: Sunan an-Nasā'ī 1337 is cited everywhere for Āyat
# al-Kursī after the prayer. Read, it is the dhikr "Allāhumma anta as-salām" —
# a different narration entirely. Quoting it from memory would have put a wrong
# reference under a correct-looking grading.

# Claims people search for that the collections here do not carry. Published
# rather than omitted: someone who has been told to recite al-Wāqiʿah for money
# is better served by being shown what the graders say than by an empty page.
ABSENT = [
    {
        "surahs": [56],
        "situations": ["poverty", "debt", "work"],
        "claim": "“Whoever recites Sūrat al-Wāqiʿah every night will never be touched by poverty.”",
        "verdict": "Not established",
        "detail": "Narrated through Abū Shujāʿ from Abū Ṭiybah, chains the critics rejected; "
                  "al-Bayhaqī himself recorded it among the weak. It is not in any of the "
                  "collections indexed here, and a sweep of them for al-Wāqiʿah returns "
                  "nothing on provision. The Qur'an is not thereby less worth reading — only "
                  "this particular promise is unsupported.",
    },
]


def corpus():
    """Every narration, keyed by (collection, number)."""
    out = {}
    for f in glob.glob(os.path.join(DATA, "hadith", "*", "*.json")):
        try:
            d = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        items = d if isinstance(d, list) else sum(
            [v for v in d.values() if isinstance(v, list)], [])
        for h in items:
            if h.get("c") and h.get("n") is not None:
                out[(h["c"], str(h["n"]))] = h
    return out


ACCEPTED = re.compile(r"Ṣaḥīḥ|Sahih|Ḥasan|Hasan|Agreed upon", re.I)

def main():
    C = corpus()
    names = json.load(open(os.path.join(DATA, "quran-index.json"),
                           encoding="utf-8"))["names"]
    # translated titles live on the full sūrah records
    meta = {s["n"]: s for s in json.load(
        open(os.path.join(DATA, "quran.json"), encoding="utf-8"))}

    kept, refused = {}, []
    for nums, sits, coll, num, says in CANDIDATES:
        h = C.get((coll, str(num)))
        if not h:
            refused.append(f"{coll} {num}: not found in the corpus")
            continue
        grade = h.get("g") or ""
        if not ACCEPTED.search(grade):
            refused.append(f"{coll} {num}: grade is {grade!r}")
            continue
        rec = {
            "surahs": [{"n": n, "name": names[str(n)],
                        "translated": meta.get(n, {}).get("translated", "")}
                       for n in nums if str(n) in names],
            "says": says,
            "ref": {"collection": coll, "number": num, "grade": grade,
                    "verdicts": h.get("v") or []},
        }
        for sid in sits:
            kept.setdefault(sid, []).append(rec)

    out = {"for": kept, "absent": ABSENT}
    path = os.path.join(DATA, "surah-for.json")
    json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"✅ sūrah-for-situation: {sum(len(v) for v in kept.values())} links "
          f"across {len(kept)} situations  ({os.path.getsize(path) // 1024} KB)")
    for sid in sorted(kept):
        names = ", ".join(s["name"] for r in kept[sid] for s in r["surahs"])
        print(f"   {sid:<20} {names}")
    if ABSENT:
        print(f"   {len(ABSENT)} claim(s) published as not established")
    if refused:
        print("   refused:")
        for r in refused:
            print(f"     {r}")


if __name__ == "__main__":
    main()
