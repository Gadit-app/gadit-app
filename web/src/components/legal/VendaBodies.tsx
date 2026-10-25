import type { ReactElement } from "react";

export const titlesVe = { privacy: "Mbekanyamaitele ya Tshiphiri", terms: "Milayo ya u Shumisa" };

export function PrivacyBodyVe(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;riṋe&rdquo;, &ldquo;ri&rdquo;, kana &ldquo;-ashu&rdquo;) ndi tshumelo i
        tshimbidzwaho nga <strong>Lavi Learning and Training Technologies LLC</strong>, khamphani yo ṅwaliswaho ngei
        Amerika (United States). Mbekanyamaitele heyi ya Tshiphiri i ṱalutshedza mafhungo ane ra a kuvhanganya, nḓila
        ine ra a shumisa ngayo, na khetho dzine na vha nadzo.
      </p>
      <p>
        Arali ni na mbudziso, ri kwameni kha{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Mafhungo ane ra a kuvhanganya</h2>
      <h3>Mafhungo a akhaunthu</h3>
      <p>
        Musi ni tshi sika akhaunthu, ri kuvhanganya aḓirese yaṋu ya imeiḽi nahone, arali na dzhena nga Google,
        mafhungo a mutheo a phurofaiḽi ane Google a a ṋetshedza (dzina ḽine ḽa sumbedzwa, tshifanyiso tsha
        phurofaiḽi). A ri ṱanganedzi phasiwede yaṋu ya Google.
      </p>
      <h3>Mafhungo a u shumisa</h3>
      <p>Musi ni tshi shumisa Gadit, ri shuma nga:</p>
      <ul>
        <li>maipfi ane na a ṱoḓa na mitaladzo ine na nga i engedza arali na funa;</li>
        <li>zwifanyiso zwo itwaho nga u ya nga khumbelo yaṋu;</li>
        <li>pulane yaṋu ya u ṅwalisa na tshiimo tsha mbadelo;</li>
        <li>ḓivhazwakale ya zwenezwino ya u ṱoḓa (kha vhashumisi vhane vha badela, u swika kha maipfi a 10 a u fhedza), i vhulungwaho uri ni kone u i wana hafhu nga murahu;</li>
        <li>mikano ya ṅwedzi (sa tsumbo, tshivhalo tsha zwifanyiso zwe na zwi ita kha tshifhinga tshino tsha mbadelo).</li>
      </ul>
      <h3>Data ya thekhinikhala na ya mbalo</h3>
      <p>
        Ri kuvhanganya nga u ḓiitela mafhungo a mutheo a thekhinikhala a ngaho aḓirese ya IP, lushaka lwa buraweza,
        lushaka lwa tshishumiswa, URL yo ni rumelaho fhano, na masiaṱari e na a sedza. Hezwi zwi shumiswa kha
        tsireledzo, u sedza kushumele, na mbalo dzo ṱanganyiswaho. Mbalo dzi ṋetshedzwa nga Vercel nahone dzi itwa uri
        dzi sa sumbedze muthu hu hone hune dza kuvhanganyelwa hone (a hu vhulungwi zwiṱalusi zwa muthu). Kha masiaṱari
        ashu a u rengisa, a u ṅwalisa na a mbadelo ri dovha ra shumisa zwishumiswa zwa u ḓivhadza na zwa mbalo, zwo
        ṱalutshedzwaho kha Khethekanyo ya 3.
      </p>
      <h3>Mafhungo a mbadelo</h3>
      <p>
        Arali na ṅwalisa, mbadelo i shumiwa nga <strong>Stripe, Inc.</strong> A ri vhoni nahone a ri vhulungi nomboro
        yoṱhe ya garaṱa yaṋu; ri ṱanganedza fhedzi thokheni ya mukhasimende na mafhungo ane a ṱoḓea u ṱalula u ṅwalisa.
      </p>

      <h2>2. Nḓila ine ra shumisa ngayo mafhungo aṋu</h2>
      <ul>
        <li>u ṋetshedza na u khwinifhadza tshumelo ya Gadit (u ita ṱhalutshedzo, zwifanyiso, nyeletshedzo nga ha mitaladzo, mbudziso dza ndingo);</li>
        <li>u londota akhaunthu yaṋu na u ita uri tshenzhemo yaṋu i ni fanele (ḓivhazwakale ya u ṱoḓa, luambo lune na lu funesa, tshikhethi tsha &ldquo;Tshiimo tsha vhana&rdquo;);</li>
        <li>u shuma nga u ṅwalisa na u rumela dziimeiḽi dza thengiselano (rasiti, tshanduko dza u ṅwalisa);</li>
        <li>u kala na u khwinifhadza kushumele kwa tshibveledzwa na u thivhela u shumiswa nga nḓila i si yone;</li>
        <li>u tevhedza mbofho dza mulayo.</li>
      </ul>
      <p>
        <strong>A ri rengisi</strong> mafhungo aṋu a muthu, nahone a ri shumisi zwiteṅwa zwaṋu u ni ita ṱhaṱhuwedzo
        dza zwithu.
      </p>

      <h2>3. Tshumelo dza vhaṅwe vhaṋetshedzi dzine ra dzi shumisa</h2>
      <p>
        Gadit i ḓitika nga vhashumi vha mafhungo vha tevhelaho. Muṅwe na muṅwe wavho u ṱanganedza fhedzi mafhungo
        maṱuku ane a ṱoḓea u ṋetshedza tshumelo yo teaho:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>, i shuma nga maipfi na mitaladzo ine na i rumela u ita ṱhalutshedzo, nyeletshedzo nga
          ha mitaladzo, mbudziso dza ndingo, na u ṅwala zwo ambiwaho (Whisper), nahone i ita zwifanyiso (DALL·E 3).
          Data i rumelwaho kha OpenAI i langwa nga mbekanyamaitele ya OpenAI ya u shumiswa ha data ya API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage), i vhulunga akhaunthu yaṋu,
          phurofaiḽi, tshiimo tsha u ṅwalisa, ḓivhazwakale ya u ṱoḓa, na zwifanyiso zwo itwaho.
        </li>
        <li>
          <strong>Stripe</strong>, i lavhelesa mbadelo, u ṅwalisa, na siaṱari ḽa u langa mbadelo (billing portal).
        </li>
        <li>
          <strong>Vercel</strong>, i fara na u ṋetshedza webusaithi, nahone i ṋetshedza mbalo dzi sa sumbedzi muthu na
          u kala kushumele.
        </li>
        <li>
          <strong>U ḓivhadza na mbalo</strong>, Meta (Meta Pixel), Google Analytics na TikTok (TikTok Pixel na Events
          API) zwi kala madalo na mvelelo dza nḓivhadzo dzashu. Zwi shumisa dzikhukhi (cookies) na thekhinolodzhi dzi
          fanaho kha masiaṱari ashu a u rengisa, a u ṅwalisa na a mbadelo. Musi ni tshi ṅwalisa kana ni tshi badela,
          ri nga rumela kha tshumelo idzi aḓirese ya imeiḽi na ID ya akhaunthu zwo khouḓiwaho nga nḓila ya thungo
          nthihi (hash), khathihi na aḓirese yaṋu ya IP na zwidodombedzwa zwa buraweza yaṋu, fhedzi u kala nḓivhadzo
          dzashu. A ri vhuyi ra dzi rumela mafhungo naa ḽithihi nga ha vhana, nahone zwishumiswa izwi a zwi shumi kha
          zwikirini zwine vhana vha zwi shumisa.
        </li>
      </ul>

      <h2>4. Ri vhulunga mafhungo aṋu lwa tshifhinga tshingafhani</h2>
      <ul>
        <li>Mafhungo a akhaunthu: musi akhaunthu yaṋu i tshi kha ḓi vha hone.</li>
        <li>Ḓivhazwakale ya u ṱoḓa: u ṱoḓa hu 10 ha u fhedza kha mushumisi muṅwe na muṅwe, hu tshi vusuluswa nga u ṱoḓa huswa huṅwe na huṅwe.</li>
        <li>Zwifanyiso zwo itwaho: zwi a vhulungwa uri ipfi na ṱhalutshedzo zwi fanaho zwi kone u shumisa hafhu tshifanyiso tsho vhulungwaho. Zwi nga vhulungwa lwa tshifhinga tshi sa fheli arali akhaunthu yaṋu i tshi kha ḓi shuma.</li>
        <li>Rekhodo dza mbadelo na dza muthelo: u ya nga zwine mulayo u shumaho wa zwi ṱoḓa (kanzhi miṅwaha ya 7).</li>
        <li>Data ya mbalo: yo ṱanganyiswaho, kanzhi i vhulungwa nga muṋetshedzi wa mbalo lwa miṅwedzi ya 13.</li>
      </ul>

      <h2>5. Pfanelo dzaṋu</h2>
      <p>U ya nga hune na dzula hone, ni nga vha na pfanelo ya u:</p>
      <ul>
        <li>humbela u swikelela mafhungo aṋu a muthu ane ra vha nao;</li>
        <li>humbela uri mafhungo a si a vhukuma a khwiniswe;</li>
        <li>humbela uri akhaunthu yaṋu na data i elanaho nayo zwi phumulwe;</li>
        <li>bvisa data yaṋu nga tshivhumbeo tshi pfukiselwaho;</li>
        <li>hanedza kana u pimela mashumisele maṅwe a mafhungo aṋu;</li>
        <li>hana u kovhekana huṅwe ha data (hune zwa shuma hone nga fhasi ha CCPA kana milayo i fanaho).</li>
      </ul>
      <p>
        U shumisa pfanelo iṅwe na iṅwe yadzo, rumelani imeiḽi kha{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Ri ḓo fhindula hu saathu
        u fhela maḓuvha a 30.
      </p>

      <h2>6. Tsireledzo</h2>
      <p>
        Ri shumisa maitele a tsireledzo a ndeme ya indasiṱiri, vhukwamani ho dzumbiwaho nga khoudu (HTTPS), dzi-API
        dzo khwaṱhisedzwaho, na ndango ya u swikelela, u tsireledza mafhungo aṋu. A hu na nḓila ya u rumela kana u
        vhulunga kha inthanete yo tsireledzeaho nga 100%, ngauralo a ri koni u khwaṱhisedza tsireledzo yo fhelelaho,
        fhedzi ri shuma tshifhinga tshoṱhe u fhungudza khombo.
      </p>

      <h2>7. Vhana</h2>
      <p>
        Gadit a yo livhiswa kha vhana vha re fhasi ha miṅwaha ya 13. Arali ni tshi tenda uri ṅwana a re fhasi ha
        miṅwaha ya 13 o sika akhaunthu, ri rumeleni imeiḽi nahone ri ḓo phumula akhaunthu na data i elanaho nayo.
      </p>

      <h2>8. Vhashumisi vha mashango a nnḓa</h2>
      <p>
        Gadit i tshimbidzwa i ngei Amerika (United States). Arali ni tshi swikelela tshumelo ni nnḓa ha Amerika,
        mafhungo aṋu a ḓo pfukiselwa, a vhulungwa, na u shumiwa ngei Amerika na kha zwipiḓa zwa zwikhala zwa data
        (data-center) zwine zwa shumiswa nga vhaṋetshedzi vhashu vha tshumelo.
      </p>

      <h2>9. Tshanduko kha mbekanyamaitele heyi</h2>
      <p>
        Ri nga vusulusa Mbekanyamaitele heyi ya Tshiphiri tshifhinga tshiṅwe na tshiṅwe. Tshanduko khulwane dzi ḓo
        andadzwa kha siaṱari iḽi hu na ḓuvha ḽiswa ḽa &ldquo;Tshifhinga tsha u vusuluswa&rdquo;. U bvela phanḓa ha u
        shumisa Gadit nga murahu ha musi tshanduko dzo thoma u shuma zwi amba uri no ṱanganedza mbekanyamaitele yo
        vusuluswaho.
      </p>

      <h2>10. Vhukwamani</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeiḽi:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyVe(): ReactElement {
  return (
    <>
      <p>
        Ni a ṱanganedzwa kha Gadit. Milayo heyi ya u Shumisa (&ldquo;Milayo&rdquo;) i langa u swikelela haṋu na u
        shumisa haṋu webusaithi, apulikheisheni, na tshumelo dza Gadit (zwoṱhe zwi tshi ṱanganywa,
        &ldquo;Tshumelo&rdquo;), zwi tshimbidzwaho nga{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;riṋe&rdquo;, &ldquo;ri&rdquo;, kana
        &ldquo;-ashu&rdquo;). Nga u shumisa Tshumelo ni a tenda u vhofhiwa nga Milayo heyi. Arali ni sa tendi, ni songo
        shumisa Tshumelo.
      </p>

      <h2>1. Ndi nnyi ane a nga shumisa Gadit</h2>
      <p>
        Ni fanela u vha ni na miṅwaha ya 13 kana u fhira u itela u sika akhaunthu. Arali ni na miṅwaha i re vhukati ha
        13 na 18, ni fanela u vha na thendelo ya mubebi kana muṱhogomeli o tendelwaho nga mulayo. Nga u shumisa Gadit
        ni khou sumbedza uri ni swikelela zwiṱoḓwa zwenezwi.
      </p>

      <h2>2. Akhaunthu yaṋu</h2>
      <p>
        Ni na vhuḓifhinduleli ha u vhulunga zwidodombedzwa zwaṋu zwa u dzhena zwi tshiphiri na ha zwoṱhe zwine zwa
        itea nga fhasi ha akhaunthu yaṋu. Ri ḓivhadzeni nga u ṱavhanya kha{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> arali ni tshi tenda uri
        tsireledzo ya akhaunthu yaṋu yo tshinyadzwa.
      </p>

      <h2>3. U ṅwalisa na mbadelo</h2>
      <h3>Pulane na mbadelo</h3>
      <p>
        Gadit i ṋetshedza pulane ya Basic ya mahala na pulane dzine dza badelwa (Clear na Deep) dzi na zwiteṅwa na
        mitengo yo ṅwalwaho kha siaṱari ḽa mitengo. Mitengo yo ṅwalwa nga USD nahone i nga shandukiswa nga nḓivhadzo
        ya maḓuvha a 30 kana u fhira kha vho no ṅwalisaho.
      </p>
      <h3>U vusuluswa nga u ḓiitela</h3>
      <p>
        U ṅwalisa hune ha badelwa hu vusuluswa nga u ḓiitela magumoni a tshifhinga tshiṅwe na tshiṅwe tsha mbadelo
        (nga ṅwedzi kana nga ṅwaha, u ya nga zwe zwa nangwa) nga mutengo u shumaho nga tshenetsho tshifhinga, nga nnḓa
        ha musi ho khanselwa hu saathu u swika ḓuvha ḽa u vusulusa.
      </p>
      <h3>U khansela</h3>
      <p>
        Ni nga khansela tshifhinga tshiṅwe na tshiṅwe kha siaṱari ḽa akhaunthu yaṋu. U khansela hu imisa u vusuluswa
        ha tshifhinga tshi ḓaho. Ni ḓo bvela phanḓa ni tshi swikelela zwiteṅwa zwine zwa badelwa u swika magumoni a
        tshifhinga tsha zwino tsha mbadelo. A ri vhuedzedzi tshipiḓa tsha tshelede tsha tshifhinga tshi songo
        shumiswaho.
      </p>
      <h3>U vhuedzedzwa ha tshelede</h3>
      <p>
        Nga nnḓa ha hune mulayo wa zwi ṱoḓa, mbadelo a dzi vhuedzedzwi. Arali ni tshi tenda uri no badeliswa nga
        vhukhakhi, ri kwameni kha{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> hu saathu u fhela maḓuvha a
        30 u bva musi no badeliswa.
      </p>

      <h2>4. U shumisa ho teaho</h2>
      <p>Ni a tenda u sa:</p>
      <ul>
        <li>shumisa Tshumelo nga ndivho i si ya mulayo kana nga nḓila i pfukaho mulayo muṅwe na muṅwe;</li>
        <li>lingedza u ṱoḓulusa nḓila ye Tshumelo ya fhaṱiwa ngayo (reverse-engineer), u shandukisa khoudu yayo (decompile), kana u bvisa khoudu ya tshisima ya Tshumelo;</li>
        <li>tambudza, shushedza, kana u huvhadza vhaṅwe vhashumisi, kana u rumela zwithu zwa vengo, zwa u ofhisa, kana zwi si zwa vhuḓifari;</li>
        <li>shumisa mitshini u swikelela Tshumelo u fhira u shumisa ha muthu hu pfalaho (sa tsumbo, u dzhia ṱhalutshedzo nga vhunzhi nga mitshini);</li>
        <li>tshila mikano ya tshivhalo tsha u shumisa (rate limits) kana mikano ya pulane, kana u shumisa akhaunthu nnzhi u itela u tshila mikano;</li>
        <li>shumisa Tshumelo u gudisa kana u khwinifhadza (fine-tune) modeḽe iṅwe na iṅwe ya AI kana tshibveledzwa tsha ḓikishinari zwine zwa vhambadzana nashu;</li>
        <li>apuḽouda kana u rumela zwithu zwine na si vhe na pfanelo ya u zwi rumela.</li>
      </ul>
      <p>
        Ri na pfanelo ya u imisa kana u fhelisa akhaunthu dzine dza pfuka Milayo heyi.
      </p>

      <h2>5. Zwiteṅwa zwo itwaho nga AI</h2>
      <p>
        Gadit i shumisa modeḽe dza vhuṱali ho itwaho (artificial intelligence) (hu tshi katelwa GPT, Whisper, na DALL·E
        zwa OpenAI) u ita ṱhalutshedzo, tsumbo, mathomo a maipfi (etymology), nyeletshedzo, mbudziso dza ndingo,
        zwifanyiso, na u ṅwala zwo ambiwaho. Ni a pfesesa nahone ni a tenda uri:
      </p>
      <ul>
        <li>
          Zwine AI ya zwi bveledza zwi nga <strong>vha zwi si zwa vhukuma, zwi sa fheleli, kana zwi sa fanelei</strong>.
          Gadit yo itelwa u vha tshishumiswa tsha u guda nahone a i fanelwi u ḓitikwa ngayo kha phetho dza mulayo, dza
          zwa mutakalo, dza mushumo, kana dza zwa pfunzo.
        </li>
        <li>
          Ṱhalutshedzo dzo itwaho nga AI dzi nga fhambana na dziḓikishinari dza tshiofisi. A ri khwaṱhisedzi uri
          ṱhalutshedzo iṅwe na iṅwe i na maanḓa a vhulangi kha zwa luambo.
        </li>
        <li>
          Zwifanyiso zwi itwa nga dzialgorithimu nahone zwiṅwe zwifhinga zwi nga vha zwi songo lavhelelwaho kana zwi
          sa ṱalutshedzi zwavhuḓi. Ndi zwifanyiso zwa u ṱalutshedza, a si u sumbedza tshithu nga hune tsha vha ngaho.
        </li>
        <li>
          Ndi inwi fhedzi ane na vha na vhuḓifhinduleli ha nḓila ine na pfesesa ngayo na u shumisa zwiteṅwa zwo itwaho
          nga AI.
        </li>
      </ul>

      <h2>6. Zwiteṅwa zwaṋu</h2>
      <p>
        Musi ni tshi rumela maipfi, mitaladzo, kana zwo rekhodiwaho zwa ipfi kha Gadit (sa tsumbo musi ni tshi shumisa
        &ldquo;Ṅwalani mutaladzo waṋu&rdquo; kana u dzhenisa nga ipfi), ni ri ṋea laisentsi ya shango ḽoṱhe, i si ya
        riṋe fhedzi (non-exclusive), i sa badelelwi (royalty-free) ya u shuma nga zwenezwo zwiteṅwa u itela u ṋetshedza
        Tshumelo na u i khwinifhadza. A ri ambi uri ri vhaṋe vha zwine na zwi rumela.
      </p>

      <h2>7. Ndaka ya ṱhalukanyo</h2>
      <p>
        Dzina ḽa Gadit, logo, webusaithi, na sofuthiwea i re ngomu ndi ndaka yashu kana ya vhane vha ri ṋea laisentsi.
        Ni ṋewa laisentsi ya inwi muṋe, i nga dzhiiwaho (revocable), i si yaṋu fhedzi, ya u shumisa Tshumelo nga nḓila
        yo tendelwaho nga Milayo heyi.
      </p>
      <p>
        Zwiteṅwa zwo itwaho nga Gadit sa phindulo kha zwe na zwi dzhenisa (ṱhalutshedzo, zwifanyiso, zwiṅwe-vho) ni nga
        zwi shumisa nga ndivho dzaṋu dza muthu, dza pfunzo, kana dzi si dza vhubindudzi. Kha u shumisa ha vhubindudzi
        (sa tsumbo kha tshibveledzwa tshine tsha badelwa), ri humbela ni ri kwame.
      </p>

      <h2>8. U wanala na tshanduko</h2>
      <p>
        Ri lwela u ita uri Tshumelo i wanale fhedzi a ri khwaṱhisedzi uri i ḓo shuma hu si na u ima kana hu si na
        vhukhakhi. Ri nga shandukisa, ra imisa, kana ra fhelisa tshipiḓa tshiṅwe na tshiṅwe tsha Tshumelo tshifhinga
        tshiṅwe na tshiṅwe, hu tshi katelwa zwiteṅwa, mitengo, kana u wanala kha zwipiḓa zwo khetheaho.
      </p>

      <h2>9. Tshumelo dza vhaṅwe vhaṋetshedzi</h2>
      <p>
        Tshumelo i ḓitika nga vhaṋetshedzi vhaṅwe (hu tshi katelwa OpenAI, Google Firebase, Stripe, na Vercel). U
        wanala havho kana maitele avho zwi nga kwama tshenzhemo yaṋu. Vhuḓifhinduleli hashu ho pimelwa nga Khethekanyo
        ya 11 hu sa londwi thaidzo dzine dza vhangwa nga avho vhaṋetshedzi.
      </p>

      <h2>10. U hana vhuḓifhinduleli</h2>
      <p>
        TSHUMELO I ṊETSHEDZWA &ldquo;NGA HUNE YA VHA NGAHO&rdquo; NA &ldquo;NGA HUNE YA WANALA NGAHO&rdquo;, HU SI NA
        KHWAṰHISEDZO DZA LUSHAKA LUṄWE NA LUṄWE, DZO AMBIWAHO KANA DZI PFESESEAHO, HU TSHI KATELWA, FHEDZI HU SA
        PIMELWI KHA, KHWAṰHISEDZO DZA U RENGISEA (MERCHANTABILITY), U FANELA NDIVHO YO KHETHEAHO (FITNESS FOR A
        PARTICULAR PURPOSE), NA U SA PFUKA PFANELO DZA VHAṄWE (NON-INFRINGEMENT).
      </p>

      <h2>11. Mukano wa vhuḓifhinduleli</h2>
      <p>
        U SWIKA HUNE MULAYO WA TENDELA HONE ZWOṰHE, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC NA VHAOFISIRI, VHASHUMI,
        NA VHAIMELELI VHAYO A VHA NGA ḒO VHA NA VHUḒIFHINDULELI KHA TSHINYALELO TSHIṄWE NA TSHIṄWE TSHI SI TSHA
        NGA HO LIVHAHO, TSHA TSHIWO, TSHO KHETHEAHO, TSHI TEVHELAHO, KANA TSHA U ṰHAṰHUWA (INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES), KANA KHA U XELELWA NGA PHUROFITHI KANA NGA MBUELO, ZWI BVAHO KANA ZWI
        ELANAHO NA U SHUMISA HAṊU TSHUMELO.
      </p>
      <p>
        VHUḒIFHINDULELI HASHU HOṰHE KHA MBILAELO IṄWE NA IṄWE I BVAHO KANA I ELANAHO NA TSHUMELO A HU NGA FHIRI
        TSHIVHALO TSHIHULWANE KHA ZWI TEVHELAHO: (A) TSHELEDE YE NA I RI BADELA KHA MIṄWEDZI YA FUMI NA MIVHILI YO
        TANGAHO MBILAELO, KANA (B) USD $100.
      </p>

      <h2>12. U fheliswa</h2>
      <p>
        Ni nga litsha u shumisa Tshumelo tshifhinga tshiṅwe na tshiṅwe. Ri nga imisa kana ra fhelisa u swikelela haṋu
        arali na pfuka Milayo heyi kana arali mulayo wa zwi ṱoḓa. Musi zwo fheliswa, mbetshelo dzine nga mbuno yadzo
        dza fanela u bvela phanḓa (hu tshi katelwa Khethekanyo dza 7, 10, 11, na 14) dzi ḓo bvela phanḓa dzi tshi shuma.
      </p>

      <h2>13. Tshanduko kha Milayo heyi</h2>
      <p>
        Ri nga vusulusa Milayo heyi tshifhinga tshiṅwe na tshiṅwe. Tshanduko khulwane dzi ḓo andadzwa kha siaṱari iḽi
        hu na ḓuvha ḽiswa ḽa &ldquo;Tshifhinga tsha u vusuluswa&rdquo;. U bvela phanḓa ha u shumisa Tshumelo nga murahu
        ha musi tshanduko dzo thoma u shuma zwi amba uri no ṱanganedza Milayo yo vusuluswaho.
      </p>

      <h2>14. Mulayo une wa langa na khani</h2>
      <p>
        Milayo heyi i langwa nga milayo ya Vunḓu ḽa Delaware, Amerika (United States), hu sa sedzwi milayo yaḽo ya u
        khetha mulayo une wa shuma (conflict-of-law rules). Khani iṅwe na iṅwe i bvaho kana i elanaho na Milayo heyi
        kana Tshumelo i ḓo tandululwa fhedzi kha khothe dza vunḓu kana dza muvhuso wa federala dzi re ngei Delaware,
        Amerika (United States), nahone ni a tenda uri khothe idzo dzi vhe na maanḓa a u haṱula nga ha inwi (personal
        jurisdiction).
      </p>

      <h2>15. Vhukwamani</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeiḽi:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
