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
      <h3>Gebruiksinligting</h3>
      <p>Wanneer u Gadit gebruik, verwerk ons:</p>
      <ul>
        <li>die woorde en opsionele sinne wat u naslaan;</li>
        <li>beelde wat op u versoek gegenereer word;</li>
        <li>u intekeningplan en faktureringstatus;</li>
        <li>’n onlangse soekgeskiedenis (vir betalende gebruikers, tot die laaste 10 woorde), wat gestoor word sodat u later weer toegang daartoe kan verkry;</li>
        <li>maandelikse kwotas (byvoorbeeld die aantal beelde wat u in hierdie faktureringsiklus gegenereer het).</li>
      </ul>
      <h3>Tegniese en analitiese data</h3>
      <p>
        Ons samel outomaties basiese tegniese inligting in, soos IP-adres, blaaiertipe, toesteltipe, verwysende URL
        en besigtigde bladsye. Dit word gebruik vir sekuriteit, prestasiemonitering en saamgevoegde analise. Die
        analise word deur Vercel verskaf en word by die punt van insameling geanonimiseer (geen persoonlike
        identifiseerders word gestoor nie).
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
          <strong>OpenAI</strong>: verwerk die woorde en sinne wat u indien om definisies, terugvoer op sinne, vasvrae
          en stemtranskripsie (Whisper) te genereer, en genereer beelde (DALL·E 3). Data wat na OpenAI gestuur word,
          word deur OpenAI se API-beleid oor datagebruik beheer.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): stoor u rekening, profiel,
          intekeningstatus, soekgeskiedenis en gegenereerde beelde.
        </li>
        <li>
          <strong>Stripe</strong>: hanteer betalings, intekeninge en die faktureringsportaal.
        </li>
        <li>
          <strong>Vercel</strong>: huisves en bedien die webwerf, en verskaf geanonimiseerde analise en
          prestasiemeting.
        </li>
      </ul>

      <h2>4. Hoe lank ons u inligting bewaar</h2>
      <ul>
        <li>Rekeninginligting: solank u rekening bestaan.</li>
        <li>Soekgeskiedenis: die laaste 10 soektogte per gebruiker, bygewerk met elke nuwe soektog.</li>
        <li>Gegenereerde beelde: bewaar sodat dieselfde woord+betekenis die gekasde beeld kan hergebruik. Dit kan onbepaald bewaar word solank u rekening aktief is.</li>
        <li>Fakturerings- en belastingrekords: soos deur toepaslike wetgewing vereis (gewoonlik 7 jaar).</li>
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
        Gadit is nie op kinders onder 13 gerig nie. Indien u meen dat ’n kind onder 13 ’n rekening geskep het, stuur
        vir ons ’n e-pos en ons sal die rekening en gepaardgaande data skrap.
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
        U moet minstens 13 jaar oud wees om ’n rekening te skep. Indien u tussen 13 en 18 is, moet u die toestemming
        van ’n ouer of wettige voog hê. Deur Gadit te gebruik, verklaar u dat u aan hierdie vereistes voldoen.
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
        Gadit bied ’n gratis Basic-plan en betaalde planne (Clear en Deep) met die funksies en pryse wat op die
        prysbladsy gelys word. Pryse word in USD aangedui en kan met minstens 30 dae kennisgewing aan bestaande
        intekenaars verander word.
      </p>
      <h3>Outomatiese hernuwing</h3>
      <p>
        Betaalde intekeninge word aan die einde van elke faktureringstydperk (maandeliks of jaarliks, soos gekies)
        outomaties teen die dan geldende prys hernu, tensy dit voor die hernuwingsdatum gekanselleer word.
      </p>
      <h3>Kansellasie</h3>
      <p>
        U kan te eniger tyd vanaf u rekeningbladsy kanselleer. Kansellasie stop toekomstige hernuwings. U behou
        toegang tot die betaalde funksies tot aan die einde van die huidige faktureringstydperk. Ons verskaf nie
        gedeeltelike terugbetalings vir ongebruikte tyd nie.
      </p>
      <h3>Terugbetalings</h3>
      <p>
        Behalwe waar die wet dit vereis, is betalings nie terugbetaalbaar nie. Indien u meen dat u per abuis gedebiteer
        is, kontak{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> binne 30 dae na die
        debitering.
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
        Gadit gebruik modelle vir kunsmatige intelligensie (insluitend OpenAI se GPT, Whisper en DALL·E) om
        definisies, voorbeelde, etimologieë, terugvoer, vasvrae, beelde en transkripsies te genereer. U verstaan en
        stem saam dat:
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
