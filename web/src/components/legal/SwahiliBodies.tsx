import type { ReactElement } from "react";

export const titlesSw = { privacy: "Sera ya Faragha", terms: "Masharti ya Matumizi" };

export function PrivacyBodySw(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;sisi&rdquo;, &ldquo;kwetu&rdquo;, au &ldquo;yetu&rdquo;) ni huduma
        inayoendeshwa na <strong>Lavi Learning and Training Technologies LLC</strong>, kampuni iliyosajiliwa nchini
        Marekani. Sera hii ya Faragha inaeleza ni taarifa gani tunazokusanya, jinsi tunavyozitumia, na chaguo ulizo nazo.
      </p>
      <p>
        Ikiwa una swali lolote, wasiliana nasi kupitia{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Taarifa tunazokusanya</h2>
      <h3>Taarifa za akaunti</h3>
      <p>
        Unapofungua akaunti, tunakusanya anwani yako ya barua pepe na, ikiwa utaingia kwa kutumia Google, taarifa za
        msingi za wasifu ambazo Google hutoa (jina la kuonyesha, picha ya wasifu). Hatupokei nenosiri lako la Google.
      </p>
      <p>
        {"Katika programu ya iOS unaweza pia kuingia kwa kutumia Apple. Kisha Apple hutupatia jina na anwani ya barua pepe unayochagua kushiriki, ambayo inaweza kuwa anwani ya faragha ya relay inayokutumia barua pepe zetu. Hatupokei nenosiri lako la Apple."}
      </p>
      <h3>Taarifa za matumizi</h3>
      <p>Unapotumia Gadit, tunachakata:</p>
      <ul>
        <li>maneno na sentensi za hiari unazotafuta;</li>
        <li>picha zinazotengenezwa kwa ombi lako;</li>
        <li>mpango wako wa usajili na hali ya malipo;</li>
        <li>historia ya hivi karibuni ya utafutaji (kwa watumiaji wanaolipia, hadi maneno 10 ya mwisho), inayohifadhiwa ili uweze kuifikia tena baadaye;</li>
        <li>
          {"ikiwa unatumia msaidizi wa Gadit katika kituo cha usaidizi: maswali unayouliza, majibu yake, na iwapo uliashiria kwamba jibu lilikuwa la msaada, pamoja na kitambulisho cha akaunti yako (na kitambulisho cha familia, ikiwa unacho), anwani ya barua pepe, mpango wako, lugha ya kiolesura, na iwapo ulitumia tovuti au programu;"}
        </li>
        <li>mipaka ya matumizi ya kila mwezi (kwa mfano, idadi ya picha ulizotengeneza katika kipindi hiki cha malipo).</li>
      </ul>
      <p>
        {"Msaidizi wa Gadit hatolewi kwenye profaili za watoto, katika Hali ya Watoto, au kwa wageni ambao hawajaingia kwenye akaunti. Tafadhali usiandike nywila au nambari za kadi ndani yake."}
      </p>
      <h3>Data za kiufundi na za uchanganuzi</h3>
      <p>
        Tunakusanya kiotomatiki taarifa za msingi za kiufundi kama vile anwani ya IP, aina ya kivinjari, aina ya kifaa,
        URL iliyokuelekeza, na kurasa zilizotazamwa. Taarifa hizi hutumika kwa usalama, ufuatiliaji wa utendaji, na
        uchanganuzi wa jumla. Uchanganuzi hutolewa na Vercel na hufanywa kuwa bila utambulisho mahali pa ukusanyaji
        (hakuna vitambulisho binafsi vinavyohifadhiwa). Kwenye kurasa zetu za masoko, usajili na malipo pia tunatumia
        zana za matangazo na uchanganuzi, zilizoelezwa katika Kifungu cha 3.
      </p>
      <h3>Taarifa za malipo</h3>
      <p>
        Ukijisajili, malipo huchakatwa na <strong>Stripe, Inc.</strong> Hatuoni wala kuhifadhi nambari kamili ya kadi
        yako; tunapokea tu tokeni ya mteja na metadata zinazohitajika kutambua usajili.
      </p>

      <h2>2. Jinsi tunavyotumia taarifa zako</h2>
      <ul>
        <li>kutoa na kuboresha huduma ya Gadit (kutengeneza fasili, picha, maoni kuhusu sentensi, majaribio mafupi);</li>
        <li>kudumisha akaunti yako na kubinafsisha matumizi yako (historia ya utafutaji, lugha unayopendelea, kitufe cha &ldquo;Hali ya Watoto&rdquo;);</li>
        <li>kuchakata usajili na kutuma barua pepe za miamala (risiti, mabadiliko ya usajili);</li>
        <li>
          {"kujibu maswali yako katika msaidizi wa Gadit na kuboresha majibu yetu ya usaidizi, na, msaidizi anapopeleka swali kwa timu yetu, kuitumia timu hiyo barua pepe yenye mazungumzo ya hivi karibuni pamoja na jina lako, anwani ya barua pepe, mpango wako, lugha ya kiolesura, na iwapo ulitumia tovuti au programu, ili timu iweze kukujibu kwa barua pepe;"}
        </li>
        <li>kupima na kuboresha utendaji wa bidhaa na kuzuia matumizi mabaya;</li>
        <li>kutimiza wajibu wa kisheria.</li>
      </ul>
      <p>
        <strong>Hatuuzi</strong> taarifa zako binafsi, na hatutumii maudhui yako kukuonyesha matangazo.
      </p>

      <h2>3. Huduma za wahusika wengine tunazotumia</h2>
      <p>
        Gadit inategemea wachakataji wafuatao. Kila mmoja hupokea tu kiwango cha chini kabisa cha taarifa kinachohitajika
        ili kutoa huduma husika:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": huchakata maneno na sentensi unazowasilisha ili kutengeneza fasili, maoni kuhusu sentensi na majaribio mafupi, hubadilisha maandishi kuwa sauti, hunukuu sauti unayoingiza, husoma maandishi kwenye picha na faili za PDF unazopakia, kwa mfano kurasa za kazi za nyumbani, na hutengeneza picha. Pia huandika majibu ya msaidizi wa Gadit: tunaitumia swali lako, ujumbe wa awali wa mazungumzo hayo hayo, lugha ya kiolesura chako, mpango wako, na iwapo uko kwenye tovuti au programu, na hatuambatishi jina lako wala anwani yako ya barua pepe. Data zinazotumwa kwa OpenAI zinasimamiwa na sera ya OpenAI ya matumizi ya data za API."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): huhifadhi akaunti yako, wasifu,
          hali ya usajili, historia ya utafutaji, na picha zilizotengenezwa.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, kupitia Google Cloud) hubadilisha maandishi kuwa sauti. Tunaitumia maandishi pekee yanayopaswa kusomwa kwa sauti, kama vile maneno, sentensi na hadithi, na sauti hiyo huhifadhiwa katika hifadhi yetu ya Firebase ili iweze kuchezwa tena. Katika mchezo mmoja wa kusoma, pia husikia sauti ambayo mtoto hutamka kwa sauti ili kuikagua, na rekodi hiyo haihifadhiwi. Google Fonts hutoa fonti za kiolesura cha Kichina, Kijapani na Kikorea, na huona anwani yako ya IP."}
        </li>
        <li>
          <strong>Dicta</strong>{": shirika lisilo la faida la Israeli, huongeza alama za vokali (niqqud) kwenye maandishi ya Kiebrania kwa ajili ya wasomaji wachanga. Tunalitumia maandishi ya Kiebrania pekee."}
        </li>
        <li>
          <strong>Stripe</strong>: hushughulikia malipo, usajili, na lango la usimamizi wa malipo.
        </li>
        <li>
          <strong>Apple</strong>{": hutoa Sign in with Apple katika programu ya iOS (tazama sehemu ya 1), na huuza na kutoza usajili unaonunuliwa katika programu ya iOS. Kwa ununuzi huo, Apple hushughulikia malipo, na sisi hupokea tu uthibitisho wa ununuzi na hali yake, kama vile usasishaji au marejesho."}
        </li>
        <li>
          <strong>PayPal</strong>{": hulipa washirika wetu. Tunaitumia anwani ya barua pepe ya PayPal ya mshirika na kiasi husika."}
        </li>
        <li>
          <strong>Resend</strong>{": hutuma barua pepe zetu (kama vile viungo vya kuingia na arifa), na huiwasilishia timu yetu maswali ambayo msaidizi wa Gadit hupeleka mbele, huku anwani yako ya barua pepe ikitumika kama anwani ya kujibu."}
        </li>
        <li>
          <strong>Expo</strong>{": huwasilisha arifa za programu ya iOS, kama vile arifa ambazo mzazi anaweza kuwasha, zinazojumuisha jina la mtoto na neno ambalo mtoto alitafuta."}
        </li>
        <li>
          <strong>Vercel</strong>: hupangisha na kuhudumia tovuti, na hutoa uchanganuzi usio na utambulisho na upimaji wa
          utendaji.
        </li>
        <li>
          <strong>Yooniz</strong>{": huduma tofauti ya kujifunza kwa familia kutoka kwa mwanzilishi huyo huyo. Yooniz inaweza kutuuliza ikiwa anwani ya barua pepe ya mzazi ina mpango wa Gadit Family unaotumika, na sisi hujibu ndiyo au hapana tu. Ikiwa upo, familia inaweza kufungua Gadit kutoka Yooniz bila nenosiri: Yooniz hututumia anwani ya barua pepe ya mzazi, majina ya kuonyesha ya wanafamilia, na iwapo kila mmoja ni mzazi, mvulana au msichana. Mtoto aliyefungua Gadit kutoka Yooniz anapoelewa neno, tunatuma kwa Yooniz anwani ya barua pepe ya mzazi, kitambulisho cha mtoto cha Yooniz na idadi ya pointi za kujifunza alizopata, kamwe si neno lenyewe."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": hutoa picha ndogo za bendera zinazoonyeshwa kwenye kurasa zetu, na kwa hivyo huona anwani yako ya IP na maelezo ya kivinjari chako."}
        </li>
        <li>
          <strong>Matangazo na uchanganuzi</strong>{": Meta (Meta Pixel), Google Analytics na TikTok (TikTok Pixel na Events API) hupima ziara na matokeo ya matangazo yetu. Hutumia vidakuzi (cookies) na teknolojia zinazofanana kwenye kurasa zetu za masoko, usajili na malipo. Unapojisajili au kulipa, tunaweza kutuma kwa huduma hizi anwani ya barua pepe na kitambulisho cha akaunti vilivyosimbwa kwa njia moja (hash), pamoja na anwani yako ya IP na maelezo ya kivinjari chako, kwa ajili ya kupima matangazo yetu tu. Affonso, huduma ya viungo vya washirika, hupakiwa kwenye kurasa hizo hizo na kwenye ukurasa wowote ambao mgeni anaufikia kupitia kiungo cha mshirika, na huweka kidakuzi kwa hadi siku 60. Ikiwa utajisajili baada ya kufika kupitia kiungo cha mshirika cha Affonso, tunatuma kwa Affonso anwani yako ya barua pepe, jina na kitambulisho cha akaunti, ili mshirika aliyekuletea apewe sifa. Hatuwatumii kamwe huduma hizi zozote taarifa kuhusu watoto, na zana hizi haziendeshwi kwenye wasifu wa mtoto, katika Kids Mode au kwenye kurasa za viungo vya darasa."}
        </li>
      </ul>

      <h2>4. Muda tunaohifadhi taarifa zako</h2>
      <ul>
        <li>Taarifa za akaunti: wakati wote akaunti yako ipo.</li>
        <li>Historia ya utafutaji: utafutaji 10 wa mwisho kwa kila mtumiaji, husasishwa kwa kila utafutaji mpya.</li>
        <li>
          {"Mazungumzo na msaidizi wa Gadit: siku 180, kisha hufutwa kiotomatiki, au mapema zaidi ukifuta akaunti yako. Hesabu ya kila siku ya maswali yako, inayotumika kwa kikomo cha kila siku, hufutwa baada ya siku 3."}
        </li>
        <li>
          {"Maswali ambayo msaidizi wa Gadit hupeleka kwa timu yetu: huhifadhiwa katika kisanduku cha barua cha timu yetu, kama barua pepe nyingine yoyote unayotutumia."}
        </li>
        <li>Picha zilizotengenezwa: huhifadhiwa ili neno+maana ileile iweze kutumia tena picha iliyohifadhiwa kwenye akiba (cache). Zinaweza kuhifadhiwa kwa muda usio na kikomo maadamu akaunti yako iko hai.</li>
        <li>Rekodi za malipo na kodi: kama inavyotakiwa na sheria inayotumika (kwa kawaida miaka 7).</li>
        <li>
          {"Akaunti zilizofutwa: rekodi fupi kwamba akaunti ilifutwa (anwani yake ya barua pepe, mpango, na sababu na dokezo ulilotoa, ikiwa lipo), inayohifadhiwa ili tuweze kujibu maswali kuhusu ufutaji huo."}
        </li>
        <li>Data za uchanganuzi: za jumla, kwa kawaida huhifadhiwa na mtoa huduma wa uchanganuzi kwa miezi 13.</li>
      </ul>

      <h2>5. Haki zako</h2>
      <p>Kulingana na mahali unapoishi, unaweza kuwa na haki ya:</p>
      <ul>
        <li>kuomba kufikia taarifa binafsi tunazoshikilia kukuhusu;</li>
        <li>kuomba kusahihishwa kwa taarifa zisizo sahihi;</li>
        <li>kuomba kufutwa kwa akaunti yako na data zinazohusiana nayo;</li>
        <li>kuhamisha data zako nje katika muundo unaoweza kuhamishwa;</li>
        <li>kupinga au kuzuia matumizi fulani ya taarifa zako;</li>
        <li>kujiondoa katika ushirikishaji fulani wa data (pale inapotumika chini ya CCPA au sheria zinazofanana).</li>
      </ul>
      <p>
        Ili kutumia yoyote kati ya haki hizi, tuma barua pepe kwa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Tutajibu ndani ya siku
        30.
      </p>

      <h2>6. Usalama</h2>
      <p>
        Tunatumia hatua za ulinzi za viwango vya sekta, yaani miunganisho iliyosimbwa (HTTPS), API zilizothibitishwa, na
        udhibiti wa ufikiaji, ili kulinda taarifa zako. Hakuna njia ya usafirishaji au uhifadhi kwenye intaneti iliyo
        salama kwa 100%, kwa hiyo hatuwezi kuhakikisha usalama kamili, lakini tunafanya kazi daima kupunguza hatari.
      </p>

      <h2>7. Watoto</h2>
      <p>
        {"Akaunti ya Gadit ni ya watu wazima, wenye umri wa miaka 18 na zaidi. Watoto na vijana hutumia Gadit kupitia mtu mzima pekee, kwa mojawapo ya njia mbili."}
      </p>
      <p>
        {"Wasifu wa Family: mzazi humwongeza kila mtoto kama wasifu ndani ya akaunti ya Family ya mzazi, akiwa na jina na iwapo mtoto ni mvulana au msichana, na, ikiwa mzazi ataongeza taarifa hizo, pia umri, darasa na picha. Watoto hawana anwani ya barua pepe wala nenosiri kwetu. Maneno anayoyatafuta mtoto, pamoja na daftari lake, michezo na maendeleo yake, huhifadhiwa katika akaunti ya family. Wazazi katika family, na yeyote wanayempa ufikiaji huo, kwa mfano mwalimu wa ziada, wanaweza kuviona, na mzazi anaweza kuchagua kupokea arifa, kwa notisi au kwa barua pepe, zenye maneno anayoyatafuta mtoto. Mzazi anaweza kuondoa wasifu wa mtoto katika programu wakati wowote."}
      </p>
      <p>
        {"Viungo vya darasa: mwanafunzi hufungua kiungo au msimbo anaopokea kutoka kwa mwalimu, bila akaunti na bila anwani ya barua pepe. Ikiwa mwalimu aliingiza orodha ya majina, mwanafunzi huchagua jina lake kutoka humo, na maneno anayoyatafuta mwanafunzi huhifadhiwa kwa ajili ya darasa chini ya jina hilo, ili mwalimu aweze kuyaona. Shule huamua kutumia Gadit na inawajibika kuwafahamisha wazazi pale sheria inapohitaji hivyo."}
      </p>
      <p>
        {"Hatutumii kamwe taarifa za watoto kwa matangazo, na zana zilizoorodheshwa chini ya Matangazo na uchanganuzi katika sehemu ya 3 hazipakiiwi kamwe kwenye wasifu wa mtoto, katika Hali ya Watoto au kwenye kurasa za viungo vya darasa. Ili wasifu wa mtoto na data zake zifutwe, mzazi anaweza kuandika kwa "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" na tutaufuta. Ikiwa unaamini kwamba mtoto alifungua akaunti yake mwenyewe, tuandikie na tutaifuta akaunti hiyo pamoja na data zake."}
      </p>

      <h2>8. Watumiaji wa kimataifa</h2>
      <p>
        Gadit inaendeshwa kutoka Marekani. Ikiwa unafikia huduma kutoka nje ya Marekani, taarifa zako zitahamishiwa,
        kuhifadhiwa, na kuchakatwa nchini Marekani na katika maeneo ya vituo vya data yanayotumiwa na watoa huduma wetu.
      </p>

      <h2>9. Mabadiliko ya sera hii</h2>
      <p>
        Tunaweza kusasisha Sera hii ya Faragha mara kwa mara. Mabadiliko muhimu yatachapishwa kwenye ukurasa huu pamoja na
        tarehe iliyorekebishwa ya &ldquo;Ilisasishwa mwisho&rdquo;. Kuendelea kwako kutumia Gadit baada ya mabadiliko kuanza
        kutumika kunamaanisha kukubali sera iliyosasishwa.
      </p>

      <h2>10. Mawasiliano</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Barua pepe:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodySw(): ReactElement {
  return (
    <>
      <p>
        Karibu Gadit. Masharti haya ya Matumizi (&ldquo;Masharti&rdquo;) yanasimamia ufikiaji wako na matumizi yako ya
        tovuti, programu, na huduma za Gadit (kwa pamoja, &ldquo;Huduma&rdquo;), zinazoendeshwa na{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;sisi&rdquo;, &ldquo;kwetu&rdquo;, au
        &ldquo;yetu&rdquo;). Kwa kutumia Huduma, unakubali kufungwa na Masharti haya. Ikiwa hukubali, usitumie Huduma.
      </p>

      <h2>1. Nani anaweza kutumia Gadit</h2>
      <p>
        {"Ni lazima uwe na umri wa miaka 18 au zaidi ili kufungua akaunti ya Gadit. Watoto na vijana walio chini ya miaka 18 hutumia Gadit kupitia mtu mzima pekee: mzazi au mlezi anaweza kuwaongeza kama wasifu katika mpango wa Family, na shule inaweza kuwapa wanafunzi wake kiungo cha darasa. Mzazi, mlezi au shule inayotoa ufikiaji huo inawajibika kwa ufikiaji huo. Kwa kufungua akaunti, unathibitisha kwamba una umri wa miaka 18 au zaidi."}
      </p>

      <h2>2. Akaunti yako</h2>
      <p>
        Unawajibika kudumisha usiri wa vitambulisho vyako vya kuingia na kwa shughuli zote zinazofanyika chini ya akaunti
        yako. Tujulishe mara moja kupitia{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> ikiwa unaamini kwamba
        akaunti yako imeingiliwa.
      </p>

      <h2>3. Usajili na malipo</h2>
      <h3>Mipango na ada</h3>
      <p>
        {"Gadit inatoa mpango wa bure wa Basic na mipango ya kulipia yenye vipengele na bei zilizoorodheshwa kwenye ukurasa wa bei. Bei zinaonyeshwa katika sarafu iliyoonyeshwa kwenye ukurasa wa bei na wakati wa malipo kwa eneo lako (nchini Israeli, shekeli mpya za Israeli ikijumuisha VAT) na zinaweza kubadilishwa kwa notisi ya angalau siku 30 kwa waliojisajili waliopo."}
      </p>
      <h3>Usasishaji wa kiotomatiki</h3>
      <p>
        Usajili wa kulipia husasishwa kiotomatiki mwishoni mwa kila kipindi cha malipo (kila mwezi au kila mwaka, kama
        ulivyochagua) kwa bei inayotumika wakati huo, isipokuwa ukighairiwa kabla ya tarehe ya usasishaji.
      </p>
      <h3>Kughairi</h3>
      <p>
        {"Unaweza kughairi wakati wowote kupitia ukurasa wa akaunti yako. Kughairi kunasimamisha usasishaji wa baadaye. Utaendelea kupata vipengele vya kulipia hadi mwisho wa kipindi cha sasa cha malipo. Isipokuwa kwa marejesho yaliyoelezwa hapa chini, hatutoi marejesho ya pesa kwa muda ambao haujatumika, isipokuwa pale sheria inapotaka vinginevyo."}
      </p>
      <h3>Marejesho ya pesa</h3>
      <p>
        {"Ukiomba ndani ya siku 14 tangu malipo ya kwanza kwenye akaunti yako, au ndani ya siku 14 tangu usasishaji wa kila mwaka, tutarejesha malipo hayo kwa ukamilifu. Huhitaji kutoa sababu. Andika kwa "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" ukitumia anwani ya barua pepe ya akaunti yako. Marejesho pia yanasitisha usajili. Malipo mengine hayarejeshwi, isipokuwa pale sheria inapotaka marejesho. Ikiwa unaamini kwamba ulitozwa kimakosa, tuandikie ndani ya siku 30 tangu ulipozwa. Ununuzi unaofanywa katika programu ya iOS hutozwa na Apple, na ni Apple pekee inayoweza kurejesha pesa hizo, kupitia reportaproblem.apple.com."}
      </p>

      <h2>4. Matumizi yanayokubalika</h2>
      <p>Unakubali kutofanya yafuatayo:</p>
      <ul>
        <li>kutumia Huduma kwa madhumuni yoyote haramu au kwa kukiuka sheria yoyote;</li>
        <li>kujaribu kufanya uhandisi wa kinyume, kutenganisha msimbo (decompile), au kutoa msimbo chanzo wa Huduma;</li>
        <li>kutendea vibaya, kunyanyasa, au kudhuru watumiaji wengine, au kuwasilisha maudhui ya chuki, ya vitisho, au machafu;</li>
        <li>kuendesha ufikiaji wa Huduma kiotomatiki zaidi ya matumizi binafsi yanayofaa (kwa mfano, kuvuna fasili kwa wingi kwa njia ya kiotomatiki);</li>
        <li>kukwepa mipaka ya kasi ya maombi au vikwazo vya mpango, au kutumia akaunti nyingi ili kuepuka mipaka ya matumizi;</li>
        <li>kutumia Huduma kufunza au kuboresha zaidi (fine-tune) modeli yoyote shindani ya AI au bidhaa ya kamusi;</li>
        <li>kupakia au kuwasilisha maudhui ambayo huna haki ya kuyawasilisha.</li>
      </ul>
      <p>
        Tuna haki ya kusimamisha au kusitisha akaunti zinazokiuka Masharti haya.
      </p>

      <h2>5. Maudhui yanayotengenezwa na AI</h2>
      <p>
        {"Gadit hutumia modeli za akili bandia (ikiwa ni pamoja na modeli kutoka OpenAI na Google) kutengeneza fasili, mifano, etimolojia, maoni, majaribio mafupi, picha, sauti, na manukuu. Unaelewa na kukubali kwamba:"}
      </p>
      <ul>
        <li>
          Matokeo ya AI yanaweza kuwa <strong>si sahihi, yasiyokamilika, au yasiyofaa</strong>. Gadit imekusudiwa kuwa
          kifaa cha kusaidia kujifunza na haipaswi kutegemewa kwa maamuzi ya kisheria, ya kitabibu, ya kikazi, au ya
          kitaaluma.
        </li>
        <li>
          Fasili zinazotengenezwa na AI zinaweza kutofautiana na kamusi rasmi. Hatuhakikishi kwamba kila fasili ina
          mamlaka ya kiisimu.
        </li>
        <li>
          Picha hutengenezwa kwa njia ya algoriti na mara kwa mara zinaweza kuwa zisizotarajiwa au zisizo sahihi. Ni
          vielelezo, si maonyesho halisi.
        </li>
        <li>
          Wewe peke yako unawajibika kwa jinsi unavyotafsiri na kutumia maudhui yanayotengenezwa na AI.
        </li>
      </ul>

      <h2>6. Maudhui yako</h2>
      <p>
        Unapowasilisha maneno, sentensi, au sauti kwa Gadit (kwa mfano unapotumia &ldquo;Tunga sentensi yako
        mwenyewe&rdquo; au uingizaji wa sauti), unatupa leseni ya ulimwengu mzima, isiyo ya kipekee, na isiyo na mrabaha
        (royalty-free) ya kuchakata maudhui hayo kwa madhumuni ya kutoa Huduma na kuiboresha. Hatudai umiliki wa
        mawasilisho yako.
      </p>

      <h2>7. Miliki bunifu</h2>
      <p>
        Jina la Gadit, nembo, tovuti, na programu za msingi ni mali yetu au mali ya watoaji leseni wetu. Unapewa leseni
        binafsi, inayoweza kubatilishwa, na isiyo ya kipekee ya kutumia Huduma kama inavyoruhusiwa na Masharti haya.
      </p>
      <p>
        Maudhui yanayotengenezwa na Gadit kujibu maingizo yako (fasili, picha, n.k.) yanaweza kutumiwa nawe kwa
        madhumuni binafsi, ya kielimu, au yasiyo ya kibiashara. Kwa matumizi ya kibiashara (kwa mfano katika bidhaa ya
        kulipia), tafadhali wasiliana nasi.
      </p>

      <h2>8. Upatikanaji na mabadiliko</h2>
      <p>
        Tunajitahidi kuhakikisha Huduma inapatikana lakini hatuhakikishi utendaji usiokatizwa au usio na hitilafu.
        Tunaweza kurekebisha, kusimamisha, au kusitisha sehemu yoyote ya Huduma wakati wowote, ikiwa ni pamoja na
        vipengele, bei, au upatikanaji katika maeneo mahususi.
      </p>

      <h2>9. Huduma za wahusika wengine</h2>
      <p>
        Huduma inategemea watoa huduma wengine (ikiwa ni pamoja na OpenAI, Google Firebase, Stripe, na Vercel).
        Upatikanaji au utendaji wao unaweza kuathiri matumizi yako. Dhima yetu imewekewa mipaka na Kifungu cha 11 bila
        kujali matatizo yanayosababishwa na watoa huduma hawa.
      </p>

      <h2>10. Kanusho</h2>
      <p>
        HUDUMA INATOLEWA &ldquo;KAMA ILIVYO&rdquo; NA &ldquo;KADIRI INAVYOPATIKANA&rdquo;, BILA DHAMANA ZA AINA YOYOTE,
        ZIWE ZA WAZI AU ZA KUDHANIWA, IKIWA NI PAMOJA NA, LAKINI SI TU, DHAMANA ZA UFAAFU WA KUUZIKA (MERCHANTABILITY),
        UFAAFU KWA MADHUMUNI MAHUSUSI, NA KUTOKIUKA HAKI ZA WENGINE (NON-INFRINGEMENT).
      </p>

      <h2>11. Kikomo cha dhima</h2>
      <p>
        KWA KIWANGO CHA JUU KABISA KINACHORUHUSIWA NA SHERIA, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC NA MAAFISA,
        WAFANYAKAZI, NA MAWAKALA WAKE HAWATAWAJIBIKA KWA HASARA YOYOTE ISIYO YA MOJA KWA MOJA, YA KITUKIO (INCIDENTAL),
        MAALUM, YA MATOKEO (CONSEQUENTIAL), AU YA KIADHABU (PUNITIVE), AU KWA UPOTEVU WOWOTE WA FAIDA AU MAPATO,
        UNAOTOKANA NA AU UNAOHUSIANA NA MATUMIZI YAKO YA HUDUMA.
      </p>
      <p>
        JUMLA YA DHIMA YETU KWA MADAI YOYOTE YANAYOTOKANA NA AU YANAYOHUSIANA NA HUDUMA HAITAZIDI KIASI KIKUBWA ZAIDI
        KATI YA (A) KIASI ULICHOTULIPA KATIKA MIEZI KUMI NA MIWILI KABLA YA MADAI HAYO, AU (B) USD $100.
      </p>

      <h2>12. Usitishaji</h2>
      <p>
        Unaweza kuacha kutumia Huduma wakati wowote. Tunaweza kusimamisha au kusitisha ufikiaji wako ikiwa utakiuka
        Masharti haya au ikiwa sheria inataka hivyo. Baada ya usitishaji, vifungu ambavyo kwa asili yake vinapaswa
        kuendelea kudumu (ikiwa ni pamoja na Vifungu vya 7, 10, 11, na 14) vitaendelea kutumika.
      </p>

      <h2>13. Mabadiliko ya Masharti haya</h2>
      <p>
        Tunaweza kurekebisha Masharti haya mara kwa mara. Mabadiliko muhimu yatachapishwa kwenye ukurasa huu pamoja na
        tarehe iliyorekebishwa ya &ldquo;Ilisasishwa mwisho&rdquo;. Kuendelea kwako kutumia Huduma baada ya mabadiliko
        kuanza kutumika kunamaanisha kukubali Masharti yaliyosasishwa.
      </p>

      <h2>14. Sheria inayotumika na migogoro</h2>
      <p>
        Masharti haya yanasimamiwa na sheria za Jimbo la Delaware, Marekani, bila kuzingatia kanuni zake za mgongano wa
        sheria (conflict-of-law rules). Mgogoro wowote unaotokana na au unaohusiana na Masharti haya au Huduma utatatuliwa
        pekee katika mahakama za jimbo au za shirikisho zilizoko Delaware, Marekani, na unakubali mamlaka ya mahakama hizo
        juu yako binafsi (personal jurisdiction).
      </p>

      <h2>15. Mawasiliano</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Barua pepe:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
