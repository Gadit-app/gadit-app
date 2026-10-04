"""Step A (Arabic): collect every AI answer for the Arab state education
curriculum into one flat record list.
Output: records.json [{ai, subject_ar, subject_he, level, grades, title_ar, title_he, official}]"""
import io, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
AI = os.path.join(HERE, "ai")
HEB = "אבגדהוזחטי"
LEVELS = {"גן", "יסודי", "חטיבת ביניים", "תיכון"}


def grade_letters(g):
    """[3,4,5] -> 'ג-ה'; 'ג-ד' stays; 'גן' stays."""
    if isinstance(g, list) and g:
        nums = sorted(int(x) for x in g if str(x).isdigit())
        def let(n):
            return {10: "י", 11: "יא", 12: "יב"}.get(n, HEB[n - 1] if 1 <= n <= 9 else str(n))
        if not nums:
            return ""
        return let(nums[0]) if len(nums) == 1 else f"{let(nums[0])}-{let(nums[-1])}"
    return str(g or "").strip()


def level_of(grades, given):
    if given in LEVELS:
        return given
    g = grades
    if "גן" in g:
        return "גן"
    first = g.split("-")[0].strip()
    order = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "יא", "יב"]
    if first in order:
        i = order.index(first)
        return "יסודי" if i < 6 else "חטיבת ביניים" if i < 9 else "תיכון"
    return ""


def official(src):
    s = str(src or "")
    return "education.gov.il" in s and s.count("/") > 4


recs = []


def add(ai, sar, she, level, grades, tar, the, src=None):
    grades = grade_letters(grades)
    level = level_of(grades, level)
    if level not in LEVELS or not (tar or the):
        return
    recs.append({"ai": ai, "subject_ar": (sar or "").strip(), "subject_he": (she or "").strip(), "level": level,
                 "grades": grades, "title_ar": (tar or "").strip(), "title_he": (the or "").strip(), "official": official(src)})


# full-schema answers
for name in ("gpt", "manus"):
    for x in json.load(io.open(os.path.join(AI, f"{name}.json"), encoding="utf-8")):
        for t in x.get("topics", []):
            add(name, x.get("subject_ar"), x.get("subject_he"), t.get("level"), t.get("grades"), t.get("title_ar"), t.get("title_he"), t.get("source"))
# compact answers: [title_ar, title_he, level, grades, source?, confidence?]
for name in ("gemini", "deepseek", "grok"):
    for x in json.load(io.open(os.path.join(AI, f"{name}.json"), encoding="utf-8")):
        for t in x["topics"]:
            add(name, x["subject_ar"], x["subject_he"], t[2], t[3], t[0], t[1], t[4] if len(t) > 4 else None)
# Claude: researched, one subject per file
for f in sorted(os.listdir(AI)):
    if f.startswith("claude-") and f.endswith(".json"):
        for x in json.load(io.open(os.path.join(AI, f), encoding="utf-8")):
            srcs = x.get("sources", {})
            for t in x.get("topics", []):
                ok = any(official((srcs.get(s) or {}).get("url")) for s in t.get("source_ids", []))
                add("claude", x.get("subject_ar"), x.get("subject_he"), None, t.get("grades"), t.get("title_ar"), t.get("title_he"), "https://pop.education.gov.il/x/x/x/x" if ok else None)

io.open(os.path.join(HERE, "records.json"), "w", encoding="utf-8").write(json.dumps(recs, ensure_ascii=False))
from collections import Counter
print("records", len(recs))
print("by ai", Counter(r["ai"] for r in recs))
print("by level", Counter(r["level"] for r in recs))
print("subjects", len({r["subject_he"] for r in recs}))
