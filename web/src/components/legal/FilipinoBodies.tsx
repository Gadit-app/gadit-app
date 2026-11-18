import type { ReactElement } from "react";

export const titlesFil = { privacy: "Patakaran sa Privacy", terms: "Mga Tuntunin ng Paggamit" };

export function PrivacyBodyFil(): ReactElement {
  return (
    <>
      <p>
        Ang Gadit (&ldquo;Gadit&rdquo;, &ldquo;kami&rdquo;, &ldquo;namin&rdquo;, o &ldquo;aming&rdquo;) ay isang
        serbisyong pinapatakbo ng <strong>Lavi Learning and Training Technologies LLC</strong>, isang kumpanyang
        nakarehistro sa Estados Unidos. Ipinapaliwanag ng Patakaran sa Privacy na ito kung anong impormasyon ang aming
        kinokolekta, kung paano namin ito ginagamit, at ang mga pagpipiliang mayroon kayo.
      </p>
      <p>
        Kung mayroon kayong anumang tanong, makipag-ugnayan sa amin sa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Impormasyong aming kinokolekta</h2>
      <h3>Impormasyon ng account</h3>
      <p>
        Kapag gumawa kayo ng account, kinokolekta namin ang inyong email address at, kung kayo ay mag-sign in gamit ang
        Google, ang pangunahing impormasyon ng profile na ibinibigay ng Google (display name, larawan sa profile). Hindi
        namin natatanggap ang inyong password sa Google.
      </p>
      <p>
        {"Sa iOS app, maaari rin kayong mag-sign in gamit ang Apple. Pagkatapos, ibinibigay sa amin ng Apple ang pangalan at ang email address na pinili ninyong ibahagi, na maaaring isang private relay address na nagpapasa sa inyo ng aming mga email. Hindi namin natatanggap ang inyong password sa Apple."}
      </p>
      <h3>Impormasyon sa paggamit</h3>
      <p>Kapag ginagamit ninyo ang Gadit, pinoproseso namin ang:</p>
      <ul>
        <li>mga salita at opsyonal na pangungusap na inyong hinahanap;</li>
        <li>mga larawang binubuo ayon sa inyong kahilingan;</li>
        <li>inyong subscription plan at billing status;</li>
        <li>kamakailang kasaysayan ng paghahanap (para sa mga bayad na user, hanggang sa huling 10 salita), na iniimbak upang ma-access ninyo itong muli sa ibang pagkakataon;</li>
        <li>
          {"kung ginagamit ninyo ang assistant ng Gadit sa help center: ang mga tanong na itinatanong ninyo, ang mga sagot nito, at kung minarkahan ninyo ang isang sagot bilang nakatulong, kasama ang inyong account ID (at family ID, kung mayroon), email address, plan, wika ng interface, at kung ginamit ninyo ang website o ang app;"}
        </li>
        <li>buwanang quota (halimbawa, ang bilang ng mga larawang nabuo ninyo sa billing cycle na ito).</li>
      </ul>
      <p>
        {"Ang assistant ng Gadit ay hindi inaalok sa mga profile ng mga bata, sa Mode para sa mga Bata, o sa mga bisitang hindi naka-sign in. Mangyaring huwag mag-type rito ng mga password o numero ng card."}
      </p>
      <h3>Teknikal at analytics na datos</h3>
      <p>
        Awtomatiko naming kinokolekta ang pangunahing teknikal na impormasyon gaya ng IP address, uri ng browser, uri ng
        device, referring URL, at mga pahinang tiningnan. Ginagamit ito para sa seguridad, pagsubaybay sa performance, at
        pinagsama-samang analytics. Ang analytics ay ibinibigay ng Vercel at ginagawang anonymous sa mismong punto ng
        pagkolekta (walang personal na identifier na iniimbak). Sa aming mga pahina ng marketing, pag-sign up, at
        pagbabayad, gumagamit din kami ng mga tool para sa advertising at analytics, na inilalarawan sa Seksyon 3.
      </p>
      <h3>Impormasyon sa pagbabayad</h3>
      <p>
        Kung kayo ay mag-subscribe, ang pagbabayad ay pinoproseso ng <strong>Stripe, Inc.</strong> Hindi namin nakikita o
        iniimbak ang buong numero ng inyong card; tumatanggap lamang kami ng customer token at metadata na kailangan upang
        matukoy ang subscription.
      </p>

      <h2>2. Paano namin ginagamit ang inyong impormasyon</h2>
      <ul>
        <li>upang ibigay at pagbutihin ang serbisyo ng Gadit (pagbuo ng mga kahulugan, larawan, feedback sa pangungusap, quiz);</li>
        <li>upang mapanatili ang inyong account at i-personalize ang inyong karanasan (kasaysayan ng paghahanap, gustong wika, toggle ng &ldquo;Mode para sa mga Bata&rdquo;);</li>
        <li>upang iproseso ang mga subscription at magpadala ng mga transactional email (mga resibo, mga pagbabago sa subscription);</li>
        <li>
          {"upang sagutin ang inyong mga tanong sa assistant ng Gadit at pagbutihin ang aming mga sagot sa help, at, kapag ipinapasa ng assistant ang isang tanong sa aming team, upang i-email sa team ang kamakailang pag-uusap kasama ang inyong pangalan, email address, plan, wika ng interface, at kung ginamit ninyo ang website o ang app, upang makasagot sa inyo ang team sa pamamagitan ng email;"}
        </li>
        <li>upang sukatin at pagbutihin ang performance ng produkto at pigilan ang pang-aabuso;</li>
        <li>upang sumunod sa mga legal na obligasyon.</li>
      </ul>
      <p>
        <strong>Hindi namin ibinebenta</strong> ang inyong personal na impormasyon, at hindi namin ginagamit ang inyong
        nilalaman upang magpakita sa inyo ng mga advertisement.
      </p>

      <h2>3. Mga third-party na serbisyong aming ginagamit</h2>
      <p>
        Umaasa ang Gadit sa mga sumusunod na processor. Ang bawat isa ay tumatanggap lamang ng pinakamababang impormasyong
        kailangan upang maibigay ang kaukulang serbisyo:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": pinoproseso ang mga salita at pangungusap na inyong isinusumite upang bumuo ng mga kahulugan, feedback sa pangungusap at mga quiz, ginagawang speech ang teksto, tine-transcribe ang voice input, binabasa ang teksto sa mga larawang at PDF file na inyong ina-upload, halimbawa mga pahina ng takdang-aralin, at bumubuo ng mga larawan. Isinusulat din nito ang mga sagot ng assistant ng Gadit: ipinapadala namin rito ang inyong tanong, ang mga naunang mensahe sa parehong pag-uusap, ang wika ng inyong interface, ang inyong plan, at kung kayo ay nasa website o app, at hindi namin isinasama ang inyong pangalan o email address. Ang datos na ipinapadala sa OpenAI ay sakop ng patakaran ng OpenAI sa paggamit ng datos ng API."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): iniimbak ang inyong account,
          profile, status ng subscription, kasaysayan ng paghahanap, at mga nabuong larawan.
        </li>
        <li>
          <strong>Google</strong>{":  (Gemini, sa pamamagitan ng Google Cloud), ginagawang speech ang teksto. Ang ipinapadala lamang namin dito ay ang tekstong babasahin nang malakas, gaya ng mga salita, pangungusap at kuwento, at ang audio ay itinatago sa aming Firebase storage upang maaari itong patugtugin muli. Sa isang reading game, naririnig din nito ang tunog na binibigkas nang malakas ng isang bata upang masuri ito, at ang recording na iyon ay hindi itinatago. Inihahatid ng Google Fonts ang mga font ng interface sa Chinese, Japanese at Korean, at nakikita nito ang inyong IP address."}
        </li>
        <li>
          <strong>Dicta</strong>{": isang Israeli non-profit, naglalagay ng mga vowel mark, niqqud, sa tekstong Hebrew para sa mga batang mambabasa. Ang ipinapadala lamang namin dito ay ang tekstong Hebrew."}
        </li>
        <li>
          <strong>Stripe</strong>: humahawak sa mga pagbabayad, subscription, at billing portal.
        </li>
        <li>
          <strong>Apple</strong>{": nagbibigay ng Sign in with Apple sa iOS app, tingnan ang seksyon 1, at nagbebenta at naniningil para sa mga subscription na binibili sa iOS app. Para sa mga iyon, Apple ang humahawak sa bayad, at pagtitibay lamang ng pagbili at ng katayuan nito, tulad ng renewal o refund, ang natatanggap namin."}
        </li>
        <li>
          <strong>PayPal</strong>{": nagbabayad sa aming mga partner, affiliates. Ibinibigay namin dito ang PayPal email address ng partner at ang halaga."}
        </li>
        <li>
          <strong>Resend</strong>{": nagpapadala ng aming mga email (tulad ng mga sign-in link at notification), at ipinadadala sa aming team ang mga tanong na ipinapasa ng assistant ng Gadit, na ang inyong email address ang gagamiting reply address."}
        </li>
        <li>
          <strong>Expo</strong>{": naghahatid ng mga notification ng iOS app, tulad ng mga alert na maaaring i-on ng isang magulang, na kinabibilangan ng pangalan ng bata at ng salitang hinanap ng bata."}
        </li>
        <li>
          <strong>Vercel</strong>: nagho-host at naghahatid ng website, at nagbibigay ng anonymous na analytics at
          pagsukat ng performance.
        </li>
        <li>
          <strong>Yooniz</strong>{": isang hiwalay na serbisyong pampagkatuto para sa pamilya mula sa parehong founder. Maaaring tanungin kami ng Yooniz kung ang email address ng isang magulang ay may aktibong Gadit Family plan, at oo o hindi lamang ang aming isinasagot. Kung mayroon, maaaring buksan ng pamilya ang Gadit mula sa Yooniz nang walang password: ipinapadala sa amin ng Yooniz ang email address ng magulang, ang mga display name ng mga miyembro ng pamilya, at kung ang bawat isa ay magulang, lalaki o babae. Kapag may batang nagbukas ng Gadit mula sa Yooniz at nakaunawa ng isang salita, ipinapadala namin sa Yooniz ang email address ng magulang, ang Yooniz ID ng bata at ang bilang ng mga learning point na nakuha, ngunit hindi kailanman ang mismong salita."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": inihahatid ang maliliit na larawan ng mga bandila na ipinapakita sa aming mga pahina, at dahil dito ay nakikita nito ang inyong IP address at mga detalye ng browser."}
        </li>
        <li>
          <strong>Pag-aanunsyo at analytics</strong>{": Sinusukat ng Meta, Meta Pixel, Google Analytics at TikTok, TikTok Pixel at Events API, ang mga pagbisita at ang mga resulta ng aming mga ad. Gumagamit sila ng cookies at mga katulad na teknolohiya sa aming mga pahina ng marketing, pag-sign up, at pagbabayad. Kapag kayo ay nag-sign up o nagbayad, maaari naming ipadala sa mga serbisyong ito ang isang hashed, one-way na naka-encrypt, na email address at account ID, kasama ang inyong IP address at mga detalye ng browser, para lamang sukatin ang aming mga ad. Ang Affonso, isang serbisyo para sa mga affiliate link, ay naglo-load sa mga kaparehong pahina at sa anumang pahinang mararating ng bisita sa pamamagitan ng link ng partner, at nagpapanatili ng cookie nang hanggang 60 araw. Kung nag-sign up kayo matapos dumating sa pamamagitan ng affiliate link ng Affonso, ipinapadala namin sa Affonso ang inyong email address, pangalan at account ID, upang makredito ang affiliate na nag-refer sa inyo. Hindi kailanman kami nagpapadala sa alinman sa mga serbisyong ito ng impormasyon tungkol sa mga bata, at hindi tumatakbo ang mga tool na ito sa profile ng bata, sa Kids Mode o sa mga pahina ng class link."}
        </li>
      </ul>

      <h2>4. Gaano katagal namin iniingatan ang inyong impormasyon</h2>
      <ul>
        <li>Impormasyon ng account: habang umiiral ang inyong account.</li>
        <li>Kasaysayan ng paghahanap: ang huling 10 paghahanap bawat user, ina-update sa bawat bagong paghahanap.</li>
        <li>
          {"Mga pag-uusap sa assistant ng Gadit: 180 araw, pagkatapos ay awtomatikong binubura, o mas maaga kung buburahin ninyo ang inyong account. Ang pang-araw-araw na bilang ng inyong mga tanong, na ginagamit para sa pang-araw-araw na limitasyon, ay binubura pagkalipas ng 3 araw."}
        </li>
        <li>
          {"Mga tanong na ipinapasa ng assistant ng Gadit sa aming team: iniingatan sa mailbox ng aming team, tulad ng anumang email na ipinapadala ninyo sa amin."}
        </li>
        <li>Mga nabuong larawan: iniingatan upang muling magamit ng parehong salita+kahulugan ang naka-cache na larawan. Maaaring panatilihin nang walang takdang panahon habang aktibo ang inyong account.</li>
        <li>Mga rekord ng billing at buwis: ayon sa hinihingi ng naaangkop na batas (karaniwang 7 taon).</li>
        <li>
          {"Mga binurang account: isang maikling tala na binura ang account (ang email address nito, plan, at ang dahilan at tala na ibinigay ninyo, kung mayroon), na iniingatan upang makasagot kami sa mga tanong tungkol sa pagbura."}
        </li>
        <li>Analytics na datos: pinagsama-sama, karaniwang iniingatan ng analytics provider sa loob ng 13 buwan.</li>
      </ul>

      <h2>5. Ang inyong mga karapatan</h2>
      <p>Depende sa kung saan kayo nakatira, maaaring mayroon kayong karapatang:</p>
      <ul>
        <li>humiling ng access sa personal na impormasyong hawak namin tungkol sa inyo;</li>
        <li>humiling ng pagwawasto ng hindi tumpak na impormasyon;</li>
        <li>humiling ng pagbura ng inyong account at kaugnay na datos;</li>
        <li>i-export ang inyong datos sa isang portable na format;</li>
        <li>tumutol sa o limitahan ang ilang paggamit ng inyong impormasyon;</li>
        <li>mag-opt out sa ilang pagbabahagi ng datos (kung naaangkop sa ilalim ng CCPA o mga katulad na batas).</li>
      </ul>
      <p>
        Upang gamitin ang alinman sa mga karapatang ito, mag-email sa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Tutugon kami sa loob ng
        30 araw.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Gumagamit kami ng mga pananggalang na pamantayan sa industriya, gaya ng mga naka-encrypt na koneksyon (HTTPS),
        mga authenticated na API, at mga kontrol sa access, upang protektahan ang inyong impormasyon. Walang paraan ng
        pagpapadala o pag-iimbak sa internet na 100% ligtas, kaya hindi namin magagarantiya ang ganap na seguridad, ngunit
        patuloy kaming nagsisikap na bawasan ang panganib.
      </p>

      <h2>7. Mga bata</h2>
      <p>
        {"Ang account sa Gadit ay para sa mga nasa hustong gulang, 18 taong gulang pataas. Ang mga bata at tinedyer ay gumagamit ng Gadit sa pamamagitan lamang ng isang nasa hustong gulang, sa isa sa dalawang paraan."}
      </p>
      <p>
        {"Mga profile sa Family: idinadagdag ng magulang ang bawat bata bilang profile sa loob ng Family account ng magulang, na may pangalan at kung ang bata ay lalaki o babae, at, kung idaragdag ng magulang ang mga ito, edad, baitang sa paaralan, at larawan. Walang email address o password sa amin ang mga bata. Ang mga salitang hinahanap ng bata, at ang notebook, mga laro, at progreso ng bata, ay sine-save sa account ng pamilya. Makikita ang mga ito ng mga magulang sa pamilya, at ng sinumang binibigyan nila ng access, gaya ng tutor, at maaaring piliin ng magulang na makatanggap ng mga alert, sa notification o email, kasama ang mga salitang hinahanap ng bata. Maaaring alisin ng magulang ang profile ng bata sa app anumang oras."}
      </p>
      <p>
        {"Mga class link: binubuksan ng estudyante ang link o code na ibinibigay ng guro, nang walang account at walang email address. Kung naglagay ang guro ng listahan ng mga pangalan, pipiliin ng estudyante ang kaniyang pangalan mula rito, at ang mga salitang hinahanap ng estudyante ay sine-save para sa klase sa ilalim ng pangalang iyon, upang makita ng guro ang mga ito. Ang paaralan ang nagpapasyang gumamit ng Gadit at ito ang may pananagutan sa pagpapaalam sa mga magulang kung hinihingi ito ng batas."}
      </p>
      <p>
        {"Hindi namin kailanman ginagamit ang impormasyon ng mga bata para sa pag-aanunsyo, at ang mga tool na nakalista sa ilalim ng Pag-aanunsyo at analytics sa seksyon 3 ay hindi kailanman naglo-load sa profile ng bata, sa Kids Mode, o sa mga pahina ng class link. Upang ma-delete ang profile ng bata at ang datos nito, maaaring sumulat ang magulang sa "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" at ide-delete namin ito. Kung naniniwala kayong may batang nagbukas ng sarili niyang account, sumulat sa amin at ide-delete namin ang account at ang datos nito."}
      </p>

      <h2>8. Mga internasyonal na user</h2>
      <p>
        Ang Gadit ay pinapatakbo mula sa Estados Unidos. Kung ina-access ninyo ang serbisyo mula sa labas ng Estados
        Unidos, ang inyong impormasyon ay ililipat, iimbakin, at ipoproseso sa Estados Unidos at sa mga rehiyon ng data
        center na ginagamit ng aming mga service provider.
      </p>

      <h2>9. Mga pagbabago sa patakarang ito</h2>
      <p>
        Maaari naming i-update ang Patakaran sa Privacy na ito paminsan-minsan. Ang mahahalagang pagbabago ay ipo-post sa
        pahinang ito kasama ang binagong petsa ng &ldquo;Huling na-update&rdquo;. Ang patuloy ninyong paggamit ng Gadit
        matapos magkabisa ang mga pagbabago ay nangangahulugan ng pagtanggap sa na-update na patakaran.
      </p>

      <h2>10. Makipag-ugnayan</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyFil(): ReactElement {
  return (
    <>
      <p>
        Maligayang pagdating sa Gadit. Ang Mga Tuntunin ng Paggamit na ito (&ldquo;Mga Tuntunin&rdquo;) ang namamahala sa
        inyong pag-access at paggamit ng website, mga application, at mga serbisyo ng Gadit (sama-sama, ang
        &ldquo;Serbisyo&rdquo;), na pinapatakbo ng{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;kami&rdquo;, &ldquo;namin&rdquo;, o
        &ldquo;aming&rdquo;). Sa paggamit ng Serbisyo, sumasang-ayon kayong matali sa Mga Tuntuning ito. Kung hindi kayo
        sumasang-ayon, huwag gamitin ang Serbisyo.
      </p>

      <h2>1. Sino ang maaaring gumamit ng Gadit</h2>
      <p>
        {"Kailangan kayong 18 taong gulang o mas matanda upang makapagbukas ng account sa Gadit. Ang mga bata at tinedyer na wala pang 18 taong gulang ay gumagamit ng Gadit sa pamamagitan lamang ng isang nasa hustong gulang: maaaring idagdag sila ng magulang o tagapag-alaga bilang mga profile sa planong Family, at maaaring bigyan ng isang paaralan ang mga estudyante nito ng class link. Ang magulang, tagapag-alaga, o paaralang nagbibigay ng access na ito ang may pananagutan dito. Sa pagbubukas ng account, kinukumpirma ninyo na kayo ay 18 taong gulang o mas matanda."}
      </p>

      <h2>2. Ang inyong account</h2>
      <p>
        Kayo ang may pananagutan sa pagpapanatiling kumpidensyal ng inyong mga login credential at sa lahat ng aktibidad na
        nagaganap sa ilalim ng inyong account. Ipaalam agad sa amin sa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> kung naniniwala kayong
        nakompromiso ang inyong account.
      </p>

      <h2>3. Mga subscription at pagsingil</h2>
      <h3>Mga plan at bayarin</h3>
      <p>
        {"Nag-aalok ang Gadit ng libreng Basic plan at mga bayad na plan na may mga feature at presyong nakalista sa pahina ng pagpepresyo. Ang mga presyo ay nakasaad sa currency na ipinapakita sa pahina ng pagpepresyo at sa pag-checkout para sa iyong lokasyon (sa Israel, mga bagong Israeli shekel kasama ang VAT) at maaaring baguhin nang may abiso na hindi bababa sa 30 araw para sa mga kasalukuyang subscriber."}
      </p>
      <h3>Awtomatikong pag-renew</h3>
      <p>
        Ang mga bayad na subscription ay awtomatikong nire-renew sa katapusan ng bawat billing period (buwanan o taunan,
        ayon sa napili) sa presyong umiiral sa panahong iyon, maliban kung kinansela bago ang petsa ng pag-renew.
      </p>
      <h3>Pagkansela</h3>
      <p>
        {"Maaari kayong magkansela anumang oras mula sa pahina ng inyong account. Ang pagkansela ay humihinto sa mga susunod na pag-renew. Mananatili ang inyong access sa mga bayad na feature hanggang sa katapusan ng kasalukuyang billing period. Maliban sa mga refund na inilalarawan sa ibaba, hindi kami nagbabalik ng bayad para sa hindi nagamit na panahon, maliban kung hinihingi ng batas ang iba."}
      </p>
      <h3>Mga refund</h3>
      <p>
        {"Kung hihiling kayo sa loob ng 14 na araw mula sa unang bayad sa inyong account, o sa loob ng 14 na araw mula sa taunang pag-renew, ibabalik namin nang buo ang bayad na iyon. Hindi ninyo kailangang magbigay ng dahilan. Sumulat sa "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" mula sa email address ng inyong account. Tinatapos din ng refund ang subscription. Ang ibang mga bayad ay hindi refundable, maliban kung hinihingi ng batas ang refund. Kung naniniwala kayong kayo ay nasingil nang mali, sumulat sa amin sa loob ng 30 araw mula sa pagsingil. Ang mga pagbiling ginawa sa iOS app ay sinisingil ng Apple, at Apple lamang ang maaaring mag-refund ng mga iyon, sa reportaproblem.apple.com."}
      </p>

      <h2>4. Katanggap-tanggap na paggamit</h2>
      <p>Sumasang-ayon kayong hindi:</p>
      <ul>
        <li>gamitin ang Serbisyo para sa anumang ilegal na layunin o nang lumalabag sa anumang batas;</li>
        <li>tangkaing i-reverse-engineer, i-decompile, o kunin ang source code ng Serbisyo;</li>
        <li>abusuhin, harasin, o saktan ang ibang mga user, o magsumite ng nilalamang mapoot, nagbabanta, o malaswa;</li>
        <li>i-automate ang pag-access sa Serbisyo nang lampas sa makatwirang personal na paggamit (halimbawa, pag-scrape ng mga kahulugan nang maramihan);</li>
        <li>lusutan ang mga rate limit o mga paghihigpit ng plan, o gumamit ng maraming account upang makaiwas sa mga quota;</li>
        <li>gamitin ang Serbisyo upang mag-train o mag-fine-tune ng anumang kakumpitensyang AI model o produktong diksyunaryo;</li>
        <li>mag-upload o magsumite ng nilalamang wala kayong karapatang isumite.</li>
      </ul>
      <p>
        Inilalaan namin ang karapatang suspindihin o wakasan ang mga account na lumalabag sa Mga Tuntuning ito.
      </p>

      <h2>5. Nilalamang binuo ng AI</h2>
      <p>
        {"Gumagamit ang Gadit ng mga artificial-intelligence model (kabilang ang mga model mula sa OpenAI at Google) upang bumuo ng mga kahulugan, halimbawa, etimolohiya, feedback, quiz, larawan, speech, at transcription. Nauunawaan at sinasang-ayunan ninyo na:"}
      </p>
      <ul>
        <li>
          Ang output ng AI ay maaaring <strong>hindi tumpak, hindi kumpleto, o hindi angkop</strong>. Ang Gadit ay
          nilayon bilang pantulong sa pag-aaral at hindi dapat asahan para sa mga legal, medikal, propesyonal, o
          akademikong desisyon.
        </li>
        <li>
          Ang mga kahulugang binuo ng AI ay maaaring naiiba sa mga opisyal na diksyunaryo. Hindi namin ginagarantiya na
          ang bawat kahulugan ay awtoritatibo sa linggwistika.
        </li>
        <li>
          Ang mga larawan ay binubuo sa pamamagitan ng algorithm at paminsan-minsan ay maaaring hindi inaasahan o hindi
          eksakto. Ang mga ito ay mga ilustrasyon, hindi literal na paglalarawan.
        </li>
        <li>
          Kayo lamang ang may pananagutan sa kung paano ninyo binibigyang-kahulugan at ginagamit ang nilalamang binuo ng
          AI.
        </li>
      </ul>

      <h2>6. Ang inyong nilalaman</h2>
      <p>
        Kapag nagsumite kayo ng mga salita, pangungusap, o audio sa Gadit (halimbawa kapag ginagamit ang &ldquo;Bumuo ng
        sarili ninyong pangungusap&rdquo; o voice input), binibigyan ninyo kami ng pandaigdigan, hindi eksklusibo, at
        royalty-free na lisensya upang iproseso ang nilalamang iyon para sa layuning maihatid ang Serbisyo at mapabuti
        ito. Hindi namin inaangkin ang pagmamay-ari ng inyong mga isinumite.
      </p>

      <h2>7. Intelektwal na ari-arian</h2>
      <p>
        Ang pangalang Gadit, logo, website, at ang pinagbabatayang software ay pag-aari namin o ng aming mga licensor.
        Pinagkakalooban kayo ng personal, mababawi, at hindi eksklusibong lisensya upang gamitin ang Serbisyo ayon sa
        pinahihintulutan ng Mga Tuntuning ito.
      </p>
      <p>
        Ang nilalamang binuo ng Gadit bilang tugon sa inyong input (mga kahulugan, larawan, atbp.) ay maaari ninyong
        gamitin para sa personal, pang-edukasyon, o hindi pangkomersyal na layunin. Para sa komersyal na paggamit
        (halimbawa sa isang bayad na produkto), mangyaring makipag-ugnayan sa amin.
      </p>

      <h2>8. Availability at mga pagbabago</h2>
      <p>
        Sinisikap naming panatilihing available ang Serbisyo ngunit hindi namin ginagarantiya ang tuloy-tuloy o
        walang-error na operasyon. Maaari naming baguhin, suspindihin, o ihinto ang anumang bahagi ng Serbisyo anumang
        oras, kabilang ang mga feature, pagpepresyo, o availability sa mga partikular na rehiyon.
      </p>

      <h2>9. Mga third-party na serbisyo</h2>
      <p>
        Umaasa ang Serbisyo sa mga third-party provider (kabilang ang OpenAI, Google Firebase, Stripe, at Vercel). Ang
        kanilang availability o pagkilos ay maaaring makaapekto sa inyong karanasan. Ang aming pananagutan ay nililimitahan
        ng Seksyon 11 anuman ang mga isyung dulot ng mga provider na ito.
      </p>

      <h2>10. Pagtatatwa</h2>
      <p>
        ANG SERBISYO AY IBINIBIGAY NANG &ldquo;KUNG ANO ITO&rdquo; (&ldquo;AS IS&rdquo;) AT &ldquo;AYON SA
        AVAILABILITY&rdquo; (&ldquo;AS AVAILABLE&rdquo;), NANG WALANG ANUMANG URI NG WARRANTY, HAYAG MAN O
        IPINAHIHIWATIG, KABILANG NGUNIT HINDI LIMITADO SA MGA WARRANTY NG KAKAYAHANG MAIBENTA (MERCHANTABILITY),
        KAANGKUPAN PARA SA ISANG PARTIKULAR NA LAYUNIN, AT HINDI PAGLABAG SA KARAPATAN NG IBA (NON-INFRINGEMENT).
      </p>

      <h2>11. Limitasyon ng pananagutan</h2>
      <p>
        SA PINAKAMALAWAK NA SAKLAW NA PINAHIHINTULUTAN NG BATAS, ANG LAVI LEARNING AND TRAINING TECHNOLOGIES LLC AT ANG
        MGA OPISYAL, EMPLEYADO, AT AHENTE NITO AY HINDI MANANAGOT SA ANUMANG HINDI DIREKTA, INSIDENTAL, ESPESYAL,
        KINAHINATNANG (CONSEQUENTIAL), O PAPARUSANG (PUNITIVE) DANYOS, O SA ANUMANG PAGKAWALA NG TUBO O KITA, NA
        NAGMUMULA SA O MAY KAUGNAYAN SA INYONG PAGGAMIT NG SERBISYO.
      </p>
      <p>
        ANG AMING KABUUANG PANANAGUTAN PARA SA ANUMANG CLAIM NA NAGMUMULA SA O MAY KAUGNAYAN SA SERBISYO AY HINDI LALAMPAS
        SA MAS MALAKI SA (A) HALAGANG IBINAYAD NINYO SA AMIN SA LOOB NG LABINDALAWANG BUWAN BAGO ANG CLAIM, O (B) USD
        $100.
      </p>

      <h2>12. Pagwawakas</h2>
      <p>
        Maaari ninyong ihinto ang paggamit ng Serbisyo anumang oras. Maaari naming suspindihin o wakasan ang inyong access
        kung lalabagin ninyo ang Mga Tuntuning ito o kung hinihingi ng batas. Sa pagwawakas, ang mga probisyong ayon sa
        kanilang likas na katangian ay dapat manatili (kabilang ang Mga Seksyon 7, 10, 11, at 14) ay mananatiling may
        bisa.
      </p>

      <h2>13. Mga pagbabago sa Mga Tuntuning ito</h2>
      <p>
        Maaari naming rebisahin ang Mga Tuntuning ito paminsan-minsan. Ang mahahalagang pagbabago ay ipo-post sa pahinang
        ito kasama ang binagong petsa ng &ldquo;Huling na-update&rdquo;. Ang patuloy ninyong paggamit ng Serbisyo matapos
        magkabisa ang mga pagbabago ay nangangahulugan ng pagtanggap sa na-update na Mga Tuntunin.
      </p>

      <h2>14. Namamahalang batas at mga hindi pagkakaunawaan</h2>
      <p>
        Ang Mga Tuntuning ito ay pinamamahalaan ng mga batas ng Estado ng Delaware, Estados Unidos, nang hindi
        isinasaalang-alang ang mga panuntunan nito sa salungatan ng mga batas (conflict-of-law rules). Anumang hindi
        pagkakaunawaan na nagmumula sa o may kaugnayan sa Mga Tuntuning ito o sa Serbisyo ay eksklusibong lulutasin sa mga
        hukuman ng estado o pederal na matatagpuan sa Delaware, Estados Unidos, at pumapayag kayo sa personal na
        hurisdiksyon (personal jurisdiction) ng mga hukumang iyon.
      </p>

      <h2>15. Makipag-ugnayan</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
