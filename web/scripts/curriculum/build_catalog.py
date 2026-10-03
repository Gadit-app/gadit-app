"""Step C: merged.json + canon2.json -> web/src/lib/curriculum-catalog.json
The compact catalog the /sets area reads: levels, categories, subjects, topics.
Topic ids are stable hashes of subject|level|title ("cur-" + 10 hex)."""
import hashlib, io, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "src", "lib", "curriculum-catalog.json")
canon = json.load(io.open(os.path.join(HERE, "canon2.json"), encoding="utf-8"))
merged = json.load(io.open(os.path.join(HERE, "merged.json"), encoding="utf-8"))

LEVELS = [("gan", "גן"), ("elementary", "יסודי"), ("middle", "חטיבת ביניים"), ("high", "תיכון")]
LV_KEY = {he: k for k, he in LEVELS}
CATS = [
    ("language", "שפה וספרות"), ("math", "מתמטיקה"), ("sciences", "מדעים"),
    ("foreign-languages", "שפות זרות"), ("jewish-studies", "יהדות ומורשת"),
    ("history-civics", "היסטוריה, חברה ואזרחות"), ("geography-environment", "גאוגרפיה וסביבה"),
    ("social-sciences", "מדעי החברה"), ("computers", "מחשבים וטכנולוגיה"),
    ("arts-media", "אמנויות ותקשורת"), ("body-health", "גוף, בריאות וכישורי חיים"),
    ("engineering", "הנדסה ומגמות טכנולוגיות"), ("vocational", "מגמות מקצועיות"),
    ("early-childhood", "גיל הרך"),
]
CAT_KEY = {he: k for k, he in CATS}

def clean(s):
    s = re.sub(r"\s*[–—]\s*", " ", str(s)).strip()
    return re.sub(r"\s{2,}", " ", s)

def grades(g):
    return re.sub(r"\s*[–—]\s*", "-", str(g or "")).strip()

topics, count = [], {}
for gk, ts in merged.items():
    key, level_he = gk.split("|")
    lv = LV_KEY[level_he]
    seen = set()
    for t in ts:
        title = clean(t.get("title", ""))
        if not title or title in seen:
            continue
        seen.add(title)
        tid = "cur-" + hashlib.sha1(f"{key}|{lv}|{title}".encode("utf-8")).hexdigest()[:10]
        topics.append({"id": tid, "s": key, "l": lv, "t": title, "g": grades(t.get("grades")),
                       "n": len(set(t.get("sources") or [])), "o": 1 if t.get("official") else 0})
        count[key] = count.get(key, 0) + 1

subjects = []
for s in canon["subjects"]:
    if s["key"] not in count:
        continue
    subjects.append({"key": s["key"], "he": clean(s["name"]), "cat": CAT_KEY[s["category"]],
                     "dati": 1 if s["stream"] == 'ממ"ד' else 0})
order = {k: i for i, (k, _) in enumerate(CATS)}
subjects.sort(key=lambda s: (order[s["cat"]], -count[s["key"]]))

out = {"levels": [{"key": k, "he": he} for k, he in LEVELS],
       "categories": [{"key": k, "he": he} for k, he in CATS],
       "subjects": subjects, "topics": topics}
assert len({t["id"] for t in topics}) == len(topics), "duplicate topic id"
io.open(OUT, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
print("subjects", len(subjects), "topics", len(topics), "bytes", os.path.getsize(OUT))
