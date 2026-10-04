"""Step D (Arabic): merged.json + canon2.json -> web/src/lib/curriculum-catalog-ar.json
The Arab state education catalog. Topic ids are stable hashes ("cur-ar-" + 10 hex).
Subjects shared with the Hebrew catalog keep its keys (and icons)."""
import hashlib, io, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "src", "lib", "curriculum-catalog-ar.json")
canon = json.load(io.open(os.path.join(HERE, "canon2.json"), encoding="utf-8"))
merged = json.load(io.open(os.path.join(HERE, "merged.json"), encoding="utf-8"))
he = json.load(io.open(os.path.join(HERE, "..", "..", "src", "lib", "curriculum-catalog.json"), encoding="utf-8"))

LEVELS = [("gan", "גן", "الروضة"), ("elementary", "יסודי", "الابتدائيّة"), ("middle", "חטיבת ביניים", "الإعداديّة"), ("high", "תיכון", "الثانويّة")]
LV_KEY = {h: k for k, h, _ in LEVELS}
CAT_AR = {
    "language": "اللغة والأدب", "math": "الرياضيّات", "sciences": "العلوم", "foreign-languages": "اللغات",
    "religion": "الدين والتراث", "history-civics": "التاريخ والمجتمع والمدنيّات", "geography-environment": "الجغرافيا والبيئة",
    "social-sciences": "العلوم الاجتماعيّة", "computers": "الحاسوب والتكنولوجيا", "arts-media": "الفنون والإعلام",
    "body-health": "الجسم والصحّة ومهارات الحياة", "engineering": "الهندسة والمسارات التكنولوجيّة", "vocational": "المسارات المهنيّة",
    "early-childhood": "الطفولة المبكرة",
}
cats_he = {c["key"]: c["he"] for c in he["categories"]}
cats_he["religion"] = "דת ומורשת"
ORDER = ["language", "math", "sciences", "foreign-languages", "religion", "history-civics", "geography-environment",
         "social-sciences", "computers", "arts-media", "body-health", "engineering", "vocational", "early-childhood"]
HEB_IN_AR = re.compile(r"[֐-׿]")


def clean(s):
    return re.sub(r"\s{2,}", " ", re.sub(r"\s*[–—]\s*", " ", str(s or ""))).strip()


topics, count, bad = [], {}, 0
subj = {s["key"]: s for s in canon["subjects"]}
for gk, ts in merged.items():
    key, lvl_he = gk.split("|")
    lv = LV_KEY[lvl_he]
    seen = set()
    for t in ts:
        tar, the = clean(t.get("title_ar")), clean(t.get("title_he"))
        if not tar or tar in seen:
            continue
        if HEB_IN_AR.search(tar):
            bad += 1
        seen.add(tar)
        tid = "cur-ar-" + hashlib.sha1(f"{key}|{lv}|{tar}".encode("utf-8")).hexdigest()[:10]
        topics.append({"id": tid, "s": key, "l": lv, "t": tar, "th": the, "g": re.sub(r"\s*[–—]\s*", "-", str(t.get("grades") or "")),
                       "n": len(set(t.get("sources") or [])), "o": 1 if t.get("official") else 0})
        count[key] = count.get(key, 0) + 1

subjects = [{"key": k, "he": clean(s["name_he"]), "ar": clean(s["name_ar"]), "cat": s["category"]} for k, s in subj.items() if k in count]
subjects.sort(key=lambda s: (ORDER.index(s["cat"]) if s["cat"] in ORDER else 99, -count[s["key"]]))
cats = [{"key": c, "he": cats_he.get(c, c), "ar": CAT_AR.get(c, c)} for c in ORDER if any(s["cat"] == c for s in subjects)]
out = {"sector": "arab-state", "levels": [{"key": k, "he": h, "ar": a} for k, h, a in LEVELS], "categories": cats, "subjects": subjects, "topics": topics}
assert len({t["id"] for t in topics}) == len(topics)
io.open(OUT, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
from collections import Counter
print("subjects", len(subjects), "topics", len(topics), "hebrew letters inside arabic titles", bad)
print("by level", Counter(t["l"] for t in topics))
print("multi-source", sum(1 for t in topics if t["n"] > 1), "official", sum(t["o"] for t in topics))
new = [s["he"] for s in subjects if s["key"] not in {x["key"] for x in he["subjects"]}]
print("new subjects (need icons):", new)
