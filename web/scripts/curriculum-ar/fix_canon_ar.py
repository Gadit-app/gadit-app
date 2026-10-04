"""Manual pass over canon.json (Arabic): merge leftover duplicates, check
reused keys exist in the Hebrew catalog. Output: canon2.json
{subjects:[{key,name_he,name_ar,category,reuse}], alias:{raw->key}}"""
import io, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
c = json.load(io.open(os.path.join(HERE, "canon.json"), encoding="utf-8"))
he = json.load(io.open(os.path.join(HERE, "..", "..", "src", "lib", "curriculum-catalog.json"), encoding="utf-8"))
he_keys = {s["key"]: s for s in he["subjects"]}

# key -> key it merges into
MERGE = {
    "islamic-heritage": "islam",
    "christian-heritage": "christianity",
    "technology-and-engineering": "technological-education",
    "health-sciences": "health-systems",
    "information-and-data": "data-science",
    "leadership-and-entrepreneurship": "entrepreneurship-and-business-innovation",
    "social-sciences": "sociology",
}
NAMES = {
    "islam": ("דת האסלאם", "التربية الإسلاميّة"),
    "christianity": ("דת הנצרות", "التربية المسيحيّة"),
    "arabic-language": ("שפה וספרות ערבית", "اللغة العربيّة وآدابها"),
}

alias, subjects = {}, {}
for s in c["subjects"]:
    k = MERGE.get(s["key"], s["key"])
    for a in s["aliases"]:
        alias[a] = k
    if k not in subjects:
        base = he_keys.get(k)
        subjects[k] = {
            "key": k,
            "name_he": NAMES.get(k, (s["name_he"],))[0],
            "name_ar": NAMES.get(k, (None, s["name_ar"]))[1],
            "category": base["cat"] if base else s["category"],
            "reuse": bool(base),
        }
bad = [k for k, v in subjects.items() if not v["reuse"] and k in he_keys]
print("subjects", len(subjects), "reuse", sum(v["reuse"] for v in subjects.values()), "aliases", len(alias))
print("new keys:", [k for k, v in subjects.items() if not v["reuse"]])
io.open(os.path.join(HERE, "canon2.json"), "w", encoding="utf-8").write(json.dumps({"subjects": list(subjects.values()), "alias": alias}, ensure_ascii=False, indent=1))
