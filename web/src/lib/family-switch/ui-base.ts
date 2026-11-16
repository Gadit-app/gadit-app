/**
 * The words of the "Switch to Family" box on the account page (Gadi approved
 * 2026-11-16). Hebrew and English here; every other interface language is in
 * ui-i18n.json (scripts/family-switch-i18n.ts). {amount} and {price} are
 * filled with the money in the subscription's currency.
 */
export type FamilySwitchUi = {
  btn: string; what: string; same: string; now: string; nowZero: string; nextMonth: string; nextYear: string;
  confirm: string; cancel: string; busy: string; done: string; go: string; failPay: string; fail: string;
};

export const FAMILY_SWITCH_EN: FamilySwitchUi = {
  btn: "Switch to Family",
  what: "Up to 5 children, a parent dashboard, and a profile and notebook for every child.",
  same: "Your current subscription moves to Family, with no need to enter a card again.",
  now: "Charged today: {amount}, the difference up to the end of the current period.",
  nowZero: "Nothing is charged today.",
  nextMonth: "From the next renewal: {price} a month.",
  nextYear: "From the next renewal: {price} a year.",
  confirm: "Confirm and switch",
  cancel: "Not now",
  busy: "Switching",
  done: "Done, you are on Family. Add the children on the family page.",
  go: "To my family",
  failPay: "The payment did not go through, so nothing changed. You can update the card in billing and try again.",
  fail: "The switch did not work. Please try again, or write to us at support@gadit.app.",
};

export const FAMILY_SWITCH_HE: FamilySwitchUi = {
  btn: "מעבר ל-Family",
  what: "עד 5 ילדים, לוח בקרה להורה, ופרופיל ומחברת לכל ילד.",
  same: "המנוי הנוכחי עובר ל-Family, בלי להזין כרטיס מחדש.",
  now: "יחויב היום: {amount}, ההפרש עד סוף התקופה הנוכחית.",
  nowZero: "היום לא יחויב כלום.",
  nextMonth: "מהחידוש הבא: {price} לחודש.",
  nextYear: "מהחידוש הבא: {price} לשנה.",
  confirm: "אישור ומעבר",
  cancel: "לא עכשיו",
  busy: "מעבירים",
  done: "זהו, עברתם ל-Family. מוסיפים את הילדים בעמוד המשפחה.",
  go: "למשפחה שלי",
  failPay: "התשלום לא עבר, ולכן לא השתנה כלום. אפשר לעדכן את הכרטיס בניהול החיובים ולנסות שוב.",
  fail: "המעבר לא הצליח. אפשר לנסות שוב, או לכתוב לנו ל-support@gadit.app.",
};
