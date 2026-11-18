import type { ReactElement } from "react";

export const titlesNl = { privacy: "Privacybeleid", terms: "Gebruiksvoorwaarden" };

export function PrivacyBodyNl(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;wij&rdquo;, &ldquo;ons&rdquo; of &ldquo;onze&rdquo;) is een dienst die wordt
        geëxploiteerd door <strong>Lavi Learning and Training Technologies LLC</strong>, een in de Verenigde Staten
        geregistreerde onderneming. Dit Privacybeleid legt uit welke informatie wij verzamelen, hoe wij die gebruiken en
        welke keuzes u heeft.
      </p>
      <p>
        Als u vragen heeft, neem dan contact met ons op via{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informatie die wij verzamelen</h2>
      <h3>Accountinformatie</h3>
      <p>
        Wanneer u een account aanmaakt, verzamelen wij uw e-mailadres en, als u zich aanmeldt met Google, de
        basisprofielinformatie die Google verstrekt (weergavenaam, profielfoto). Wij ontvangen uw Google-wachtwoord
        niet.
      </p>
      <p>
        {"In de iOS-app kunt u zich ook aanmelden met Apple. Apple geeft ons dan de naam en het e-mailadres dat u kiest te delen, wat een privérelay-adres kan zijn dat onze e-mails naar u doorstuurt. Wij ontvangen uw Apple-wachtwoord niet."}
      </p>
      <h3>Gebruiksinformatie</h3>
      <p>Wanneer u Gadit gebruikt, verwerken wij:</p>
      <ul>
        <li>de woorden en optionele zinnen die u opzoekt;</li>
        <li>afbeeldingen die op uw verzoek worden gegenereerd;</li>
        <li>uw abonnement en uw factureringsstatus;</li>
        <li>een recente zoekgeschiedenis (voor betalende gebruikers tot de laatste 10 woorden), opgeslagen zodat u deze later opnieuw kunt raadplegen;</li>
        <li>
          {"als u de Gadit-assistent in het helpcentrum gebruikt: de vragen die u stelt, de antwoorden die de assistent geeft en of u een antwoord als nuttig hebt gemarkeerd, samen met uw account-ID (en familie-ID, indien van toepassing), e-mailadres, abonnement, interface-taal en of u de website of de app hebt gebruikt;"}
        </li>
        <li>maandelijkse quota (bijvoorbeeld het aantal afbeeldingen dat u in de huidige factureringsperiode heeft gegenereerd).</li>
      </ul>
      <p>
        {"De Gadit-assistent wordt niet aangeboden op kinderprofielen, in de Kindermodus of aan bezoekers die niet zijn aangemeld. Typ er geen wachtwoorden of kaartnummers in."}
      </p>
      <h3>Technische en analytische gegevens</h3>
      <p>
        Wij verzamelen automatisch technische basisinformatie zoals IP-adres, browsertype, apparaattype, verwijzende
        URL en bekeken pagina&rsquo;s. Deze informatie wordt gebruikt voor beveiliging, prestatiebewaking en
        geaggregeerde analyses. De analyses worden geleverd door Vercel en worden op het moment van verzameling
        geanonimiseerd (er worden geen persoonlijke identificatiegegevens opgeslagen). Op onze marketing-, aanmeld- en
        betaalpagina&rsquo;s gebruiken wij ook advertentie- en analysetools, die in Artikel 3 worden beschreven.
      </p>
      <h3>Betalingsinformatie</h3>
      <p>
        Als u een abonnement afsluit, wordt de betaling verwerkt door <strong>Stripe, Inc.</strong> Wij zien uw
        volledige kaartnummer niet en slaan het niet op; wij ontvangen alleen een klanttoken en de metagegevens die
        nodig zijn om het abonnement te identificeren.
      </p>

      <h2>2. Hoe wij uw informatie gebruiken</h2>
      <ul>
        <li>om de dienst Gadit te leveren en te verbeteren (het genereren van definities, afbeeldingen, feedback op zinnen, quizzen);</li>
        <li>om uw account te onderhouden en uw ervaring te personaliseren (zoekgeschiedenis, voorkeurstaal, schakelaar voor de Kindermodus);</li>
        <li>om abonnementen te verwerken en transactionele e-mails te verzenden (ontvangstbewijzen, wijzigingen in het abonnement);</li>
        <li>
          {"om uw vragen in de Gadit-assistent te beantwoorden en onze hulpantwoorden te verbeteren, en, wanneer de assistent een vraag doorstuurt naar ons team, om het team per e-mail het recente gesprek te sturen samen met uw naam, e-mailadres, abonnement, interface-taal en of u de website of de app hebt gebruikt, zodat het team u per e-mail kan antwoorden;"}
        </li>
        <li>om de prestaties van het product te meten en te verbeteren en misbruik te voorkomen;</li>
        <li>om te voldoen aan wettelijke verplichtingen.</li>
      </ul>
      <p>
        Wij <strong>verkopen uw persoonsgegevens niet</strong>, en wij gebruiken uw inhoud niet om u advertenties te
        tonen.
      </p>

      <h2>3. Diensten van derden die wij gebruiken</h2>
      <p>
        Gadit maakt gebruik van de volgende verwerkers. Elk van hen ontvangt alleen de minimale informatie die nodig is
        om de betreffende dienst te verlenen:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": verwerkt de woorden en zinnen die u indient om definities, feedback op zinnen en quizzen te genereren, zet tekst om in spraak, transcribeert spraakinvoer, leest de tekst in foto’s en PDF-bestanden die u uploadt (bijvoorbeeld huiswerkbladen) en genereert afbeeldingen. OpenAI schrijft ook de antwoorden van de Gadit-assistent: wij sturen uw vraag, de eerdere berichten in hetzelfde gesprek, uw interface-taal, uw abonnement en of u de website of de app gebruikt, en wij voegen uw naam of e-mailadres niet toe. Gegevens die naar OpenAI worden verzonden, vallen onder het API-beleid voor gegevensgebruik van OpenAI."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): slaat uw account, profiel,
          abonnementsstatus, zoekgeschiedenis en gegenereerde afbeeldingen op.
        </li>
        <li>
          <strong>Google</strong>{"(Gemini, via Google Cloud): zet tekst om in spraak. Wij sturen alleen de tekst die moet worden voorgelezen, zoals woorden, zinnen en verhalen, en de audio wordt in onze Firebase-opslag bewaard zodat deze opnieuw kan worden afgespeeld. In één leesspel hoort het ook het geluid dat een kind hardop maakt, om dit te controleren, en die opname wordt niet opgeslagen. Google Fonts levert de lettertypen van de Chinese, Japanse en Koreaanse interface en ziet uw IP-adres."}
        </li>
        <li>
          <strong>Dicta</strong>{", een Israëlische non-profitorganisatie, voegt klinkertekens (niqqud) toe aan Hebreeuwse tekst voor jonge lezers. Wij sturen alleen de Hebreeuwse tekst."}
        </li>
        <li>
          <strong>Stripe</strong>: verzorgt betalingen, abonnementen en het factureringsportaal.
        </li>
        <li>
          <strong>Apple</strong>{": biedt Sign in with Apple aan in de iOS-app (zie paragraaf 1) en verkoopt en factureert de abonnementen die in de iOS-app worden gekocht. Voor die aankopen verwerkt Apple de betaling, en wij ontvangen alleen een bevestiging van de aankoop en de status daarvan (zoals een verlenging of een terugbetaling)."}
        </li>
        <li>
          <strong>PayPal</strong>{": betaalt onze partners (affiliates). Wij geven het PayPal-e-mailadres van de partner en het bedrag door."}
        </li>
        <li>
          <strong>Resend</strong>{": verzendt onze e-mails (zoals aanmeldlinks en meldingen), en bezorgt aan ons team de vragen die de Gadit-assistent doorstuurt, met uw e-mailadres als antwoordadres."}
        </li>
        <li>
          <strong>Expo</strong>{": bezorgt de meldingen van de iOS-app, zoals de waarschuwingen die een ouder kan inschakelen en die de naam van een kind en het woord dat het kind heeft opgezocht bevatten."}
        </li>
        <li>
          <strong>Vercel</strong>: host en levert de website, en verzorgt geanonimiseerde analyses en
          prestatiemetingen.
        </li>
        <li>
          <strong>Yooniz</strong>{", een afzonderlijke leerservice voor gezinnen van dezelfde oprichter. Yooniz kan ons vragen of het e-mailadres van een ouder een actief Gadit Family-abonnement heeft, en wij antwoorden alleen ja of nee. Als dat zo is, kan het gezin Gadit vanuit Yooniz openen zonder wachtwoord: Yooniz stuurt ons het e-mailadres van de ouder, de weergavenamen van de gezinsleden en of ieder van hen een ouder, een jongen of een meisje is. Wanneer een kind dat Gadit vanuit Yooniz heeft geopend een woord begrijpt, sturen wij Yooniz het e-mailadres van de ouder, de Yooniz-ID van het kind en het aantal verdiende leerpunten, nooit het woord zelf."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{", levert de kleine vlagafbeeldingen die op onze pagina’s worden getoond, en ziet daardoor uw IP-adres en browsergegevens."}
        </li>
        <li>
          <strong>Advertenties en analyse</strong>{": Meta (Meta Pixel), Google Analytics en TikTok (TikTok Pixel en Events API) meten bezoeken en de resultaten van onze advertenties. Zij gebruiken cookies en vergelijkbare technologieën op onze marketing-, aanmeld- en betaalpagina’s. Wanneer u zich aanmeldt of betaalt, kunnen wij deze diensten een gehasht (eenrichtingsversleuteld) e-mailadres en account-ID sturen, samen met uw IP-adres en browsergegevens, uitsluitend om onze advertenties te meten. Affonso, een dienst voor affiliatelinks, wordt geladen op dezelfde pagina’s en op elke pagina die een bezoeker via een partnerlink bereikt, en bewaart maximaal 60 dagen een cookie. Als u zich aanmeldt nadat u via een affiliatelink van Affonso bent binnengekomen, sturen wij Affonso uw e-mailadres, naam en account-ID, zodat de affiliate die u heeft doorverwezen daarvoor de krediet krijgt. Wij sturen nooit informatie over kinderen naar een van deze diensten, en deze tools draaien niet op het profiel van een kind, in de kindermodus of op pagina’s met een klaslink."}
        </li>
      </ul>

      <h2>4. Hoe lang wij uw informatie bewaren</h2>
      <ul>
        <li>Accountinformatie: zolang uw account bestaat.</li>
        <li>Zoekgeschiedenis: de laatste 10 zoekopdrachten per gebruiker, bijgewerkt bij elke nieuwe zoekopdracht.</li>
        <li>
          {"Gesprekken met de Gadit-assistent: 180 dagen, daarna automatisch verwijderd, of eerder als u uw account verwijdert. Een dagelijkse telling van uw vragen, gebruikt voor de dagelijkse limiet, wordt na 3 dagen verwijderd."}
        </li>
        <li>
          {"Vragen die de Gadit-assistent doorstuurt naar ons team: bewaard in de mailbox van ons team, net als elke e-mail die u ons stuurt."}
        </li>
        <li>Gegenereerde afbeeldingen: bewaard zodat dezelfde combinatie van woord en betekenis de in de cache opgeslagen afbeelding opnieuw kan gebruiken. Deze kunnen voor onbepaalde tijd worden bewaard zolang uw account actief is.</li>
        <li>Facturerings- en belastinggegevens: zoals vereist door de toepasselijke wetgeving (doorgaans 7 jaar).</li>
        <li>
          {"Verwijderde accounts: een korte registratie dat het account is verwijderd (het e-mailadres, het abonnement en de reden en opmerking die u hebt opgegeven, indien van toepassing), bewaard zodat wij vragen over de verwijdering kunnen beantwoorden."}
        </li>
        <li>Analytische gegevens: geaggregeerd, doorgaans door de analyseprovider 13 maanden bewaard.</li>
      </ul>

      <h2>5. Uw rechten</h2>
      <p>Afhankelijk van waar u woont, heeft u mogelijk het recht om:</p>
      <ul>
        <li>inzage te vragen in de persoonsgegevens die wij over u bewaren;</li>
        <li>rectificatie van onjuiste informatie te vragen;</li>
        <li>verwijdering van uw account en de bijbehorende gegevens te vragen;</li>
        <li>uw gegevens te exporteren in een overdraagbaar formaat;</li>
        <li>bezwaar te maken tegen bepaalde vormen van gebruik van uw informatie of deze te beperken;</li>
        <li>zich af te melden voor bepaalde vormen van het delen van gegevens (indien van toepassing op grond van de CCPA of vergelijkbare wetgeving).</li>
      </ul>
      <p>
        Om een van deze rechten uit te oefenen, stuurt u een e-mail naar{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Wij reageren binnen
        30 dagen.
      </p>

      <h2>6. Beveiliging</h2>
      <p>
        Wij gebruiken in de sector gangbare beveiligingsmaatregelen, namelijk versleutelde verbindingen (HTTPS),
        geauthenticeerde API&rsquo;s en toegangscontroles, om uw informatie te beschermen. Geen enkele methode van
        verzending of opslag via het internet is 100% veilig, dus wij kunnen geen absolute veiligheid garanderen, maar
        wij werken voortdurend aan het verminderen van risico&rsquo;s.
      </p>

      <h2>7. Kinderen</h2>
      <p>
        {"Een Gadit-account is bedoeld voor volwassenen van 18 jaar en ouder. Kinderen en tieners gebruiken Gadit alleen via een volwassene, op een van twee manieren."}
      </p>
      <p>
        {"Family-profielen: een ouder voegt elk kind toe als profiel binnen het Family-account van de ouder, met een naam en of het kind een jongen of een meisje is, en, als de ouder die toevoegt, ook een leeftijd, een schooljaar en een foto. Kinderen hebben bij ons geen e-mailadres of wachtwoord. De woorden die een kind opzoekt, en de woordenschrift, spellen en voortgang van het kind, worden opgeslagen in het account van de familie. De ouders in de familie, en iedereen aan wie zij toegang geven, bijvoorbeeld een privéleraar, kunnen deze zien, en een ouder kan ervoor kiezen meldingen te ontvangen, via een notificatie of e-mail, met de woorden die een kind opzoekt. Een ouder kan het profiel van een kind op elk moment in de app verwijderen."}
      </p>
      <p>
        {"Klaslinks: een leerling opent de link of code die een leraar geeft, zonder account en zonder e-mailadres. Als de leraar een namenlijst heeft ingevoerd, kiest de leerling daar zijn of haar naam uit, en de woorden die de leerling opzoekt, worden voor de klas onder die naam opgeslagen, zodat de leraar deze kan zien. De school besluit Gadit te gebruiken en is verantwoordelijk voor het informeren van ouders waar de wet dit vereist."}
      </p>
      <p>
        {"Wij gebruiken informatie van kinderen nooit voor advertenties, en de tools die onder Advertenties en analyse in sectie 3 worden genoemd, laden nooit op een kinderprofiel, in Kids Mode of op pagina's met klaslinks. Om het profiel van een kind en de bijbehorende gegevens te laten verwijderen, kan een ouder schrijven naar "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" en zullen wij deze verwijderen. Als u denkt dat een kind zelf een account heeft geopend, schrijf ons dan en wij zullen het account en de bijbehorende gegevens verwijderen."}
      </p>

      <h2>8. Internationale gebruikers</h2>
      <p>
        Gadit wordt geëxploiteerd vanuit de Verenigde Staten. Als u de dienst gebruikt vanuit een land buiten de
        Verenigde Staten, wordt uw informatie doorgegeven naar, opgeslagen in en verwerkt in de Verenigde Staten en in
        de datacenterregio&rsquo;s die door onze dienstverleners worden gebruikt.
      </p>

      <h2>9. Wijzigingen in dit beleid</h2>
      <p>
        Wij kunnen dit Privacybeleid van tijd tot tijd bijwerken. Wezenlijke wijzigingen worden op deze pagina
        gepubliceerd met een herziene datum bij &ldquo;Laatst bijgewerkt&rdquo;. Als u Gadit blijft gebruiken nadat
        de wijzigingen van kracht zijn geworden, geldt dit als aanvaarding van het bijgewerkte beleid.
      </p>

      <h2>10. Contact</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyNl(): ReactElement {
  return (
    <>
      <p>
        Welkom bij Gadit. Deze Gebruiksvoorwaarden (de &ldquo;Voorwaarden&rdquo;) regelen uw toegang tot en gebruik van
        de website, applicaties en diensten van Gadit (samen de &ldquo;Dienst&rdquo;), geëxploiteerd door{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;wij&rdquo;, &ldquo;ons&rdquo; of
        &ldquo;onze&rdquo;). Door de Dienst te gebruiken, stemt u ermee in gebonden te zijn aan deze Voorwaarden. Als u
        niet akkoord gaat, gebruik de Dienst dan niet.
      </p>

      <h2>1. Wie Gadit mag gebruiken</h2>
      <p>
        {"U moet 18 jaar of ouder zijn om een Gadit-account te openen. Kinderen en tieners jonger dan 18 jaar gebruiken Gadit alleen via een volwassene: een ouder of voogd kan hen als profielen toevoegen aan het Family-abonnement, en een school kan haar leerlingen een klaslink geven. De ouder, voogd of school die deze toegang geeft, is daarvoor verantwoordelijk. Door een account te openen, bevestigt u dat u 18 jaar of ouder bent."}
      </p>

      <h2>2. Uw account</h2>
      <p>
        U bent verantwoordelijk voor het vertrouwelijk houden van uw inloggegevens en voor alle activiteiten die onder
        uw account plaatsvinden. Breng ons onmiddellijk op de hoogte via{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> als u denkt dat uw
        account is gecompromitteerd.
      </p>

      <h2>3. Abonnementen en facturering</h2>
      <h3>Abonnementen en tarieven</h3>
      <p>
        {"Gadit biedt een gratis Basic-abonnement en betaalde abonnementen met de functies en prijzen die op de prijspagina worden vermeld. Prijzen worden vermeld in de valuta die op de prijspagina en bij het afrekenen voor uw locatie wordt getoond (in Israël: nieuwe Israëlische sjekels inclusief btw) en kunnen voor bestaande abonnees worden gewijzigd met een kennisgeving van ten minste 30 dagen vooraf."}
      </p>
      <h3>Automatische verlenging</h3>
      <p>
        Betaalde abonnementen worden aan het einde van elke factureringsperiode (maandelijks of jaarlijks, zoals
        gekozen) automatisch verlengd tegen de op dat moment geldende prijs, tenzij ze vóór de verlengingsdatum worden
        opgezegd.
      </p>
      <h3>Opzegging</h3>
      <p>
        {"U kunt op elk moment opzeggen via uw accountpagina. Opzegging stopt toekomstige verlengingen. U behoudt toegang tot de betaalde functies tot het einde van de lopende factureringsperiode. Behalve voor de hieronder beschreven terugbetalingen, betalen wij geen geld terug voor ongebruikte tijd, tenzij de wet anders vereist."}
      </p>
      <h3>Terugbetalingen</h3>
      <p>
        {"Als u hierom verzoekt binnen 14 dagen na de eerste betaling op uw account, of binnen 14 dagen na een jaarlijkse verlenging, betalen wij die betaling volledig terug. U hoeft daarvoor geen reden op te geven. Schrijf naar "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" vanaf het e-mailadres van uw account. Een terugbetaling beëindigt ook het abonnement. Andere betalingen worden niet terugbetaald, behalve waar de wet een terugbetaling vereist. Als u denkt dat er bij u ten onrechte een bedrag in rekening is gebracht, schrijf ons dan binnen 30 dagen na de afschrijving. Aankopen die in de iOS-app zijn gedaan, worden door Apple gefactureerd, en alleen Apple kan deze terugbetalen, via reportaproblem.apple.com."}
      </p>

      <h2>4. Aanvaardbaar gebruik</h2>
      <p>U stemt ermee in om niet:</p>
      <ul>
        <li>de Dienst te gebruiken voor enig onwettig doel of in strijd met enige wet;</li>
        <li>te proberen de broncode van de Dienst te reverse-engineeren, te decompileren of te achterhalen;</li>
        <li>andere gebruikers te misbruiken, lastig te vallen of schade toe te brengen, of inhoud in te dienen die haatdragend, bedreigend of obsceen is;</li>
        <li>de toegang tot de Dienst te automatiseren buiten redelijk persoonlijk gebruik (bijvoorbeeld het op grote schaal scrapen van definities);</li>
        <li>snelheidslimieten of abonnementsbeperkingen te omzeilen, of meerdere accounts te gebruiken om quota te ontlopen;</li>
        <li>de Dienst te gebruiken om een concurrerend AI-model of woordenboekproduct te trainen of te verfijnen;</li>
        <li>inhoud te uploaden of in te dienen die u niet gerechtigd bent in te dienen.</li>
      </ul>
      <p>
        Wij behouden ons het recht voor accounts die deze Voorwaarden schenden op te schorten of te beëindigen.
      </p>

      <h2>5. Door AI gegenereerde inhoud</h2>
      <p>
        {"Gadit gebruikt modellen voor kunstmatige intelligentie, waaronder modellen van OpenAI en Google, om definities, voorbeelden, etymologieën, feedback, quizzen, afbeeldingen, spraak en transcripties te genereren. U begrijpt en gaat ermee akkoord dat:"}
      </p>
      <ul>
        <li>
          AI-uitvoer <strong>onjuist, onvolledig of ongepast</strong> kan zijn. Gadit is bedoeld als leermiddel en
          mag niet als basis dienen voor juridische, medische, professionele of academische beslissingen.
        </li>
        <li>
          Door AI gegenereerde definities kunnen afwijken van officiële woordenboeken. Wij garanderen niet dat elke
          definitie taalkundig gezaghebbend is.
        </li>
        <li>
          Afbeeldingen algoritmisch worden gegenereerd en soms onverwacht of onnauwkeurig kunnen zijn. Het zijn
          illustraties, geen letterlijke weergaven.
        </li>
        <li>
          U als enige verantwoordelijk bent voor de manier waarop u door AI gegenereerde inhoud interpreteert en
          gebruikt.
        </li>
      </ul>

      <h2>6. Uw inhoud</h2>
      <p>
        Wanneer u woorden, zinnen of audio indient bij Gadit (bijvoorbeeld bij het gebruik van &ldquo;Schrijf uw eigen
        zin&rdquo; of spraakinvoer), verleent u ons een wereldwijde, niet-exclusieve, royaltyvrije licentie om die
        inhoud te verwerken met het doel de Dienst te leveren en te verbeteren. Wij maken geen aanspraak op het
        eigendom van uw inzendingen.
      </p>

      <h2>7. Intellectueel eigendom</h2>
      <p>
        De naam Gadit, het logo, de website en de onderliggende software zijn ons eigendom of het eigendom van onze
        licentiegevers. U krijgt een persoonlijke, herroepbare, niet-exclusieve licentie om de Dienst te gebruiken zoals
        toegestaan door deze Voorwaarden.
      </p>
      <p>
        Inhoud die Gadit genereert als reactie op uw invoer (definities, afbeeldingen, enz.) mag door u worden gebruikt
        voor persoonlijke, educatieve of niet-commerciële doeleinden. Neem voor commercieel gebruik (bijvoorbeeld in een
        betaald product) contact met ons op.
      </p>

      <h2>8. Beschikbaarheid en wijzigingen</h2>
      <p>
        Wij streven ernaar de Dienst beschikbaar te houden, maar wij garanderen geen ononderbroken of foutloze werking.
        Wij kunnen elk onderdeel van de Dienst op elk moment wijzigen, opschorten of stopzetten, met inbegrip van
        functies, prijzen of beschikbaarheid in specifieke regio&rsquo;s.
      </p>

      <h2>9. Diensten van derden</h2>
      <p>
        De Dienst is afhankelijk van externe aanbieders (waaronder OpenAI, Google Firebase, Stripe en Vercel). Hun
        beschikbaarheid of functioneren kan van invloed zijn op uw ervaring. Onze aansprakelijkheid is beperkt door
        Artikel 11, ongeacht problemen die door deze aanbieders worden veroorzaakt.
      </p>

      <h2>10. Disclaimer</h2>
      <p>
        DE DIENST WORDT VERSTREKT &ldquo;IN DE HUIDIGE STAAT&rdquo; EN &ldquo;ZOALS BESCHIKBAAR&rdquo;, ZONDER
        GARANTIES VAN WELKE AARD DAN OOK, HETZIJ UITDRUKKELIJK HETZIJ STILZWIJGEND, WAARONDER MAAR NIET BEPERKT TOT
        GARANTIES VAN VERKOOPBAARHEID (MERCHANTABILITY), GESCHIKTHEID VOOR EEN BEPAALD DOEL EN NIET-INBREUK
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Beperking van aansprakelijkheid</h2>
      <p>
        VOOR ZOVER MAXIMAAL TOEGESTAAN DOOR DE WET ZIJN LAVI LEARNING AND TRAINING TECHNOLOGIES LLC EN HAAR
        FUNCTIONARISSEN, WERKNEMERS EN VERTEGENWOORDIGERS NIET AANSPRAKELIJK VOOR ENIGE INDIRECTE, INCIDENTELE,
        BIJZONDERE OF GEVOLGSCHADE OF SCHADEVERGOEDING MET EEN BESTRAFFEND KARAKTER (PUNITIVE DAMAGES), OF VOOR ENIG
        VERLIES VAN WINST OF INKOMSTEN, VOORTVLOEIEND UIT OF IN VERBAND MET UW GEBRUIK VAN DE DIENST.
      </p>
      <p>
        ONZE TOTALE AANSPRAKELIJKHEID VOOR ENIGE VORDERING DIE VOORTVLOEIT UIT OF VERBAND HOUDT MET DE DIENST ZAL NIET
        HOGER ZIJN DAN HET HOOGSTE VAN (A) HET BEDRAG DAT U ONS HEEFT BETAALD IN DE TWAALF MAANDEN VOORAFGAAND AAN DE
        VORDERING, OF (B) USD $100.
      </p>

      <h2>12. Beëindiging</h2>
      <p>
        U kunt op elk moment stoppen met het gebruik van de Dienst. Wij kunnen uw toegang opschorten of beëindigen als u
        deze Voorwaarden schendt of als de wet dit vereist. Na beëindiging blijven de bepalingen die naar hun aard
        behoren voort te duren (waaronder de Artikelen 7, 10, 11 en 14) van kracht.
      </p>

      <h2>13. Wijzigingen in deze Voorwaarden</h2>
      <p>
        Wij kunnen deze Voorwaarden van tijd tot tijd herzien. Wezenlijke wijzigingen worden op deze pagina gepubliceerd
        met een herziene datum bij &ldquo;Laatst bijgewerkt&rdquo;. Als u de Dienst blijft gebruiken nadat de
        wijzigingen van kracht zijn geworden, geldt dit als aanvaarding van de bijgewerkte Voorwaarden.
      </p>

      <h2>14. Toepasselijk recht en geschillen</h2>
      <p>
        Op deze Voorwaarden is het recht van de staat Delaware, Verenigde Staten, van toepassing, zonder rekening te
        houden met de regels van conflictenrecht (conflict-of-law rules) van die staat. Elk geschil dat voortvloeit uit
        of verband houdt met deze Voorwaarden of de Dienst wordt uitsluitend beslecht door de staats- of federale
        rechtbanken in Delaware, Verenigde Staten, en u stemt in met de persoonlijke rechtsmacht (personal
        jurisdiction) van die rechtbanken.
      </p>

      <h2>15. Contact</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
