import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/components/LegalPage";
import { JP_YEN_LIVE } from "@/lib/jp-legal";
import { LangLink } from "@/components/legal/TokushohoLink";

// Same text as TOKUSHOHO_LABEL in TokushohoLink.tsx (a "use client" module, so
// its constants cannot be imported as values into this server file).
const TOKUSHOHO_LABEL = "特定商取引法に基づく表記";

/**
 * 特定商取引法に基づく表記 (disclosure under Japan's Act on Specified Commercial
 * Transactions). Required before yen prices are shown to visitors in Japan.
 * Served at /tokushoho and, through the middleware lang prefix, /ja/tokushoho.
 * Japanese is the primary text; English is the other locale in the picker.
 */

// The seller details (Gadi 2026-11-02); this is the only place they are written.
const SELLER = {
  name: "Lavi Learning and Training Technologies LLC",
  responsible: "Gadi Ben Lavi",
  address: "700 Starkey Rd., Largo, FL 33771, USA",
  phone: "+972-52-653-2883",
  email: "support@gadit.app",
};

// The yen prices (decided). Keep equal to the PRICE_DISPLAY.jpy block in
// lib/pricing-currency.ts and the Stripe jpy currency_options.
const JPY = {
  individualMonthly: "¥480",
  individualYearly: "¥4,800",
  familyMonthly: "¥780",
  familyYearly: "¥7,800",
};

const TRIAL_DAYS = 14;

export const metadata: Metadata = {
  title: `${TOKUSHOHO_LABEL}, Gadit`,
  description: "Gadit 特定商取引法に基づく表記 (Legal notice under the Act on Specified Commercial Transactions).",
};

const LAST_UPDATED = "November 2, 2026";

const Mail = () => <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>;

const JapaneseBody = () => (
  <>
    <h2>販売業者</h2>
    <p>{SELLER.name}（米国法人）</p>

    <h2>運営統括責任者</h2>
    <p>{SELLER.responsible}</p>

    <h2>所在地</h2>
    <p dir="ltr">{SELLER.address}</p>

    <h2>電話番号</h2>
    <p>
      <span dir="ltr">{SELLER.phone}</span>
      <br />
      お問い合わせは、原則として下記メールアドレスにて承ります。
    </p>

    <h2>メールアドレス</h2>
    <p><Mail /></p>

    <h2>サービスの内容</h2>
    <p>Gadit（オンライン語彙学習サービス）の有料プラン（Individual、Family）のご提供</p>

    <h2>販売価格</h2>
    <p>
      各プランの価格は<LangLink path="/pricing">料金ページ</LangLink>に表示しています。日本からお申し込みの場合の価格は以下のとおりです。
    </p>
    <ul>
      <li>Individual：月額 {JPY.individualMonthly}、年額 {JPY.individualYearly}</li>
      <li>Family：月額 {JPY.familyMonthly}、年額 {JPY.familyYearly}</li>
    </ul>
    <p>
      表示価格はお支払いいただく総額です。消費税が課される場合は表示価格に含まれており、別途加算されることはありません。
    </p>

    <h2>商品代金以外の必要料金</h2>
    <p>本サービスのご利用に必要なインターネット接続料金および通信料金は、お客様のご負担となります。</p>

    <h2>支払方法</h2>
    <p>
      クレジットカードまたはデビットカード（決済は Stripe を通じて行います）。対応する端末およびブラウザでは、Apple Pay、Google Pay もご利用いただけます。
    </p>

    <h2>支払時期</h2>
    <p>
      お申し込み時にカード情報をご登録いただきます。{TRIAL_DAYS}日間の無料体験期間中は料金は発生しません。無料体験期間の終了時に、お選びいただいたプラン（月額または年額）の初回料金が請求されます。以後は、各請求期間の開始時に自動的に請求されます（月額プランは毎月、年額プランは毎年）。
    </p>

    <h2>提供時期</h2>
    <p>お申し込み手続きの完了後、直ちにご利用いただけます。</p>

    <h2>返品・キャンセル</h2>
    <ul>
      <li>デジタルサービスの性質上、お申し込み後の返品はお受けしておりません。</li>
      <li>
        解約はアカウントページからいつでも行えます。解約すると以後の自動更新は停止され、現在の請求期間の終了まで有料機能をご利用いただけます。
      </li>
      <li>未使用期間に対する日割り返金および一部返金は行いません。法令で義務付けられている場合を除き、お支払いいただいた料金は返金できません。</li>
      <li>無料体験期間中に解約した場合、無料体験はその時点で終了し、料金は発生しません。</li>
      <li>
        誤って請求されたと思われる場合は、請求日から30日以内に <Mail /> までご連絡ください。
      </li>
    </ul>

    <h2>動作環境</h2>
    <p>
      最新版の Google Chrome、Safari、Microsoft Edge、Mozilla Firefox などの主要なウェブブラウザ（パソコン、スマートフォン、タブレット）。JavaScript および Cookie を有効にしてご利用ください。Android 端末では、Google Play で配信している Gadit アプリもご利用いただけます。
    </p>
  </>
);

