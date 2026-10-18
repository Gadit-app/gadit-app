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
      <h3>Gebruiksinformatie</h3>
      <p>Wanneer u Gadit gebruikt, verwerken wij:</p>
      <ul>
        <li>de woorden en optionele zinnen die u opzoekt;</li>
        <li>afbeeldingen die op uw verzoek worden gegenereerd;</li>
        <li>uw abonnement en uw factureringsstatus;</li>
        <li>een recente zoekgeschiedenis (voor betalende gebruikers tot de laatste 10 woorden), opgeslagen zodat u deze later opnieuw kunt raadplegen;</li>
        <li>maandelijkse quota (bijvoorbeeld het aantal afbeeldingen dat u in de huidige factureringsperiode heeft gegenereerd).</li>
      </ul>
      <h3>Technische en analytische gegevens</h3>
      <p>
        Wij verzamelen automatisch technische basisinformatie zoals IP-adres, browsertype, apparaattype, verwijzende
        URL en bekeken pagina&rsquo;s. Deze informatie wordt gebruikt voor beveiliging, prestatiebewaking en
        geaggregeerde analyses. De analyses worden geleverd door Vercel en worden op het moment van verzameling
        geanonimiseerd (er worden geen persoonlijke identificatiegegevens opgeslagen).
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
          <strong>OpenAI</strong>: verwerkt de woorden en zinnen die u indient om definities, feedback op zinnen,
          quizzen en spraaktranscriptie (Whisper) te genereren, en genereert afbeeldingen (DALL·E 3). Gegevens die naar
          OpenAI worden verzonden, vallen onder het API-beleid voor gegevensgebruik van OpenAI.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): slaat uw account, profiel,
          abonnementsstatus, zoekgeschiedenis en gegenereerde afbeeldingen op.
        </li>
        <li>
          <strong>Stripe</strong>: verzorgt betalingen, abonnementen en het factureringsportaal.
        </li>
        <li>
          <strong>Vercel</strong>: host en levert de website, en verzorgt geanonimiseerde analyses en
          prestatiemetingen.
        </li>
      </ul>

      <h2>4. Hoe lang wij uw informatie bewaren</h2>
      <ul>
        <li>Accountinformatie: zolang uw account bestaat.</li>
        <li>Zoekgeschiedenis: de laatste 10 zoekopdrachten per gebruiker, bijgewerkt bij elke nieuwe zoekopdracht.</li>
        <li>Gegenereerde afbeeldingen: bewaard zodat dezelfde combinatie van woord en betekenis de in de cache opgeslagen afbeelding opnieuw kan gebruiken. Deze kunnen voor onbepaalde tijd worden bewaard zolang uw account actief is.</li>
        <li>Facturerings- en belastinggegevens: zoals vereist door de toepasselijke wetgeving (doorgaans 7 jaar).</li>
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
        Gadit is niet gericht op kinderen jonger dan 13 jaar. Als u denkt dat een kind jonger dan 13 jaar een account
        heeft aangemaakt, stuur ons dan een e-mail en wij verwijderen het account en de bijbehorende gegevens.
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
        U moet ten minste 13 jaar oud zijn om een account aan te maken. Als u tussen 13 en 18 jaar oud bent, heeft u
        toestemming nodig van een ouder of wettelijke voogd. Door Gadit te gebruiken, verklaart u dat u aan deze
        vereisten voldoet.
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
        Gadit biedt een gratis Basic-abonnement en betaalde abonnementen (Clear en Deep) met de functies en prijzen die
        op de prijspagina worden vermeld. Prijzen worden vermeld in USD en kunnen voor bestaande abonnees worden
        gewijzigd met een opzegtermijn van ten minste 30 dagen.
      </p>
      <h3>Automatische verlenging</h3>
      <p>
        Betaalde abonnementen worden aan het einde van elke factureringsperiode (maandelijks of jaarlijks, zoals
        gekozen) automatisch verlengd tegen de op dat moment geldende prijs, tenzij ze vóór de verlengingsdatum worden
        opgezegd.
      </p>
      <h3>Opzegging</h3>
      <p>
        U kunt op elk moment opzeggen via uw accountpagina. Opzegging stopt toekomstige verlengingen. U behoudt toegang
        tot de betaalde functies tot het einde van de lopende factureringsperiode. Wij verstrekken geen gedeeltelijke
        terugbetalingen voor ongebruikte tijd.
      </p>
      <h3>Terugbetalingen</h3>
      <p>
        Behalve waar de wet dit vereist, worden betalingen niet terugbetaald. Als u denkt dat er bij u ten onrechte een
        bedrag in rekening is gebracht, neem dan binnen 30 dagen na de afschrijving contact op met{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
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
        Gadit gebruikt modellen voor kunstmatige intelligentie (waaronder GPT, Whisper en DALL·E van OpenAI) om
        definities, voorbeelden, etymologieën, feedback, quizzen, afbeeldingen en transcripties te genereren. U begrijpt
        en gaat ermee akkoord dat:
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
