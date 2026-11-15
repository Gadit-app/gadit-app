/**
 * The words of the help window in Hebrew and English (Gadi 2026-11-15). The
 * other languages are in ui-i18n.json (lib/help-chat/ui.ts, server side).
 */

export type HelpUi = {
  fab: string; title: string; sub: string; hello: string; faq: string; close: string; placeholder: string; send: string;
  thinking: string; handoff: string; replyTo: string; helped: string; notHelped: string; thanks: string; limit: string;
  error: string; openGuide: string; openPage: string; test: string; starters: string[];
};

export const HELP_UI_HE: HelpUi = {
  fab: "צריכים עזרה?",
  title: "העוזר של Gadit",
  sub: "תשובות על כל שימוש ב-Gadit",
  hello: "היי! אנחנו העוזר של Gadit. אפשר לשאול אותנו כל דבר על השימוש ב-Gadit: איך מחפשים, איך מחברים ילד, איך עובדת המחברת ועוד.",
  faq: "שאלות נפוצות",
  close: "סגירה",
  placeholder: "כתבו כאן שאלה",
  send: "שליחה",
  thinking: "חושבים",
  handoff: "העברנו את השאלה לצוות. אדם אמיתי יחזור אליכם במייל בהקדם.",
  replyTo: "התשובה תגיע לכתובת:",
  helped: "עזר",
  notHelped: "לא עזר",
  thanks: "תודה!",
  limit: "הגעתם למספר השאלות היומי. אפשר לכתוב לנו ל-support@gadit.app",
  error: "משהו השתבש. נסו שוב בעוד רגע.",
  openGuide: "פתיחת המדריך",
  openPage: "מעבר לעמוד",
  test: "גרסת בדיקה",
  starters: [
    "איך מחברים את הטלפון של הילד?",
    "איך מוסיפים ילד למשפחה?",
    "איך יודעים איזו משמעות נכונה במשפט שלי?",
    "איך רואים מה הילד חיפש?",
    "המחברת לא שומרת מילים, למה?",
    "איך מבטלים או משהים את המנוי?",
  ],
};

export const HELP_UI_EN: HelpUi = {
  fab: "Need help?",
  title: "Gadit assistant",
  sub: "Answers on anything in Gadit",
  hello: "Hi! We are the Gadit assistant. Ask us anything about using Gadit: how to look up a word, how to connect a child, how the notebook works and more.",
  faq: "Common questions",
  close: "Close",
  placeholder: "Type a question",
  send: "Send",
  thinking: "Thinking",
  handoff: "We passed your question to the team. A real person will reply by email soon.",
  replyTo: "The reply will go to:",
  helped: "Helpful",
  notHelped: "Not helpful",
  thanks: "Thank you!",
  limit: "You reached today's number of questions. You can write to us at support@gadit.app",
  error: "Something went wrong. Please try again in a moment.",
  openGuide: "Open the guide",
  openPage: "Go to the page",
  test: "Test version",
  starters: [
    "How do I connect my child's phone?",
    "How do I add a child to the family?",
    "Which meaning fits my sentence?",
    "How do I see what my child looked up?",
    "Why doesn't the notebook save words?",
    "How do I cancel or pause my subscription?",
  ],
};
