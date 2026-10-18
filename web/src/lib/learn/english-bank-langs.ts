// The English bank's words in the other 37 UI languages (Gadi 2026-10-18:
// learning English opens to every UI language). he/ar/ru stay on the bank
// rows in english-bank.ts; here one file per language maps the English
// word (ENGLISH_BANK `w`, exact spelling) to its child-friendly translation.
// Server-only in practice: engine.ts reads it in bankFor, which runs in
// /api/learn; the client never imports it, so the bundle stays small.
import af from "./english-bank-t/af.json";
import am from "./english-bank-t/am.json";
import bn from "./english-bank-t/bn.json";
import cs from "./english-bank-t/cs.json";
import da from "./english-bank-t/da.json";
import de from "./english-bank-t/de.json";
import el from "./english-bank-t/el.json";
import es from "./english-bank-t/es.json";
import fa from "./english-bank-t/fa.json";
import fil from "./english-bank-t/fil.json";
import fr from "./english-bank-t/fr.json";
import hi from "./english-bank-t/hi.json";
import hu from "./english-bank-t/hu.json";
import id from "./english-bank-t/id.json";
import it from "./english-bank-t/it.json";
import ja from "./english-bank-t/ja.json";
import ko from "./english-bank-t/ko.json";
import nl from "./english-bank-t/nl.json";
import nr from "./english-bank-t/nr.json";
import nso from "./english-bank-t/nso.json";
import pl from "./english-bank-t/pl.json";
import pt from "./english-bank-t/pt.json";
import sk from "./english-bank-t/sk.json";
import ss from "./english-bank-t/ss.json";
import st from "./english-bank-t/st.json";
import sw from "./english-bank-t/sw.json";
import th from "./english-bank-t/th.json";
import tn from "./english-bank-t/tn.json";
import tr from "./english-bank-t/tr.json";
import ts from "./english-bank-t/ts.json";
import uk from "./english-bank-t/uk.json";
import ve from "./english-bank-t/ve.json";
import vi from "./english-bank-t/vi.json";
import xh from "./english-bank-t/xh.json";
import zhCN from "./english-bank-t/zh-CN.json";
import zhTW from "./english-bank-t/zh-TW.json";
import zu from "./english-bank-t/zu.json";

export const ENGLISH_BANK_T: Record<string, Record<string, string>> = {
  af, am, bn, cs, da, de, el, es, fa, fil, fr, hi, hu, id, it, ja, ko, nl, nr, nso, pl, pt,
  sk, ss, st, sw, th, tn, tr, ts, uk, ve, vi, xh, "zh-CN": zhCN, "zh-TW": zhTW, zu,
};
