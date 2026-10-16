import { Lang } from "./i18n";

export type ContactContent = {
  pageTitle: string;
  pageSubtitle: string;
  faqHeading: string;
  stillNeedHelpHeading: string;
  stillNeedHelpBody: string;
  emailButton: string;
  responseTime: string;
  faq: { q: string; a: string }[];
};

export const CONTACT = {} as Record<Lang, ContactContent>;
Object.assign(CONTACT, {
  en: {
    pageTitle: "Contact & FAQ",
    pageSubtitle: "Common questions, and how to reach us if you can't find what you're looking for.",
    faqHeading: "Frequently asked questions",
    stillNeedHelpHeading: "Still need help?",
    stillNeedHelpBody: "If your question isn't answered here, email us directly. We read every message.",
    emailButton: "Email support",
    responseTime: "We usually reply within 24 to 48 hours.",
    faq: [
      {
        q: "What is Gadit?",
        a: "Gadit is a dictionary for truly understanding a word. You get meanings, real-life examples, etymology, idioms and expressions, kids' explanations, an image, sentence practice with feedback, and short quizzes. All in one place.",
      },
      {
        q: "Which languages does Gadit support?",
        a: "The interface currently supports English, Hebrew, Arabic, Russian, Spanish, Portuguese, and French, with more on the way.",
      },
      {
        q: "How is Gadit different from a regular dictionary?",
        a: "A regular dictionary gives you a definition. Gadit helps you GAD the word: see every meaning, get the meaning that fits your sentence, view the word as an image, write your own sentence and get feedback, and quiz yourself until it sticks.",
      },
      {
        q: "What subscription plans are available?",
        a: "There are three. Basic is free, requires no signup, and includes definitions, examples, and etymology (the origin of the word). Clear adds kids' explanations, idioms and expressions, illustrations, voice input, sentence practice with feedback, and search history, with 14 free trial days. Deep adds interactive quizzes that help you really lock in what you learned.",
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes. You can cancel your subscription at any time from your account area. Access to the paid plan remains until the end of the current billing period.",
      },
      {
        q: "How accurate are Gadit's definitions?",
        a: "Definitions are written to be clear, useful, and faithful to how words are actually used.",
      },
      {
        q: "What happens to my data and search history?",
        a: "Your account data, search history (up to the 10 most recent words), and generated images are stored securely. We never sell your data. For full details, see our Privacy Policy.",
      },
    ],
  },

  zu: {
    pageTitle: "Xhumana Nathi Nemibuzo Evamile",
    pageSubtitle: "Imibuzo evamile, kanye nendlela yokuxhumana nathi uma ungakutholi lokho okufunayo.",
    faqHeading: "Imibuzo evame ukubuzwa",
    stillNeedHelpHeading: "Usadinga usizo?",
    stillNeedHelpBody: "Uma umbuzo wakho ungaphendulwanga lapha, sithumele i-imeyili ngqo. Sifunda wonke umyalezo.",
    emailButton: "Thumela i-imeyili yosizo",
    responseTime: "Ngokuvamile siphendula phakathi kwamahora angu-24 kuya kwangu-48.",
    faq: [
      {
        q: "Yini i-Gadit?",
        a: "I-Gadit yisichazamazwi sokuqonda igama ngokweqiniso. Uthola izincazelo, izibonelo zempilo yangempela, umsuka wegama, izisho nezingqondo zamagama, izincazelo zezingane, isithombe, ukuzijwayeza imisho ngempendulo, kanye nezivivinyo ezifushane. Konke endaweni eyodwa.",
      },
      {
        q: "Yiziphi izilimi i-Gadit ezisekelayo?",
        a: "Isikhombimsebenzisi okwamanje sisekela isiNgisi, isiHebheru, isi-Arabhu, isiRashiya, isiSpeyini, isiPutukezi, kanye nesiFulentshi, futhi ezinye zisendleleni.",
      },
      {
        q: "I-Gadit yehluke kanjani kwisichazamazwi esijwayelekile?",
        a: "Isichazamazwi esijwayelekile sikunika incazelo. I-Gadit ikusiza ukuthi wenze i-GAD egameni: bona zonke izincazelo, uthole incazelo efanele umusho wakho, ubuke igama njengesithombe, ubhale owakho umusho uthole nempendulo, futhi uzivivinye uze uligxilise.",
      },
      {
        q: "Yiziphi izinhlelo zokubhalisa ezikhona?",
        a: "Zintathu. I-Basic imahhala, ayidingi kubhalisa, futhi ihlanganisa izincazelo, izibonelo, nomsuka wegama. I-Clear yengeza izincazelo zezingane, izisho nezingqondo zamagama, imifanekiso, ukufaka ngezwi, ukuzijwayeza imisho ngempendulo, nomlando wokusesha, kanye nezinsuku ezingu-14 zokulinga mahhala. I-Deep yengeza izivivinyo ezisebenzisanayo ezikusiza ugxilise ngempela lokho okufundile.",
      },
      {
        q: "Ngingakukhansela yini ukubhalisa kwami nganoma yisiphi isikhathi?",
        a: "Yebo. Ungakukhansela ukubhalisa kwakho nganoma yisiphi isikhathi endaweni ye-akhawunti yakho. Ukufinyelela ohlelweni olukhokhelwayo kuhlala kuze kuphele isikhathi samanje sokukhokha.",
      },
      {
        q: "Zinembe kangakanani izincazelo ze-Gadit?",
        a: "Izincazelo zibhalwa ukuze zicace, zibe usizo, futhi zithembeke endleleni amagama asetshenziswa ngayo ngempela.",
      },
      {
        q: "Kwenzekani ngedatha yami nomlando wokusesha?",
        a: "Idatha ye-akhawunti yakho, umlando wokusesha (kuze kufike emagameni angu-10 amuva), nezithombe ezakhiwe kugcinwa ngokuphephile. Asiyithengisi neze idatha yakho. Ukuze uthole imininingwane egcwele, bona iNqubomgomo yethu Yobumfihlo.",
      },
    ],
  },
  xh: {
    pageTitle: "Qhagamshelana nathi nemibuzo",
    pageSubtitle: "Imibuzo eqhelekileyo, nendlela yokufikelela kuthi ukuba awuyifumani into oyikhangelayo.",
    faqHeading: "Imibuzo ebuzwa rhoqo",
    stillNeedHelpHeading: "Usafuna uncedo?",
    stillNeedHelpBody: "Ukuba umbuzo wakho awuphendulwanga apha, sithumelele i-imeyile ngqo. Siyawufunda wonke umyalezo.",
    emailButton: "Thumela i-imeyile kwinkxaso",
    responseTime: "Sidla ngokuphendula kwiiyure ezingama-24 ukuya kwezingama-48.",
    faq: [
      {
        q: "Yintoni i-Gadit?",
        a: "Gadit sisichazi-magama sokuqonda igama ngokwenene. Ufumana iintsingiselo, imizekelo yobomi bokwenyani, imvelaphi, izaci namabinzana, iinkcazelo zabantwana, umfanekiso, ukuziqhelisa ngezivakalisi nengxelo, kunye nemibuzo emifutshane. Konke kwindawo enye.",
      },
      {
        q: "Zeziphi iilwimi ezixhaswa yi-Gadit?",
        a: "Ujongano okwangoku luxhasa isiNgesi, isiHebhere, isiArabhu, isiRashiya, isiSpanish, isiPhuthukezi nesiFrentshi, kwaye ezinye ziyeza.",
      },
      {
        q: "Gadit yahluke njani kwisichazi-magama esiqhelekileyo?",
        a: "Isichazi-magama esiqhelekileyo sikunika intsingiselo. Gadit ikunceda wenze i-GAD kwigama: ubone zonke iintsingiselo, ufumane intsingiselo engena kwisivakalisi sakho, ubone igama njengomfanekiso, ubhale esakho isivakalisi ufumane ingxelo, kwaye uzivavanye de lihlale.",
      },
      {
        q: "Zeziphi izicwangciso zomrhumo ezikhoyo?",
        a: "Zintathu. I-Basic isimahla, ayifuni kubhalisa, kwaye iquka iintsingiselo, imizekelo nemvelaphi (apho igama livela khona). I-Clear yongeza iinkcazelo zabantwana, izaci namabinzana, imifanekiso, ukufaka ngelizwi, ukuziqhelisa ngezivakalisi nengxelo, kunye nembali yokukhangela, kunye neentsuku ezili-14 zovavanyo lwasimahla. I-Deep yongeza imibuzo esebenzisanayo ekunceda ugcine ngokwenene oko ukufundileyo.",
      },
      {
        q: "Ndingawurhoxisa umrhumo wam nanini na?",
        a: "Ewe. Ungawurhoxisa umrhumo wakho nanini na kwindawo yeakhawunti yakho. Ukufikelela kwisicwangciso esihlawulelwayo kuhlala de kuphele ixesha langoku lokuhlawula.",
      },
      {
        q: "Zichaneke kangakanani iintsingiselo ze-Gadit?",
        a: "Iintsingiselo zibhalwe ukuze zicace, ziluncedo, kwaye zithembeke kwindlela amagama asetyenziswa ngayo ngokwenene.",
      },
      {
        q: "Kwenzeka ntoni kwiinkcukacha zam nembali yokukhangela?",
        a: "Iinkcukacha zeakhawunti yakho, imbali yokukhangela (ukuya kumagama ali-10 akutshanje) nemifanekiso eyenziweyo zigcinwa ngokukhuselekileyo. Asizithengisi iinkcukacha zakho. Ukuze ufumane iinkcukacha ezipheleleyo, jonga uMgaqo-nkqubo wethu wabucala.",
      },
    ],
  },
  nso: {
    pageTitle: "Ikgokaganye le rena le Dipotšišo",
    pageSubtitle: "Dipotšišo tše di tlwaelegilego, le ka moo o ka re hwetšago ka gona ge o sa hwetše seo o se nyakago.",
    faqHeading: "Dipotšišo tšeo di botšišwago gantši",
    stillNeedHelpHeading: "O sa nyaka thušo?",
    stillNeedHelpBody: "Ge potšišo ya gago e sa arabja mo, re romele imeile thwii. Re bala molaetša o mongwe le o mongwe.",
    emailButton: "Romela imeile go thušo",
    responseTime: "Gantši re araba ka gare ga diiri tše 24 go ya go tše 48.",
    faq: [
      {
        q: "Gadit ke eng?",
        a: "Gadit ke pukuntšu ya go kwešiša lentšu ka nnete. O hwetša ditlhalošo, mehlala ya bophelo bja nnete, mothopo wa lentšu, dika le dipolelwana, ditlhalošo tša bana, seswantšho, tlwaetšo ya mafoko le dikarabelo, le ditlhahlobo tše kopana. Ka moka lefelong le tee.",
      },
      {
        q: "Gadit e thekga dipolelo dife?",
        a: "Ga bjale tšhebedišo e thekga Seisemane, Seheberu, Searabia, Serashia, Sepanish, Sepotokisi, le Sefora, gomme tše dingwe di tla.",
      },
      {
        q: "Gadit e fapana bjang le pukuntšu ya tlwaelo?",
        a: "Pukuntšu ya tlwaelo e go fa tlhalošo. Gadit e go thuša go GAD lentšu: bona ditlhalošo ka moka, hwetša tlhalošo ye e sepelelanago le lefoko la gago, bona lentšu bjalo ka seswantšho, ngwala lefoko la gago o hwetše dikarabelo, gomme o itlhahlobe go fihlela le dula.",
      },
      {
        q: "Go na le maano afe a peeletšo?",
        a: "Go na le a mararo. Basic ke ya mahala, ga e nyake go ingwadiša, gomme e akaretša ditlhalošo, mehlala, le mothopo wa lentšu. Clear e oketša ditlhalošo tša bana, dika le dipolelwana, diswantšho, go tsenya ka lentšu, tlwaetšo ya mafoko le dikarabelo, le histori ya dinyakišišo, ka matšatši a 14 a teko ya mahala. Deep e oketša ditlhahlobo tše di šomišanago tše di go thušago go tiiša seo o ithutilego sona ka nnete.",
      },
      {
        q: "Na nka khansela peeletšo ya ka nako efe goba efe?",
        a: "Ee. O ka khansela peeletšo ya gago nako efe goba efe go tšwa sebakeng sa akhaonto ya gago. Phihlelelo ya leano le le lefelwago e dula go fihla mafelelong a nako ya tefo ya bjale.",
      },
      {
        q: "Ditlhalošo tša Gadit di nepagetše go le kae?",
        a: "Ditlhalošo di ngwadilwe gore di kwagale, di thuše, gomme di botegele ka moo mantšu a šomišwago ka gona ka nnete.",
      },
      {
        q: "Go direga eng ka tshedimošo ya ka le histori ya dinyakišišo?",
        a: "Tshedimošo ya akhaonto ya gago, histori ya dinyakišišo (go fihla go mantšu a 10 a morago bjale), le diswantšho tše di dirilwego di bolokwa ka polokego. Ga re rekiše tshedimošo ya gago le gatee. Bakeng sa dintlha ka botlalo, bona Pholisi ya rena ya Sephiri.",
      },
    ],
  },
  tn: {
    pageTitle: "Ikgolaganye le rona & Dipotso",
    pageSubtitle: "Dipotso tse di tlwaelegileng, le kafa o ka re fitlhelelang ka teng fa o sa bone se o se batlang.",
    faqHeading: "Dipotso tse di botswang gantsi",
    stillNeedHelpHeading: "A o sa ntse o tlhoka thuso?",
    stillNeedHelpBody: "Fa potso ya gago e sa arabiwa fa, re romelele imeile ka tlhamalalo. Re bala molaetsa mongwe le mongwe.",
    emailButton: "Romelela thuso imeile",
    responseTime: "Gantsi re araba mo diureng di le 24 go ya go 48.",
    faq: [
      {
        q: "Gadit ke eng?",
        a: "Gadit ke thanodi ya go tlhaloganya lefoko tota. O bona ditlhaloso, dikai tsa botshelo jwa nnete, tshimologo ya lefoko, dikapolelo le dipolelo, ditlhaloso tsa bana, setshwantsho, boikatiso jwa dipolelo le maikutlo, le ditlhatlhobo tse dikhutshwane. Tsotlhe mo lefelong le le lengwe.",
      },
      {
        q: "Gadit e dirisa dipuo dife?",
        a: "Ga jaana tiriso e dirisa Sekgoa, Sehebera, Searabia, Serashia, Sesepanishe, Sepotokisi, le Sefora, mme tse dingwe di a tla.",
      },
      {
        q: "Gadit e farologana jang le thanodi e e tlwaelegileng?",
        a: "Thanodi e e tlwaelegileng e go naya tlhaloso. Gadit e go thusa go GAD lefoko: go bona ditlhaloso tsotlhe, go bona tlhaloso e e tsamaisanang le polelo ya gago, go bona lefoko le le setshwantsho, go kwala polelo ya gago mme o bone maikutlo, le go itlhatlhoba go fitlha le nna mo tlhaloganyong.",
      },
      {
        q: "Go na le maano afe a ikwadiso?",
        a: "Go na le a le mararo. Basic ke mahala, ga e tlhoke go ikwadisa, mme e akaretsa ditlhaloso, dikai, le tshimologo ya lefoko. Clear e oketsa ditlhaloso tsa bana, dikapolelo le dipolelo, ditshwantsho, go tsenya ka lentswe, boikatiso jwa dipolelo le maikutlo, le hisitori ya dipatlo, le malatsi a le 14 a teko ya mahala. Deep e oketsa ditlhatlhobo tse o tsayang karolo mo go tsone tse di go thusang go tshwara sentle se o se ithutileng.",
      },
      {
        q: "A nka khansela ikwadiso ya me nako nngwe le nngwe?",
        a: "Ee. O ka khansela ikwadiso ya gago nako nngwe le nngwe mo lefelong la akhaonto ya gago. Phitlhelelo ya leano le le duelelwang e nna go fitlha kwa bofelong jwa nako ya tefo ya jaanong.",
      },
      {
        q: "Ditlhaloso tsa Gadit di nepagetse go le kae?",
        a: "Ditlhaloso di kwadilwe gore di phepafale, di thuse, mme di ikanyege go ya ka fa mafoko a dirisiwang ka teng tota.",
      },
      {
        q: "Go diragala eng ka tshedimosetso ya me le hisitori ya dipatlo?",
        a: "Tshedimosetso ya akhaonto ya gago, hisitori ya dipatlo (go fitlha mafoko a le 10 a bosheng), le ditshwantsho tse di dirilweng di bolokwa ka tsela e e sireletsegileng. Ga re ke re rekisa tshedimosetso ya gago. Go bona dintlha tsotlhe, bona Pholisi ya rona ya Sephiri.",
      },
    ],
  },
  st: {
    pageTitle: "Ikopanye le rona le Dipotso",
    pageSubtitle: "Dipotso tse tlwaelehileng, le kamoo o ka re fihlelang kateng haeba o sa fumane seo o se batlang.",
    faqHeading: "Dipotso tse botswang kgafetsa",
    stillNeedHelpHeading: "O ntse o hloka thuso?",
    stillNeedHelpBody: "Haeba potso ya hao e sa arajwe mona, re romele imeile ka kotloloho. Re bala molaetsa o mong le o mong.",
    emailButton: "Romela imeile ho ba thuso",
    responseTime: "Hangata re araba nakong ya dihora tse 24 ho isa ho tse 48.",
    faq: [
      {
        q: "Gadit ke eng?",
        a: "Gadit ke bukantswe ya ho utlwisisa lentswe ka nnete. O fumana meelelo, mehlala ya bophelo ba nnete, tshimoloho ya lentswe, dikapolelo le dipolelo, ditlhaloso tsa bana, setshwantsho, boikwetliso ba dipolelo ka maikutlo, le dikwisi tse kgutshwane. Kaofela sebakeng se le seng.",
      },
      {
        q: "Gadit e tshehetsa dipuo dife?",
        a: "Hajwale sebopeho se tshehetsa Senyesemane, Seheberu, Searabia, Serashea, Sespanishe, Sepotokisi, le Sefora, mme tse ding di sa tla.",
      },
      {
        q: "Gadit e fapane jwang le bukantswe e tlwaelehileng?",
        a: "Bukantswe e tlwaelehileng e o fa tlhaloso. Gadit e o thusa ho GAD lentswe: bona meelelo yohle, fumana moelelo o tsamaisanang le polelo ya hao, bona lentswe e le setshwantsho, ngola polelo ya hao mme o fumane maikutlo, mme o ikwetlise ka dikwisi ho fihlela le dula.",
      },
      {
        q: "Ho na le merero efe ya ngodiso?",
        a: "Ho na le e meraro. Basic ke mahala, ha e hloke ho ngodisa, mme e kenyeletsa ditlhaloso, mehlala, le tshimoloho ya lentswe (moo lentswe le tswang teng). Clear e eketsa ditlhaloso tsa bana, dikapolelo le dipolelo, ditshwantsho, ho bua ho ena le ho ngola, boikwetliso ba dipolelo ka maikutlo, le nalane ya dipatlo, ka matsatsi a 14 a teko a mahala. Deep e eketsa dikwisi tse sebedisanang tse o thusang ho tiisa seo o ithutileng sona ka nnete.",
      },
      {
        q: "Na nka emisa ngodiso ya ka nako efe kapa efe?",
        a: "E. O ka emisa ngodiso ya hao nako efe kapa efe sebakeng sa akhaonte ya hao. Phihlello ya moralo o lefellwang e dula ho fihlela qetellong ya nako ya hajwale ya tefo.",
      },
      {
        q: "Ditlhaloso tsa Gadit di nepahetse hakae?",
        a: "Ditlhaloso di ngotswe hore di hlake, di be le thuso, mme di tshepahale ho kamoo mantswe a sebediswang kateng ka nnete.",
      },
      {
        q: "Ho etsahala eng ka dintlha tsa ka le nalane ya dipatlo?",
        a: "Dintlha tsa akhaonte ya hao, nalane ya dipatlo (ho fihlela mantswe a 10 a morao tjena), le ditshwantsho tse entsweng di bolokwa ka polokeho. Ha re ke re rekisa dintlha tsa hao. Bakeng sa dintlha tse felletseng, bona Leano la rona la Lekunutu.",
      },
    ],
  },
  ts: {
    pageTitle: "Vulavula na hina & Swivutiso",
    pageSubtitle: "Swivutiso leswi tolovelekeke, na ndlela yo hi kuma loko mi nga kumi leswi mi swi lavaka.",
    faqHeading: "Swivutiso leswi talaka ku vutisiwa",
    stillNeedHelpHeading: "Xana ma ha lava mpfuno?",
    stillNeedHelpBody: "Loko xivutiso xa n'wina xi nga hlamuriwanga laha, hi rhumeleni imeyili hi ku kongoma. Hi hlaya rungula rin'wana na rin'wana.",
    emailButton: "Rhumela imeyili eka mpfuno",
    responseTime: "Hi ntolovelo hi hlamula endzhaku ka tiawara ta 24 ku ya eka 48.",
    faq: [
      {
        q: "Xana Gadit i yini?",
        a: "Gadit i dikixinari yo twisisa rito hakunene. Mi kuma tinhlamuselo, swikombiso swa vutomi bya xiviri, masungulo, swivulavulelo na swivulwa, tinhlamuselo ta vana, xifaniso, ntoloveto wa swivulwa hi switsundzuxo, na mavutiso yo koma. Hinkwaswo endhawini yin'we.",
      },
      {
        q: "Xana Gadit yi seketela tindzimi tihi?",
        a: "Sweswi xitirhisiwa xi seketela Xinghezi, Xiheberu, Xiarabu, Xirhaxiya, Xipaniya, Xiputukezi na Xifurwa, naswona tin'wana ti le ndleleni.",
      },
      {
        q: "Xana Gadit yi hambana njhani na dikixinari ya ntolovelo?",
        a: "Dikixinari ya ntolovelo yi mi nyika nhlamuselo. Gadit yi mi pfuna ku GAD rito: ku vona tinhlamuselo hinkwato, ku kuma nhlamuselo leyi fambelanaka na xivulwa xa n'wina, ku vona rito hi xifaniso, ku tsala xivulwa xa n'wina mi kuma switsundzuxo, na ku tikambela ku fikela ri tshama.",
      },
      {
        q: "Xana ku na tipulani tihi ta mbhaliso?",
        a: "Ku na tinharhu. Basic i ya mahala, a yi laveli ku tsarisa, naswona yi katsa tinhlamuselo, swikombiso, na masungulo (laha rito ri humaka kona). Clear yi engetela tinhlamuselo ta vana, swivulavulelo na swivulwa, swifaniso, ku lava hi rito, ntoloveto wa swivulwa hi switsundzuxo, na matimu ya ku lava, yi ri na masiku ya 14 ya ndzingo wa mahala. Deep yi engetela mavutiso yo tirhisana lama mi pfunaka ku khomelela hakunene leswi mi swi dyondzeke.",
      },
      {
        q: "Xana ndzi nga khansela mbhaliso wa mina nkarhi wun'wana na wun'wana?",
        a: "Ina. Mi nga khansela mbhaliso wa n'wina nkarhi wun'wana na wun'wana eka ndhawu ya akhawunti ya n'wina. Ku nghena eka pulani yo hakeriwa ku tshama ku fikela emakumu ka nkarhi wa sweswi wa ku hakela.",
      },
      {
        q: "Xana tinhlamuselo ta Gadit ti lulamile ku fikela kwihi?",
        a: "Tinhlamuselo ti tsariwa leswaku ti twala, ti pfuna, naswona ti tshembeka eka ndlela leyi marito ma tirhisiwaka ha yona hakunene.",
      },
      {
        q: "Ku humelela yini hi vuxokoxoko na matimu ya mina ya ku lava?",
        a: "Vuxokoxoko bya akhawunti ya n'wina, matimu ya ku lava (ku fika eka marito ya 10 ya sweswinyana), na swifaniso leswi endliweke swi hlayisiwa hi ndlela leyi sirhelelekeke. A hi tshuki hi xavisa vuxokoxoko bya n'wina. Leswaku mi kuma vuxokoxoko hinkwabyo, langutani Pholisi ya hina ya Xihundla.",
      },
    ],
  },
  ss: {
    pageTitle: "Xhumana Natsi & Imibuto",
    pageSubtitle: "Imibuto levamile, nekutsi ungasitfola njani uma ungakutfoli loko lokufunako.",
    faqHeading: "Imibuto lebutwa kakhulu",
    stillNeedHelpHeading: "Usadzinga lusito?",
    stillNeedHelpBody: "Uma umbuto wakho ungakaphendvulwa lapha, sitfumelele i-imeyili ngco. Siyawufundza wonkhe umlayeto.",
    emailButton: "Tfumela i-imeyili elusitweni",
    responseTime: "Sivame kuphendvula ngekhatsi kwemahora langu-24 kuya ku-48.",
    faq: [
      {
        q: "Iyini Gadit?",
        a: "Gadit isichazamagama sekucondza ligama ngempela. Utfola tinchazelo, tibonelo letivela emphilweni yangempela, imvelaphi, tisho netinkhulumo, tinchazelo tebantfwana, sitfombe, kuticecesha imisho lokunemibono, nemibuto lemifishane. Konkhe endzaweni yinye.",
      },
      {
        q: "Gadit isekela tiphi tilwimi?",
        a: "Sikrini nyalo sisekela siNgisi, siHebheru, si-Arabhu, siRashiya, siSpanishi, siPutukezi, nesiFulentshi, futsi letinye tiyeta.",
      },
      {
        q: "Gadit yehluke njani esichazamagameni lesijwayelekile?",
        a: "Sichazamagama lesijwayelekile sikunika inchazelo. Gadit ikusita u-GAD ligama: ubone tonkhe tinchazelo, utfole inchazelo lefanele umusho wakho, ubone ligama esitfombeni, ubhale umusho wakho utfole imibono, futsi utihlole kuze lihlale ekhanda.",
      },
      {
        q: "Ngumaphi emahlelo ekubhalisa lakhona?",
        a: "Kunemahlelo lamatsatfu. Basic ingemahhala, ayidzingi kubhalisa, futsi ifaka tinchazelo, tibonelo, nemvelaphi (lapho ligama livela khona). Clear yengeta tinchazelo tebantfwana, tisho netinkhulumo, titfombe, kufaka ngelivi, kuticecesha imisho lokunemibono, nemlandvo wekusesha, kanye nemalanga langu-14 ekulinga kwamahhala. Deep yengeta imibuto lehlanganyelako lekusita ugcine ngempela loko lokufundzile.",
      },
      {
        q: "Ngingakhansela kubhalisa kwami nobe nini?",
        a: "Yebo. Ungakhansela kubhalisa kwakho nobe nini endzaweni ye-akhawunti yakho. Kungena kulihlelo lelikhokhelwako kuhlala kuze kuphele sikhatsi sekukhokha samanje.",
      },
      {
        q: "Tinchazelo te-Gadit tinembe kangakanani?",
        a: "Tinchazelo tibhalwa kute ticace, tisite, futsi tetsembeke endleleni emagama lasetjentiswa ngayo ngempela.",
      },
      {
        q: "Kwentekani ngemininingwane yami nemlandvo wami wekusesha?",
        a: "Imininingwane ye-akhawunti yakho, umlandvo wekusesha (kufika emagameni la-10 lasandza kuseshwa), netitfombe letidaliwe kugcinwa ngekuphepha. Asilokutsengisi imininingwane yakho. Kute utfole imininingwane lephelele, buka Inchubomgomo Yetfu Yemfihlo.",
      },
    ],
  },
  ve: {
    pageTitle: "Kwamani & Mbudziso",
    pageSubtitle: "Mbudziso dzi ḓivheaho, na nḓila ya u ri kwama arali ni sa wani zwine na khou zwi ṱoḓa.",
    faqHeading: "Mbudziso dzine dza vhudziswa kanzhi",
    stillNeedHelpHeading: "Ni kha ḓi ṱoḓa thuso?",
    stillNeedHelpBody: "Arali mbudziso yaṋu i sa fhindulwi fhano, ri rumeleni imeiḽi. Ri vhala mulaedza muṅwe na muṅwe.",
    emailButton: "Rumelani imeiḽi kha thuso",
    responseTime: "Kanzhi ri fhindula nga awara dza 24 u swika 48.",
    faq: [
      {
        q: "Gadit ndi mini?",
        a: "Gadit ndi bugu ya maipfi ya u pfesesa ipfi vhukuma. Ni wana ndeme, tsumbo dza vhutshilo ha ḓuvha ḽiṅwe na ḽiṅwe, vhubvo ha ipfi, mirero na maambele, ṱhalutshedzo dza vhana, tshifanyiso, nḓowelo ya mitaladzi i na vhuṱanzi, na mbudziso pfufhi. Zwoṱhe fhethu huthihi.",
      },
      {
        q: "Gadit i shuma nga nyambo dzifhio?",
        a: "Zwino tshikirini tshi shuma nga Luisimane, Luheberu, Luarabu, Lurashia, Lusipenishi, Luphothugisi, na Lufurentshi, nahone dziṅwe dzi khou ḓa.",
      },
      {
        q: "Gadit i fhambana hani na bugu ya maipfi ya misi yoṱhe?",
        a: "Bugu ya maipfi ya misi yoṱhe i ni ṋea ṱhalutshedzo. Gadit i ni thusa u GAD ipfi: u vhona ndeme dzoṱhe, u wana ndeme ine ya tshimbilelana na mutaladzi waṋu, u vhona ipfi sa tshifanyiso, u ṅwala mutaladzi waṋu ni wane vhuṱanzi, na u ḓilinga u swika ḽi tshi dzula.",
      },
      {
        q: "Hu na pulane dzifhio dza ṅwaliso?",
        a: "Hu na tharu. Basic ndi ya mahala, a i ṱoḓi u ḓiṅwalisa, nahone i katela ṱhalutshedzo, tsumbo, na vhubvo ha ipfi (hune ipfi ḽa bva hone). Clear i engedza ṱhalutshedzo dza vhana, mirero na maambele, zwifanyiso, u amba nga ipfi, nḓowelo ya mitaladzi i na vhuṱanzi, na zwe na ṱoḓa, hu na maḓuvha a 14 a tshilingo tsha mahala. Deep i engedza mbudziso dzine dza ni thusa u vhulunga vhukuma zwe na guda.",
      },
      {
        q: "Naa ndi nga khansela ṅwaliso wanga tshifhinga tshiṅwe na tshiṅwe?",
        a: "Ee. Ni nga khansela ṅwaliso waṋu tshifhinga tshiṅwe na tshiṅwe kha fhethu ha akhaunthu yaṋu. Ni dzula ni tshi dzhena kha pulane ya u badelwa u swika magumoni a tshifhinga tsha mbadelo tshi re hone.",
      },
      {
        q: "Ṱhalutshedzo dza Gadit ndi dza vhukuma lungafhani?",
        a: "Ṱhalutshedzo dzo ṅwalwa uri dzi pfesesee, dzi thuse, nahone dzi fulufhedzee u ya nga nḓila ine maipfi a shumiswa ngayo vhukuma.",
      },
      {
        q: "Hu itea mini kha mafhungo anga na zwe nda ṱoḓa?",
        a: "Mafhungo a akhaunthu yaṋu, zwe na ṱoḓa (u swika kha maipfi a 10 a zwenezwino), na zwifanyiso zwo itwaho zwi vhulungwa nga nḓila yo tsireledzeaho. A ri rengisi mafhungo aṋu. Kha zwidodombedzwa zwoṱhe, vhonani Mbekanyamaitele yashu ya Tshiphiri.",
      },
    ],
  },
  nr: {
    pageTitle: "Thintana nathi & Imibuzo",
    pageSubtitle: "Imibuzo evamileko, nendlela yokusifikelela nange ungakuthola lokho okufunako.",
    faqHeading: "Imibuzo ebuzwa kanengi",
    stillNeedHelpHeading: "Usatlhoga isizo?",
    stillNeedHelpBody: "Nange umbuzo wakho ungaphendulwa lapha, sithumelele i-imeyili ngokuqondileko. Sifunda yoke imilayezo.",
    emailButton: "Thumela i-imeyili esizweni",
    responseTime: "Kanengi siphendula phakathi kwamahora ama-24 ukuya kwama-48.",
    faq: [
      {
        q: "Iyini i-Gadit?",
        a: "I-Gadit sisihlathululimezwi sokuzwisisa ilizwi ngamambala. Uthola iinhlathululo, izibonelo zepilo yamambala, umsuka welizwi, izaga neenkulumo, iinhlathululo zabantwana, isithombe, ukuzilolonga imitjho namazwana, neenkhwizi ezifitjhani. Koke endaweni yinye.",
      },
      {
        q: "I-Gadit isekela maphi amalimi?",
        a: "Ukusebenzisa nje kusekela isiNgisi, isiHebheru, isi-Arabhu, isiRhashiya, isiPanitjhi, isiPutukezi nesiFurentjhi, begodu amanye ayeza.",
      },
      {
        q: "I-Gadit yehluke njani esihlathululimezwini esijayelekileko?",
        a: "Isihlathululimezwi esijayelekileko sikunikela ihlathululo. I-Gadit ikusiza bona wenze i-GAD elizwini: ubone zoke iinhlathululo, uthole ihlathululo efanelana nomutjho wakho, ubone ilizwi ngesithombe, utlole umutjho wakho uthole amazwana, begodu uzihlole bekube lihlala ehlokweni.",
      },
      {
        q: "Ngimaphi amahlelo wokubhalisela atholakalako?",
        a: "Mathathu. I-Basic imahala, ayitlhogi ukubhalisa, begodu ifaka iinhlathululo, izibonelo nomsuka welizwi. I-Clear yengeza iinhlathululo zabantwana, izaga neenkulumo, izithombe, ukufaka ngelizwi, ukuzilolonga imitjho namazwana, nomlando wokufuna, kunamalanga ali-14 wokulinga mahala. I-Deep yengeza iinkhwizi ezisebenzisanako ezikusiza bona ubambelele ngamambala kilokho okufundileko.",
      },
      {
        q: "Ngingakhansela ukubhalisela kwami nanyana kunini?",
        a: "Iye. Ungakhansela ukubhalisela kwakho nanyana kunini endaweni ye-akhawunti yakho. Ukungena ehlelweni elibhadelelwako kuhlala bekube kuphela isikhathi sokubhadela sanje.",
      },
      {
        q: "Iinhlathululo ze-Gadit zinembe kangangani?",
        a: "Iinhlathululo zitlolwa bona zikhanye, zisize, begodu zithembeke endleleni amezwi asetjenziswa ngayo ngamambala.",
      },
      {
        q: "Kwenzekani ngemininingwana yami nomlando wokufuna?",
        a: "Imininingwana ye-akhawunti yakho, umlando wokufuna (amezwi ali-10 wakutjhanje), nezithombe ezenziweko kubulungwa ngokuphephileko. Asikhe sathengise imininingwana yakho. Ngemininingwana epheleleko, bona uMthethomgomo Wefihlo wethu.",
      },
    ],
  },

  el: {
    pageTitle: "Επικοινωνία και συχνές ερωτήσεις",
    pageSubtitle: "Συχνές ερωτήσεις, και πώς να επικοινωνήσεις μαζί μας αν δεν βρεις αυτό που ψάχνεις.",
    faqHeading: "Συχνές ερωτήσεις",
    stillNeedHelpHeading: "Χρειάζεσαι κι άλλη βοήθεια;",
    stillNeedHelpBody: "Αν δεν βρίσκεις εδώ την απάντηση, γράψε μας απευθείας. Διαβάζουμε κάθε μήνυμα.",
    emailButton: "Στείλε email στην υποστήριξη",
    responseTime: "Συνήθως απαντάμε μέσα σε 24 έως 48 ώρες.",
    faq: [
      {
        q: "Τι είναι το Gadit;",
        a: "Το Gadit είναι ένα λεξικό για να καταλαβαίνεις μια λέξη στα αλήθεια. Παίρνεις σημασίες, παραδείγματα από την πραγματική ζωή, ετυμολογία, ιδιωματισμούς και εκφράσεις, εξηγήσεις για παιδιά, μια εικόνα, εξάσκηση σε προτάσεις με σχόλια, και σύντομα κουίζ. Όλα σε ένα μέρος.",
      },
      {
        q: "Ποιες γλώσσες υποστηρίζει το Gadit;",
        a: "Η διεπαφή υποστηρίζει αυτή τη στιγμή αγγλικά, εβραϊκά, αραβικά, ρωσικά, ισπανικά, πορτογαλικά και γαλλικά, με κι άλλες στον δρόμο.",
      },
      {
        q: "Σε τι διαφέρει το Gadit από ένα κοινό λεξικό;",
        a: "Ένα κοινό λεξικό σου δίνει έναν ορισμό. Το Gadit σε βοηθάει να κάνεις GAD τη λέξη: να δεις κάθε σημασία, να πάρεις τη σημασία που ταιριάζει στην πρότασή σου, να δεις τη λέξη ως εικόνα, να γράψεις τη δική σου πρόταση και να πάρεις σχόλια, και να κάνεις κουίζ στον εαυτό σου μέχρι να μείνει.",
      },
      {
        q: "Ποια συνδρομητικά πακέτα είναι διαθέσιμα;",
        a: "Υπάρχουν τρία. Το Basic είναι δωρεάν, δεν χρειάζεται εγγραφή, και περιλαμβάνει ορισμούς, παραδείγματα, και ετυμολογία (την προέλευση της λέξης). Το Clear προσθέτει εξηγήσεις για παιδιά, ιδιωματισμούς και εκφράσεις, εικονογραφήσεις, φωνητική εισαγωγή, εξάσκηση σε προτάσεις με σχόλια, και ιστορικό αναζήτησης, με 14 ημέρες δωρεάν δοκιμής. Το Deep προσθέτει διαδραστικά κουίζ που σε βοηθούν να εμπεδώσεις στα αλήθεια αυτά που έμαθες.",
      },
      {
        q: "Μπορώ να ακυρώσω τη συνδρομή μου οποιαδήποτε στιγμή;",
        a: "Ναι. Μπορείς να ακυρώσεις τη συνδρομή σου οποιαδήποτε στιγμή από την περιοχή του λογαριασμού σου. Η πρόσβαση στο επί πληρωμή πακέτο παραμένει μέχρι το τέλος της τρέχουσας περιόδου χρέωσης.",
      },
      {
        q: "Πόσο ακριβείς είναι οι ορισμοί του Gadit;",
        a: "Οι ορισμοί γράφονται ώστε να είναι σαφείς, χρήσιμοι, και πιστοί στον τρόπο που χρησιμοποιούνται πραγματικά οι λέξεις.",
      },
      {
        q: "Τι γίνεται με τα δεδομένα μου και το ιστορικό αναζήτησής μου;",
        a: "Τα δεδομένα του λογαριασμού σου, το ιστορικό αναζήτησης (έως τις 10 πιο πρόσφατες λέξεις), και οι εικόνες που δημιουργούνται αποθηκεύονται με ασφάλεια. Δεν πουλάμε ποτέ τα δεδομένα σου. Για όλες τις λεπτομέρειες, δες την Πολιτική Απορρήτου μας.",
      },
    ],
  },

  he: {
    pageTitle: "יצירת קשר ושאלות נפוצות",
    pageSubtitle: "שאלות נפוצות, ואיך אפשר לפנות אלינו אם לא מצאתם את מה שחיפשתם.",
    faqHeading: "שאלות נפוצות",
    stillNeedHelpHeading: "עדיין צריכים עזרה?",
    stillNeedHelpBody: "אם השאלה שלכם לא מופיעה כאן, פשוט כתבו לנו. אנחנו קוראים כל הודעה.",
    emailButton: "שליחת מייל לתמיכה",
    responseTime: "בדרך כלל אנחנו חוזרים תוך 24 עד 48 שעות.",
    faq: [
      {
        q: "מה זה Gadit?",
        a: "Gadit הוא מילון להבנת מילה עד הסוף. אנחנו קוראים לזה לעשות GAD למילה. מקבלים את כל המשמעויות, דוגמאות מהחיים, אטימולוגיה (מקור המילה), ניבים וצירופי מילים, הסבר לילדים, תמונה, תרגול משפטים עם פידבק, וחידונים קצרים. הכל במקום אחד.",
      },
      {
        q: "באילו שפות Gadit תומך?",
        a: "הממשק תומך כרגע באנגלית, עברית, ערבית, רוסית, ספרדית, פורטוגזית וצרפתית, ועוד שפות בדרך.",
      },
      {
        q: "במה Gadit שונה ממילון רגיל?",
        a: "מילון רגיל נותן הגדרה. Gadit עוזר לכם לעשות GAD למילה: לראות את כל המשמעויות, לקבל את ההגדרה שמתאימה למשפט שלכם, לראות את המילה כתמונה, לכתוב משפט משלכם ולקבל פידבק, ולעבור חידון קצר עד שהיא נדבקת.",
      },
      {
        q: "מה הם סוגי המנויים הקיימים?",
        a: "יש שלושה סוגים. Basic הוא חינמי, לא דורש הרשמה, וכולל הגדרות, דוגמאות, ואטימולוגיה (מקור המילה). Clear מוסיף הסברים לילדים, ניבים וצירופי מילים, המחשה בתמונות, הקלדה קולית, תרגול משפטים עם פידבק, והיסטוריית חיפושים, עם 14 ימי התנסות חינם. Deep מוסיף חידונים אינטראקטיביים שעוזרים להטמיע את החומר.",
      },
      {
        q: "האם אני יכול לבטל את המנוי בכל עת?",
        a: "כן. ניתן לבטל את המנוי בכל עת דרך אזור החשבון שלך. הגישה לתוכנית בתשלום נשמרת עד סוף תקופת החיוב הנוכחית.",
      },
      {
        q: "עד כמה ההגדרות של Gadit מדויקות?",
        a: "ההגדרות נכתבות כך שיהיו ברורות, מועילות ונאמנות לאופן שבו המילים באמת בשימוש.",
      },
      {
        q: "מה קורה למידע ולהיסטוריית החיפוש שלי?",
        a: "נתוני החשבון, היסטוריית החיפוש (עד 10 מילים אחרונות), והתמונות שנוצרו נשמרים באופן מאובטח. אנחנו לא מוכרים את המידע שלכם. לפרטים מלאים, אפשר לעיין במדיניות הפרטיות.",
      },
    ],
  },

  ar: {
    pageTitle: "الاتصال والأسئلة الشائعة",
    pageSubtitle: "الأسئلة الشائعة، وكيف يمكنك التواصل معنا إذا لم تجد ما تبحث عنه.",
    faqHeading: "الأسئلة الشائعة",
    stillNeedHelpHeading: "ما زلت بحاجة إلى المساعدة؟",
    stillNeedHelpBody: "إذا لم تجد إجابة سؤالك هنا، راسلنا مباشرةً. نحن نقرأ كل رسالة.",
    emailButton: "مراسلة الدعم",
    responseTime: "نرد عادةً خلال 24 إلى 48 ساعة.",
    faq: [
      {
        q: "ما هو Gadit؟",
        a: "Gadit قاموس ذكي يتجاوز التعريف العادي بكثير. تحصل على معانٍ واضحة، أمثلة من الحياة الواقعية، علم اشتقاق (أصل الكلمة)، تعابير اصطلاحية وعبارات شائعة، شروحات للأطفال، رسوم توضيحية، تدريب على الجمل مع تغذية راجعة، واختبارات قصيرة. وتُضاف ميزات جديدة باستمرار لضمان أن يفهم الجميع الكلمات حقًا.",
      },
      {
        q: "ما اللغات التي يدعمها Gadit؟",
        a: "تدعم الواجهة حاليًا الإنجليزية، العبرية، العربية، الروسية، الإسبانية، البرتغالية، والفرنسية، والمزيد قادم.",
      },
      {
        q: "كيف يختلف Gadit عن قاموس عادي؟",
        a: "القاموس العادي يعطيك تعريفًا وبعض الأمثلة. مع Gadit يمكنك توضيح الكلمة بصورة، يمكنك كتابة جملة كاملة بالكلمة والحصول بالضبط على المعنى الذي يناسب السياق، يمكنك التدرب على الكلمة بكتابة جملتك الخاصة والحصول على تغذية راجعة، وفي النهاية يمكنك أيضًا إجراء اختبار قصير لتثبيتها.",
      },
      {
        q: "ما هي خطط الاشتراك المتاحة؟",
        a: "هناك ثلاث خطط. Basic مجانية، لا تتطلب تسجيلًا، وتشمل التعريفات، الأمثلة، وعلم الاشتقاق (أصل الكلمة). Clear تضيف شروحات للأطفال، تعابير اصطلاحية وعبارات شائعة، رسومًا توضيحية، إدخالًا صوتيًا، تدريبًا على الجمل مع تغذية راجعة، وسجل البحث، مع 14 يومًا تجريبيًا مجانيًا. Deep تضيف اختبارات تفاعلية تساعدك على تثبيت ما تعلمته.",
      },
      {
        q: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
        a: "نعم. يمكنك إلغاء اشتراكك في أي وقت من منطقة حسابك. يستمر الوصول إلى الخطة المدفوعة حتى نهاية فترة الفوترة الحالية.",
      },
      {
        q: "ما مدى دقة تعريفات Gadit؟",
        a: "تُكتب التعريفات لتكون واضحة، مفيدة، ووفية للطريقة التي تُستخدم بها الكلمات فعلًا.",
      },
      {
        q: "ماذا يحدث لبياناتي وسجل البحث الخاص بي؟",
        a: "بيانات حسابك، سجل البحث (حتى 10 كلمات حديثة)، والصور التي تم إنشاؤها تُخزَّن بأمان. نحن لا نبيع بياناتك أبدًا. للتفاصيل الكاملة، يمكنك مراجعة سياسة الخصوصية.",
      },
    ],
  },

  ru: {
    pageTitle: "Контакты и частые вопросы",
    pageSubtitle: "Часто задаваемые вопросы и как с нами связаться, если вы не нашли ответ.",
    faqHeading: "Часто задаваемые вопросы",
    stillNeedHelpHeading: "Нужна ещё помощь?",
    stillNeedHelpBody: "Если вашего вопроса нет здесь, напишите нам напрямую. Мы читаем каждое сообщение.",
    emailButton: "Написать в поддержку",
    responseTime: "Обычно отвечаем в течение 24 до 48 часов.",
    faq: [
      {
        q: "Что такое Gadit?",
        a: "Gadit, это умный словарь, который выходит далеко за рамки обычного определения. Вы получаете ясные значения, живые примеры, этимологию (происхождение слова), идиомы и устойчивые выражения, объяснения для детей, иллюстрации, практику предложений с обратной связью и короткие викторины. Постоянно добавляются новые возможности, чтобы каждый по-настоящему понимал слова.",
      },
      {
        q: "Какие языки поддерживает Gadit?",
        a: "Интерфейс сейчас поддерживает английский, иврит, арабский, русский, испанский, португальский и французский, и добавятся ещё.",
      },
      {
        q: "Чем Gadit отличается от обычного словаря?",
        a: "Обычный словарь даёт определение и несколько примеров. В Gadit можно проиллюстрировать слово картинкой, можно написать целое предложение со словом и получить именно то значение, которое подходит контексту, можно потренироваться, написав своё собственное предложение и получить обратную связь, а в конце можно ещё пройти короткую викторину, чтобы закрепить его.",
      },
      {
        q: "Какие тарифы существуют?",
        a: "Их три. Basic бесплатный, не требует регистрации и включает определения, примеры и этимологию (происхождение слова). Clear добавляет объяснения для детей, идиомы и устойчивые выражения, иллюстрации, голосовой ввод, практику предложений с обратной связью и историю поиска, с 14 днями бесплатного пробного периода. Deep добавляет интерактивные викторины, которые помогают по-настоящему закрепить пройденное.",
      },
      {
        q: "Могу ли я отменить подписку в любое время?",
        a: "Да. Вы можете отменить подписку в любое время в разделе аккаунта. Доступ к платному тарифу сохраняется до конца текущего периода оплаты.",
      },
      {
        q: "Насколько точны определения Gadit?",
        a: "Определения пишутся так, чтобы быть ясными, полезными и верными тому, как слова реально используются.",
      },
      {
        q: "Что происходит с моими данными и историей поиска?",
        a: "Данные аккаунта, история поиска (до 10 недавних слов) и созданные изображения хранятся в защищённом виде. Мы никогда не продаём ваши данные. Подробнее можно прочитать в Политике конфиденциальности.",
      },
    ],
  },

  es: {
    pageTitle: "Contacto y preguntas frecuentes",
    pageSubtitle: "Preguntas comunes y cómo comunicarte con nosotros si no encuentras lo que buscas.",
    faqHeading: "Preguntas frecuentes",
    stillNeedHelpHeading: "¿Todavía necesitas ayuda?",
    stillNeedHelpBody: "Si tu pregunta no está aquí, escríbenos directamente. Leemos cada mensaje.",
    emailButton: "Escribir a soporte",
    responseTime: "Solemos responder en 24 a 48 horas.",
    faq: [
      {
        q: "¿Qué es Gadit?",
        a: "Gadit es un diccionario inteligente que va mucho más allá de una definición común. Obtienes significados claros, ejemplos de la vida real, etimología (el origen de la palabra), modismos y expresiones, explicaciones para niños, ilustraciones, práctica de oraciones con retroalimentación y cuestionarios breves. Se añaden nuevas funciones todo el tiempo para que todos entiendan de verdad las palabras.",
      },
      {
        q: "¿Qué idiomas admite Gadit?",
        a: "La interfaz actualmente admite inglés, hebreo, árabe, ruso, español, portugués y francés, y habrá más.",
      },
      {
        q: "¿En qué se diferencia Gadit de un diccionario común?",
        a: "Un diccionario común te da una definición y algunos ejemplos. Con Gadit puedes ilustrar la palabra con una imagen, puedes escribir una oración completa con la palabra y obtener exactamente el significado que encaja con el contexto, puedes practicar la palabra escribiendo tu propia oración y recibir retroalimentación, y al final también puedes hacer un cuestionario breve para fijarla.",
      },
      {
        q: "¿Qué planes de suscripción están disponibles?",
        a: "Hay tres. Basic es gratis, no requiere registro, e incluye definiciones, ejemplos y etimología (el origen de la palabra). Clear añade explicaciones para niños, modismos y expresiones, ilustraciones, entrada por voz, práctica de oraciones con retroalimentación e historial de búsqueda, con 14 días de prueba gratis. Deep añade cuestionarios interactivos que te ayudan a fijar de verdad lo aprendido.",
      },
      {
        q: "¿Puedo cancelar mi suscripción en cualquier momento?",
        a: "Sí. Puedes cancelar tu suscripción en cualquier momento desde tu área de cuenta. El acceso al plan de pago se mantiene hasta el final del período de facturación actual.",
      },
      {
        q: "¿Qué tan precisas son las definiciones de Gadit?",
        a: "Las definiciones están escritas para ser claras, útiles y fieles a cómo se usan realmente las palabras.",
      },
      {
        q: "¿Qué pasa con mis datos y mi historial de búsqueda?",
        a: "Los datos de tu cuenta, tu historial de búsqueda (hasta 10 palabras recientes) y las imágenes generadas se almacenan de forma segura. Nunca vendemos tus datos. Para más detalles, puedes consultar nuestra Política de Privacidad.",
      },
    ],
  },

  pt: {
    pageTitle: "Contato e perguntas frequentes",
    pageSubtitle: "Perguntas comuns e como falar conosco se você não encontrar o que procura.",
    faqHeading: "Perguntas frequentes",
    stillNeedHelpHeading: "Ainda precisa de ajuda?",
    stillNeedHelpBody: "Se sua pergunta não está aqui, escreva para a gente. Lemos todas as mensagens.",
    emailButton: "Enviar e-mail ao suporte",
    responseTime: "Costumamos responder em 24 a 48 horas.",
    faq: [
      {
        q: "O que é o Gadit?",
        a: "O Gadit é um dicionário inteligente que vai muito além de uma definição comum. Você recebe significados claros, exemplos do dia a dia, etimologia (a origem da palavra), expressões idiomáticas e combinações de palavras, explicações para crianças, ilustrações, prática de frases com feedback e quizzes curtos. Novas funcionalidades são adicionadas o tempo todo para garantir que todos realmente entendam as palavras.",
      },
      {
        q: "Quais idiomas o Gadit suporta?",
        a: "A interface atualmente oferece inglês, hebraico, árabe, russo, espanhol, português e francês, com mais a caminho.",
      },
      {
        q: "Como o Gadit é diferente de um dicionário comum?",
        a: "Um dicionário comum dá uma definição e alguns exemplos. No Gadit você pode ilustrar a palavra com uma imagem, pode escrever uma frase completa com a palavra e receber exatamente o significado que combina com o contexto, pode praticar a palavra escrevendo sua própria frase e receber feedback, e no final ainda pode fazer um quiz curto para fixá-la.",
      },
      {
        q: "Quais planos de assinatura estão disponíveis?",
        a: "Existem três. Basic é gratuito, não exige cadastro, e inclui definições, exemplos e etimologia (a origem da palavra). Clear adiciona explicações para crianças, expressões idiomáticas e combinações de palavras, ilustrações, entrada de voz, prática de frases com feedback e histórico de buscas, com 14 dias de teste grátis. Deep adiciona quizzes interativos que ajudam você a fixar de verdade o que aprendeu.",
      },
      {
        q: "Posso cancelar minha assinatura a qualquer momento?",
        a: "Sim. Você pode cancelar sua assinatura a qualquer momento na sua área de conta. O acesso ao plano pago permanece até o fim do período de cobrança atual.",
      },
      {
        q: "Quão precisas são as definições do Gadit?",
        a: "As definições são escritas para serem claras, úteis e fiéis ao modo como as palavras são realmente usadas.",
      },
      {
        q: "O que acontece com meus dados e meu histórico de buscas?",
        a: "Os dados da sua conta, o histórico de buscas (até 10 palavras recentes) e as imagens geradas ficam armazenados com segurança. Nunca vendemos seus dados. Para detalhes completos, você pode consultar nossa Política de Privacidade.",
      },
    ],
  },

  fr: {
    pageTitle: "Contact et questions fréquentes",
    pageSubtitle: "Questions courantes et comment nous contacter si vous ne trouvez pas ce que vous cherchez.",
    faqHeading: "Foire aux questions",
    stillNeedHelpHeading: "Besoin d'aide supplémentaire ?",
    stillNeedHelpBody: "Si votre question n'a pas de réponse ici, écrivez-nous directement. Nous lisons chaque message.",
    emailButton: "Contacter le support",
    responseTime: "Nous répondons généralement sous 24 à 48 heures.",
    faq: [
      {
        q: "Qu'est-ce que Gadit ?",
        a: "Gadit est un dictionnaire intelligent qui va bien au-delà d'une définition classique. Vous obtenez des significations claires, des exemples de la vie réelle, l'étymologie (l'origine du mot), des expressions et tournures, des explications pour enfants, des illustrations, un entraînement aux phrases avec retour, et de courts quiz. De nouvelles fonctionnalités sont ajoutées en permanence pour que chacun comprenne vraiment les mots.",
      },
      {
        q: "Quelles langues Gadit prend-il en charge ?",
        a: "L'interface prend actuellement en charge l'anglais, l'hébreu, l'arabe, le russe, l'espagnol, le portugais et le français, et d'autres arrivent.",
      },
      {
        q: "En quoi Gadit est-il différent d'un dictionnaire classique ?",
        a: "Un dictionnaire classique donne une définition et quelques exemples. Avec Gadit vous pouvez illustrer le mot par une image, vous pouvez écrire une phrase complète avec le mot et obtenir exactement le sens qui correspond au contexte, vous pouvez vous entraîner sur le mot en écrivant votre propre phrase et recevoir un retour, et à la fin vous pouvez aussi passer un court quiz pour bien l'ancrer.",
      },
      {
        q: "Quelles formules d'abonnement sont disponibles ?",
        a: "Il y en a trois. Basic est gratuite, ne nécessite pas d'inscription, et inclut les définitions, les exemples et l'étymologie (l'origine du mot). Clear ajoute les explications pour enfants, les expressions et tournures, les illustrations, la saisie vocale, l'entraînement aux phrases avec retour, et l'historique de recherche, avec 14 jours d'essai gratuit. Deep ajoute des quiz interactifs qui vous aident à vraiment ancrer ce que vous avez appris.",
      },
      {
        q: "Puis-je annuler mon abonnement à tout moment ?",
        a: "Oui. Vous pouvez annuler votre abonnement à tout moment depuis votre espace compte. L'accès à la formule payante est conservé jusqu'à la fin de la période de facturation en cours.",
      },
      {
        q: "Quelle est la précision des définitions de Gadit ?",
        a: "Les définitions sont rédigées pour être claires, utiles et fidèles à la façon dont les mots sont réellement utilisés.",
      },
      {
        q: "Que deviennent mes données et mon historique de recherche ?",
        a: "Les données de votre compte, votre historique (jusqu'à 10 mots récents) et les images générées sont stockés en toute sécurité. Nous ne vendons jamais vos données. Pour plus de détails, vous pouvez consulter notre Politique de confidentialité.",
      },
    ],
  },
  de: {
    pageTitle: "Contact & FAQ",
    pageSubtitle: "Common questions, and how to reach us if you can't find what you're looking for.",
    faqHeading: "Frequently asked questions",
    stillNeedHelpHeading: "Still need help?",
    stillNeedHelpBody: "If your question isn't answered here, email us directly. We read every message.",
    emailButton: "Email support",
    responseTime: "We usually reply within 24 to 48 hours.",
    faq: [
      {
        q: "What is Gadit?",
        a: "Gadit is a dictionary for truly understanding a word. You get meanings, real-life examples, etymology, idioms and expressions, kids' explanations, an image, sentence practice with feedback, and short quizzes. All in one place.",
      },
      {
        q: "Which languages does Gadit support?",
        a: "The interface currently supports English, Hebrew, Arabic, Russian, Spanish, Portuguese, and French, with more on the way.",
      },
      {
        q: "How is Gadit different from a regular dictionary?",
        a: "A regular dictionary gives you a definition. Gadit helps you GAD the word: see every meaning, get the meaning that fits your sentence, view the word as an image, write your own sentence and get feedback, and quiz yourself until it sticks.",
      },
      {
        q: "What subscription plans are available?",
        a: "There are three. Basic is free, requires no signup, and includes definitions, examples, and etymology (the origin of the word). Clear adds kids' explanations, idioms and expressions, illustrations, voice input, sentence practice with feedback, and search history, with 14 free trial days. Deep adds interactive quizzes that help you really lock in what you learned.",
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes. You can cancel your subscription at any time from your account area. Access to the paid plan remains until the end of the current billing period.",
      },
      {
        q: "How accurate are Gadit's definitions?",
        a: "Definitions are written to be clear, useful, and faithful to how words are actually used.",
      },
      {
        q: "What happens to my data and search history?",
        a: "Your account data, search history (up to the 10 most recent words), and generated images are stored securely. We never sell your data. For full details, see our Privacy Policy.",
      },
    ],
  },
  cs: {
    pageTitle: "Contact & FAQ",
    pageSubtitle: "Common questions, and how to reach us if you can't find what you're looking for.",
    faqHeading: "Frequently asked questions",
    stillNeedHelpHeading: "Still need help?",
    stillNeedHelpBody: "If your question isn't answered here, email us directly. We read every message.",
    emailButton: "Email support",
    responseTime: "We usually reply within 24 to 48 hours.",
    faq: [
      {
        q: "What is Gadit?",
        a: "Gadit is a dictionary for truly understanding a word. You get meanings, real-life examples, etymology, idioms and expressions, kids' explanations, an image, sentence practice with feedback, and short quizzes. All in one place.",
      },
      {
        q: "Which languages does Gadit support?",
        a: "The interface currently supports English, Hebrew, Arabic, Russian, Spanish, Portuguese, and French, with more on the way.",
      },
      {
        q: "How is Gadit different from a regular dictionary?",
        a: "A regular dictionary gives you a definition. Gadit helps you GAD the word: see every meaning, get the meaning that fits your sentence, view the word as an image, write your own sentence and get feedback, and quiz yourself until it sticks.",
      },
      {
        q: "What subscription plans are available?",
        a: "There are three. Basic is free, requires no signup, and includes definitions, examples, and etymology (the origin of the word). Clear adds kids' explanations, idioms and expressions, illustrations, voice input, sentence practice with feedback, and search history, with 14 free trial days. Deep adds interactive quizzes that help you really lock in what you learned.",
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes. You can cancel your subscription at any time from your account area. Access to the paid plan remains until the end of the current billing period.",
      },
      {
        q: "How accurate are Gadit's definitions?",
        a: "Definitions are written to be clear, useful, and faithful to how words are actually used.",
      },
      {
        q: "What happens to my data and search history?",
        a: "Your account data, search history (up to the 10 most recent words), and generated images are stored securely. We never sell your data. For full details, see our Privacy Policy.",
      },
    ],
  },
});

// Italian + Japanese reuse the English content for now — the cs block
// above already does the same. Translating the full FAQ block is a
// separate sweep; this keeps the type complete and the build green so
// it/ja users at least see a populated Contact page instead of a 404.
CONTACT.it = CONTACT.en;
CONTACT.ja = CONTACT.en;
CONTACT.sk = CONTACT.en;
