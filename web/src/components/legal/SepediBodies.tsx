import type { ReactElement } from "react";

export const titlesNso = { privacy: "Pholisi ya Sephiri", terms: "Melawana ya Tšhomišo" };

export function PrivacyBodyNso(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;rena&rdquo;, goba &ldquo;ya rena&rdquo;) ke tirelo yeo e šomišwago ke{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, khamphani yeo e ngwadišitšwego ka United States.
        Pholisi ye ya Sephiri e hlaloša gore re kgoboketša tshedimošo efe, re e šomiša bjang, le dikgetho tšeo o nago
        le tšona.
      </p>
      <p>
        Ge o na le potšišo efe goba efe, ikgokaganye le rena go{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Tshedimošo yeo re e kgoboketšago</h2>
      <h3>Tshedimošo ya akhaonto</h3>
      <p>
        Ge o hlama akhaonto, re kgoboketša aterese ya gago ya imeile gomme, ge o tsena ka Google, re kgoboketša
        tshedimošo ya motheo ya profaele yeo Google e e abago (leina leo le bontšhwago, seswantšho sa profaele). Ga re
        amogele phasewete ya gago ya Google.
      </p>
      <h3>Tshedimošo ya tšhomišo</h3>
      <p>Ge o šomiša Gadit, re šomana le:</p>
      <ul>
        <li>mantšu ao o a nyakago le mafoko ao o ka a tsenyago ge o rata;</li>
        <li>diswantšho tšeo di dirilwego ka kgopelo ya gago;</li>
        <li>leano la gago la ngwadišo (subscription) le maemo a gago a tefo;</li>
        <li>histori ya moragorago ya dinyakišišo (go bašomiši bao ba lefago, go fihla go mantšu a 10 a mafelelo), yeo e bolokwago gore o kgone go e bona gape ka morago;</li>
        <li>dikabelo tša kgwedi (go fa mohlala, palo ya diswantšho tšeo o di dirilego nakong ye ya bjale ya tefo).</li>
      </ul>
      <h3>Datha ya sethekniki le ya tshekatsheko</h3>
      <p>
        Re kgoboketša ka go itiragalela tshedimošo ya motheo ya sethekniki go swana le aterese ya IP, mohuta wa
        sefetleki (browser), mohuta wa sedirišwa, URL yeo e go romilego, le matlakala ao o a lebeletšego. Se se
        šomišetšwa polokego, go hlokomela tshepedišo, le tshekatsheko ya dipalopalo tše di kopantšwego. Tshekatsheko e
        abja ke Vercel gomme e dirwa gore e se tsebiše motho nakong ya ge e kgoboketšwa (ga go dintlha tša go tsebiša
        motho tšeo di bolokwago). Matlakaleng a rena a papatšo, a ngwadišo le a tefo re šomiša gape le didirišwa tša
        papatšo le tshekatsheko, tšeo di hlalošitšwego go Karolo ya 3.
      </p>
      <h3>Tshedimošo ya tefo</h3>
      <p>
        Ge o ngwadiša, tefo e šongwa ke <strong>Stripe, Inc.</strong> Ga re bone goba go boloka nomoro ka moka ya
        karata ya gago; re amogela fela tokene ya moreki le datha ya tlhalošo (metadata) yeo e nyakegago go tsebiša
        ngwadišo.
      </p>

      <h2>2. Kamoo re šomišago tshedimošo ya gago</h2>
      <ul>
        <li>go aba le go kaonafatša tirelo ya Gadit (go dira ditlhalošo, diswantšho, ditshwayo mabapi le mafoko, le diteko);</li>
        <li>go hlokomela akhaonto ya gago le go dira gore maitemogelo a gago a go swanele (histori ya dinyakišišo, polelo yeo o e kgethilego, sefetoši sa &ldquo;Mokgwa wa bana&rdquo;);</li>
        <li>go šoma ka dingwadišo le go romela diimeile tša ditshepedišo (diresiti, diphetogo tša ngwadišo);</li>
        <li>go lekanya le go kaonafatša tshepedišo ya setšweletšwa le go thibela tšhomišo ye mpe;</li>
        <li>go obamela ditlamo tša molao.</li>
      </ul>
      <p>
        <strong>Ga re rekiše</strong> tshedimošo ya gago ya motho ka noši, gomme ga re šomiše diteng tša gago go go
        bapatšetša.
      </p>

      <h2>3. Ditirelo tša batho ba boraro tšeo re di šomišago</h2>
      <p>
        Gadit e ithekgile ka baabi ba ditirelo ba ba latelago bao ba šomago ka datha. Yo mongwe le yo mongwe wa bona o
        amogela fela tshedimošo ye nnyane kudu yeo e nyakegago go aba tirelo ye e amegago:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>, e šoma ka mantšu le mafoko ao o a romelago go dira ditlhalošo, ditshwayo mabapi le
          mafoko, diteko, le go ngwalolla seo se bolelwago (Whisper), gomme e dira diswantšho (DALL·E 3). Datha yeo e
          romelwago go OpenAI e laolwa ke pholisi ya OpenAI ya tšhomišo ya datha ya API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage), e boloka akhaonto ya gago,
          profaele, maemo a ngwadišo, histori ya dinyakišišo, le diswantšho tšeo di dirilwego.
        </li>
        <li>
          <strong>Stripe</strong>, e šoma ka ditefo, dingwadišo, le potale ya ditefo.
        </li>
        <li>
          <strong>Vercel</strong>, e swara le go abela weposaete, gomme e aba tshekatsheko ye e sa tsebišego motho le
          go lekanya tshepedišo.
        </li>
        <li>
          <strong>Papatšo le tshekatsheko</strong>, Meta (Meta Pixel), Google Analytics le TikTok (TikTok Pixel le
          Events API) di lekanya diketelo le dipoelo tša dipapatšo tša rena. Di šomiša dikhuki (cookies) le
          theknolotši ye e swanago matlakaleng a rena a papatšo, a ngwadišo le a tefo. Ge o ngwadiša goba o lefa, re
          ka romela ditirelo tše aterese ya imeile le ID ya akhaonto tšeo di khoutilwego ka tsela ya lehlakore le tee
          (hash), gotee le aterese ya gago ya IP le dintlha tša sefetleki sa gago, fela go lekanya dipapatšo tša rena.
          Ga re ke re di romele tshedimošo efe goba efe ka ga bana, gomme didirišwa tše ga di šome dikrineng tšeo bana
          ba di šomišago.
        </li>
      </ul>

      <h2>4. Re boloka tshedimošo ya gago nako ye kae</h2>
      <ul>
        <li>Tshedimošo ya akhaonto: ge feela akhaonto ya gago e sa le gona.</li>
        <li>Histori ya dinyakišišo: dinyakišišo tše 10 tša mafelelo go mošomiši yo mongwe le yo mongwe, e mpshafatšwa ka nyakišišo ye nngwe le ye nngwe ye mpsha.</li>
        <li>Diswantšho tšeo di dirilwego: di a bolokwa gore lentšu le bokao tše di swanago (lentšu+bokao) di kgone go šomiša gape seswantšho seo se bolokilwego. Di ka bolokwa go ya go ile ge feela akhaonto ya gago e šoma.</li>
        <li>Direkhoto tša ditefo le tša motšhelo: go ya ka moo molao wo o šomago o nyakago (gantši mengwaga ye 7).</li>
        <li>Datha ya tshekatsheko: e kopantšwe, gantši e bolokwa ke moabi wa tshekatsheko dikgwedi tše 13.</li>
      </ul>

      <h2>5. Ditokelo tša gago</h2>
      <p>Go ya ka moo o dulago gona, o ka ba le tokelo ya go:</p>
      <ul>
        <li>kgopela go bona tshedimošo ya motho ka noši yeo re e swerego mabapi le wena;</li>
        <li>kgopela gore tshedimošo ye e sa nepagalago e lokišwe;</li>
        <li>kgopela gore akhaonto ya gago le datha ye e amanago le yona di phumolwe;</li>
        <li>ntšha datha ya gago ka sebopego seo se ka fetišetšwago gongwe;</li>
        <li>ganetša goba go thibela ditšhomišo tše itšego tša tshedimošo ya gago;</li>
        <li>gana go abelanwa ga datha go go itšego (moo go šomago ka fase ga CCPA goba melao ye e swanago).</li>
      </ul>
      <p>
        Go diriša efe goba efe ya ditokelo tše, romela imeile go{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Re tla araba mo matšatšing
        a 30.
      </p>

      <h2>6. Polokego</h2>
      <p>
        Re šomiša ditšhireletšo tša maemo a intasteri, e lego dikgokagano tše di khoutilwego (HTTPS), di-API tšeo di
        netefaditšwego, le taolo ya phihlelelo, go šireletša tshedimošo ya gago. Ga go mokgwa wa go fetišetša goba go
        boloka tshedimošo inthaneteng wo o bolokegilego ka 100%, ka fao re ka se tiišetše polokego ya go phethagala,
        eupša re šoma ka mehla go fokotša kotsi.
      </p>

      <h2>7. Bana</h2>
      <p>
        Gadit ga e lebišwe go bana ba ka fase ga mengwaga ye 13. Ge o dumela gore ngwana wa ka fase ga mengwaga ye 13
        o hlamile akhaonto, re romele imeile gomme re tla phumola akhaonto le datha ye e amanago le yona.
      </p>

      <h2>8. Bašomiši ba ditšhabatšhaba</h2>
      <p>
        Gadit e šongwa go tšwa United States. Ge o tsena tirelong o le ka ntle ga United States, tshedimošo ya gago e
        tla fetišetšwa, ya bolokwa, gomme ya šongwa ka United States le ka dileteng tša disenthara tša datha tšeo di
        šomišwago ke baabi ba rena ba ditirelo.
      </p>

      <h2>9. Diphetogo go pholisi ye</h2>
      <p>
        Re ka mpshafatša Pholisi ye ya Sephiri nako le nako. Diphetogo tše bohlokwa di tla phatlalatšwa letlakaleng le,
        gomme letšatšikgwedi la &ldquo;E mpshafaditšwe la mafelelo&rdquo; le tla fetošwa. Ge o tšwela pele go šomiša
        Gadit ka morago ga ge diphetogo di thomile go šoma, seo se bontšha gore o amogela pholisi ye e mpshafaditšwego.
      </p>

      <h2>10. Ikgokaganye le rena</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeile:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyNso(): ReactElement {
  return (
    <>
      <p>
        O amogelwa go Gadit. Melawana ye ya Tšhomišo (&ldquo;Melawana&rdquo;) e laola go tsena ga gago le tšhomišo ya
        gago ya weposaete ya Gadit, diapplikeišene, le ditirelo (ka moka ga tšona, &ldquo;Tirelo&rdquo;), tšeo di
        šongwago ke{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;rena&rdquo; goba &ldquo;ya rena&rdquo;).
        Ka go šomiša Tirelo, o dumela go tlemwa ke Melawana ye. Ge o sa dumele, o se ke wa šomiša Tirelo.
      </p>

      <h2>1. Ke mang yo a ka šomišago Gadit</h2>
      <p>
        O swanetše go ba le bonyane mengwaga ye 13 go hlama akhaonto. Ge o le magareng ga mengwaga ye 13 le ye 18, o
        swanetše go ba le tumelelo ya motswadi goba mohlokomedi wa semolao. Ka go šomiša Gadit, o tiišetša gore o
        fihlelela dinyakwa tše.
      </p>

      <h2>2. Akhaonto ya gago</h2>
      <p>
        O na le maikarabelo a go boloka dintlha tša gago tša go tsena e le sephiri le a mešomo ka moka yeo e diregago
        ka fase ga akhaonto ya gago. Re tsebiše ka pela go{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> ge o dumela gore akhaonto ya
        gago e tsenetšwe ke motho yo a sa dumelelwago.
      </p>

      <h2>3. Dingwadišo le ditefo</h2>
      <h3>Maano le ditefo</h3>
      <p>
        Gadit e aba leano la Basic la mahala le maano ao a lefelwago (Clear le Deep) ka dikarolo le ditheko tšeo di
        bontšhitšwego letlakaleng la ditheko. Ditheko di bontšhwa ka USD gomme di ka fetošwa ka tsebišo ya bonyane
        matšatši a 30 go bangwadiši bao ba lego gona.
      </p>
      <h3>Mpshafatšo ya go itiragalela</h3>
      <p>
        Dingwadišo tšeo di lefelwago di mpshafatšwa ka go itiragalela mafelelong a nako ye nngwe le ye nngwe ya tefo
        (kgwedi le kgwedi goba ngwaga le ngwaga, go ya ka seo se kgethilwego) ka theko yeo e šomago ka nako yeo, ntle
        le ge di khanseletšwe pele ga letšatši la mpshafatšo.
      </p>
      <h3>Go khansela</h3>
      <p>
        O ka khansela nako efe goba efe go tšwa letlakaleng la akhaonto ya gago. Go khansela go emiša dimpshafatšo tša
        ka moso. O tla tšwela pele o na le phihlelelo ya dikarolo tšeo di lefelwago go fihla mafelelong a nako ya bjale
        ya tefo. Ga re bušetše tšhelete ya karolo ya nako yeo e sa šomišwago.
      </p>
      <h3>Dipušetšo tša tšhelete</h3>
      <p>
        Ntle le moo molao o go nyakago, ditefo ga di bušetšwe. Ge o dumela gore o lefišitšwe ka phošo, ikgokaganye
        le{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> mo matšatšing a 30 go tloga
        ge o lefišitšwe.
      </p>

      <h2>4. Tšhomišo ye e amogelegago</h2>
      <p>O dumela gore o ka se:</p>
      <ul>
        <li>šomiše Tirelo ka morero ofe goba ofe wo o sego molaong goba ka go tshela molao ofe goba ofe;</li>
        <li>leke go dira boenjiniere bja go boela morago (reverse-engineer), go dekhompaela, goba go ntšha khoutu ya mothopo ya Tirelo;</li>
        <li>hlakiše, tshwenye, goba gobatše bašomiši ba bangwe, goba romele diteng tša lehloyo, tša go tšhošetša, goba tša bohlapa;</li>
        <li>dire gore go tsena Tirelong go direge ka go itiragalela go feta tšhomišo ya motho ka noši ye e kwagalago (go fa mohlala, go kgoba ditlhalošo ka bontši);</li>
        <li>dikologe mellwane ya palo ya dikgopelo goba dithibelo tša leano, goba šomiše diakhaonto tše ntši go efoga dikabelo;</li>
        <li>šomiše Tirelo go tlwaetša goba go lokiša gabotse (fine-tune) mmotlolo ofe goba ofe wa AI goba setšweletšwa sa pukuntšu seo se phadišanago;</li>
        <li>laiše goba romele diteng tšeo o se nago tokelo ya go di romela.</li>
      </ul>
      <p>
        Re ipolokela tokelo ya go emiša nakwana goba go fediša diakhaonto tšeo di tshelago Melawana ye.
      </p>

      <h2>5. Diteng tšeo di tšweleditšwego ke AI</h2>
      <p>
        Gadit e šomiša dimmotlolo tša bohlale bja maitirelo (go akaretša GPT, Whisper, le DALL·E tša OpenAI) go
        tšweletša ditlhalošo, mehlala, ditšo tša mantšu, ditshwayo, diteko, diswantšho, le dingwalollo. O a kwešiša
        gomme o dumela gore:
      </p>
      <ul>
        <li>
          Dipoelo tša AI di ka ba <strong>tše di sa nepagalago, tše di sa felelago, goba tše di sa swanelago</strong>.
          Gadit e reretšwe go ba sethuši sa go ithuta gomme ga se ya swanela go ithekgwa ka yona go tšea diphetho tša
          semolao, tša kalafo, tša profešene, goba tša thuto.
        </li>
        <li>
          Ditlhalošo tšeo di tšweleditšwego ke AI di ka fapana le dipukuntšu tša semmušo. Ga re tiišetše gore tlhalošo
          ye nngwe le ye nngwe e ka tšewa bjalo ka ya bolaodi go ya ka thutapolelo.
        </li>
        <li>
          Diswantšho di tšweletšwa ka alkhoritimi gomme ka dinako tše dingwe di ka ba tše di sa letelwago goba tše di sa
          nepagalago. Ke diswantšho tša go hlaloša, e sego diswantšho tša nnete tša seo se hlalošwago.
        </li>
        <li>
          Ke wena fela yo a nago le maikarabelo a ka moo o hlathollago le go šomiša diteng tšeo di tšweleditšwego ke AI.
        </li>
      </ul>

      <h2>6. Diteng tša gago</h2>
      <p>
        Ge o romela mantšu, mafoko, goba modumo go Gadit (go fa mohlala ge o šomiša &ldquo;Bopa lefoko la gago&rdquo;
        goba go tsenya ka lentšu), o re fa laesense ya lefase ka bophara, yeo e sego ya bosenoši (non-exclusive), le
        yeo e sa lefelwego ditokelo (royalty-free) go šoma ka diteng tšeo ka morero wa go aba Tirelo le go e
        kaonafatša. Ga re ipolele bong bja dilo tšeo o di romelago.
      </p>

      <h2>7. Thoto ya monagano</h2>
      <p>
        Leina la Gadit, logo, weposaete, le softwere yeo e lego motheong ke thoto ya rena goba thoto ya bao ba re
        filego dilaesense. O fiwa laesense ya motho ka noši, yeo e ka gogelwago morago, yeo e sego ya bosenoši, go
        šomiša Tirelo bjalo ka ge go dumeletšwe ke Melawana ye.
      </p>
      <p>
        Diteng tšeo di tšweleditšwego ke Gadit go araba seo o se tsentšego (ditlhalošo, diswantšho, bjalo bjalo) di ka
        šomišwa ke wena ka merero ya motho ka noši, ya thuto, goba yeo e sego ya kgwebo. Bakeng sa tšhomišo ya kgwebo
        (go fa mohlala setšweletšweng seo se lefelwago), hle ikgokaganye le rena.
      </p>

      <h2>8. Go hwetšagala le diphetogo</h2>
      <p>
        Re katanela go dira gore Tirelo e hwetšagale, eupša ga re tiišetše gore e tla šoma ntle le go kgaotšwa goba
        ntle le diphošo. Re ka fetoša, ra emiša nakwana, goba ra khutliša karolo efe goba efe ya Tirelo nako efe goba
        efe, go akaretša dikarolo, ditheko, goba go hwetšagala dileteng tše itšego.
      </p>

      <h2>9. Ditirelo tša batho ba boraro</h2>
      <p>
        Tirelo e ithekgile ka baabi ba batho ba boraro (go akaretša OpenAI, Google Firebase, Stripe, le Vercel). Go
        hwetšagala ga bona goba boitshwaro bja bona go ka ama maitemogelo a gago. Maikarabelo a rena a lekanyeditšwe ke
        Karolo ya 11 go sa šetšwe mathata ao a hlotšwego ke baabi ba.
      </p>

      <h2>10. Tlhokomedišo</h2>
      <p>
        TIRELO E ABJA &ldquo;BJALO KA GE E LE&rdquo; (&ldquo;AS IS&rdquo;) LE &ldquo;BJALO KA GE E
        HWETŠAGALA&rdquo; (&ldquo;AS AVAILABLE&rdquo;), NTLE LE DITIIŠETŠO TŠA MOHUTA OFE GOBA OFE, E KA BA TŠE DI
        BOLETŠWEGO GOBA TŠE DI SA BOLELWAGO, GO AKARETŠA, EUPŠA E SE FELA, DITIIŠETŠO TŠA GO REKEGA
        (MERCHANTABILITY), TŠA GO SWANELA MORERO O ITŠEGO, LE TŠA GO SE TLALELE DITOKELO TŠA BA BANGWE
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Kelotšo ya maikarabelo</h2>
      <p>
        GO FIHLA BOTLALONG BJO BO DUMELETŠWEGO KE MOLAO, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC LE BAOFISIRI
        BA YONA, BAŠOMI, LE BAEMEDI BA KA SE BE LE MAIKARABELO A DITSHENYEGELO DIFE GOBA DIFE TŠEO E SEGO TŠA
        THWII, TŠA GO TLA KA THOKO (INCIDENTAL), TŠE DI KGETHEGILEGO, TŠA DITLAMORAGO (CONSEQUENTIAL), GOBA TŠA
        KOTLO (PUNITIVE DAMAGES), GOBA A TAHLEGELO EFE GOBA EFE YA DIPOELO GOBA YA LETSENO, YEO E TŠWAGO GO GOBA E
        AMANAGO LE TŠHOMIŠO YA GAGO YA TIRELO.
      </p>
      <p>
        MAIKARABELO A RENA KA MOKA A KLEIMI EFE GOBA EFE YEO E TŠWAGO GO GOBA E AMANAGO LE TIRELO A KA SE FETE YE
        KGOLO GO TŠE PEDI TŠE: (A) TŠHELETE YEO O E LEFILEGO GO RENA DIKGWEDING TŠE LESOMEPEDI TŠEO DI ETELELAGO
        KLEIMI PELE, GOBA (B) USD $100.
      </p>

      <h2>12. Go fedišwa</h2>
      <p>
        O ka emiša go šomiša Tirelo nako efe goba efe. Re ka emiša nakwana goba ra fediša phihlelelo ya gago ge o
        tshela Melawana ye goba ge molao o nyaka seo. Ge go fedišwa, ditlhagišo tšeo ka tlhago ya tšona di swanetšego
        go tšwela pele di šoma (go akaretša Dikarolo tša 7, 10, 11, le 14) di tla dula di šoma.
      </p>

      <h2>13. Diphetogo go Melawana ye</h2>
      <p>
        Re ka hlabolla Melawana ye nako le nako. Diphetogo tše bohlokwa di tla phatlalatšwa letlakaleng le, gomme
        letšatšikgwedi la &ldquo;E mpshafaditšwe la mafelelo&rdquo; le tla fetošwa. Ge o tšwela pele go šomiša Tirelo
        ka morago ga ge diphetogo di thomile go šoma, seo se bontšha gore o amogela Melawana ye e mpshafaditšwego.
      </p>

      <h2>14. Molao wo o laolago le diphapano</h2>
      <p>
        Melawana ye e laolwa ke melao ya Mmušo wa Delaware (State of Delaware), United States, ntle le go šetša
        melawana ya ona ya kgohlano ya melao (conflict-of-law rules). Phapano efe goba efe yeo e tšwago go goba e
        amanago le Melawana ye goba Tirelo e tla rarollwa fela dikgorong tša mmušo wa Delaware goba tša federale tšeo
        di lego Delaware, United States, gomme o dumelela gore dikgoro tšeo di be le maatla a semolao godimo ga gago
        (personal jurisdiction).
      </p>

      <h2>15. Ikgokaganye le rena</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Imeile:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
