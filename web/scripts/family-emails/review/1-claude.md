# Review 1: Claude (condensed)

## Headline
- Email 1 leads to no word search, so goal 1 (use on day 0) fails regardless of order.
- 6 of 16 bridge lines name the wrong next email (2, 3, 8, 10, 15, 16): text not updated after reorder. (Known: new bridge lines prepared in reorder-next.mjs.)
- House rules broken: plural address in 1, 2, 6, 9, 15, 17; one-sentence-per-line not kept in 3, 8-16.
- Key question: when is the cancel decision (trial length / first billing)? Mails 13-17 may land after it; mail 17 on day 30 = full charge day, worst moment for a feature list.

## Part A: order
Proposed:
1. Day 0: first child + first word (merge 1, 2, 4 + first line of 5).
2. Day 1: parent daily summary (mail 3, alerts first).
3. Day 2: Every Word (a page from the book).
4. Day 3: dictation.
5. Day 4: streak, ranks, weekly goal.
6. Day 5: games and quizzes (4 words exist by now).
7. Day 6: meaning from the sentence.
8. Day 7: first week + notebook (weekly review ritual).
9. Day 9: more on the word page (merge 12 questions + 13 idioms).
10. Day 11: Say it.
11. Day 13: 33 languages (in translated versions: day 1).
12. Day 16: private teacher.
13. 3 days before billing/trial end: the child's month in numbers (replaces 17).
Drop 16 (help) -> fixed footer line "Have a question? Reply to this email, it reaches us."
Top 3 for the first 3 emails: search from the child's profile; parent daily summary; Every Word.
Missing behavioral mails: rescue (no word in 24-48h), "no child added yet" (day 1), weekly summary with personal numbers (needs dynamic fields).
Cadence fine; 13 mails enough. Send at 16:00-17:00 (homework time), not morning. Use "במייל הבא" not "מחר" (Friday->Sunday).

## Part B: per email (score, main issue, subject, fixes)
1 (5): 4 setup tasks, zero words. Subj: "היי {שם}, שלוש דקות והילד שלך מחפש את המילה הראשונה". Open with "בשלוש דקות הילד שלך יחפש את המילה הראשונה שלו."; order: add child, shared kids screen, hand phone, search one homework word; install + device pairing to a bottom block; "מומלץ להוסיף גם את ההורה השני, אם זה רלוונטי למשפחה שלכם" -> "אפשר להוסיף גם את ההורה השני." Button "להוספת הילד הראשון" ok only if it lands on search.
2 (5): 5 lines of background; clinical claim ("קשב וריכוז") -> "ילד שלא מבין מילה אחת במשפט, מאבד את כל המשפט."; plural "בחרו... חפשו... קראו" -> "בוחרים... מחפשים... קוראים"; step 4 typo "יש מתחת לכל משמעות יש" -> "מתחת לכל משמעות יש כפתורים לתרגול: "חידון", "משחק" ו"חברו משפט"."; "מילה כל מילה" -> "כל מילה"; "GADIT" -> "Gadit"; double space "אם  תלמיד". Subj: "היי {שם}, מילה אחת משיעורי הבית, חמש דקות".
3 (7): daily summary is the key action but only step 4; put settings steps first; one sentence per line; button -> "להפעלת הסיכום היומי" to /family?tab=settings. Subj: "היי {שם}, רוצה לדעת איזו מילה הילד חיפש היום?"
4 (5): whole mail on something automatic. Open with the comparison demo; "Gadit מסבירה" vs masculine elsewhere: pick one (masculine). Subj: "היי {שם}, אותה מילה, פעם לילד ופעם למבוגר".
5 (5): delete "אוצר המילים של אדם יכול לעשות הבדל ענק..."; open "עבר שבוע. זה הזמן לפתוח יחד עם הילד את המחברת שלו."; "יושבים יחד עם הילד..."; one name: "למחברת" vs menu "אוצר המילים". Button "לעבור על המחברת עם הילד". Subj: "היי {שם}, כמה מילים כבר יש במחברת של הילד?"
6 (7): add step 5 "המילים החשובות בקטע"; plural "צלמו... ופתחו" -> impersonal; bridge missing period. Button "לצילום הדף הראשון". Subj: "היי {שם}, מצלמים דף מהספר, מבינים כל מילה".
7 (7): "## מצב הקשר" -> "## המשמעות לפי המשפט"; move קרן example to the opening; name the exact box label. Subj: "היי {שם}, קרן של קרנף או קרן של שמש?" Idea: prefilled link with word+sentence.
8 (6): 4-word gate -> "יש פחות מ-4 מילים במחברת? מחפשים עוד מילה או שתיים מהשיעורים של היום, והמשחקים נפתחים."; one sentence per line. Subj: "היי {שם}, חמש דקות משחק אחרי שיעורי הבית".
9 (7): "בשפה שלכם" -> "בעברית"; one sentence per line; open with "מתי ההכתבה של השבוע? שני תרגולים קצרים לפניה עושים את ההבדל." Button "להדבקת רשימת ההכתבה". Subj: "היי {שם}, ההכתבה של השבוע, בלי ערב של לחץ".
10 (6): "בשפה חדשה" -> "באנגלית"; button "לתגיד את זה" not proper -> "לתרגול הגייה". Subj: "היי {שם}, הילד אומר משפט באנגלית ומקבל כוכבים".
11 (4): habit mail on day 12 and no button -> day 4, button "לראות את הדרגה של הילד" /family; unify "הכול"/"הכל". Subj: "היי {שם}, הרצף של הילד כבר התחיל".
12 (5): merge with 13 ("## מה עוד יש בדף של מילה"); chips list as one line, not steps; open with "איך לזכור". Subj: "היי {שם}, איך זוכרים מילה שתמיד שוכחים?"
13 (5): "ביטויים באנגלית הם הדבר הכי קשה..." -> "ביטויים באנגלית מבלבלים גם ילדים שמכירים כל מילה בהם." Subj: "היי {שם}, "לשבור את הראש" לא קשור לראש שבור".
14 (6 he / 3 translated): day 1 in non-Hebrew versions; add button "לבחירת השפה שלך". Subj: "היי {שם}, שיעורי הבית באנגלית, ההסבר בשפה שלך".
15 (6): "מאמן" vs "מורה": one term; bridge promises a summary. Subj: "היי {שם}, יש לילד מורה פרטי? ככה הוא מצטרף ל-Gadit".
16 (3): delete; footer line on every mail; /help link into mail 1.
17 (4): feature list in plural on billing day -> child's month in numbers (dynamic), "## הכלים שעוד לא ניסית", 3 days before billing; safety -> one line in mail 1. Subj: "היי {שם}, החודש הראשון של הילד ב-Gadit, במספרים".

## Part C
- Repetition: 10/17 subjects start "היי {שם}, ככה"; same skeleton (steps + "טיפ מהשטח") everywhere; parent always the middleman.
- Child on day 1: start from shared kids screen; give the parent a ready sentence to say; reward for the first word; the child's first login screen matters more than any email ("מה המילה הראשונה שלך?").
- Top 3: (1) day-0 mail ending with the child's first search; (2) habit mechanisms in days 1-5 (daily summary, dictation, streak) and last mail before the decision; (3) behavior-triggered mails (rescue, personal numbers).
- Precondition: fix the 6 bridge lines and plural address.
