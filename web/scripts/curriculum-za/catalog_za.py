"""Step C (South Africa): units-merged.json -> two files
- src/lib/curriculum-catalog-za.json   the browsable catalog (no words)
- src/lib/curriculum-sets-za.json      words + in-lesson definitions per unit (server side)
Unit ids are stable hashes ("cur-za-" + 10 hex)."""
import hashlib, io, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, "..", "..", "src", "lib")
merged = json.load(io.open(os.path.join(HERE, "units-merged.json"), encoding="utf-8"))

SUBJECTS = [  # key, English name, Hebrew name, category (icons come from the Hebrew catalog where the key exists)
    ("english-home-language", "English Home Language", "אנגלית שפת בית", "language"),
    ("mathematics", "Mathematics", "מתמטיקה", "math"),
    ("natural-sciences-technology", "Natural Sciences and Technology", "מדעי הטבע וטכנולוגיה", "sciences"),
    ("natural-sciences", "Natural Sciences", "מדעי הטבע", "sciences"),
    ("technology", "Technology", "טכנולוגיה", "engineering"),
    ("history", "History", "היסטוריה", "history-civics"),
    ("geography", "Geography", "גאוגרפיה", "geography-environment"),
    ("economic-management-sciences", "Economic and Management Sciences", "כלכלה וניהול", "social-sciences"),
    ("life-skills", "Life Skills", "כישורי חיים", "body-health"),
    ("life-orientation", "Life Orientation", "התמצאות בחיים", "body-health"),
    ("creative-arts", "Creative Arts", "אמנויות", "arts-media"),
]
CATS = [("language", "Language", "שפה"), ("math", "Mathematics", "מתמטיקה"), ("sciences", "Sciences", "מדעים"),
        ("engineering", "Technology", "טכנולוגיה"), ("history-civics", "History", "היסטוריה"),
        ("geography-environment", "Geography", "גאוגרפיה"), ("social-sciences", "Economics", "כלכלה"),
        ("body-health", "Life Skills", "כישורי חיים"), ("arts-media", "Arts", "אמנויות")]
LEVELS = [("intermediate", "Intermediate Phase (Grades 4-6)", "כיתות ד עד ו"), ("senior", "Senior Phase (Grades 7-9)", "כיתות ז עד ט")]


def clean(s):
    return re.sub(r"\s{2,}", " ", re.sub(r"\s*[–—]\s*", ", ", str(s or ""))).strip()


topics, sets, count = [], {}, {}
order = {k: i for i, (k, *_) in enumerate(SUBJECTS)}
for gk, units in merged.items():
    key, grade = gk.split("|")
    g = int(grade)
    lv = "intermediate" if g <= 6 else "senior"
    seen = set()
    for u in units:
        title = clean(u.get("topic"))
        words = [(clean(w.get("w")), clean(w.get("d"))) for w in u.get("words") or [] if w.get("w") and w.get("d")]
        if not title or title.lower() in seen or len(words) < 4:
            continue
        seen.add(title.lower())
        tid = "cur-za-" + hashlib.sha1(f"{key}|{g}|{title}".encode("utf-8")).hexdigest()[:10]
        topics.append({"id": tid, "s": key, "l": lv, "g": str(g), "t": title, "term": u.get("term"), "strand": clean(u.get("strand"))})
        dd = {}
        for w, d in words:
            if w not in dd:
                dd[w] = d
        sets[tid] = {"words": list(dd)[:12], "defs": {w: dd[w] for w in list(dd)[:12]}}
        count[key] = count.get(key, 0) + 1

topics.sort(key=lambda t: (order[t["s"]], int(t["g"]), t["term"] or 9))
subjects = [{"key": k, "en": en, "he": he, "cat": c} for k, en, he, c in SUBJECTS if k in count]
cat_used = {s["cat"] for s in subjects}
out = {"curriculum": "za-caps", "levels": [{"key": k, "en": en, "he": he} for k, en, he in LEVELS],
       "categories": [{"key": k, "en": en, "he": he} for k, en, he in CATS if k in cat_used], "subjects": subjects, "topics": topics}
io.open(os.path.join(LIB, "curriculum-catalog-za.json"), "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
io.open(os.path.join(LIB, "curriculum-sets-za.json"), "w", encoding="utf-8").write(json.dumps(sets, ensure_ascii=False, separators=(",", ":")))
from collections import Counter
print("subjects", len(subjects), "units", len(topics), "words", sum(len(v["words"]) for v in sets.values()))
print(Counter((t["s"], t["g"]) for t in topics).most_common(5))
