import type { ReactElement } from "react";

export const titlesSt = { privacy: "Leano la Lekunutu", terms: "Dipehelo tsa Tshebediso" };

export function PrivacyBodySt(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;rona&rdquo;, kapa &ldquo;ya rona&rdquo;) ke tshebeletso e tsamaiswang ke{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, khampani e ngodisitsweng United States. Leano lena
        la Lekunutu le hlalosa hore na re bokella tlhahisoleseding efe, re e sebedisa jwang, le dikgetho tseo o nang le
        tsona.
      </p>
      <p>
        Haeba o na le potso efe kapa efe, ikopanye le rona ho{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Tlhahisoleseding eo re e bokellang</h2>
      <h3>Tlhahisoleseding ya akhaonto</h3>
      <p>
        Ha o theha akhaonto, re bokella aterese ya hao ya imeile mme, haeba o kena ka Google, re bokella
        tlhahisoleseding ya motheo ya profaele eo Google e e fanang (lebitso le bonahalang, setshwantsho sa profaele).
        Ha re fumane phasewete ya hao ya Google.
      </p>
      <h3>Tlhahisoleseding ya tshebediso</h3>
      <p>Ha o sebedisa Gadit, re sebetsana le:</p>
      <ul>
        <li>mantswe ao o a batlang le dipolelo tseo o ka di kenyang ha o rata;</li>
        <li>ditshwantsho tse entsweng ka kopo ya hao;</li>
        <li>leano la hao la ngodiso (subscription) le boemo ba hao ba tefo;</li>
        <li>nalane ya morao tjena ya dipatlo (bakeng sa basebedisi ba lefang, ho fihla mantsweng a 10 a ho qetela), e bolokwang hore o tle o e fumane hape hamorao;</li>
        <li>dikabelo tsa kgwedi (mohlala, palo ya ditshwantsho tseo o di entseng nakong ena ya jwale ya tefo).</li>
      </ul>
      <h3>Dintlha tsa theknoloji le tsa tlhahlobo</h3>
      <p>
        Re bokella ka boiketsetso tlhahisoleseding ya motheo ya theknoloji jwalo ka aterese ya IP, mofuta wa sebadi
        (browser), mofuta wa sesebediswa, URL e o romileng, le maqephe ao o a shebileng. Sena se sebediswa bakeng sa
        tshireletso, ho hlokomela tshebetso, le tlhahlobo ya dipalopalo tse kopantsweng. Tlhahlobo e fanwa ke Vercel
        mme e etswa hore e se tsebahatse motho nakong ya ho bokellwa (ha ho na ditshupo tsa motho tse bolokwang).
        Maqepheng a rona a papatso, a ngodiso le a tefo re boetse re sebedisa disebediswa tsa papatso le tlhahlobo,
        tse hlalositsweng Karolong ya 3.
      </p>
      <h3>Tlhahisoleseding ya tefo</h3>
      <p>
        Haeba o ngodisa, tefo e sebetswa ke <strong>Stripe, Inc.</strong> Ha re bone kapa ho boloka nomoro yohle ya
        karete ya hao; re fumana feela tokene ya moreki le dintlha tse hlalosang (metadata) tse hlokehang ho
        tsebahatsa ngodiso.
      </p>

      <h2>2. Kamoo re sebedisang tlhahisoleseding ya hao</h2>
      <ul>
        <li>ho fana ka le ho ntlafatsa tshebeletso ya Gadit (ho hlahisa ditlhaloso, ditshwantsho, maikutlo ka dipolelo, le diteko);</li>
        <li>ho hlokomela akhaonto ya hao le ho etsa hore boiphihlelo ba hao bo o tshwanele (nalane ya dipatlo, puo eo o e ratang, sekonopo sa &ldquo;Mokgwa wa bana&rdquo;);</li>
        <li>ho sebetsana le dingodiso le ho romela diimeile tsa ditransekshene (diresiti, diphetoho tsa ngodiso);</li>
        <li>ho lekanya le ho ntlafatsa tshebetso ya sehlahiswa le ho thibela tshebediso e mpe;</li>
        <li>ho latela ditlamo tsa molao.</li>
      </ul>
      <p>
        <strong>Ha re rekise</strong> tlhahisoleseding ya hao ya botho, mme ha re sebedise dikahare tsa hao ho o
        bapatsetsa.
      </p>

      <h2>3. Ditshebeletso tsa mekga ya boraro tseo re di sebedisang</h2>
      <p>
        Gadit e itshetlehile ka bafani ba ditshebeletso ba latelang ba sebetsanang le dintlha. E mong le e mong wa bona
        o fumana feela tlhahisoleseding e nyane ka ho fetisisa e hlokehang ho fana ka tshebeletso e amehang:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>, e sebetsana le mantswe le dipolelo tseo o di romelang ho hlahisa ditlhaloso,
          maikutlo ka dipolelo, diteko, le ho ngola seo ho buuwang (Whisper), mme e hlahisa ditshwantsho (DALL·E 3).
          Dintlha tse romelwang ho OpenAI di laolwa ke leano la OpenAI la tshebediso ya dintlha tsa API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage), e boloka akhaonto ya hao,
          profaele, boemo ba ngodiso, nalane ya dipatlo, le ditshwantsho tse hlahisitsweng.
        </li>
        <li>
          <strong>Stripe</strong>, e sebetsana le ditefo, dingodiso, le potale ya ditefo.
        </li>
        <li>
          <strong>Vercel</strong>, e bolokela le ho fana ka websaete, mme e fana ka tlhahlobo e sa tsebahatseng motho
          le tekanyo ya tshebetso.
        </li>
        <li>
          <strong>Papatso le tlhahlobo</strong>, Meta (Meta Pixel), Google Analytics le TikTok (TikTok Pixel le Events
          API) di lekanya diketelo le diphetho tsa dipapatso tsa rona. Di sebedisa dikhuki (cookies) le theknoloji e
          tshwanang maqepheng a rona a papatso, a ngodiso le a tefo. Ha o ngodisa kapa o lefa, re ka romela
          ditshebeletso tsena aterese ya imeile le ID ya akhaonto tse kgoutilweng ka tsela ya lehlakore le le leng
          (hash), hammoho le aterese ya hao ya IP le dintlha tsa sebadi sa hao, feela ho lekanya dipapatso tsa rona.
          Ha ho mohla re di romellang tlhahisoleseding efe kapa efe ka bana, mme disebediswa tsena ha di sebetse
          diskrineng tseo bana ba di sebedisang.
        </li>
      </ul>

      <h2>4. Re boloka tlhahisoleseding ya hao nako e kae</h2>
      <ul>
        <li>Tlhahisoleseding ya akhaonto: ha feela akhaonto ya hao e ntse e le teng.</li>
        <li>Nalane ya dipatlo: dipatlo tse 10 tsa ho qetela ho mosebedisi e mong le e mong, e ntjhafatswa ka patlo e nngwe le e nngwe e ntjha.</li>
        <li>Ditshwantsho tse hlahisitsweng: di a bolokwa e le hore lentswe le moelelo tse tshwanang (lentswe+moelelo) di kgone ho sebedisa hape setshwantsho se bolokilweng. Di ka bolokwa ka ho sa feleng ha feela akhaonto ya hao e ntse e sebetsa.</li>
        <li>Direkoto tsa ditefo le tsa lekgetho: jwalo ka ha molao o sebetsang o hloka (hangata dilemo tse 7).</li>
        <li>Dintlha tsa tlhahlobo: di kopantswe, hangata di bolokwa ke mofani wa tlhahlobo dikgwedi tse 13.</li>
      </ul>

      <h2>5. Ditokelo tsa hao</h2>
      <p>Ho ya ka moo o dulang teng, o ka ba le tokelo ya ho:</p>
      <ul>
        <li>kopa ho fumana tlhahisoleseding ya botho eo re nang le yona ka wena;</li>
        <li>kopa hore tlhahisoleseding e fosahetseng e lokiswe;</li>
        <li>kopa hore akhaonto ya hao le dintlha tse amanang le yona di hlakolwe;</li>
        <li>ntsha dintlha tsa hao ka sebopeho se ka fetisetswang kae kapa kae;</li>
        <li>hanyetsa kapa ho thibela ditshebediso tse itseng tsa tlhahisoleseding ya hao;</li>
        <li>hana ho arolelanwa ha dintlha tse itseng (moo ho sebetsang tlasa CCPA kapa melao e tshwanang).</li>
      </ul>
      <p>
        Ho sebedisa efe kapa efe ya ditokelo tsena, romela imeile ho{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Re tla araba nakong ya
        matsatsi a 30.
      </p>

      <h2>6. Tshireletso</h2>
      <p>
        Re sebedisa mehato ya tshireletso ya maemo a indasteri, e leng dikgokahano tse kentsweng khoutu (HTTPS), di-API
        tse netefaditsweng, le taolo ya phihlello, ho sireletsa tlhahisoleseding ya hao. Ha ho mokgwa wa ho fetisa
        kapa ho boloka dintlha inthaneteng o sireletsehileng ka 100%, ka hona re ke ke ra tiisa tshireletso e
        phethahetseng, empa re sebetsa kamehla ho fokotsa kotsi.
      </p>

      <h2>7. Bana</h2>
      <p>
        Gadit ha e a lebiswa baneng ba ka tlase ho dilemo tse 13. Haeba o dumela hore ngwana ya ka tlase ho dilemo tse
        13 o thehile akhaonto, re romelle imeile mme re tla hlakola akhaonto le dintlha tse amanang le yona.
      </p>

      <h2>8. Basebedisi ba matjhaba</h2>
      <p>
        Gadit e tsamaiswa ho tswa United States. Haeba o fihlella tshebeletso o le ka ntle ho United States,
        tlhahisoleseding ya hao e tla fetisetswa, e bolokwe, mme e sebetswe United States le dibakeng tsa ditsi tsa
        dintlha tse sebediswang ke bafani ba rona ba ditshebeletso.
      </p>

      <h2>9. Diphetoho ho leano lena</h2>
      <p>
        Re ka ntjhafatsa Leano lena la Lekunutu nako le nako. Diphetoho tsa bohlokwa di tla phatlalatswa leqepheng
        lena, mme letsatsi la &ldquo;E ntjhafaditswe la ho qetela&rdquo; le tla fetolwa. Ha o tswela pele ho sebedisa
        Gadit ka mora hore diphetoho di qale ho sebetsa, seo se bontsha hore o amohela leano le ntjhafaditsweng.
      </p>

      <h2>10. Ikopanye le rona</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeile:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodySt(): ReactElement {
  return (
    <>
      <p>
        Rea o amohela ho Gadit. Dipehelo tsena tsa Tshebediso (&ldquo;Dipehelo&rdquo;) di laola phihlello ya hao le
        tshebediso ya hao ya websaete ya Gadit, diapplikeishene, le ditshebeletso (kaofela, &ldquo;Tshebeletso&rdquo;),
        tse tsamaiswang ke{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;rona&rdquo; kapa &ldquo;ya rona&rdquo;).
        Ka ho sebedisa Tshebeletso, o dumela ho tlangwa ke Dipehelo tsena. Haeba o sa dumele, o se ke wa sebedisa
        Tshebeletso.
      </p>

      <h2>1. Ke mang ya ka sebedisang Gadit</h2>
      <p>
        O tlameha ho ba bonyane dilemo tse 13 ho theha akhaonto. Haeba o le pakeng tsa dilemo tse 13 le 18, o tlameha
        ho ba le tumello ya motswadi kapa mohlokomedi wa molao. Ka ho sebedisa Gadit, o tiisa hore o fihlella ditlhoko
        tsena.
      </p>

      <h2>2. Akhaonto ya hao</h2>
      <p>
        O na le boikarabelo ba ho boloka dintlha tsa hao tsa ho kena e le lekunutu le ba diketso tsohle tse etsahalang
        tlasa akhaonto ya hao. Re tsebise kapele ho{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> haeba o dumela hore akhaonto
        ya hao e kentswe ke motho ya sa dumellwang.
      </p>

      <h2>3. Dingodiso le ditefo</h2>
      <h3>Maano le ditefello</h3>
      <p>
        Gadit e fana ka leano la Basic la mahala le maano a lefellwang (Clear le Deep) a nang le dikarolo le ditheko
        tse thathamisitsweng leqepheng la ditheko. Ditheko di bontshwa ka USD mme di ka fetolwa ka tsebiso ya bonyane
        matsatsi a 30 ho bangodisi ba teng.
      </p>
      <h3>Ntjhafatso ka bo yona</h3>
      <p>
        Dingodiso tse lefellwang di ntjhafatswa ka bo tsona qetellong ya nako e nngwe le e nngwe ya tefo (kgwedi le
        kgwedi kapa selemo le selemo, ho ya ka se kgethilweng) ka theko e sebetsang ka nako eo, ntle le haeba di
        hlakotswe pele ho letsatsi la ntjhafatso.
      </p>
      <h3>Ho hlakola ngodiso</h3>
      <p>
        O ka hlakola ngodiso nako efe kapa efe ho tswa leqepheng la akhaonto ya hao. Ho hlakola ho emisa dintjhafatso
        tsa nakong e tlang. O tla tswela pele o fihlella dikarolo tse lefellwang ho fihlela qetellong ya nako ya tefo
        ya jwale. Ha re kgutlise tjhelete ya karolo ya nako e sa sebediswang.
      </p>
      <h3>Dikgutliso tsa tjhelete</h3>
      <p>
        Ntle le moo molao o hlokang, ditefo ha di kgutliswe. Haeba o dumela hore o lefisitswe ka phoso, ikopanye
        le{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> nakong ya matsatsi a 30 ho
        tloha ha o lefisitswe.
      </p>

      <h2>4. Tshebediso e amohelehang</h2>
      <p>O dumela hore o ke ke wa:</p>
      <ul>
        <li>sebedisa Tshebeletso bakeng sa sepheo sefe kapa sefe se seng molaong kapa ka ho tlola molao ofe kapa ofe;</li>
        <li>leka ho etsa boenjiniere ba ho kgutlela morao (reverse-engineer), ho dikhompaela, kapa ho ntsha khoutu ya mohlodi ya Tshebeletso;</li>
        <li>hlekefetsa, tshwenya, kapa ho lematsa basebedisi ba bang, kapa ho romela dikahare tsa lehloyo, tse tshosang, kapa tse manyala;</li>
        <li>etsa hore ho kena Tshebeletsong ho etsahale ka bo hona ho feta tshebediso e utlwahalang ya motho ka mong (mohlala, ho kgobokanya ditlhaloso ka bongata);</li>
        <li>qoba meedi ya palo ya dikopo kapa dithibelo tsa leano, kapa ho sebedisa diakhaonto tse ngata ho qoba dikabelo;</li>
        <li>sebedisa Tshebeletso ho kwetlisa kapa ho ntlafatsa ka botlalo (fine-tune) modele ofe kapa ofe wa AI kapa sehlahiswa sa bukantswe se hlodisanang;</li>
        <li>kenya kapa ho romela dikahare tseo o se nang tokelo ya ho di romela.</li>
      </ul>
      <p>
        Re ipolokela tokelo ya ho emisa nakwana kapa ho fedisa diakhaonto tse tlolang Dipehelo tsena.
      </p>

      <h2>5. Dikahare tse hlahisitsweng ke AI</h2>
      <p>
        Gadit e sebedisa dimodele tsa bohlale ba maiketsetso (ho kenyeletswa GPT, Whisper, le DALL·E tsa OpenAI) ho
        hlahisa ditlhaloso, mehlala, ditso tsa mantswe, maikutlo, diteko, ditshwantsho, le dingolwa tsa seo ho
        buuwang. O a utlwisisa mme o dumela hore:
      </p>
      <ul>
        <li>
          Dihlahiswa tsa AI di ka ba <strong>tse fosahetseng, tse sa phethelwang, kapa tse sa tshwanelang</strong>.
          Gadit e reretswe ho ba thuso ya ho ithuta mme ha ya lokela ho itshetlehelwa bakeng sa diqeto tsa molao, tsa
          bongaka, tsa profeshenale, kapa tsa thuto.
        </li>
        <li>
          Ditlhaloso tse hlahisitsweng ke AI di ka fapana le dibukantswe tsa semmuso. Ha re tiise hore tlhaloso e nngwe
          le e nngwe e na le bolaodi ho ya ka thuto ya puo.
        </li>
        <li>
          Ditshwantsho di hlahiswa ka alkhoritheme mme ka nako tse ding di ka ba tse sa lebellwang kapa tse sa
          nepahalang. Ke ditshwantsho tsa ho hlalosa, e seng dipontsho tsa sebele tsa se hlaloswang.
        </li>
        <li>
          Ke wena feela ya nang le boikarabelo ba kamoo o hlalosang le ho sebedisa dikahare tse hlahisitsweng ke AI.
        </li>
      </ul>

      <h2>6. Dikahare tsa hao</h2>
      <p>
        Ha o romela mantswe, dipolelo, kapa modumo ho Gadit (mohlala ha o sebedisa &ldquo;Iqapele polelo ya hao&rdquo;
        kapa ho kenya ka lentswe), o re fa laesense ya lefatshe ka bophara, e seng ya ho ikgetha (non-exclusive), e se
        nang tefo ya ditokelo (royalty-free) ho sebetsana le dikahare tseo ka sepheo sa ho fana ka Tshebeletso le ho e
        ntlafatsa. Ha re ipolele bong ba seo o se romelang.
      </p>

      <h2>7. Thepa ya kelello</h2>
      <p>
        Lebitso la Gadit, logo, websaete, le softwere e ka morao ho tsona ke thepa ya rona kapa thepa ya ba re fileng
        dilaesense. O fuwa laesense ya botho, e ka hulwang morao, e seng ya ho ikgetha, ho sebedisa Tshebeletso jwalo
        ka ha ho dumelletswe ke Dipehelo tsena.
      </p>
      <p>
        Dikahare tse hlahisitsweng ke Gadit ho araba seo o se kentseng (ditlhaloso, ditshwantsho, jj.) di ka
        sebediswa ke wena bakeng sa merero ya botho, ya thuto, kapa e seng ya kgwebo. Bakeng sa tshebediso ya kgwebo
        (mohlala sehlahisweng se lefellwang), ka kopo ikopanye le rona.
      </p>

      <h2>8. Ho fumaneha le diphetoho</h2>
      <p>
        Re leka ka matla ho etsa hore Tshebeletso e fumanehe, empa ha re tiise hore e tla sebetsa ntle le ho kgaotsa
        kapa ntle le diphoso. Re ka fetola, ra emisa nakwana, kapa ra kgaotsa karolo efe kapa efe ya Tshebeletso nako
        efe kapa efe, ho kenyeletswa dikarolo, ditheko, kapa ho fumaneha dibakeng tse itseng.
      </p>

      <h2>9. Ditshebeletso tsa mekga ya boraro</h2>
      <p>
        Tshebeletso e itshetlehile ka bafani ba mekga ya boraro (ho kenyeletswa OpenAI, Google Firebase, Stripe, le
        Vercel). Ho fumaneha ha bona kapa boitshwaro ba bona ho ka ama boiphihlelo ba hao. Boikarabelo ba rona bo
        lekanyeditswe ke Karolo ya 11 ho sa natswe mathata a bakilweng ke bafani bana.
      </p>

      <h2>10. Ho itokolla boikarabelong</h2>
      <p>
        TSHEBELETSO E FANWA &ldquo;JWALO KA HA E LE&rdquo; (&ldquo;AS IS&rdquo;) LE &ldquo;JWALO KA HA E
        FUMANEHA&rdquo; (&ldquo;AS AVAILABLE&rdquo;), NTLE LE DITIISETSO TSA MOFUTA OFE KAPA OFE, EBA TSE BOLELWANG
        KA KOTLOLLO KAPA TSE SA BOLELWANG, HO KENYELETSWA, EMPA E SE FEELA, DITIISETSO TSA HO REKEHA
        (MERCHANTABILITY), TSA HO TSHWANELA SEPHEO SE ITSENG, LE TSA HO SE TLOLE DITOKELO TSA BA BANG
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Moedi wa boikarabelo</h2>
      <p>
        HO FIHLELA BOHOLENG BO DUMELLWANG KE MOLAO, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC LE BAOFISIRI BA
        YONA, BASEBETSI, LE BAEMEDI BA KE KE BA BA LE BOIKARABELO BA TSHENYO EFE KAPA EFE E SENG YA KA KOTLOLLO, YA
        KA TSHOHANYETSO (INCIDENTAL), E IKGETHILENG, YA DITLAMORAO (CONSEQUENTIAL), KAPA YA KOTLO (PUNITIVE
        DAMAGES), KAPA BA TAHLEHELO EFE KAPA EFE YA DIPHAELLO KAPA YA LEKENO, E TSWANG HO KAPA E AMANANG LE
        TSHEBEDISO YA HAO YA TSHEBELETSO.
      </p>
      <p>
        BOIKARABELO BA RONA BOHLE BAKENG SA TLELEIMI EFE KAPA EFE E TSWANG HO KAPA E AMANANG LE TSHEBELETSO BO KE KE
        BA FETA E KGOLO HO TSENA TSE PEDI: (A) TJHELETE EO O E LEFILENG HO RONA DIKGWEDING TSE LESHOME LE METSO E
        MMEDI TSE ETELLANG PELE TLELEIMI, KAPA (B) USD $100.
      </p>

      <h2>12. Ho fediswa</h2>
      <p>
        O ka emisa ho sebedisa Tshebeletso nako efe kapa efe. Re ka emisa nakwana kapa ra fedisa phihlello ya hao
        haeba o tlola Dipehelo tsena kapa haeba molao o hloka jwalo. Ha ho fediswa, dipehelo tseo ka tlhaho ya tsona
        di lokelang ho tswela pele (ho kenyeletswa Dikarolo tsa 7, 10, 11, le 14) di tla dula di sebetsa.
      </p>

      <h2>13. Diphetoho ho Dipehelo tsena</h2>
      <p>
        Re ka lekola botjha Dipehelo tsena nako le nako. Diphetoho tsa bohlokwa di tla phatlalatswa leqepheng lena,
        mme letsatsi la &ldquo;E ntjhafaditswe la ho qetela&rdquo; le tla fetolwa. Ha o tswela pele ho sebedisa
        Tshebeletso ka mora hore diphetoho di qale ho sebetsa, seo se bontsha hore o amohela Dipehelo tse
        ntjhafaditsweng.
      </p>

      <h2>14. Molao o laolang le dikgohlano</h2>
      <p>
        Dipehelo tsena di laolwa ke melao ya Mmuso wa Delaware (State of Delaware), United States, ntle le ho ela
        hloko melao ya yona ya kgohlano ya melao (conflict-of-law rules). Kgohlano efe kapa efe e tswang ho kapa e
        amanang le Dipehelo tsena kapa Tshebeletso e tla rarollwa feela makgotleng a mmuso wa Delaware kapa a
        federale a leng Delaware, United States, mme o dumela hore makgotla ao a be le matla a molao hodima hao
        (personal jurisdiction).
      </p>

      <h2>15. Ikopanye le rona</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeile:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
