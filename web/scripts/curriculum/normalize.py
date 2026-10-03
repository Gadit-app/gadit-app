"""Collect every AI answer + the research-agent map into one flat record list.
Output: scripts/curriculum/records.json  [{ai, subject, level, grades, title, official}]"""
import io, json, os, glob
HERE = os.path.dirname(os.path.abspath(__file__))
LV = {"elementary": "יסודי", "middle": "חטיבת ביניים", "high": "תיכון", "kindergarten": "גן"}
LEVELS = {"גן", "יסודי", "חטיבת ביניים", "תיכון"}

def official(src):
    s = str(src or "")
    return ("education.gov.il" in s and "/tchumey_daat/?" not in s and s.strip() not in ("pop.education.gov.il",)) or s == "same" or "mavo1" == s

recs = []
def add(ai, subject, level, grades, title, src=None):
    level = LV.get(level, level)
    if level not in LEVELS:
        # guess from grades
        g = str(grades)
        level = "גן" if "גן" in g or "חובה" in g else level
    if level not in LEVELS or not str(title).strip():
        return
    recs.append({"ai": ai, "subject": subject.strip(), "level": level, "grades": str(grades or "").strip(), "title": str(title).strip(), "official": bool(official(src))})

# research agent map
for x in json.load(io.open(os.path.join(HERE, "curriculum-map.json"), encoding="utf-8")):
    for t in x["topics"]:
        add("agent", x["subject"], x["level"], t.get("grades", ""), t["title"], t.get("source"))

for f in glob.glob(os.path.join(HERE, "ai", "*.json")):
    name = os.path.basename(f).split("-")[0].split(".")[0]
    d = json.load(io.open(f, encoding="utf-8"))
    if isinstance(d, list):  # claude-full original schema
        for x in d:
            if not x.get("subject") or not x.get("topics"):
                continue
            for t in x["topics"]:
                add(name, x["subject"], t.get("level", ""), t.get("grades", ""), t.get("title", ""), t.get("source"))
        continue
    for x in d["subjects"]:
        for t in x.get("t", []):
            add(name, x["s"], t[1] if len(t) > 1 else "", t[2] if len(t) > 2 else "", t[0], t[3] if len(t) > 3 else None)

io.open(os.path.join(HERE, "records.json"), "w", encoding="utf-8").write(json.dumps(recs, ensure_ascii=False))
from collections import Counter
print("records", len(recs))
print("by ai", Counter(r["ai"] for r in recs))
print("by level", Counter(r["level"] for r in recs))
print("unique subjects", len(set(r["subject"] for r in recs)))
print("official", sum(r["official"] for r in recs))
