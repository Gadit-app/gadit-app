/**
 * Copy for friends in Word Worlds (Gadi 2026-11-01). Kid strings address
 * the child in the plural in Hebrew; parent strings address the parent in
 * the plural too. No dashes; "Gadit" stays in Latin letters. Languages
 * without an entry use English.
 */
import { FRIENDS_MORE } from "./friends-i18n-more";

export type FriendsCopy = {
  title: string;
  myCode: string;
  codeHint: string;
  addPh: string;
  addBtn: string;
  waiting: string;
  errNotFound: string;
  errSelf: string;
  errAlready: string;
  sent: string;
  empty: string;
  visit: string;
  friendWorld: (name: string) => string;
  noWords: string;
  sendGift: string;
  pickGift: string;
  noGiftWords: string;
  giftSent: (name: string) => string;
  giftLimit: string;
  giftFrom: (name: string) => string;
  openGift: string;
  giftOpened: (name: string) => string;
  copy: string;
  copied: string;
  // parent side (the family page)
  pTitle: string;
  pSub: string;
  pRequest: (friend: string, kid: string) => string;
  pApprove: string;
  pDecline: string;
  pFriendsOf: (kid: string) => string;
  pRemove: string;
  pushTitle: string;
  pushBody: (friend: string, kid: string) => string;
};

const en: FriendsCopy = {
  title: "Friends",
  myCode: "Your friend code",
  codeHint: "Give it to a friend so they can add you",
  addPh: "Friend's code",
  addBtn: "Add",
  waiting: "Waiting for a parent's OK",
  errNotFound: "No one has this code",
  errSelf: "That is your own code",
  errAlready: "You are already friends",
  sent: "Sent. A parent will approve it",
  empty: "Add a friend with their code",
  visit: "Visit",
  friendWorld: (n) => `${n}'s world`,
  noWords: "No words here yet",
  sendGift: "Send a word as a gift",
  pickGift: "Which of your words?",
  noGiftWords: "Spell words in your worlds first, then you can give them",
  giftSent: (n) => `The gift is on its way to ${n}`,
  giftLimit: "That is 3 gifts to this friend today. Send more tomorrow",
  giftFrom: (n) => `A gift from ${n}`,
  openGift: "Spell it to open",
  giftOpened: (n) => `${n}'s gift lives in your world now`,
  copy: "Copy",
  copied: "Copied",
  pTitle: "Friends in Word Worlds",
  pSub: "Kids can visit a friend's world and send each other words.\nThere is no chat and no typing between kids.",
  pRequest: (f, k) => `${f} and ${k} want to be friends`,
  pApprove: "Approve",
  pDecline: "Decline",
  pFriendsOf: (k) => `${k}'s friends`,
  pRemove: "Remove",
  pushTitle: "A friend request in Gadit",
  pushBody: (f, k) => `${f} and ${k} want to be friends in Word Worlds. Approve it on the family page.`,
};

const he: FriendsCopy = {
  title: "חברים",
  myCode: "קוד החבר שלכם",
  codeHint: "תנו אותו לחבר כדי שיוסיף אתכם",
  addPh: "קוד של חבר",
  addBtn: "הוסיפו",
  waiting: "מחכים לאישור של הורה",
  errNotFound: "אין חבר עם הקוד הזה",
  errSelf: "זה הקוד שלכם",
  errAlready: "אתם כבר חברים",
  sent: "נשלח. הורה יאשר את זה",
  empty: "הוסיפו חבר עם הקוד שלו",
  visit: "לבקר",
  friendWorld: (n) => `העולם של ${n}`,
  noWords: "עוד אין כאן מילים",
  sendGift: "שלחו מילה במתנה",
  pickGift: "איזו מילה שלכם?",
  noGiftWords: "קודם אייתו מילים בעולמות שלכם, ואז אפשר לתת אותן",
  giftSent: (n) => `המתנה בדרך אל ${n}`,
  giftLimit: "שלחתם היום 3 מתנות לחבר הזה. אפשר לשלוח עוד מחר",
  giftFrom: (n) => `מתנה מ${n}`,
  openGift: "אייתו כדי לפתוח",
  giftOpened: (n) => `המתנה של ${n} גרה עכשיו בעולם שלכם`,
  copy: "העתיקו",
  copied: "הועתק",
  pTitle: "חברים בעולמות המילים",
  pSub: "ילדים יכולים לבקר בעולם של חבר ולשלוח זה לזה מילים.\nאין צ'אט ואין הקלדה בין ילדים.",
  pRequest: (f, k) => `${f} ו${k} רוצים להיות חברים`,
  pApprove: "אישור",
  pDecline: "דחייה",
  pFriendsOf: (k) => `החברים של ${k}`,
  pRemove: "הסרה",
  pushTitle: "בקשת חברות ב Gadit",
  pushBody: (f, k) => `${f} ו${k} רוצים להיות חברים בעולמות המילים. אפשר לאשר בדף המשפחה.`,
};

const ALL: Record<string, FriendsCopy> = { en, he, ...FRIENDS_MORE };
export const friendsCopy = (lang: string): FriendsCopy => ALL[lang] ?? en;
