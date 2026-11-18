import type { ReactElement } from "react";

export const titlesAf = { privacy: "Privaatheidsbeleid", terms: "Gebruiksvoorwaardes" };

export function PrivacyBodyAf(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;ons&rdquo; of &ldquo;ons s’n&rdquo;) is ’n diens wat bedryf word deur{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, ’n maatskappy wat in die Verenigde State
        geregistreer is. Hierdie Privaatheidsbeleid verduidelik watter inligting ons insamel, hoe ons dit gebruik en
        watter keuses u het.
      </p>
      <p>
        Indien u enige vraag het, kontak ons by{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Inligting wat ons insamel</h2>
      <h3>Rekeninginligting</h3>
      <p>
        Wanneer u ’n rekening skep, samel ons u e-posadres in en, indien u met Google aanmeld, die basiese
        profielinligting wat Google verskaf (vertoonnaam, profielfoto). Ons ontvang nie u Google-wagwoord nie.
      </p>
      <p>
        {"In die iOS-toepassing kan u ook met Apple aanmeld. Apple gee dan aan ons die naam en e-posadres wat u kies om te deel, wat ’n private relay-adres kan wees wat ons e-posse na u aanstuur. Ons ontvang nie u Apple-wagwoord nie."}
      </p>
      <h3>Gebruiksinligting</h3>
      <p>Wanneer u Gadit gebruik, verwerk ons:</p>
      <ul>
        <li>die woorde en opsionele sinne wat u naslaan;</li>
        <li>beelde wat op u versoek gegenereer word;</li>
        <li>u intekeningplan en faktureringstatus;</li>
        <li>’n onlangse soekgeskiedenis (vir betalende gebruikers, tot die laaste 10 woorde), wat gestoor word sodat u later weer toegang daartoe kan verkry;</li>
        <li>
          {"indien u die Gadit-assistent in die hulpsentrum gebruik: die vrae wat u vra, sy antwoorde en of u aangedui het dat ’n antwoord nuttig was, saam met u rekening-ID (en familie-ID, indien u een het), e-posadres, plan, koppelvlaktaal, en of u die webwerf of die toepassing gebruik het;"}
        </li>
        <li>maandelikse kwotas (byvoorbeeld die aantal beelde wat u in hierdie faktureringsiklus gegenereer het).</li>
      </ul>
      <p>
        {"Die Gadit-assistent word nie op kinderprofiele, in Kindermodus of aan besoekers wat nie aangemeld is nie, aangebied nie. Moet asseblief nie wagwoorde of kaartnommers daarin tik nie."}
      </p>
      <h3>Tegniese en analitiese data</h3>
      <p>
        Ons samel outomaties basiese tegniese inligting in, soos IP-adres, blaaiertipe, toesteltipe, verwysende URL
        en besigtigde bladsye. Dit word gebruik vir sekuriteit, prestasiemonitering en saamgevoegde analise. Die
        analise word deur Vercel verskaf en word by die punt van insameling geanonimiseer (geen persoonlike
        identifiseerders word gestoor nie). Op ons bemarkings-, registrasie- en betaalbladsye gebruik ons ook
        advertensie- en analisehulpmiddels, wat in Artikel 3 beskryf word.
      </p>
      <h3>Betalingsinligting</h3>
      <p>
        Indien u inteken, word betaling deur <strong>Stripe, Inc.</strong> verwerk. Ons sien of stoor nie u volledige
        kaartnommer nie; ons ontvang slegs ’n kliënttoken en die metadata wat nodig is om die intekening te
        identifiseer.
      </p>

      <h2>2. Hoe ons u inligting gebruik</h2>
      <ul>
        <li>om die Gadit-diens te verskaf en te verbeter (die generering van definisies, beelde, terugvoer op sinne, vasvrae);</li>
        <li>om u rekening in stand te hou en u ervaring te verpersoonlik (soekgeskiedenis, voorkeurtaal, Kindermodus-skakelaar);</li>
        <li>om intekeninge te verwerk en transaksionele e-posse te stuur (kwitansies, intekeningveranderinge);</li>
        <li>
          {"om u vrae in die Gadit-assistent te beantwoord en ons hulpantwoorde te verbeter, en, wanneer die assistent ’n vraag na ons span aanstuur, om die onlangse gesprek per e-pos aan die span te stuur saam met u naam, e-posadres, plan, koppelvlaktaal, en of u die webwerf of die toepassing gebruik het, sodat die span u per e-pos kan antwoord;"}
        </li>
        <li>om produkprestasie te meet en te verbeter en misbruik te voorkom;</li>
        <li>om aan wetlike verpligtinge te voldoen.</li>
      </ul>
      <p>
        Ons <strong>verkoop nie</strong> u persoonlike inligting nie, en ons gebruik nie u inhoud om aan u te
        adverteer nie.
      </p>

      <h2>3. Derdepartydienste wat ons gebruik</h2>
      <p>
        Gadit maak staat op die volgende verwerkers. Elkeen ontvang slegs die minimum inligting wat nodig is om die
        betrokke diens te lewer:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": verwerk die woorde en sinne wat u indien om definisies, terugvoer op sinne en vasvrae te genereer, skakel teks na spraak om, transkribeer steminvoer, lees die teks in foto’s en PDF-lêers wat u oplaai (byvoorbeeld huiswerkbladsye), en genereer beelde. Dit skryf ook die Gadit-assistent se antwoorde: ons stuur u vraag, die vroeëre boodskappe in dieselfde gesprek, u koppelvlaktaal, u plan, en of u op die webwerf of in die toepassing is, en ons heg nie u naam of e-posadres aan nie. Data wat na OpenAI gestuur word, word deur OpenAI se API-beleid oor datagebruik beheer."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): stoor u rekening, profiel,
          intekeningstatus, soekgeskiedenis en gegenereerde beelde.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, via Google Cloud), skakel teks na spraak om. Ons stuur slegs die teks wat hardop gelees moet word, soos woorde, sinne en stories, en die klank word in ons Firebase-berging gehou sodat dit weer gespeel kan word. In een lees-speletjie hoor dit ook die klank wat ’n kind hardop sê, om dit na te gaan, en daardie opname word nie gestoor nie. Google Fonts lewer die lettertipes van die Chinese, Japanese en Korean koppelvlak en sien u IP-adres."}
        </li>
        <li>
          <strong>Dicta</strong>{": ’n Israeliese niewinsorganisasie, voeg klinkertekens (niqqud) by Hebreeuse teks vir jong lesers. Ons stuur slegs die Hebreeuse teks daarnatoe."}
        </li>
        <li>
          <strong>Stripe</strong>: hanteer betalings, intekeninge en die faktureringsportaal.
        </li>
        <li>
          <strong>Apple</strong>{": verskaf Sign in with Apple in die iOS-toepassing (sien afdeling 1), en verkoop en faktureer die intekeninge wat in die iOS-toepassing gekoop word. Vir daardie aankope hanteer Apple die betaling, en ons ontvang slegs ’n bevestiging van die aankoop en die status daarvan (soos ’n hernuwing of ’n terugbetaling)."}
        </li>
        <li>
          <strong>PayPal</strong>{": betaal ons vennote. Ons gee die vennoot se PayPal-e-posadres en die bedrag daaraan."}
        </li>
        <li>
          <strong>Resend</strong>{": stuur ons e-posse (soos aanmeldskakels en kennisgewings), en lewer die vrae wat die Gadit-assistent aanstuur aan ons span af, met u e-posadres as die antwoordadres."}
        </li>
        <li>
          <strong>Expo</strong>{": lewer die kennisgewings van die iOS-toepassing af, soos die waarskuwings wat ’n ouer kan aanskakel, wat ’n kind se naam en die woord wat die kind nageslaan het, insluit."}
        </li>
        <li>
          <strong>Vercel</strong>: huisves en bedien die webwerf, en verskaf geanonimiseerde analise en
          prestasiemeting.
        </li>
        <li>
          <strong>Yooniz</strong>{": ’n afsonderlike gesinsleerdienste van dieselfde stigter. Yooniz kan ons vra of ’n ouer se e-posadres ’n aktiewe Gadit Family-plan het, en ons antwoord slegs ja of nee. Indien wel, kan die gesin Gadit vanaf Yooniz oopmaak sonder ’n wagwoord: Yooniz stuur vir ons die ouer se e-posadres, die vertoonname van die gesinslede, en of elkeen ’n ouer, ’n seun of ’n meisie is. Wanneer ’n kind wat Gadit vanaf Yooniz oopgemaak het, ’n woord verstaan, stuur ons aan Yooniz die ouer se e-posadres, die kind se Yooniz-ID en die aantal leerpunte wat verdien is, nooit die woord self nie."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": lewer die klein vlagbeelde wat op ons bladsye vertoon word, en sien dus u IP-adres en blaaierbesonderhede."}
        </li>
        <li>
          <strong>Advertensies en analise</strong>{": Meta (Meta Pixel), Google Analytics en TikTok (TikTok Pixel en Events API) meet besoeke en die resultate van ons advertensies. Hulle gebruik koekies (cookies) en soortgelyke tegnologieë op ons bemarkings-, registrasie- en betaalbladsye. Wanneer u registreer of betaal, kan ons aan hierdie dienste ’n gehashte (eenrigting-geënkripteerde) e-posadres en rekening-ID stuur, saam met u IP-adres en blaaierbesonderhede, slegs om ons advertensies te meet. Affonso, ’n diens vir vennootskakels, laai op dieselfde bladsye en op enige bladsy wat ’n besoeker via ’n vennootskakel bereik, en hou ’n koekie vir tot 60 dae. Indien u registreer nadat u via ’n Affonso-vennootskakel aangekom het, stuur ons aan Affonso u e-posadres, naam en rekening-ID, sodat die vennoot wat u verwys het, krediet ontvang. Ons stuur nooit enige van hierdie dienste inligting oor kinders nie, en hierdie hulpmiddels loop nie op ’n kind se profiel, in Kids Mode of op klas-skakelbladsye nie."}
        </li>
      </ul>

      <h2>4. Hoe lank ons u inligting bewaar</h2>
      <ul>
        <li>Rekeninginligting: solank u rekening bestaan.</li>
        <li>Soekgeskiedenis: die laaste 10 soektogte per gebruiker, bygewerk met elke nuwe soektog.</li>
        <li>
          {"Gesprekke met die Gadit-assistent: 180 dae, dan word dit outomaties uitgevee, of vroeër indien u u rekening uitvee. ’n Daaglikse telling van u vrae, wat vir die daaglikse limiet gebruik word, word ná 3 dae uitgevee."}
        </li>
        <li>
          {"Vrae wat die Gadit-assistent na ons span aanstuur: word in ons span se posbus gehou, soos enige e-pos wat u aan ons stuur."}
        </li>
        <li>Gegenereerde beelde: bewaar sodat dieselfde woord+betekenis die gekasde beeld kan hergebruik. Dit kan onbepaald bewaar word solank u rekening aktief is.</li>
        <li>Fakturerings- en belastingrekords: soos deur toepaslike wetgewing vereis (gewoonlik 7 jaar).</li>
        <li>
          {"Geskrapte rekeninge: ’n kort rekord dat die rekening geskrap is (die e-posadres, plan, en die rede en nota wat u gegee het, indien enige), wat gehou word sodat ons vrae oor die skrapping kan beantwoord."}
        </li>
        <li>Analitiese data: saamgevoeg, gewoonlik deur die analiseverskaffer vir 13 maande bewaar.</li>
      </ul>

      <h2>5. U regte</h2>
      <p>Afhangende van waar u woon, kan u die reg hê om:</p>
      <ul>
        <li>toegang te versoek tot die persoonlike inligting wat ons oor u hou;</li>
        <li>regstelling van onakkurate inligting te versoek;</li>
        <li>skrapping van u rekening en gepaardgaande data te versoek;</li>
        <li>u data in ’n oordraagbare formaat uit te voer;</li>
        <li>beswaar te maak teen sekere gebruike van u inligting of dit te beperk;</li>
        <li>u te onttrek aan sekere datadeling (waar van toepassing kragtens die CCPA of soortgelyke wette).</li>
      </ul>
      <p>
        Om enige van hierdie regte uit te oefen, stuur ’n e-pos na{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Ons sal binne 30 dae
        antwoord.
      </p>

      <h2>6. Sekuriteit</h2>
      <p>
        Ons gebruik bedryfstandaard-beskermingsmaatreëls, naamlik geënkripteerde verbindings (HTTPS), geverifieerde
        API’s en toegangsbeheer, om u inligting te beskerm. Geen metode van oordrag of berging op die internet is 100%
        veilig nie; daarom kan ons nie absolute sekuriteit waarborg nie, maar ons werk voortdurend om risiko te
        verminder.
      </p>

      <h2>7. Kinders</h2>
      <p>
        {"’n Gadit-rekening is vir volwassenes, 18 jaar en ouer. Kinders en tieners gebruik Gadit slegs deur ’n volwassene, op een van twee maniere."}
      </p>
      <p>
        {"Family-profiele: ’n ouer voeg elke kind as ’n profiel binne die ouer se Family-rekening by, met ’n naam en of die kind ’n seun of ’n meisie is, en, indien die ouer dit byvoeg, ook ’n ouderdom, ’n skoolgraad en ’n foto. Kinders het nie ’n e-posadres of wagwoord by ons nie. Die woorde wat ’n kind opsoek, en die kind se notaboek, speletjies en vordering, word in die familie se rekening gestoor. Die ouers in die familie, en enigiemand aan wie hulle toegang gee (byvoorbeeld ’n privaatonderwyser), kan dit sien, en ’n ouer kan kies om waarskuwings, per kennisgewing of e-pos, te ontvang met die woorde wat ’n kind opsoek. ’n Ouer kan ’n kind se profiel te eniger tyd in die toepassing verwyder."}
      </p>
      <p>
        {"Klas-skakels: ’n leerder open die skakel of kode wat ’n onderwyser gee, sonder ’n rekening en sonder ’n e-posadres. Indien die onderwyser ’n lys name ingevoer het, kies die leerder sy of haar naam daaruit, en die woorde wat die leerder opsoek, word vir die klas onder daardie naam gestoor, sodat die onderwyser dit kan sien. Die skool besluit om Gadit te gebruik en is verantwoordelik daarvoor om ouers in te lig waar die wet dit vereis."}
      </p>
      <p>
        {"Ons gebruik nooit kinders se inligting vir advertensies nie, en die hulpmiddels wat onder Advertensies en analise in afdeling 3 gelys word, laai nooit op ’n kind se profiel, in Kids Mode of op klas-skakelbladsye nie. Om ’n kind se profiel en die data daarvan te laat skrap, kan ’n ouer aan "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" skryf en ons sal dit skrap. Indien u meen dat ’n kind ’n rekening van sy of haar eie geopen het, skryf aan ons en ons sal die rekening en die data daarvan skrap."}
      </p>

      <h2>8. Internasionale gebruikers</h2>
      <p>
        Gadit word vanuit die Verenigde State bedryf. Indien u die diens van buite die Verenigde State gebruik, sal u
        inligting oorgedra word na, gestoor word in en verwerk word in die Verenigde State en in die
        datasentrumstreke wat deur ons diensverskaffers gebruik word.
      </p>

      <h2>9. Veranderinge aan hierdie beleid</h2>
      <p>
        Ons kan hierdie Privaatheidsbeleid van tyd tot tyd bywerk. Wesenlike veranderinge sal op hierdie bladsy
        geplaas word met ’n hersiene &ldquo;Laas opgedateer&rdquo;-datum. U voortgesette gebruik van Gadit nadat
        veranderinge van krag geword het, maak aanvaarding van die bygewerkte beleid uit.
      </p>

      <h2>10. Kontak</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-pos:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyAf(): ReactElement {
  return (
    <>
      <p>
        Welkom by Gadit. Hierdie Gebruiksvoorwaardes (&ldquo;Voorwaardes&rdquo;) reël u toegang tot en gebruik van
        die Gadit-webwerf, -toepassings en -dienste (gesamentlik die &ldquo;Diens&rdquo;), wat bedryf word deur{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;ons&rdquo; of &ldquo;ons s’n&rdquo;).
        Deur die Diens te gebruik, stem u in om deur hierdie Voorwaardes gebind te word. Indien u nie instem nie,
        moet u nie die Diens gebruik nie.
      </p>

      <h2>1. Wie Gadit mag gebruik</h2>
      <p>
        {"U moet 18 jaar of ouer wees om ’n Gadit-rekening te open. Kinders en tieners onder 18 gebruik Gadit slegs deur ’n volwassene: ’n ouer of voog kan hulle as profiele op die Family-plan byvoeg, en ’n skool kan aan sy leerders ’n klas-skakel gee. Die ouer, voog of skool wat hierdie toegang gee, is daarvoor verantwoordelik. Deur ’n rekening te open, bevestig u dat u 18 jaar of ouer is."}
      </p>

      <h2>2. U rekening</h2>
      <p>
        U is verantwoordelik daarvoor om die vertroulikheid van u aanmeldbesonderhede te handhaaf, en vir alle
        aktiwiteite wat onder u rekening plaasvind. Stel ons onverwyld in kennis by{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> indien u meen dat u
        rekening gekompromitteer is.
      </p>

      <h2>3. Intekeninge en fakturering</h2>
      <h3>Planne en fooie</h3>
      <p>
        {"Gadit bied ’n gratis Basic-plan en betaalde planne met die funksies en pryse wat op die prysbladsy gelys word. Pryse word aangedui in die geldeenheid wat op die prysbladsy en by afrekening vir julle ligging gewys word (in Israel, nuwe Israeliese sikkels, BTW ingesluit) en kan met minstens 30 dae se kennisgewing aan bestaande intekenaars verander word."}
      </p>
      <h3>Outomatiese hernuwing</h3>
      <p>
        Betaalde intekeninge word aan die einde van elke faktureringstydperk (maandeliks of jaarliks, soos gekies)
        outomaties teen die dan geldende prys hernu, tensy dit voor die hernuwingsdatum gekanselleer word.
      </p>
      <h3>Kansellasie</h3>
      <p>
        {"U kan te eniger tyd vanaf u rekeningbladsy kanselleer. Kansellasie stop toekomstige hernuwings. U behou toegang tot die betaalde funksies tot aan die einde van die huidige faktureringstydperk. Afgesien van die terugbetalings wat hieronder beskryf word, betaal ons nie vir ongebruikte tyd terug nie, behalwe waar die wet anders vereis."}
      </p>
      <h3>Terugbetalings</h3>
      <p>
        {"Indien u dit binne 14 dae ná die eerste betaling op u rekening versoek, of binne 14 dae ná ’n jaarlikse hernuwing, sal ons daardie betaling ten volle terugbetaal. U hoef geen rede te gee nie. Skryf aan "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" vanaf die e-posadres van u rekening. ’n Terugbetaling beëindig ook die intekening. Ander betalings is nie terugbetaalbaar nie, behalwe waar die wet ’n terugbetaling vereis. Indien u meen dat u per abuis gedebiteer is, skryf aan ons binne 30 dae ná die debitering. Aankope wat in die iOS-toepassing gedoen word, word deur Apple gefaktureer, en slegs Apple kan dit terugbetaal, by reportaproblem.apple.com."}
      </p>

      <h2>4. Aanvaarbare gebruik</h2>
      <p>U stem in om nie die volgende te doen nie:</p>
      <ul>
        <li>die Diens vir enige onwettige doel of in stryd met enige wet te gebruik;</li>
        <li>te probeer om tru-ingenieurswese op die Diens toe te pas, dit te dekompileer of die bronkode daarvan te onttrek;</li>
        <li>ander gebruikers te misbruik, te teister of skade aan te doen, of inhoud in te dien wat haatdraend, dreigend of onwelvoeglik is;</li>
        <li>toegang tot die Diens te outomatiseer verder as redelike persoonlike gebruik (byvoorbeeld om definisies op groot skaal te skraap);</li>
        <li>tempolimiete of planbeperkings te omseil, of veelvuldige rekeninge te gebruik om kwotas te vermy;</li>
        <li>die Diens te gebruik om enige mededingende KI-model of woordeboekproduk op te lei of te verfyn;</li>
        <li>inhoud op te laai of in te dien wat u nie die reg het om in te dien nie.</li>
      </ul>
      <p>
        Ons behou ons die reg voor om rekeninge wat hierdie Voorwaardes oortree, op te skort of te beëindig.
      </p>

      <h2>5. KI-gegenereerde inhoud</h2>
      <p>
        {"Gadit gebruik modelle vir kunsmatige intelligensie (insluitend modelle van OpenAI en Google) om definisies, voorbeelde, etimologieë, terugvoer, vasvrae, beelde, spraak en transkripsies te genereer. U verstaan en stem saam dat:"}
      </p>
      <ul>
        <li>
          KI-uitset <strong>onakkuraat, onvolledig of onvanpas</strong> kan wees. Gadit is bedoel as ’n
          leerhulpmiddel, en daar moet nie daarop staatgemaak word vir regs-, mediese, professionele of akademiese
          besluite nie.
        </li>
        <li>
          KI-gegenereerde definisies kan van amptelike woordeboeke verskil. Ons waarborg nie dat elke definisie
          taalkundig gesaghebbend is nie.
        </li>
        <li>
          Beelde word algoritmies gegenereer en kan soms onverwags of onpresies wees. Dit is illustrasies, nie
          letterlike uitbeeldings nie.
        </li>
        <li>
          U is uitsluitlik verantwoordelik vir hoe u KI-gegenereerde inhoud vertolk en gebruik.
        </li>
      </ul>

      <h2>6. U inhoud</h2>
      <p>
        Wanneer u woorde, sinne of klank by Gadit indien (byvoorbeeld wanneer u &ldquo;Stel u eie sin saam&rdquo; of
        steminvoer gebruik), verleen u aan ons ’n wêreldwye, nie-eksklusiewe, tantièmevrye (royalty-free) lisensie om
        daardie inhoud te verwerk met die doel om die Diens te lewer en te verbeter. Ons maak geen aanspraak op
        eienaarskap van u insendings nie.
      </p>

      <h2>7. Intellektuele eiendom</h2>
      <p>
        Die Gadit-naam, -logo, -webwerf en onderliggende sagteware is ons eiendom of die eiendom van ons
        lisensiegewers. U word ’n persoonlike, herroepbare, nie-eksklusiewe lisensie verleen om die Diens te gebruik
        soos deur hierdie Voorwaardes toegelaat.
      </p>
      <p>
        Inhoud wat deur Gadit in reaksie op u invoer gegenereer word (definisies, beelde, ens.) mag deur u vir
        persoonlike, opvoedkundige of niekommersiële doeleindes gebruik word. Vir kommersiële gebruik (byvoorbeeld in
        ’n betaalde produk) kontak ons asseblief.
      </p>

      <h2>8. Beskikbaarheid en veranderinge</h2>
      <p>
        Ons streef daarna om die Diens beskikbaar te hou, maar ons waarborg nie ononderbroke of foutlose werking nie.
        Ons kan enige deel van die Diens te eniger tyd wysig, opskort of staak, insluitend funksies, pryse of
        beskikbaarheid in spesifieke streke.
      </p>

      <h2>9. Derdepartydienste</h2>
      <p>
        Die Diens maak staat op derdepartyverskaffers (insluitend OpenAI, Google Firebase, Stripe en Vercel). Hul
        beskikbaarheid of gedrag kan u ervaring beïnvloed. Ons aanspreeklikheid word deur Artikel 11 beperk, ongeag
        probleme wat deur hierdie verskaffers veroorsaak word.
      </p>

      <h2>10. Vrywaring</h2>
      <p>
        DIE DIENS WORD VERSKAF &ldquo;SOOS DIT IS&rdquo; EN &ldquo;SOOS BESKIKBAAR&rdquo;, SONDER WAARBORGE VAN
        WATTER AARD OOK AL, HETSY UITDRUKLIK OF STILSWYGEND, INSLUITEND MAAR NIE BEPERK NIE TOT WAARBORGE VAN
        VERHANDELBAARHEID (MERCHANTABILITY), GESKIKTHEID VIR ’N BEPAALDE DOEL EN NIE-INBREUKMAKING
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Beperking van aanspreeklikheid</h2>
      <p>
        IN DIE MAKSIMUM MATE WAT DEUR DIE WET TOEGELAAT WORD, SAL LAVI LEARNING AND TRAINING TECHNOLOGIES LLC EN SY
        BESTUURDERS, WERKNEMERS EN AGENTE NIE AANSPREEKLIK WEES VIR ENIGE INDIREKTE, BYKOMSTIGE, SPESIALE, GEVOLGLIKE
        OF BESTRAFFENDE SKADEVERGOEDING (PUNITIVE DAMAGES), OF VIR ENIGE VERLIES VAN WINS OF INKOMSTE, WAT VOORTSPRUIT
        UIT OF VERBAND HOU MET U GEBRUIK VAN DIE DIENS NIE.
      </p>
      <p>
        ONS TOTALE AANSPREEKLIKHEID VIR ENIGE EIS WAT VOORTSPRUIT UIT OF VERBAND HOU MET DIE DIENS SAL NIE DIE GROTER
        VAN (A) DIE BEDRAG WAT U ONS IN DIE TWAALF MAANDE VOOR DIE EIS BETAAL HET, OF (B) USD $100, OORSKRY NIE.
      </p>

      <h2>12. Beëindiging</h2>
      <p>
        U kan te eniger tyd ophou om die Diens te gebruik. Ons kan u toegang opskort of beëindig indien u hierdie
        Voorwaardes oortree of indien die wet dit vereis. By beëindiging bly die bepalings wat uit hul aard behoort
        voort te bestaan (insluitend Artikels 7, 10, 11 en 14) van krag.
      </p>

      <h2>13. Veranderinge aan hierdie Voorwaardes</h2>
      <p>
        Ons kan hierdie Voorwaardes van tyd tot tyd hersien. Wesenlike veranderinge sal op hierdie bladsy geplaas word
        met ’n hersiene &ldquo;Laas opgedateer&rdquo;-datum. U voortgesette gebruik van die Diens nadat veranderinge
        van krag geword het, maak aanvaarding van die bygewerkte Voorwaardes uit.
      </p>

      <h2>14. Toepaslike reg en geskille</h2>
      <p>
        Hierdie Voorwaardes word beheer deur die wette van die Staat Delaware, Verenigde State, sonder inagneming van
        sy reëls oor wetskonflik (conflict-of-law rules). Enige geskil wat voortspruit uit of verband hou met hierdie
        Voorwaardes of die Diens, sal uitsluitlik in die staats- of federale howe in Delaware, Verenigde State,
        besleg word, en u stem in tot die persoonlike jurisdiksie (personal jurisdiction) van daardie howe.
      </p>

      <h2>15. Kontak</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-pos:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
