"""Manual pass over canon.json: merge leftover duplicates, fix categories, map unmapped names.
Output: canon2.json {subjects:[{key,name,category,stream}], alias:{raw->key}}"""
import io, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
c = json.load(io.open(os.path.join(HERE, "canon.json"), encoding="utf-8"))
by_name = {s["name"]: s for s in c["subjects"]}
alias = {}
for s in c["subjects"]:
    for a in s["aliases"]:
        alias[a] = s["key"]

def key_of(name):
    return by_name[name]["key"]

# merge source-name -> target-name (both canonical names from canon.json)
MERGE = {
    "תלמוד": "גמרא",
    "ידיעת הארץ וארכאולוגיה": "לימודי ארץ ישראל",
    "קרימינולוגיה ומשפט": "מדעי המשטרה והקרימינולוגיה",
    "עיצוב אופנה": "אופנה ועיצוב תלבושות",
    "מערכות חשמל": "הנדסת חשמל, בקרה ואנרגיה",
    "מערכות אוטונומיות ורחפנים": "רובוטיקה ומערכות אוטונומיות",
    "סייבר ואבטחת מערכות": "הגנת סייבר ורשתות",
    "אלקטרוניקה": "הנדסת אלקטרוניקה ומחשבים",
    "מידע ונתונים": "מדע נתונים",
    "מנהיגות ויזמות": "יזמות וחדשנות עסקית",
    "הגות ומחשבה יהודית": "מחשבת ישראל",
    "אמנות חזותית": "אמנות",
    "לשון": "עברית",
    "חינוך תעבורתי": "זהירות בדרכים",
    "מדעי החינוך הגופני": "חינוך גופני",
    "בריאות": "כישורי חיים",
    "איסלאם ותרבותו": "עולם הערבים והאסלאם",
    "לימודי המזרח התיכון": "עולם הערבים והאסלאם",
    "הנדסת רכב ומערכות תחבורה": "תחבורה מתקדמת",
    "עיתונאות ותקשורת חוקרת": "תקשורת",
    "מדיה ופרסום": "תקשורת",
}
for src, dst in MERGE.items():
    if src not in by_name or dst not in by_name:
        print("skip merge", src, "->", dst); continue
    sk, dk = by_name[src]["key"], by_name[dst]["key"]
    for a, k in list(alias.items()):
        if k == sk:
            alias[a] = dk
    del by_name[src]

RENAME = {
    "עברית": "עברית ולשון",
    "לימודי ארץ ישראל": "לימודי ארץ ישראל וארכיאולוגיה",
    "מדעי המשטרה והקרימינולוגיה": "קרימינולוגיה",
    "אופנה ועיצוב תלבושות": "עיצוב אופנה",
    "זהירות בדרכים": "זהירות בדרכים וחינוך תעבורתי",
    "כישורי חיים": "כישורי חיים ובריאות",
    "עולם הערבים והאסלאם": "עולם הערבים, האסלאם והמזרח התיכון",
    "תחבורה מתקדמת": "תחבורה מתקדמת ורכב",
}
subjects = []
for name, s in by_name.items():
    s = dict(s)
    s["name"] = RENAME.get(name, name)
    if s["category"] == "אמנויות":
        s["category"] = "אמנויות ותקשורת"
    if s["name"] in ("תקשורת", "טכנולוגיות תקשורת"):
        s["category"] = "אמנויות ותקשורת"
    s.pop("aliases", None)
    subjects.append(s)

UNMAPPED = {"מדעי החברה": "סוציולוגיה", "מנהל וכלכלה (ניהול עסקי)": "מנהל עסקים", "שפה ואוריינות (גן)": "חינוך לגיל הרך", "תולדות עם ישראל": "היסטוריה"}
name2key = {s["name"]: s["key"] for s in subjects}
for raw, tgt in UNMAPPED.items():
    k = name2key.get(tgt) or name2key.get(RENAME.get(tgt, tgt))
    if k: alias[raw] = k
    else: print("no target", raw, tgt)

io.open(os.path.join(HERE, "canon2.json"), "w", encoding="utf-8").write(json.dumps({"subjects": subjects, "alias": alias}, ensure_ascii=False, indent=1))
from collections import Counter
print("subjects", len(subjects), "aliases", len(alias))
print(Counter(s["category"] for s in subjects))
