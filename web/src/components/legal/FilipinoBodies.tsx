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
      <h3>Impormasyon sa paggamit</h3>
      <p>Kapag ginagamit ninyo ang Gadit, pinoproseso namin ang:</p>
      <ul>
        <li>mga salita at opsyonal na pangungusap na inyong hinahanap;</li>
        <li>mga larawang binubuo ayon sa inyong kahilingan;</li>
        <li>inyong subscription plan at billing status;</li>
        <li>kamakailang kasaysayan ng paghahanap (para sa mga bayad na user, hanggang sa huling 10 salita), na iniimbak upang ma-access ninyo itong muli sa ibang pagkakataon;</li>
        <li>buwanang quota (halimbawa, ang bilang ng mga larawang nabuo ninyo sa billing cycle na ito).</li>
      </ul>
      <h3>Teknikal at analytics na datos</h3>
      <p>
        Awtomatiko naming kinokolekta ang pangunahing teknikal na impormasyon gaya ng IP address, uri ng browser, uri ng
        device, referring URL, at mga pahinang tiningnan. Ginagamit ito para sa seguridad, pagsubaybay sa performance, at
        pinagsama-samang analytics. Ang analytics ay ibinibigay ng Vercel at ginagawang anonymous sa mismong punto ng
        pagkolekta (walang personal na identifier na iniimbak).
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
          <strong>OpenAI</strong>: pinoproseso ang mga salita at pangungusap na inyong isinusumite upang bumuo ng mga
          kahulugan, feedback sa pangungusap, quiz, at voice transcription (Whisper), at bumubuo ng mga larawan (DALL·E 3).
          Ang datos na ipinapadala sa OpenAI ay sakop ng patakaran ng OpenAI sa paggamit ng datos ng API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): iniimbak ang inyong account,
          profile, status ng subscription, kasaysayan ng paghahanap, at mga nabuong larawan.
        </li>
        <li>
          <strong>Stripe</strong>: humahawak sa mga pagbabayad, subscription, at billing portal.
        </li>
        <li>
          <strong>Vercel</strong>: nagho-host at naghahatid ng website, at nagbibigay ng anonymous na analytics at
          pagsukat ng performance.
        </li>
      </ul>

      <h2>4. Gaano katagal namin iniingatan ang inyong impormasyon</h2>
      <ul>
        <li>Impormasyon ng account: habang umiiral ang inyong account.</li>
        <li>Kasaysayan ng paghahanap: ang huling 10 paghahanap bawat user, ina-update sa bawat bagong paghahanap.</li>
        <li>Mga nabuong larawan: iniingatan upang muling magamit ng parehong salita+kahulugan ang naka-cache na larawan. Maaaring panatilihin nang walang takdang panahon habang aktibo ang inyong account.</li>
        <li>Mga rekord ng billing at buwis: ayon sa hinihingi ng naaangkop na batas (karaniwang 7 taon).</li>
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
        Ang Gadit ay hindi nakadirekta sa mga batang wala pang 13 taong gulang. Kung naniniwala kayong may batang wala
        pang 13 taong gulang na gumawa ng account, mag-email sa amin at buburahin namin ang account at ang kaugnay na
        datos.
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
        Kailangang kayo ay hindi bababa sa 13 taong gulang upang makagawa ng account. Kung kayo ay nasa pagitan ng 13 at
        18 taong gulang, kailangan ninyo ang pahintulot ng magulang o legal na tagapag-alaga. Sa paggamit ng Gadit,
        ipinapahayag ninyo na natutugunan ninyo ang mga kinakailangang ito.
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
        Nag-aalok ang Gadit ng libreng Basic plan at mga bayad na plan (Clear at Deep) na may mga feature at presyong
        nakalista sa pahina ng pagpepresyo. Ang mga presyo ay nakasaad sa USD at maaaring baguhin nang may abiso na hindi
        bababa sa 30 araw para sa mga kasalukuyang subscriber.
      </p>
      <h3>Awtomatikong pag-renew</h3>
      <p>
        Ang mga bayad na subscription ay awtomatikong nire-renew sa katapusan ng bawat billing period (buwanan o taunan,
        ayon sa napili) sa presyong umiiral sa panahong iyon, maliban kung kinansela bago ang petsa ng pag-renew.
      </p>
      <h3>Pagkansela</h3>
      <p>
        Maaari kayong magkansela anumang oras mula sa pahina ng inyong account. Ang pagkansela ay humihinto sa mga susunod
        na pag-renew. Mananatili ang inyong access sa mga bayad na feature hanggang sa katapusan ng kasalukuyang billing
        period. Hindi kami nagbibigay ng bahagyang refund para sa hindi nagamit na panahon.
      </p>
      <h3>Mga refund</h3>
      <p>
        Maliban kung hinihingi ng batas, ang mga bayad ay hindi refundable. Kung naniniwala kayong kayo ay nasingil nang
        mali, makipag-ugnayan sa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> sa loob ng 30 araw mula sa
        pagsingil.
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
        Gumagamit ang Gadit ng mga artificial intelligence model (kabilang ang GPT, Whisper, at DALL·E ng OpenAI) upang
        bumuo ng mga kahulugan, halimbawa, etimolohiya, feedback, quiz, larawan, at transcription. Nauunawaan at
        sinasang-ayunan ninyo na:
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