const EnglishBody = () => (
  <>
    <p>
      This page is the disclosure required by Japan&rsquo;s Act on Specified Commercial Transactions
      (特定商取引法). The Japanese version is the primary text.
    </p>

    <h2>Seller (販売業者)</h2>
    <p>{SELLER.name} (a United States company)</p>

    <h2>Responsible person (運営統括責任者)</h2>
    <p>{SELLER.responsible}</p>

    <h2>Address (所在地)</h2>
    <p>{SELLER.address}</p>

    <h2>Phone (電話番号)</h2>
    <p>
      {SELLER.phone}
      <br />
      We handle inquiries by email whenever possible.
    </p>

    <h2>Email (メールアドレス)</h2>
    <p><Mail /></p>

    <h2>Service (サービスの内容)</h2>
    <p>Paid plans (Individual, Family) of Gadit, an online vocabulary learning service.</p>

    <h2>Price (販売価格)</h2>
    <p>
      Prices for every plan are shown on the <LangLink path="/pricing">pricing page</LangLink>. For customers in Japan:
    </p>
    <ul>
      <li>Individual: {JPY.individualMonthly} per month, {JPY.individualYearly} per year</li>
      <li>Family: {JPY.familyMonthly} per month, {JPY.familyYearly} per year</li>
    </ul>
    <p>
      The displayed price is the total you pay. Where consumption tax applies, it is included in the displayed
      price and nothing is added on top.
    </p>

    <h2>Other fees (商品代金以外の必要料金)</h2>
    <p>Internet connection and data charges needed to use the Service are paid by the customer.</p>

    <h2>Payment method (支払方法)</h2>
    <p>
      Credit or debit card, processed by Stripe. Apple Pay and Google Pay are also available on supported devices
      and browsers.
    </p>

    <h2>Payment timing (支払時期)</h2>
    <p>
      You enter your card when you sign up. Nothing is charged during the {TRIAL_DAYS}-day free trial. The first
      payment for the plan you chose (monthly or yearly) is charged when the trial ends, and then automatically at the
      start of each billing period (every month for monthly plans, every year for yearly plans).
    </p>

    <h2>Delivery (提供時期)</h2>
    <p>The Service is available immediately after you complete sign-up.</p>

    <h2>Returns and cancellation (返品・キャンセル)</h2>
    <ul>
      <li>Because this is a digital service, there are no returns after purchase.</li>
      <li>
        You can cancel at any time from your account page. Cancellation stops future renewals, and you keep the paid
        features until the end of the current billing period.
      </li>
      <li>
        We do not give prorated or partial refunds for unused time. Except where required by law, payments are
        non-refundable.
      </li>
      <li>If you cancel during the free trial, the trial ends at that moment and you are not charged.</li>
      <li>
        If you believe you were charged in error, contact <Mail /> within 30 days of the charge.
      </li>
    </ul>

    <h2>System requirements (動作環境)</h2>
    <p>
      A current version of a major web browser such as Google Chrome, Safari, Microsoft Edge or Mozilla Firefox, on a
      computer, phone or tablet, with JavaScript and cookies enabled. On Android, the Gadit app on Google Play can also
      be used.
    </p>
  </>
);

export default function TokushohoPage() {
  if (!JP_YEN_LIVE) notFound();
  return (
    <LegalPage
      lastUpdated={LAST_UPDATED}
      bindingNotice={false}
      locales={{
        ja: { title: TOKUSHOHO_LABEL, body: <JapaneseBody /> },
        en: { title: "Legal Notice (Act on Specified Commercial Transactions)", body: <EnglishBody /> },
      }}
    />
  );
}
