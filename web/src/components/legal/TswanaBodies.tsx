import type { ReactElement } from "react";

export const titlesTn = { privacy: "Pholisi ya Sephiri", terms: "Melawana ya Tiriso" };

export function PrivacyBodyTn(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;rona&rdquo;, kgotsa &ldquo;ya rona&rdquo;) ke tirelo e e tsamaisiwang ke{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, khampani e e kwadisitsweng kwa United States.
        Pholisi eno ya Sephiri e tlhalosa gore re kokoanya tshedimosetso efe, re e dirisa jang, le ditlhopho tse o nang
        le tsone.
      </p>
      <p>
        Fa o na le potso epe, ikgolaganye le rona kwa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Tshedimosetso e re e kokoanyang</h2>
      <h3>Tshedimosetso ya akhaonto</h3>
      <p>
        Fa o bula akhaonto, re kokoanya aterese ya gago ya imeile mme, fa o tsena ka Google, re kokoanya tshedimosetso
        ya motheo ya porofaele e Google e e neelang (leina le le bonagalang, setshwantsho sa porofaele). Ga re amogele
        lefoko la sephiri la gago la Google.
      </p>
      <h3>Tshedimosetso ya tiriso</h3>
      <p>Fa o dirisa Gadit, re tsamaisa tshedimosetso e e latelang:</p>
      <ul>
        <li>mafoko a o a batlang le dipolelo tse o ka di tsenyang fa o rata;</li>
        <li>ditshwantsho tse di dirilweng ka kopo ya gago;</li>
        <li>leano la gago la ikwadiso (subscription) le maemo a gago a go duela;</li>
        <li>hisetori ya bosheng ya dipatlo (mo badirising ba ba duelang, go fitlha mo mafokong a le 10 a bofelo), e e bolokwang gore o kgone go e bona gape moragonyana;</li>
        <li>dikabelo tsa kgwedi (ka sekai, palo ya ditshwantsho tse o di dirileng mo nakong eno ya jaanong ya go duela).</li>
      </ul>
      <h3>Data ya setegeniki le ya tshekatsheko</h3>
      <p>
        Re kokoanya ka boyone tshedimosetso ya motheo ya setegeniki jaaka aterese ya IP, mofuta wa sebatli (browser),
        mofuta wa sedirisiwa, URL e e go romileng, le ditsebe tse o di lebileng. Se se dirisetswa pabalesego, go
        tlhokomela tiragatso, le tshekatsheko ya dipalopalo tse di kopantsweng. Tshekatsheko e neelwa ke Vercel mme e
        dirwa gore e se supe motho mo nakong ya go kokoanngwa (ga go na ditshupo tsa motho tse di bolokwang). Mo
        ditsebeng tsa rona tsa papatso, tsa ikwadiso le tsa tuelo re dirisa gape didirisiwa tsa papatso le
        tshekatsheko, tse di tlhalositsweng mo Karolong 3.
      </p>
      <h3>Tshedimosetso ya tuelo</h3>
      <p>
        Fa o ikwadisa, tuelo e tsamaisiwa ke <strong>Stripe, Inc.</strong> Ga re bone kgotsa go boloka nomoro yotlhe
        ya karata ya gago; re amogela fela tokene ya moreki le data ya tlhaloso (metadata) e e tlhokegang go supa
        ikwadiso.
      </p>

      <h2>2. Ka moo re dirisang tshedimosetso ya gago ka teng</h2>
      <ul>
        <li>go neela le go tokafatsa tirelo ya Gadit (go dira ditlhaloso, ditshwantsho, maikutlo ka dipolelo, le diteko);</li>
        <li>go tlhokomela akhaonto ya gago le go dira gore maitemogelo a gago a go tshwanele (hisetori ya dipatlo, puo e o e ratang, sefetoledi sa &ldquo;Mokgwa wa bana&rdquo;);</li>
        <li>go tsamaisa diikwadiso le go romela diimeile tsa ditirisano (dirasiti, diphetogo tsa ikwadiso);</li>
        <li>go lekanya le go tokafatsa tiragatso ya setlhagiswa le go thibela tiriso e e sa siamang;</li>
        <li>go obamela ditlamelo tsa semolao.</li>
      </ul>
      <p>
        <strong>Ga re rekise</strong> tshedimosetso ya gago ya botho, mme ga re dirise diteng tsa gago go go
        bapatsetsa.
      </p>

      <h2>3. Ditirelo tsa batho ba boraro tse re di dirisang</h2>
      <p>
        Gadit e ikaegile ka batlamedi ba ditirelo ba ba latelang ba ba tsamaisang data. Mongwe le mongwe wa bone o
        amogela fela tshedimosetso e e potlana thata e e tlhokegang go neela tirelo e e amegang:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>, e tsamaisa mafoko le dipolelo tse o di romelang go dira ditlhaloso, maikutlo ka
          dipolelo, diteko, le go kwalolola se se buiwang (Whisper), mme e dira ditshwantsho (DALL·E 3). Data e e
          romelwang kwa OpenAI e laolwa ke pholisi ya OpenAI ya tiriso ya data ya API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage), e boloka akhaonto ya gago,
          porofaele, maemo a ikwadiso, hisetori ya dipatlo, le ditshwantsho tse di dirilweng.
        </li>
        <li>
          <strong>Stripe</strong>, e tsamaisa dituelo, diikwadiso, le potale ya go duela.
        </li>
        <li>
          <strong>Vercel</strong>, e tshwara le go tlamela webosaete, mme e neela tshekatsheko e e sa supeng motho le
          tekanyo ya tiragatso.
        </li>
        <li>
          <strong>Papatso le tshekatsheko</strong>, Meta (Meta Pixel), Google Analytics le TikTok (TikTok Pixel le
          Events API) di lekanya diketelo le dipoelo tsa dipapatso tsa rona. Di dirisa dikhukhi (cookies) le
          thekenoloji e e tshwanang mo ditsebeng tsa rona tsa papatso, tsa ikwadiso le tsa tuelo. Fa o ikwadisa kgotsa
          o duela, re ka romela ditirelo tse aterese ya imeile le ID ya akhaonto tse di khoutilweng ka tsela ya
          lehlakore le le lengwe (hash), mmogo le aterese ya gago ya IP le dintlha tsa sebatli sa gago, fela go
          lekanya dipapatso tsa rona. Ga re ke re di romelela tshedimosetso epe ka bana, mme didirisiwa tse ga di dire
          mo disekirining tse bana ba di dirisang.
        </li>
      </ul>

      <h2>4. Re boloka tshedimosetso ya gago lobaka lo lo kae</h2>
      <ul>
        <li>Tshedimosetso ya akhaonto: fa fela akhaonto ya gago e sa ntse e le teng.</li>
        <li>Hisetori ya dipatlo: dipatlo di le 10 tsa bofelo mo modirising mongwe le mongwe, e ntšhafadiwa ka patlo nngwe le nngwe e ntšha.</li>
        <li>Ditshwantsho tse di dirilweng: di a bolokwa gore lefoko le bokao tse di tshwanang (lefoko+bokao) di kgone go dirisa gape setshwantsho se se bolokilweng. Di ka bolokwa ka bosakhutleng fa fela akhaonto ya gago e santse e dira.</li>
        <li>Direkoto tsa dituelo le tsa lekgetho: jaaka molao o o dirang o tlhoka (gantsi dingwaga di le 7).</li>
        <li>Data ya tshekatsheko: e kopantswe, gantsi e bolokwa ke motlamedi wa tshekatsheko dikgwedi di le 13.</li>
      </ul>

      <h2>5. Ditshwanelo tsa gago</h2>
      <p>Go ya ka kwa o nnang teng, o ka nna le tshwanelo ya go:</p>
      <ul>
        <li>kopa go bona tshedimosetso ya botho e re e tshwereng ka ga gago;</li>
        <li>kopa gore tshedimosetso e e sa nepagalang e baakanngwe;</li>
        <li>kopa gore akhaonto ya gago le data e e amanang le yone di phimolwe;</li>
        <li>ntsha data ya gago ka sebopego se se ka fetisediwang gongwe;</li>
        <li>ganetsa kgotsa go lekanyetsa ditiriso dingwe tsa tshedimosetso ya gago;</li>
        <li>gana go abalanngwa ga data mongwe (fa go dira ka fa tlase ga CCPA kgotsa melao e e tshwanang).</li>
      </ul>
      <p>
        Go dirisa nngwe ya ditshwanelo tseno, romela imeile kwa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Re tla araba mo malatsing
        a le 30.
      </p>

      <h2>6. Pabalesego</h2>
      <p>
        Re dirisa ditshireletso tsa maemo a intaseteri, e leng dikgolagano tse di kwadilweng ka khoutu (HTTPS), di-API
        tse di netefaditsweng, le taolo ya phitlhelelo, go sireletsa tshedimosetso ya gago. Ga go na mokgwa wa go
        romela kgotsa go boloka mo inthaneteng o o babalesegileng ka 100%, ka jalo ga re kgone go tlhomamisa pabalesego
        e e feletseng, mme re dira ka metlha go fokotsa kotsi.
      </p>

      <h2>7. Bana</h2>
      <p>
        Gadit ga e lebisiwe kwa baneng ba ba ka fa tlase ga dingwaga di le 13. Fa o dumela gore ngwana yo o ka fa tlase
        ga dingwaga di le 13 o butse akhaonto, re romelele imeile mme re tla phimola akhaonto le data e e amanang le
        yone.
      </p>

      <h2>8. Badirisi ba boditšhabatšhaba</h2>
      <p>
        Gadit e tsamaisiwa go tswa kwa United States. Fa o tsena mo tirelong o le kwa ntle ga United States,
        tshedimosetso ya gago e tla fetisediwa, ya bolokwa, mme ya tsamaisiwa kwa United States le mo dikgaolong tsa
        ditsenta tsa data tse di dirisiwang ke batlamedi ba rona ba ditirelo.
      </p>

      <h2>9. Diphetogo mo pholising eno</h2>
      <p>
        Re ka ntšhafatsa Pholisi eno ya Sephiri nako le nako. Diphetogo tse di botlhokwa di tla phasaladiwa mo tsebeng
        eno, mme letlha la &ldquo;E ntšhafaditswe la bofelo&rdquo; le tla fetolwa. Fa o tswelela go dirisa Gadit morago
        ga gore diphetogo di simolole go dira, seo se supa gore o amogela pholisi e e ntšhafaditsweng.
      </p>

      <h2>10. Ikgolaganye le rona</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeile:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyTn(): ReactElement {
  return (
    <>
      <p>
        O amogetswe mo Gadit. Melawana eno ya Tiriso (&ldquo;Melawana&rdquo;) e laola go tsena ga gago le tiriso ya
        gago ya webosaete ya Gadit, diapolikeišene, le ditirelo (tsotlhe mmogo, &ldquo;Tirelo&rdquo;), tse di
        tsamaisiwang ke{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;rona&rdquo; kgotsa &ldquo;ya rona&rdquo;).
        Ka go dirisa Tirelo, o dumela go bofiwa ke Melawana eno. Fa o sa dumele, o se ka wa dirisa Tirelo.
      </p>

      <h2>1. Ke mang yo o ka dirisang Gadit</h2>
      <p>
        O tshwanetse go bo o na le bonnye dingwaga di le 13 go bula akhaonto. Fa o le magareng ga dingwaga di le 13 le
        18, o tshwanetse go nna le tetla ya motsadi kgotsa mosireletsi wa semolao. Ka go dirisa Gadit, o tlhomamisa
        gore o fitlhelela ditlhokego tseno.
      </p>

      <h2>2. Akhaonto ya gago</h2>
      <p>
        O na le maikarabelo a go boloka dintlha tsa gago tsa go tsena di le sephiri le a ditiro tsotlhe tse di
        diragalang ka fa tlase ga akhaonto ya gago. Re itsise ka bonako kwa{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> fa o dumela gore akhaonto ya
        gago e tsenwe ke motho yo o sa letlelelwang.
      </p>

      <h2>3. Diikwadiso le go duelisa</h2>
      <h3>Maano le dituelo</h3>
      <p>
        Gadit e neela leano la Basic le le sa duelelweng le maano a a duelelwang (Clear le Deep) a a nang le dikarolo le
        ditlhwatlhwa tse di kwadilweng mo tsebeng ya ditlhwatlhwa. Ditlhwatlhwa di kwalwa ka USD mme di ka fetolwa ka
        kitsiso ya bonnye malatsi a le 30 go baikwadisi ba ba leng teng.
      </p>
      <h3>Ntšhafatso ka boyone</h3>
      <p>
        Diikwadiso tse di duelelwang di ntšhafadiwa ka boyone kwa bofelong jwa nako nngwe le nngwe ya go duela (kgwedi
        le kgwedi kgotsa ngwaga le ngwaga, go ya ka se se tlhophilweng) ka tlhwatlhwa e e dirang ka nako eo, ntle le fa
        di khanseletswe pele ga letlha la ntšhafatso.
      </p>
      <h3>Go khansela</h3>
      <p>
        O ka khansela nako nngwe le nngwe go tswa mo tsebeng ya akhaonto ya gago. Go khansela go emisa dintšhafatso
        tsa isagweng. O tla nna o na le phitlhelelo ya dikarolo tse di duelelwang go fitlha kwa bofelong jwa nako ya
        jaanong ya go duela. Ga re busetse madi a karolo ya nako e e sa dirisiwang.
      </p>
      <h3>Dipusetso tsa madi</h3>
      <p>
        Ntle le fa molao o tlhoka jalo, dituelo ga di busediwe. Fa o dumela gore o duedisitswe ka phoso, ikgolaganye
        le{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> mo malatsing a le 30 go tloga
        ka letlha la go duedisiwa.
      </p>

      <h2>4. Tiriso e e amogelesegang</h2>
      <p>O dumela gore o ka se:</p>
      <ul>
        <li>dirise Tirelo ka maikaelelo ape a a seng mo molaong kgotsa ka go tlola molao ope;</li>
        <li>leke go dira boenjenere jwa go boela morago (reverse-engineer), go dikhompaela, kgotsa go ntsha khoutu ya motswedi ya Tirelo;</li>
        <li>sotle, tshwenye, kgotsa gobatse badirisi ba bangwe, kgotsa romele diteng tsa letlhoo, tsa go tshosetsa, kgotsa tsa matlhabisaditlhong;</li>
        <li>dire gore go tsena mo Tirelong go diragale ka boyone go feta tiriso e e utlwalang ya motho ka namana (ka sekai, go kgobokanya ditlhaloso ka bontsi);</li>
        <li>potologe melelwane ya palo ya dikopo kgotsa dikganelo tsa leano, kgotsa dirise diakhaonto di le dintsi go tila dikabelo;</li>
        <li>dirise Tirelo go katisa kgotsa go tokafatsa ka botlalo (fine-tune) sekao sepe sa AI kgotsa setlhagiswa sa thanodi se se gaisanang;</li>
        <li>tsenye kgotsa romele diteng tse o se nang tshwanelo ya go di romela.</li>
      </ul>
      <p>
        Re ipolokela tshwanelo ya go emisa ka nakwana kgotsa go fedisa diakhaonto tse di tlolang Melawana eno.
      </p>

      <h2>5. Diteng tse di tlhagisitsweng ke AI</h2>
      <p>
        Gadit e dirisa dikao tsa botlhale jwa maitirelo (go akaretsa GPT, Whisper, le DALL·E tsa OpenAI) go tlhagisa
        ditlhaloso, dikai, ditso tsa mafoko, maikutlo, diteko, ditshwantsho, le dikwalololo. O a tlhaloganya mme o
        dumela gore:
      </p>
      <ul>
        <li>
          Dipoelo tsa AI di ka nna <strong>tse di sa nepagalang, tse di sa feletseng, kgotsa tse di sa
          tshwanelang</strong>. Gadit e diretswe go nna sethusi sa go ithuta mme ga e a tshwanela go ikaegiwa ka yone
          mo ditshwetsong tsa semolao, tsa kalafi, tsa porofešene, kgotsa tsa thuto.
        </li>
        <li>
          Ditlhaloso tse di tlhagisitsweng ke AI di ka farologana le dithanodi tsa semmuso. Ga re tlhomamise gore
          tlhaloso nngwe le nngwe e na le taolo go ya ka thutapuo.
        </li>
        <li>
          Ditshwantsho di tlhagisiwa ka alekoritimi mme ka dinako dingwe di ka nna tse di sa solofelwang kgotsa tse di
          sa nepagalang. Ke ditshwantsho tsa go tlhalosa, e seng ditshwantsho tsa mmatota tsa se se tlhalosiwang.
        </li>
        <li>
          Ke wena fela yo o nang le maikarabelo a gore o tlhaloganya le go dirisa jang diteng tse di tlhagisitsweng ke
          AI.
        </li>
      </ul>

      <h2>6. Diteng tsa gago</h2>
      <p>
        Fa o romela mafoko, dipolelo, kgotsa modumo kwa Gadit (ka sekai fa o dirisa &ldquo;Kwala polelo ya gago&rdquo;
        kgotsa go tsenya ka lentswe), o re naya laesense ya lefatshe lotlhe, e e seng ya bosi (non-exclusive), e e sa
        duelelweng ditshwanelo (royalty-free) go tsamaisa diteng tseo ka maikaelelo a go neela Tirelo le go e
        tokafatsa. Ga re ipolele bong jwa dilo tse o di romelang.
      </p>

      <h2>7. Thoto ya botlhale</h2>
      <p>
        Leina la Gadit, logo, webosaete, le softwere e e mo motheong ke thoto ya rona kgotsa thoto ya ba ba re neileng
        dilaesense. O neilwe laesense ya motho ka namana, e e ka gogelwang morago, e e seng ya bosi, go dirisa Tirelo
        jaaka go letleletswe ke Melawana eno.
      </p>
      <p>
        Diteng tse di tlhagisitsweng ke Gadit go araba se o se tsentseng (ditlhaloso, ditshwantsho, jalo le jalo) di ka
        dirisiwa ke wena ka maikaelelo a botho, a thuto, kgotsa a a seng a kgwebo. Bakeng sa tiriso ya kgwebo (ka sekai
        mo setlhagisweng se se duelelwang), tsweetswee ikgolaganye le rona.
      </p>

      <h2>8. Go nna teng le diphetogo</h2>
      <p>
        Re leka ka natla go dira gore Tirelo e nne teng, mme ga re tlhomamise gore e tla dira kwa ntle ga go kgaogana
        kgotsa kwa ntle ga diphoso. Re ka fetola, ra emisa ka nakwana, kgotsa ra khutlisa karolo epe ya Tirelo nako
        nngwe le nngwe, go akaretsa dikarolo, ditlhwatlhwa, kgotsa go nna teng mo dikgaolong dingwe.
      </p>

      <h2>9. Ditirelo tsa batho ba boraro</h2>
      <p>
        Tirelo e ikaegile ka batlamedi ba batho ba boraro (go akaretsa OpenAI, Google Firebase, Stripe, le Vercel). Go
        nna teng ga bone kgotsa maitsholo a bone go ka ama maitemogelo a gago. Maikarabelo a rona a lekanyeditswe ke
        Karolo 11 go sa kgathalesege mathata a a bakilweng ke batlamedi bano.
      </p>

      <h2>10. Go itatola</h2>
      <p>
        TIRELO E NEELWA &ldquo;JAAKA E NTSE&rdquo; (&ldquo;AS IS&rdquo;) LE &ldquo;JAAKA E LE TENG&rdquo; (&ldquo;AS
        AVAILABLE&rdquo;), KWA NTLE GA DITLHOMAMISO DIPE TSA MOFUTA OPE, E KA NNA TSE DI BOLETSWENG KA TLHAMALALO
        KGOTSA TSE DI SA BOLELWANG, GO AKARETSA, MME E SE FELA, DITLHOMAMISO TSA GO REKEGA (MERCHANTABILITY), TSA GO
        TSHWANELA MAIKAELELO A A RILENG, LE TSA GO SE TLOLE DITSHWANELO TSA BA BANGWE (NON-INFRINGEMENT).
      </p>

      <h2>11. Tekanyetso ya maikarabelo</h2>
      <p>
        GO FITLHA KWA BOTLALONG JO BO LETLELELWANG KE MOLAO, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC LE
        BAOFISIRI BA YONE, BADIRI, LE BAEMEDI BA KA SE NNE LE MAIKARABELO A DITSHENYEGELO DIPE TSE E SENG TSA
        TLHAMALALO, TSA KA TSHOGANYETSO (INCIDENTAL), TSE DI KGETHEGILENG, TSA DITLAMORAGO (CONSEQUENTIAL), KGOTSA TSA
        KOTLHAO (PUNITIVE DAMAGES), KGOTSA A TATLHEGELO EPE YA DIPOELO KGOTSA YA LETSENO, E E TSWANG MO GO KGOTSA E
        AMANANG LE TIRISO YA GAGO YA TIRELO.
      </p>
      <p>
        MAIKARABELO A RONA OTLHE A KLEIMI EPE E E TSWANG MO GO KGOTSA E AMANANG LE TIRELO A KA SE FETE E E KGOLWANYANE
        GO TSE PEDI TSENO: (A) MADI A O A DUETSENG RONA MO DIKGWEDING DI LE SOME LE BOBEDI TSE DI TLANG PELE GA
        KLEIMI, KGOTSA (B) USD $100.
      </p>

      <h2>12. Go fedisa</h2>
      <p>
        O ka emisa go dirisa Tirelo nako nngwe le nngwe. Re ka emisa ka nakwana kgotsa ra fedisa phitlhelelo ya gago fa
        o tlola Melawana eno kgotsa fa molao o tlhoka jalo. Fa go fedisiwa, ditlamelo tse ka tlholego ya tsone di
        tshwanetseng go tswelela (go akaretsa Dikarolo 7, 10, 11, le 14) di tla nna di dira.
      </p>

      <h2>13. Diphetogo mo Melawaneng eno</h2>
      <p>
        Re ka baakanya Melawana eno nako le nako. Diphetogo tse di botlhokwa di tla phasaladiwa mo tsebeng eno, mme
        letlha la &ldquo;E ntšhafaditswe la bofelo&rdquo; le tla fetolwa. Fa o tswelela go dirisa Tirelo morago ga gore
        diphetogo di simolole go dira, seo se supa gore o amogela Melawana e e ntšhafaditsweng.
      </p>

      <h2>14. Molao o o laolang le dikgotlhang</h2>
      <p>
        Melawana eno e laolwa ke melao ya Naga ya Delaware (State of Delaware), United States, kwa ntle ga go kgathala
        ka melawana ya yone ya kgotlhang ya melao (conflict-of-law rules). Kgotlhang epe e e tswang mo go kgotsa e
        amanang le Melawana eno kgotsa Tirelo e tla rarabololwa fela mo dikgotlatshekelong tsa naga ya Delaware kgotsa
        tsa feterale tse di leng kwa Delaware, United States, mme o dumela gore dikgotlatshekelo tseo di nne le taolo
        ya semolao mo go wena (personal jurisdiction).
      </p>

      <h2>15. Ikgolaganye le rona</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeile:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
