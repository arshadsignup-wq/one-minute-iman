# -*- coding: utf-8 -*-
"""Re-file the library tier against the current rule, without re-harvesting.

The Arabic patterns in lexicon.py were unanchored, and Arabic attaches its
pronouns as suffixes, so الهم (grief) matched inside أموالهم (their wealth) and
مكيالهم (their measure). Thirty narrations about fighting and about the zakat
collector were therefore listed under "Duʿā for anxiety and worry", in Arabic,
with no translation beside them.

The patterns are fixed now. Re-running the whole pipeline needs 62MB of source
collections that are not in the repository, but nothing about this step does:
data/entries.json already carries each narration's Arabic and its full English,
which is everything assign() reads. So the rule is re-applied here and the three
generated files are re-emitted.

    python3 scripts/refile.py            # report what would change
    python3 scripts/refile.py --write    # write it
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DATA = os.path.join(os.path.dirname(HERE), "data")

from assign import assign, fallback  # noqa: E402
from lexicon import S, CATEGORIES  # noqa: E402

write = "--write" in sys.argv

entries = json.load(open(f"{DATA}/entries.json", encoding="utf-8"))

moved, emptied, before_total, after_total = [], 0, 0, 0
for e in entries:
    if e["tier"] != "library":
        continue
    old = list(e.get("situations") or [])
    new = assign(e.get("english_full"), e.get("arabic"))
    if not new:
        new = fallback(e.get("arabic"))
    before_total += len(old)
    after_total += len(new)
    if new != old:
        moved.append((e["id"], e["title"], old, new))
    e["situations"] = new

print(f"library entries re-filed : {sum(1 for e in entries if e['tier']=='library')}")
print(f"assignments before/after : {before_total} -> {after_total}")
print(f"entries whose filing moved: {len(moved)}")

# what each situation gains and loses
delta = {}
for _id, _t, old, new in moved:
    for s in set(old) - set(new):
        delta.setdefault(s, [0, 0])[0] += 1
    for s in set(new) - set(old):
        delta.setdefault(s, [0, 0])[1] += 1
print("\nsituation                 lost   gained")
for sid, (lost, gained) in sorted(delta.items(), key=lambda kv: -kv[1][0]):
    print(f"  {sid:<24} {lost:>4}   {gained:>5}")

print("\na few that moved:")
for _id, _t, old, new in moved[:8]:
    print(f"  {_t:<26} {','.join(old) or '-'}  ->  {','.join(new) or '-'}")

if not write:
    print("\n(dry run — pass --write to emit)")
    raise SystemExit(0)

# ── re-emit, mirroring steps 4 and 5 of build_all.py ────────────────────────
sit_out = []
for x in S:
    members = [e["id"] for e in entries if x["id"] in e["situations"]]
    sit_out.append({
        "id": x["id"], "label": x["label"], "cat": x["cat"], "blurb": x["blurb"],
        "feelings": x["feelings"], "count": len(members),
    })


def _ref_line(e):
    src = e["source"]
    if src["kind"] == "quran":
        return "Qur'an %s" % src.get("reference", "")
    return "%s %s" % (src["collection"], src["number"])


def _snip(t, n=90):
    t = (t or "").strip()
    return t if len(t) <= n else t[:n].rstrip() + " …"


index = [{
    "id": e["id"],
    "t": e["title"],
    "s": e["situations"],
    "x": 1 if e["tier"] == "curated" else 0,
    "g": e["source"]["grade"],
    "r": _ref_line(e),
    "l": e.get("lede") or e.get("book") or "",
    "a": _snip(e.get("arabic") or ""),
} for e in entries]


def _emit(obj, *names):
    for n in names:
        json.dump(obj, open(n, "w"), ensure_ascii=False, indent=1)


_emit(entries, f"{HERE}/all-entries.json", f"{DATA}/entries.json")
_emit({"categories": CATEGORIES, "situations": sit_out},
      f"{HERE}/situations.json", f"{DATA}/situations.json")
_emit(index, f"{DATA}/index.json")
print("\nwrote entries.json, situations.json, index.json")

empty = [s["id"] for s in sit_out if s["count"] == 0]
thin = [(s["id"], s["count"]) for s in sit_out if 0 < s["count"] < 4]
if empty:
    print("   ⚠️  situations with no entries:", empty)
if thin:
    print("   ⚠️  thin situations:", thin)
