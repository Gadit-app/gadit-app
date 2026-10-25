import type { ReactElement } from "react";

export const titlesDa = { privacy: "Privatlivspolitik", terms: "Brugsvilkår" };

export function PrivacyBodyDa(): ReactElement {
  return (
    <>
      <p>
        Gadit (»Gadit«, »vi«, »os« eller »vores«) er en tjeneste, der drives af{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, en virksomhed registreret i USA. Denne
        privatlivspolitik forklarer, hvilke oplysninger vi indsamler, hvordan vi bruger dem, og hvilke valgmuligheder du
        har.
      </p>
      <p>
        Hvis du har spørgsmål, kan du kontakte os på{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Oplysninger, vi indsamler</h2>
      <h3>Kontooplysninger</h3>
      <p>
        Når du opretter en konto, indsamler vi din e-mailadresse og, hvis du logger ind med Google, de grundlæggende
        profiloplysninger, som Google stiller til rådighed (visningsnavn, profilbillede). Vi modtager ikke din
        Google-adgangskode.
      </p>
      <h3>Brugsoplysninger</h3>
      <p>Når du bruger Gadit, behandler vi:</p>
      <ul>
        <li>de ord og valgfrie sætninger, du slår op;</li>
        <li>billeder, der genereres på din anmodning;</li>
        <li>dit abonnement og din faktureringsstatus;</li>
        <li>en nylig søgehistorik (for betalende brugere op til de seneste 10 ord), som gemmes, så du kan få adgang til den igen senere;</li>
        <li>månedlige kvoter (for eksempel antallet af billeder, du har genereret i den aktuelle faktureringsperiode).</li>
      </ul>
      <h3>Tekniske data og analysedata</h3>
      <p>
        Vi indsamler automatisk grundlæggende tekniske oplysninger såsom IP-adresse, browsertype, enhedstype,
        henvisende URL og viste sider. Dette bruges til sikkerhed, overvågning af ydeevne og aggregerede analyser.
        Analyserne leveres af Vercel og anonymiseres allerede ved indsamlingen (der gemmes ingen personlige
        identifikatorer). På vores marketing-, tilmeldings- og betalingssider bruger vi også annoncerings- og
        analyseværktøjer, som er beskrevet i afsnit 3.
      </p>
      <h3>Betalingsoplysninger</h3>
      <p>
        Hvis du tegner et abonnement, behandles betalingen af <strong>Stripe, Inc.</strong> Vi ser og gemmer ikke dit
        fulde kortnummer; vi modtager kun et kundetoken og de metadata, der er nødvendige for at identificere
        abonnementet.
      </p>

      <h2>2. Hvordan vi bruger dine oplysninger</h2>
      <ul>
        <li>til at levere og forbedre tjenesten Gadit (generering af definitioner, billeder, feedback på sætninger, quizzer);</li>
        <li>til at vedligeholde din konto og tilpasse din oplevelse (søgehistorik, foretrukket sprog, kontakt til Børnetilstand);</li>
        <li>til at behandle abonnementer og sende transaktionsmails (kvitteringer, ændringer i abonnementet);</li>
        <li>til at måle og forbedre produktets ydeevne og forhindre misbrug;</li>
        <li>til at overholde retlige forpligtelser.</li>
      </ul>
      <p>
        Vi <strong>sælger ikke</strong> dine personoplysninger, og vi bruger ikke dit indhold til at vise dig reklamer.
      </p>

      <h2>3. Tredjepartstjenester, vi bruger</h2>
      <p>
        Gadit benytter følgende databehandlere. Hver af dem modtager kun de oplysninger, der som minimum er nødvendige
        for at levere den pågældende tjeneste:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>: behandler de ord og sætninger, du indsender, for at generere definitioner, feedback
          på sætninger, quizzer og taletransskription (Whisper), og genererer billeder (DALL·E 3). Data, der sendes til
          OpenAI, er underlagt OpenAIs politik for brug af API-data.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): gemmer din konto, din profil, din
          abonnementsstatus, din søgehistorik og genererede billeder.
        </li>
        <li>
          <strong>Stripe</strong>: håndterer betalinger, abonnementer og faktureringsportalen.
        </li>
        <li>
          <strong>Vercel</strong>: hoster og leverer webstedet og stiller anonymiserede analyser og målinger af
          ydeevne til rådighed.
        </li>
        <li>
          <strong>Annoncering og analyse</strong>: Meta (Meta Pixel), Google Analytics og TikTok (TikTok Pixel og
          Events API) måler besøg og resultaterne af vores annoncer. De bruger cookies og lignende teknologier på
          vores marketing-, tilmeldings- og betalingssider. Når du tilmelder dig eller betaler, kan vi sende disse
          tjenester en hashet (envejskrypteret) e-mailadresse og konto-ID sammen med din IP-adresse og oplysninger om
          din browser, udelukkende for at måle vores annoncer. Vi sender dem aldrig oplysninger om børn, og disse
          værktøjer kører ikke på de skærme, som børn bruger.
        </li>
      </ul>

      <h2>4. Hvor længe vi opbevarer dine oplysninger</h2>
      <ul>
        <li>Kontooplysninger: så længe din konto eksisterer.</li>
        <li>Søgehistorik: de seneste 10 søgninger pr. bruger, opdateret ved hver ny søgning.</li>
        <li>Genererede billeder: opbevares, så den samme kombination af ord og betydning kan genbruge det cachelagrede billede. De kan opbevares på ubestemt tid, så længe din konto er aktiv.</li>
        <li>Fakturerings- og skatteregistreringer: som krævet i henhold til gældende lovgivning (typisk 7 år).</li>
        <li>Analysedata: aggregerede, typisk opbevaret af analyseudbyderen i 13 måneder.</li>
      </ul>

      <h2>5. Dine rettigheder</h2>
      <p>Afhængigt af hvor du bor, kan du have ret til at:</p>
      <ul>
        <li>anmode om indsigt i de personoplysninger, vi har om dig;</li>
        <li>anmode om berigtigelse af urigtige oplysninger;</li>
        <li>anmode om sletning af din konto og tilknyttede data;</li>
        <li>eksportere dine data i et overførbart format;</li>
        <li>gøre indsigelse mod eller begrænse visse former for brug af dine oplysninger;</li>
        <li>fravælge visse former for deling af data (hvor det er relevant i henhold til CCPA eller lignende love).</li>
      </ul>
      <p>
        For at udøve nogen af disse rettigheder skal du sende en e-mail til{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Vi svarer inden for
        30 dage.
      </p>

      <h2>6. Sikkerhed</h2>
      <p>
        Vi bruger branchestandard sikkerhedsforanstaltninger, nemlig krypterede forbindelser (HTTPS), godkendte API&rsquo;er
        og adgangskontrol, til at beskytte dine oplysninger. Ingen metode til overførsel eller opbevaring på internettet
        er 100% sikker, så vi kan ikke garantere absolut sikkerhed, men vi arbejder løbende på at reducere risikoen.
      </p>

      <h2>7. Børn</h2>
      <p>
        Gadit er ikke rettet mod børn under 13 år. Hvis du mener, at et barn under 13 år har oprettet en konto, så send
        os en e-mail, og vi sletter kontoen og de tilknyttede data.
      </p>

      <h2>8. Internationale brugere</h2>
      <p>
        Gadit drives fra USA. Hvis du tilgår tjenesten uden for USA, vil dine oplysninger blive overført til, opbevaret
        og behandlet i USA og i de datacenterregioner, som vores tjenesteudbydere benytter.
      </p>

      <h2>9. Ændringer i denne politik</h2>
      <p>
        Vi kan opdatere denne privatlivspolitik fra tid til anden. Væsentlige ændringer offentliggøres på denne side med
        en ændret dato for »Senest opdateret«. Din fortsatte brug af Gadit, efter at ændringerne er trådt i kraft,
        udgør en accept af den opdaterede politik.
      </p>

      <h2>10. Kontakt</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyDa(): ReactElement {
  return (
    <>
      <p>
        Velkommen til Gadit. Disse brugsvilkår (»Vilkårene«) regulerer din adgang til og brug af Gadits websted,
        applikationer og tjenester (samlet »Tjenesten«), der drives af{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (»vi«, »os« eller »vores«). Ved at bruge
        Tjenesten accepterer du at være bundet af disse Vilkår. Hvis du ikke accepterer dem, må du ikke bruge Tjenesten.
      </p>

      <h2>1. Hvem må bruge Gadit</h2>
      <p>
        Du skal være mindst 13 år gammel for at oprette en konto. Hvis du er mellem 13 og 18 år, skal du have
        tilladelse fra en forælder eller værge. Ved at bruge Gadit erklærer du, at du opfylder disse krav.
      </p>

      <h2>2. Din konto</h2>
      <p>
        Du er ansvarlig for at holde dine loginoplysninger fortrolige og for al aktivitet, der foregår under din konto.
        Giv os straks besked på{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>, hvis du mener, at din
        konto er blevet kompromitteret.
      </p>

      <h2>3. Abonnementer og fakturering</h2>
      <h3>Abonnementer og gebyrer</h3>
      <p>
        Gadit tilbyder et gratis Basic-abonnement og betalte abonnementer (Clear og Deep) med de funktioner og priser,
        der er angivet på prissiden. Priserne er angivet i USD og kan ændres med mindst 30 dages varsel for eksisterende
        abonnenter.
      </p>
      <h3>Automatisk fornyelse</h3>
      <p>
        Betalte abonnementer fornyes automatisk ved udgangen af hver faktureringsperiode (månedligt eller årligt, som
        valgt) til den på det tidspunkt gældende pris, medmindre de opsiges før fornyelsesdatoen.
      </p>
      <h3>Opsigelse</h3>
      <p>
        Du kan til enhver tid opsige fra din kontoside. Opsigelse stopper fremtidige fornyelser. Du bevarer adgangen til
        de betalte funktioner indtil udgangen af den igangværende faktureringsperiode. Vi giver ikke delvis
        tilbagebetaling for ubrugt tid.
      </p>
      <h3>Tilbagebetaling</h3>
      <p>
        Medmindre loven kræver andet, refunderes betalinger ikke. Hvis du mener, at du er blevet opkrævet ved en fejl,
        så kontakt{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> inden for 30 dage efter
        opkrævningen.
      </p>

      <h2>4. Acceptabel brug</h2>
      <p>Du accepterer ikke at:</p>
      <ul>
        <li>bruge Tjenesten til ulovlige formål eller i strid med nogen lov;</li>
        <li>forsøge at foretage reverse engineering af, dekompilere eller udtrække kildekoden til Tjenesten;</li>
        <li>misbruge, chikanere eller skade andre brugere eller indsende indhold, der er hadefuldt, truende eller uanstændigt;</li>
        <li>automatisere adgangen til Tjenesten ud over rimelig personlig brug (for eksempel ved at skrabe definitioner i stor skala);</li>
        <li>omgå hastighedsbegrænsninger eller abonnementsbegrænsninger eller bruge flere konti for at undgå kvoter;</li>
        <li>bruge Tjenesten til at træne eller finjustere en konkurrerende AI-model eller et konkurrerende ordbogsprodukt;</li>
        <li>uploade eller indsende indhold, som du ikke har ret til at indsende.</li>
      </ul>
      <p>
        Vi forbeholder os retten til at suspendere eller lukke konti, der overtræder disse Vilkår.
      </p>

      <h2>5. AI-genereret indhold</h2>
      <p>
        Gadit bruger modeller for kunstig intelligens (herunder OpenAIs GPT, Whisper og DALL·E) til at generere
        definitioner, eksempler, etymologier, feedback, quizzer, billeder og transskriptioner. Du forstår og
        accepterer, at:
      </p>
      <ul>
        <li>
          AI-output kan være <strong>unøjagtigt, ufuldstændigt eller upassende</strong>. Gadit er tænkt som et
          læringsværktøj og bør ikke lægges til grund for juridiske, medicinske, faglige eller akademiske beslutninger.
        </li>
        <li>
          AI-genererede definitioner kan afvige fra officielle ordbøger. Vi garanterer ikke, at hver definition er
          sprogligt autoritativ.
        </li>
        <li>
          Billeder genereres algoritmisk og kan lejlighedsvis være uventede eller upræcise. De er illustrationer, ikke
          bogstavelige gengivelser.
        </li>
        <li>
          Du alene er ansvarlig for, hvordan du fortolker og bruger AI-genereret indhold.
        </li>
      </ul>

      <h2>6. Dit indhold</h2>
      <p>
        Når du indsender ord, sætninger eller lyd til Gadit (for eksempel når du bruger »Skriv din egen sætning« eller
        stemmeinput), giver du os en verdensomspændende, ikke-eksklusiv, vederlagsfri licens (royalty-free) til at
        behandle dette indhold med det formål at levere Tjenesten og forbedre den. Vi gør ikke krav på ejendomsretten
        til dine indsendelser.
      </p>

      <h2>7. Immaterielle rettigheder</h2>
      <p>
        Navnet Gadit, logoet, webstedet og den underliggende software tilhører os eller vores licensgivere. Du får en
        personlig, tilbagekaldelig, ikke-eksklusiv licens til at bruge Tjenesten som tilladt i henhold til disse
        Vilkår.
      </p>
      <p>
        Indhold, som Gadit genererer som svar på dit input (definitioner, billeder osv.), må du bruge til personlige,
        uddannelsesmæssige eller ikke-kommercielle formål. Ved kommerciel brug (for eksempel i et betalt produkt) bedes
        du kontakte os.
      </p>

      <h2>8. Tilgængelighed og ændringer</h2>
      <p>
        Vi bestræber os på at holde Tjenesten tilgængelig, men vi garanterer ikke uafbrudt eller fejlfri drift. Vi kan
        til enhver tid ændre, suspendere eller indstille enhver del af Tjenesten, herunder funktioner, priser eller
        tilgængelighed i bestemte regioner.
      </p>

      <h2>9. Tredjepartstjenester</h2>
      <p>
        Tjenesten benytter tredjepartsudbydere (herunder OpenAI, Google Firebase, Stripe og Vercel). Deres
        tilgængelighed eller adfærd kan påvirke din oplevelse. Vores ansvar er begrænset af afsnit 11, uanset problemer
        forårsaget af disse udbydere.
      </p>

      <h2>10. Ansvarsfraskrivelse</h2>
      <p>
        TJENESTEN LEVERES »SOM DEN ER« OG »SOM TILGÆNGELIG«, UDEN GARANTIER AF NOGEN ART, HVERKEN UDTRYKKELIGE ELLER
        STILTIENDE, HERUNDER, MEN IKKE BEGRÆNSET TIL, GARANTIER FOR SALGBARHED (MERCHANTABILITY), EGNETHED TIL ET
        BESTEMT FORMÅL OG IKKE-KRÆNKELSE AF TREDJEMANDS RETTIGHEDER (NON-INFRINGEMENT).
      </p>

      <h2>11. Ansvarsbegrænsning</h2>
      <p>
        I DET OMFANG, LOVEN MAKSIMALT TILLADER, ER LAVI LEARNING AND TRAINING TECHNOLOGIES LLC OG DETS LEDENDE
        MEDARBEJDERE, ANSATTE OG REPRÆSENTANTER IKKE ANSVARLIGE FOR NOGEN INDIREKTE SKADER, HÆNDELIGE SKADER, SÆRLIGE
        SKADER, FØLGESKADER ELLER ERSTATNING AF PØNAL KARAKTER (PUNITIVE DAMAGES) ELLER FOR NOGET TAB AF FORTJENESTE
        ELLER INDTÆGTER, DER OPSTÅR SOM FØLGE AF ELLER I FORBINDELSE MED DIN BRUG AF TJENESTEN.
      </p>
      <p>
        VORES SAMLEDE ANSVAR FOR ETHVERT KRAV, DER OPSTÅR SOM FØLGE AF ELLER I FORBINDELSE MED TJENESTEN, KAN IKKE
        OVERSTIGE DET HØJESTE AF (A) DET BELØB, DU HAR BETALT OS I DE TOLV MÅNEDER FORUD FOR KRAVET, ELLER (B) USD
        $100.
      </p>

      <h2>12. Ophør</h2>
      <p>
        Du kan til enhver tid holde op med at bruge Tjenesten. Vi kan suspendere eller lukke din adgang, hvis du
        overtræder disse Vilkår, eller hvis loven kræver det. Ved ophør forbliver de bestemmelser, som efter deres
        karakter bør fortsætte med at gælde (herunder afsnit 7, 10, 11 og 14), i kraft.
      </p>

      <h2>13. Ændringer i disse Vilkår</h2>
      <p>
        Vi kan revidere disse Vilkår fra tid til anden. Væsentlige ændringer offentliggøres på denne side med en ændret
        dato for »Senest opdateret«. Din fortsatte brug af Tjenesten, efter at ændringerne er trådt i kraft, udgør en
        accept af de opdaterede Vilkår.
      </p>

      <h2>14. Lovvalg og tvister</h2>
      <p>
        Disse Vilkår er underlagt lovgivningen i staten Delaware, USA, uden hensyn til dens lovvalgsregler
        (conflict-of-law rules). Enhver tvist, der opstår som følge af eller i forbindelse med disse Vilkår eller
        Tjenesten, skal udelukkende afgøres ved de delstatslige eller føderale domstole i Delaware, USA, og du
        accepterer disse domstoles personlige kompetence (personal jurisdiction).
      </p>

      <h2>15. Kontakt</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
