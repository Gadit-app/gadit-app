import type { ReactElement } from "react";

export const titlesIt = { privacy: "Informativa sulla privacy", terms: "Termini di utilizzo" };

export function PrivacyBodyIt(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;noi&rdquo;, &ldquo;ci&rdquo; o &ldquo;nostro&rdquo;) è un servizio gestito
        da <strong>Lavi Learning and Training Technologies LLC</strong>, una società registrata negli Stati Uniti. La
        presente Informativa sulla privacy spiega quali informazioni raccogliamo, come le utilizziamo e quali scelte
        sono a Sua disposizione.
      </p>
      <p>
        Per qualsiasi domanda, ci contatti all’indirizzo{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informazioni che raccogliamo</h2>
      <h3>Informazioni sull’account</h3>
      <p>
        Quando Lei crea un account, raccogliamo il Suo indirizzo email e, se accede con Google, le informazioni di base
        del profilo fornite da Google (nome visualizzato, immagine del profilo). Non riceviamo la Sua password di
        Google.
      </p>
      <p>
        {"Nell’app iOS Lei può anche accedere con Apple. In tal caso Apple ci fornisce il nome e l’indirizzo email che Lei sceglie di condividere, che può essere un indirizzo relay privato che inoltra a Lei le nostre email. Non riceviamo la Sua password Apple."}
      </p>
      <h3>Informazioni sull’utilizzo</h3>
      <p>Quando Lei utilizza Gadit, trattiamo:</p>
      <ul>
        <li>le parole e le eventuali frasi che Lei cerca;</li>
        <li>le immagini generate su Sua richiesta;</li>
        <li>il Suo piano di abbonamento e lo stato della fatturazione;</li>
        <li>una cronologia delle ricerche recenti (per gli utenti a pagamento, fino alle ultime 10 parole), conservata affinché Lei possa consultarla nuovamente in seguito;</li>
        <li>
          {"se Lei utilizza l’assistente di Gadit nel centro assistenza: le domande che pone, le sue risposte e l’eventuale indicazione che una risposta è stata utile, insieme al Suo ID account (e all’ID famiglia, se presente), all’indirizzo email, al piano, alla lingua dell’interfaccia e al fatto che abbia utilizzato il sito web o l’app;"}
        </li>
        <li>le quote mensili (ad esempio, il numero di immagini che Lei ha generato nel ciclo di fatturazione corrente).</li>
      </ul>
      <p>
        {"L’assistente di Gadit non è disponibile sui profili dei bambini, in Modalità bambini né per i visitatori che non hanno effettuato l’accesso. La preghiamo di non inserirvi password o numeri di carta."}
      </p>
      <h3>Dati tecnici e analitici</h3>
      <p>
        Raccogliamo automaticamente informazioni tecniche di base quali l’indirizzo IP, il tipo di browser, il tipo di
        dispositivo, l’URL di provenienza e le pagine visualizzate. Tali informazioni sono utilizzate per la sicurezza,
        il monitoraggio delle prestazioni e le analisi statistiche aggregate. Le analisi sono fornite da Vercel e sono
        rese anonime al momento della raccolta (non viene conservato alcun identificativo personale). Nelle nostre
        pagine di marketing, di registrazione e di pagamento utilizziamo anche strumenti pubblicitari e di analisi,
        descritti nella Sezione 3.
      </p>
      <h3>Informazioni di pagamento</h3>
      <p>
        Se Lei sottoscrive un abbonamento, il pagamento è elaborato da <strong>Stripe, Inc.</strong> Non vediamo né
        conserviamo il numero completo della Sua carta; riceviamo soltanto un token cliente e i metadati necessari per
        identificare l’abbonamento.
      </p>

      <h2>2. Come utilizziamo le Sue informazioni</h2>
      <ul>
        <li>per fornire e migliorare il servizio Gadit (generazione di definizioni, immagini, commenti sulle frasi, quiz);</li>
        <li>per gestire il Suo account e personalizzare la Sua esperienza (cronologia delle ricerche, lingua preferita, interruttore della &ldquo;Modalità bambini&rdquo;);</li>
        <li>per elaborare gli abbonamenti e inviare email transazionali (ricevute, modifiche dell’abbonamento);</li>
        <li>
          {"per rispondere alle Sue domande nell’assistente di Gadit e migliorare le nostre risposte di assistenza e, quando l’assistente inoltra una domanda al nostro team, per inviare via email al team la conversazione recente insieme al Suo nome, indirizzo email, piano, lingua dell’interfaccia e al fatto che abbia utilizzato il sito web o l’app, affinché il team possa risponderLe via email;"}
        </li>
        <li>per misurare e migliorare le prestazioni del prodotto e prevenire gli abusi;</li>
        <li>per adempiere agli obblighi di legge.</li>
      </ul>
      <p>
        <strong>Non vendiamo</strong> le Sue informazioni personali e non utilizziamo i Suoi contenuti per rivolgerLe
        pubblicità.
      </p>

      <h2>3. Servizi di terzi che utilizziamo</h2>
      <p>
        Gadit si avvale dei seguenti responsabili del trattamento. Ciascuno di essi riceve soltanto le informazioni
        minime necessarie per fornire il servizio di competenza:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": tratta le parole e le frasi che Lei invia per generare definizioni, commenti sulle frasi e quiz, converte il testo in voce, trascrive l’input vocale, legge il testo nelle foto e nei file PDF che Lei carica, ad esempio pagine di compiti, e genera immagini. Scrive anche le risposte dell’assistente di Gadit: gli inviamo la Sua domanda, i messaggi precedenti della stessa conversazione, la lingua dell’interfaccia, il Suo piano e se sta utilizzando il sito web o l’app, e non alleghiamo il Suo nome né il Suo indirizzo email. I dati inviati a OpenAI sono disciplinati dalla politica di utilizzo dei dati delle API di OpenAI."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): conserva il Suo account, il
          profilo, lo stato dell’abbonamento, la cronologia delle ricerche e le immagini generate.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, tramite Google Cloud) converte il testo in voce. Gli inviamo solo il testo da leggere ad alta voce, come parole, frasi e storie, e l’audio viene conservato nel nostro storage Firebase in modo da poter essere riprodotto di nuovo. In un gioco di lettura ascolta anche il suono pronunciato ad alta voce da un bambino, per verificarlo, e tale registrazione non viene conservata. Google Fonts fornisce i caratteri dell’interfaccia in cinese, giapponese e coreano e vede il Suo indirizzo IP."}
        </li>
        <li>
          <strong>Dicta</strong>{": un’organizzazione non profit israeliana, aggiunge i segni vocalici al testo in ebraico per i giovani lettori. Le inviamo solo il testo in ebraico."}
        </li>
        <li>
          <strong>Stripe</strong>: gestisce i pagamenti, gli abbonamenti e il portale di fatturazione.
        </li>
        <li>
          <strong>Apple</strong>{": fornisce Sign in with Apple nell’app iOS, vedere sezione 1, e vende e fattura gli abbonamenti acquistati nell’app iOS. Per tali acquisti, Apple gestisce il pagamento e noi riceviamo solo una conferma dell’acquisto e del suo stato, ad esempio un rinnovo o un rimborso."}
        </li>
        <li>
          <strong>PayPal</strong>{": paga i nostri partner affiliati. Le forniamo l’indirizzo email PayPal del partner e l’importo."}
        </li>
        <li>
          <strong>Resend</strong>{": invia le nostre email (come i link di accesso e le notifiche) e recapita al nostro team le domande che l’assistente di Gadit inoltra, con il Suo indirizzo email come indirizzo di risposta."}
        </li>
        <li>
          <strong>Expo</strong>{": recapita le notifiche dell’app iOS, come gli avvisi che un genitore può attivare, che includono il nome del bambino e la parola che il bambino ha cercato."}
        </li>
        <li>
          <strong>Vercel</strong>: ospita e distribuisce il sito web e fornisce analisi anonimizzate e misurazioni delle
          prestazioni.
        </li>
        <li>
          <strong>Yooniz</strong>{": un servizio separato di apprendimento familiare dello stesso fondatore. Yooniz può chiederci se l’indirizzo email di un genitore ha un piano Gadit Family attivo, e noi rispondiamo solo sì o no. In tal caso, la famiglia può aprire Gadit da Yooniz senza password: Yooniz ci invia l’indirizzo email del genitore, i nomi visualizzati dei membri della famiglia e se ciascuno di essi è un genitore, un bambino o una bambina. Quando un bambino che ha aperto Gadit da Yooniz capisce una parola, inviamo a Yooniz l’indirizzo email del genitore, l’ID Yooniz del bambino e il numero di punti di apprendimento guadagnati, mai la parola stessa."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": fornisce le piccole immagini delle bandiere mostrate nelle nostre pagine e, pertanto, vede il Suo indirizzo IP e i dettagli del Suo browser."}
        </li>
        <li>
          <strong>Pubblicità e analisi</strong>{": Meta (Meta Pixel), Google Analytics e TikTok (TikTok Pixel ed Events API) misurano le visite e i risultati delle nostre pubblicità. Utilizzano cookie e tecnologie simili nelle nostre pagine di marketing, di registrazione e di pagamento. Quando Lei si registra o effettua un pagamento, potremmo inviare a questi servizi un indirizzo email e un ID account sottoposti a hash, cioè cifrati in modo unidirezionale, insieme al Suo indirizzo IP e ai dettagli del Suo browser, esclusivamente per misurare le nostre pubblicità. Affonso, un servizio per link di affiliazione, si carica nelle stesse pagine e in qualsiasi pagina che un visitatore raggiunga tramite un link di un partner, e conserva un cookie per un massimo di 60 giorni. Se Lei si registra dopo essere arrivato tramite un link di affiliazione Affonso, inviamo ad Affonso il Suo indirizzo email, il Suo nome e il Suo ID account, affinché il partner che L’ha indirizzata riceva il relativo accredito. Non inviamo mai a nessuno di questi servizi informazioni sui bambini, e questi strumenti non sono attivi sul profilo di un bambino, in Kids Mode o nelle pagine dei link di classe."}
        </li>
      </ul>

      <h2>4. Per quanto tempo conserviamo le Sue informazioni</h2>
      <ul>
        <li>Informazioni sull’account: finché il Suo account esiste.</li>
        <li>Cronologia delle ricerche: le ultime 10 ricerche per utente, aggiornata a ogni nuova ricerca.</li>
        <li>
          {"Conversazioni con l’assistente di Gadit: 180 giorni, poi eliminate automaticamente, o prima se Lei elimina il Suo account. Un conteggio giornaliero delle Sue domande, utilizzato per il limite giornaliero, viene eliminato dopo 3 giorni."}
        </li>
        <li>
          {"Domande che l’assistente di Gadit inoltra al nostro team: conservate nella casella di posta del nostro team, come qualsiasi email che Lei ci invia."}
        </li>
        <li>Immagini generate: conservate affinché la stessa combinazione parola+significato possa riutilizzare l’immagine memorizzata nella cache. Possono essere conservate a tempo indeterminato finché il Suo account è attivo.</li>
        <li>Documentazione di fatturazione e fiscale: secondo quanto richiesto dalla legge applicabile (di norma 7 anni).</li>
        <li>
          {"Account eliminati: una breve registrazione dell’avvenuta eliminazione dell’account (indirizzo email, piano e l’eventuale motivo e nota da Lei forniti), conservata affinché possiamo rispondere a domande relative all’eliminazione."}
        </li>
        <li>Dati analitici: aggregati, di norma conservati dal fornitore dei servizi di analisi per 13 mesi.</li>
      </ul>

      <h2>5. I Suoi diritti</h2>
      <p>A seconda del luogo in cui risiede, Lei può avere il diritto di:</p>
      <ul>
        <li>richiedere l’accesso alle informazioni personali che deteniamo su di Lei;</li>
        <li>richiedere la rettifica di informazioni inesatte;</li>
        <li>richiedere la cancellazione del Suo account e dei dati associati;</li>
        <li>esportare i Suoi dati in un formato portabile;</li>
        <li>opporsi a determinati utilizzi delle Sue informazioni o limitarli;</li>
        <li>rifiutare determinate forme di condivisione dei dati (ove applicabile ai sensi del CCPA o di leggi analoghe).</li>
      </ul>
      <p>
        Per esercitare uno qualsiasi di questi diritti, scriva a{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Le risponderemo entro
        30 giorni.
      </p>

      <h2>6. Sicurezza</h2>
      <p>
        Adottiamo misure di protezione conformi agli standard del settore, ovvero connessioni cifrate (HTTPS), API
        autenticate e controlli di accesso, per proteggere le Sue informazioni. Nessun metodo di trasmissione o di
        archiviazione su internet è sicuro al 100%; pertanto non possiamo garantire una sicurezza assoluta, ma lavoriamo
        costantemente per ridurre i rischi.
      </p>

      <h2>7. Minori</h2>
      <p>
        {"Un account Gadit è destinato agli adulti, dai 18 anni in su. I bambini e gli adolescenti utilizzano Gadit solo tramite un adulto, in uno dei due modi seguenti."}
      </p>
      <p>
        {"Profili Family: un genitore aggiunge ciascun figlio come profilo all’interno dell’account Family del genitore, con un nome e l’indicazione se il bambino è maschio o femmina e, se il genitore li aggiunge, anche età, classe scolastica e foto. I bambini non hanno presso di noi un indirizzo email né una password. Le parole che un bambino cerca, così come il suo quaderno, i suoi giochi e i suoi progressi, vengono salvati nell’account della famiglia. I genitori della famiglia, e chiunque essi autorizzino ad accedervi, per esempio un tutor, possono vederli, e un genitore può scegliere di ricevere avvisi, tramite notifica o email, con le parole che un bambino cerca. Un genitore può rimuovere in qualsiasi momento nell’app il profilo di un bambino."}
      </p>
      <p>
        {"Link di classe: uno studente apre il link o il codice fornito da un insegnante, senza un account e senza un indirizzo email. Se l’insegnante ha inserito un elenco di nomi, lo studente seleziona il proprio nome da tale elenco, e le parole che lo studente cerca vengono salvate per la classe sotto quel nome, affinché l’insegnante possa vederle. La scuola decide di utilizzare Gadit ed è responsabile di informare i genitori ove la legge lo richieda."}
      </p>
      <p>
        {"Non utilizziamo mai le informazioni dei bambini per finalità pubblicitarie, e gli strumenti elencati nella voce Pubblicità e analisi della sezione 3 non vengono mai caricati su un profilo di bambino, in Modalità bambini o nelle pagine dei link di classe. Per far eliminare il profilo di un bambino e i relativi dati, un genitore può scrivere a "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" e provvederemo a eliminarli. Se ritiene che un bambino abbia aperto un proprio account, ci scriva e provvederemo a eliminare l’account e i relativi dati."}
      </p>

      <h2>8. Utenti internazionali</h2>
      <p>
        Gadit è gestito dagli Stati Uniti. Se Lei accede al servizio dall’esterno degli Stati Uniti, le Sue informazioni
        saranno trasferite, conservate e trattate negli Stati Uniti e nelle regioni dei data center utilizzate dai nostri
        fornitori di servizi.
      </p>

      <h2>9. Modifiche alla presente informativa</h2>
      <p>
        Potremmo aggiornare di tanto in tanto la presente Informativa sulla privacy. Le modifiche sostanziali saranno
        pubblicate su questa pagina con una data di &ldquo;Ultimo aggiornamento&rdquo; rivista. L’uso continuato di
        Gadit dopo l’entrata in vigore delle modifiche costituisce accettazione dell’informativa aggiornata.
      </p>

      <h2>10. Contatti</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyIt(): ReactElement {
  return (
    <>
      <p>
        Benvenuto in Gadit. I presenti Termini di utilizzo (&ldquo;Termini&rdquo;) disciplinano l’accesso e l’utilizzo
        da parte Sua del sito web, delle applicazioni e dei servizi di Gadit (nel loro insieme, il
        &ldquo;Servizio&rdquo;), gestiti da{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;noi&rdquo;, &ldquo;ci&rdquo; o
        &ldquo;nostro&rdquo;). Utilizzando il Servizio, Lei accetta di essere vincolato dai presenti Termini. Se non li
        accetta, non utilizzi il Servizio.
      </p>

      <h2>1. Chi può utilizzare Gadit</h2>
      <p>
        {"Per aprire un account Gadit Lei deve avere 18 anni o più. I bambini e gli adolescenti di età inferiore ai 18 anni utilizzano Gadit solo tramite un adulto: un genitore o un tutore possono aggiungerli come profili nel piano Family, e una scuola può fornire ai propri studenti un link di classe. Il genitore, il tutore o la scuola che fornisce tale accesso ne è responsabile. Aprendo un account, Lei conferma di avere 18 anni o più."}
      </p>

      <h2>2. Il Suo account</h2>
      <p>
        Lei è responsabile del mantenimento della riservatezza delle Sue credenziali di accesso e di tutte le attività
        svolte tramite il Suo account. Ci informi tempestivamente all’indirizzo{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> se ritiene che il Suo
        account sia stato compromesso.
      </p>

      <h2>3. Abbonamenti e fatturazione</h2>
      <h3>Piani e tariffe</h3>
      <p>
        {"Gadit offre un piano Basic gratuito e piani a pagamento con le funzionalità e i prezzi indicati nella pagina dei prezzi. I prezzi sono espressi nella valuta mostrata nella pagina dei prezzi e al momento del pagamento in base alla vostra località (in Israele, nuovi shekel israeliani inclusa l'IVA) e possono essere modificati con un preavviso di almeno 30 giorni per gli abbonati esistenti."}
      </p>
      <h3>Rinnovo automatico</h3>
      <p>
        Gli abbonamenti a pagamento si rinnovano automaticamente alla fine di ciascun periodo di fatturazione (mensile o
        annuale, secondo la scelta effettuata) al prezzo in vigore in quel momento, salvo disdetta prima della data di
        rinnovo.
      </p>
      <h3>Disdetta</h3>
      <p>
        {"Lei può disdire in qualsiasi momento dalla pagina del Suo account. La disdetta interrompe i rinnovi futuri. Lei mantiene l’accesso alle funzionalità a pagamento fino alla fine del periodo di fatturazione in corso. Salvo per i rimborsi descritti di seguito, non rimborsiamo il tempo non utilizzato, salvo ove la legge disponga diversamente."}
      </p>
      <h3>Rimborsi</h3>
      <p>
        {"Se ne fa richiesta entro 14 giorni dal primo pagamento del Suo account, oppure entro 14 giorni da un rinnovo annuale, Le rimborseremo integralmente tale pagamento. Non è necessario fornire alcuna motivazione. Scriva a "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" dall’indirizzo email del Suo account. Il rimborso comporta anche la cessazione dell’abbonamento. Gli altri pagamenti non sono rimborsabili, salvo ove la legge imponga un rimborso. Se ritiene di aver subito un addebito per errore, ci scriva entro 30 giorni dall’addebito. Gli acquisti effettuati nell’app iOS sono addebitati da Apple, e solo Apple può rimborsarli, all’indirizzo reportaproblem.apple.com."}
      </p>

      <h2>4. Uso consentito</h2>
      <p>Lei si impegna a non:</p>
      <ul>
        <li>utilizzare il Servizio per scopi illeciti o in violazione di qualsiasi legge;</li>
        <li>tentare di effettuare il reverse engineering, di decompilare o di estrarre il codice sorgente del Servizio;</li>
        <li>maltrattare, molestare o danneggiare altri utenti, né inviare contenuti che incitino all’odio, minacciosi oppure osceni;</li>
        <li>automatizzare l’accesso al Servizio oltre un ragionevole uso personale (ad esempio, estraendo definizioni su larga scala mediante scraping);</li>
        <li>aggirare i limiti di frequenza o le restrizioni del piano, né utilizzare più account per eludere le quote;</li>
        <li>utilizzare il Servizio per addestrare o perfezionare (fine-tuning) qualsiasi modello di IA o prodotto di dizionario concorrente;</li>
        <li>caricare o inviare contenuti che Lei non ha il diritto di inviare.</li>
      </ul>
      <p>
        Ci riserviamo il diritto di sospendere o chiudere gli account che violano i presenti Termini.
      </p>

      <h2>5. Contenuti generati dall’IA</h2>
      <p>
        {"Gadit utilizza modelli di intelligenza artificiale, inclusi modelli di OpenAI e Google, per generare definizioni, esempi, etimologie, commenti, quiz, immagini, sintesi vocale e trascrizioni. Lei comprende e accetta che:"}
      </p>
      <ul>
        <li>
          I risultati dell’IA possono essere <strong>inesatti, incompleti o inappropriati</strong>. Gadit è concepito
          come supporto all’apprendimento e non deve essere utilizzato come base per decisioni legali, mediche,
          professionali o accademiche.
        </li>
        <li>
          Le definizioni generate dall’IA possono differire da quelle dei dizionari ufficiali. Non garantiamo che ogni
          definizione sia autorevole dal punto di vista linguistico.
        </li>
        <li>
          Le immagini sono generate tramite algoritmi e possono talvolta risultare inattese o imprecise. Si tratta di
          illustrazioni, non di rappresentazioni letterali.
        </li>
        <li>
          Lei è l’unico responsabile del modo in cui interpreta e utilizza i contenuti generati dall’IA.
        </li>
      </ul>

      <h2>6. I Suoi contenuti</h2>
      <p>
        Quando Lei invia parole, frasi o audio a Gadit (ad esempio utilizzando &ldquo;Scrivi una frase tua&rdquo; o
        l’input vocale), ci concede una licenza mondiale, non esclusiva ed esente da royalty (royalty-free) per trattare
        tali contenuti al fine di fornire il Servizio e di migliorarlo. Non rivendichiamo la proprietà dei contenuti da
        Lei inviati.
      </p>

      <h2>7. Proprietà intellettuale</h2>
      <p>
        Il nome Gadit, il logo, il sito web e il software sottostante sono di nostra proprietà o di proprietà dei nostri
        licenzianti. A Lei è concessa una licenza personale, revocabile e non esclusiva per utilizzare il Servizio nei
        limiti consentiti dai presenti Termini.
      </p>
      <p>
        I contenuti generati da Gadit in risposta ai Suoi input (definizioni, immagini, ecc.) possono essere da Lei
        utilizzati per scopi personali, didattici o non commerciali. Per un uso commerciale (ad esempio in un prodotto a
        pagamento), La preghiamo di contattarci.
      </p>

      <h2>8. Disponibilità e modifiche</h2>
      <p>
        Ci impegniamo a mantenere il Servizio disponibile, ma non garantiamo un funzionamento ininterrotto o privo di
        errori. Possiamo modificare, sospendere o interrompere qualsiasi parte del Servizio in qualsiasi momento,
        incluse le funzionalità, i prezzi o la disponibilità in determinate aree geografiche.
      </p>

      <h2>9. Servizi di terzi</h2>
      <p>
        Il Servizio si avvale di fornitori terzi (tra cui OpenAI, Google Firebase, Stripe e Vercel). La loro
        disponibilità o il loro funzionamento possono influire sulla Sua esperienza. La nostra responsabilità è limitata
        dalla Sezione 11, indipendentemente da eventuali problemi causati da tali fornitori.
      </p>

      <h2>10. Esclusione di garanzie</h2>
      <p>
        IL SERVIZIO È FORNITO &ldquo;COSÌ COM’È&rdquo; E &ldquo;SECONDO DISPONIBILITÀ&rdquo;, SENZA GARANZIE DI ALCUN
        TIPO, ESPRESSE O IMPLICITE, INCLUSE, A TITOLO ESEMPLIFICATIVO MA NON ESAUSTIVO, LE GARANZIE DI COMMERCIABILITÀ
        (MERCHANTABILITY), DI IDONEITÀ PER UNO SCOPO PARTICOLARE E DI NON VIOLAZIONE DEI DIRITTI ALTRUI
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Limitazione di responsabilità</h2>
      <p>
        NELLA MISURA MASSIMA CONSENTITA DALLA LEGGE, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC E I SUOI DIRIGENTI,
        DIPENDENTI E AGENTI NON SARANNO RESPONSABILI DI ALCUN DANNO INDIRETTO, INCIDENTALE, SPECIALE, CONSEQUENZIALE O
        PUNITIVO (PUNITIVE DAMAGES), NÉ DI ALCUNA PERDITA DI PROFITTI O DI RICAVI, DERIVANTI DALL’UTILIZZO DEL SERVIZIO
        DA PARTE SUA O CONNESSI A TALE UTILIZZO.
      </p>
      <p>
        LA NOSTRA RESPONSABILITÀ COMPLESSIVA PER QUALSIASI PRETESA DERIVANTE DAL SERVIZIO O AD ESSO RELATIVA NON
        SUPERERÀ IL MAGGIORE TRA (A) L’IMPORTO CHE LEI CI HA PAGATO NEI DODICI MESI PRECEDENTI LA PRETESA E (B) USD
        $100.
      </p>

      <h2>12. Cessazione</h2>
      <p>
        Lei può smettere di utilizzare il Servizio in qualsiasi momento. Possiamo sospendere o revocare il Suo accesso
        se Lei viola i presenti Termini o se richiesto dalla legge. In caso di cessazione, le disposizioni che per loro
        natura sono destinate a sopravvivere (incluse le Sezioni 7, 10, 11 e 14) resteranno in vigore.
      </p>

      <h2>13. Modifiche ai presenti Termini</h2>
      <p>
        Potremmo rivedere di tanto in tanto i presenti Termini. Le modifiche sostanziali saranno pubblicate su questa
        pagina con una data di &ldquo;Ultimo aggiornamento&rdquo; rivista. L’uso continuato del Servizio dopo l’entrata
        in vigore delle modifiche costituisce accettazione dei Termini aggiornati.
      </p>

      <h2>14. Legge applicabile e controversie</h2>
      <p>
        I presenti Termini sono disciplinati dalle leggi dello Stato del Delaware, Stati Uniti, senza riguardo alle sue
        norme sul conflitto di leggi (conflict-of-law rules). Qualsiasi controversia derivante dai presenti Termini o dal
        Servizio, o ad essi relativa, sarà risolta esclusivamente dinanzi ai tribunali statali o federali con sede nel
        Delaware, Stati Uniti, e Lei acconsente alla giurisdizione personale (personal jurisdiction) di tali tribunali.
      </p>

      <h2>15. Contatti</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
