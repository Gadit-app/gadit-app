import type { ReactElement } from "react";

export const titlesDe = { privacy: "Datenschutzerklärung", terms: "Nutzungsbedingungen" };

export function PrivacyBodyDe(): ReactElement {
  return (
    <>
      <p>
        Gadit (&bdquo;Gadit&ldquo;, &bdquo;wir&ldquo;, &bdquo;uns&ldquo; oder &bdquo;unser&ldquo;) ist ein Dienst, der von{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> betrieben wird, einem in den Vereinigten Staaten
        eingetragenen Unternehmen. Diese Datenschutzerklärung erläutert, welche Informationen wir erheben, wie wir sie
        verwenden und welche Wahlmöglichkeiten Sie haben.
      </p>
      <p>
        Bei Fragen wenden Sie sich bitte an{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Welche Informationen wir erheben</h2>
      <h3>Kontoinformationen</h3>
      <p>
        Wenn Sie ein Konto erstellen, erheben wir Ihre E-Mail-Adresse und, falls Sie sich mit Google anmelden, die
        grundlegenden Profilinformationen, die Google bereitstellt (Anzeigename, Profilbild). Ihr Google-Passwort
        erhalten wir nicht.
      </p>
      <p>
        {"In der iOS-App können Sie sich auch mit Apple anmelden. Apple übermittelt uns dann den Namen und die E-Mail-Adresse, die Sie freigeben möchten. Dabei kann es sich um eine private Relay-Adresse handeln, die unsere E-Mails an Sie weiterleitet. Ihr Apple-Passwort erhalten wir nicht."}
      </p>
      <h3>Nutzungsinformationen</h3>
      <p>Wenn Sie Gadit nutzen, verarbeiten wir:</p>
      <ul>
        <li>die Wörter und optionalen Sätze, die Sie nachschlagen;</li>
        <li>auf Ihre Anforderung hin erstellte Bilder;</li>
        <li>Ihren Abonnementtarif und Ihren Abrechnungsstatus;</li>
        <li>einen aktuellen Suchverlauf (für zahlende Nutzer bis zu den letzten 10 Wörtern), der gespeichert wird, damit Sie später erneut darauf zugreifen können;</li>
        <li>
          {"wenn Sie den Gadit-Assistenten im Hilfecenter verwenden: die Fragen, die Sie stellen, seine Antworten und ob Sie eine Antwort als hilfreich markiert haben, zusammen mit Ihrer Konto-ID (und Ihrer Familien-ID, falls vorhanden), Ihrer E-Mail-Adresse, Ihrem Tarif, Ihrer Oberflächensprache und damit, ob Sie die Website oder die App verwendet haben;"}
        </li>
        <li>monatliche Kontingente (zum Beispiel die Anzahl der Bilder, die Sie im aktuellen Abrechnungszeitraum erstellt haben).</li>
      </ul>
      <p>
        {"Der Gadit-Assistent wird nicht in Kinderprofilen, im Kindermodus oder Besuchern angeboten, die nicht angemeldet sind. Bitte geben Sie dort keine Passwörter oder Kartennummern ein."}
      </p>
      <h3>Technische Daten und Analysedaten</h3>
      <p>
        Wir erheben automatisch grundlegende technische Informationen wie IP-Adresse, Browsertyp, Gerätetyp,
        verweisende URL und aufgerufene Seiten. Diese werden für Sicherheit, Leistungsüberwachung und aggregierte
        Analysen verwendet. Die Analysen werden von Vercel bereitgestellt und bereits bei der Erhebung anonymisiert (es
        werden keine personenbezogenen Kennungen gespeichert). Auf unseren Marketing-, Registrierungs- und
        Zahlungsseiten verwenden wir außerdem Werbe- und Analysetools, die in Abschnitt 3 beschrieben sind.
      </p>
      <h3>Zahlungsinformationen</h3>
      <p>
        Wenn Sie ein Abonnement abschließen, wird die Zahlung von <strong>Stripe, Inc.</strong> abgewickelt. Wir sehen
        und speichern Ihre vollständige Kartennummer nicht; wir erhalten lediglich ein Kunden-Token und die Metadaten,
        die zur Identifizierung des Abonnements erforderlich sind.
      </p>

      <h2>2. Wie wir Ihre Informationen verwenden</h2>
      <ul>
        <li>um den Dienst Gadit bereitzustellen und zu verbessern (Erstellung von Definitionen, Bildern, Rückmeldungen zu Sätzen, Quizfragen);</li>
        <li>um Ihr Konto zu verwalten und Ihre Nutzung zu personalisieren (Suchverlauf, bevorzugte Sprache, Schalter für den Kindermodus);</li>
        <li>um Abonnements abzuwickeln und transaktionsbezogene E-Mails zu versenden (Quittungen, Änderungen des Abonnements);</li>
        <li>
          {"um Ihre Fragen im Gadit-Assistenten zu beantworten und unsere Hilfeantworten zu verbessern, und, wenn der Assistent eine Frage an unser Team weiterleitet, um dem Team die letzte Unterhaltung zusammen mit Ihrem Namen, Ihrer E-Mail-Adresse, Ihrem Tarif, Ihrer Oberflächensprache und damit, ob Sie die Website oder die App verwendet haben, per E-Mail zu senden, damit das Team Ihnen per E-Mail antworten kann;"}
        </li>
        <li>um die Leistung des Produkts zu messen und zu verbessern und Missbrauch zu verhindern;</li>
        <li>um gesetzliche Verpflichtungen zu erfüllen.</li>
      </ul>
      <p>
        Wir <strong>verkaufen Ihre personenbezogenen Daten nicht</strong>, und wir verwenden Ihre Inhalte nicht, um
        Ihnen Werbung anzuzeigen.
      </p>

      <h2>3. Von uns genutzte Dienste Dritter</h2>
      <p>
        Gadit stützt sich auf die folgenden Auftragsverarbeiter. Jeder von ihnen erhält nur die Mindestinformationen,
        die zur Erbringung des jeweiligen Dienstes erforderlich sind:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": verarbeitet die von Ihnen übermittelten Wörter und Sätze, um Definitionen, Rückmeldungen zu Sätzen und Quizfragen zu erstellen, wandelt Text in Sprache um, transkribiert Spracheingaben, liest den Text in Fotos und PDF-Dateien, die Sie hochladen, etwa Hausaufgabenseiten, und erzeugt Bilder. Es verfasst auch die Antworten des Gadit-Assistenten: Wir senden Ihre Frage, die früheren Nachrichten derselben Unterhaltung, Ihre Oberflächensprache, Ihren Tarif und ob Sie die Website oder die App nutzen, und fügen Ihren Namen oder Ihre E-Mail-Adresse nicht bei. Für an OpenAI übermittelte Daten gilt die API-Datennutzungsrichtlinie von OpenAI."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): speichert Ihr Konto, Ihr Profil,
          Ihren Abonnementstatus, Ihren Suchverlauf und die erstellten Bilder.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, über Google Cloud) wandelt Text in Sprache um. Wir senden ihm nur den Text, der vorgelesen werden soll, etwa Wörter, Sätze und Geschichten, und die Audiodatei wird in unserem Firebase-Speicher aufbewahrt, damit sie erneut abgespielt werden kann. In einem Lesespiel hört es auch den Laut, den ein Kind laut ausspricht, um ihn zu überprüfen, und diese Aufnahme wird nicht gespeichert. Google Fonts stellt die Schriftarten für die Benutzeroberfläche auf Chinesisch, Japanisch und Koreanisch bereit und sieht Ihre IP-Adresse."}
        </li>
        <li>
          <strong>Dicta</strong>{": eine israelische gemeinnützige Organisation, fügt hebräischen Texten für junge Leser Vokalzeichen (Niqqud) hinzu. Wir senden ihr nur den hebräischen Text."}
        </li>
        <li>
          <strong>Stripe</strong>: wickelt Zahlungen, Abonnements und das Abrechnungsportal ab.
        </li>
        <li>
          <strong>Apple</strong>{": stellt die Anmeldung mit Apple in der iOS-App bereit (siehe Abschnitt 1) und verkauft und berechnet die in der iOS-App gekauften Abonnements. Bei diesen Käufen wickelt Apple die Zahlung ab, und wir erhalten nur eine Bestätigung des Kaufs und seines Status, etwa einer Verlängerung oder einer Rückerstattung."}
        </li>
        <li>
          <strong>PayPal</strong>{": bezahlt unsere Partner. Wir übermitteln ihm die PayPal-E-Mail-Adresse des Partners und den Betrag."}
        </li>
        <li>
          <strong>Resend</strong>{": versendet unsere E-Mails (zum Beispiel Anmeldelinks und Benachrichtigungen) und leitet unserem Team die Fragen weiter, die der Gadit-Assistent weitergibt, wobei Ihre E-Mail-Adresse als Antwortadresse verwendet wird."}
        </li>
        <li>
          <strong>Expo</strong>{": übermittelt die Benachrichtigungen der iOS-App, etwa Hinweise, die ein Elternteil aktivieren kann und die den Namen eines Kindes und das vom Kind nachgeschlagene Wort enthalten."}
        </li>
        <li>
          <strong>Vercel</strong>: hostet und betreibt die Website und stellt anonymisierte Analysen und
          Leistungsmessungen bereit.
        </li>
        <li>
          <strong>Yooniz</strong>{": ein eigenständiger Familiendienst zum Lernen desselben Gründers. Yooniz kann uns fragen, ob die E-Mail-Adresse eines Elternteils einen aktiven Gadit Family-Tarif hat, und wir antworten nur mit Ja oder Nein. Wenn dies der Fall ist, kann die Familie Gadit aus Yooniz heraus ohne Passwort öffnen: Yooniz sendet uns die E-Mail-Adresse des Elternteils, die Anzeigenamen der Familienmitglieder und ob jede Person ein Elternteil, ein Junge oder ein Mädchen ist. Wenn ein Kind, das Gadit aus Yooniz heraus geöffnet hat, ein Wort versteht, senden wir Yooniz die E-Mail-Adresse des Elternteils, die Yooniz-ID des Kindes und die Anzahl der verdienten Lernpunkte, jedoch niemals das Wort selbst."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": stellt die kleinen Flaggenbilder bereit, die auf unseren Seiten angezeigt werden, und sieht daher Ihre IP-Adresse und Angaben zu Ihrem Browser."}
        </li>
        <li>
          <strong>Werbung und Analyse</strong>{": Meta (Meta Pixel), Google Analytics und TikTok (TikTok Pixel und Events API) messen Besuche und die Ergebnisse unserer Werbung. Diese Dienste verwenden Cookies und ähnliche Technologien auf unseren Marketing-, Registrierungs- und Zahlungsseiten. Wenn Sie sich registrieren oder bezahlen, können wir diesen Diensten eine gehashte (einseitig verschlüsselte) E-Mail-Adresse und Konto-ID zusammen mit Ihrer IP-Adresse und Angaben zu Ihrem Browser übermitteln, ausschließlich um unsere Werbung zu messen. Affonso, ein Dienst für Partnerlinks, wird auf denselben Seiten sowie auf jeder Seite geladen, die ein Besucher über einen Partnerlink erreicht, und speichert ein Cookie für bis zu 60 Tage. Wenn Sie sich registrieren, nachdem Sie über einen Affonso-Partnerlink gekommen sind, senden wir Affonso Ihre E-Mail-Adresse, Ihren Namen und Ihre Konto-ID, damit der Partner, der Sie geworben hat, die entsprechende Gutschrift erhält. Wir übermitteln keinem dieser Dienste jemals Informationen über Kinder, und diese Tools laufen nicht auf dem Profil eines Kindes, im Kids Mode oder auf Seiten mit Klassenlinks."}
        </li>
      </ul>

      <h2>4. Wie lange wir Ihre Informationen aufbewahren</h2>
      <ul>
        <li>Kontoinformationen: solange Ihr Konto besteht.</li>
        <li>Suchverlauf: die letzten 10 Suchanfragen pro Nutzer, aktualisiert bei jeder neuen Suche.</li>
        <li>
          {"Unterhaltungen mit dem Gadit-Assistenten: 180 Tage, danach automatisch gelöscht, oder früher, wenn Sie Ihr Konto löschen. Eine tägliche Zählung Ihrer Fragen, die für das tägliche Limit verwendet wird, wird nach 3 Tagen gelöscht."}
        </li>
        <li>
          {"Fragen, die der Gadit-Assistent an unser Team weiterleitet: werden im Postfach unseres Teams aufbewahrt, wie jede andere E-Mail, die Sie uns senden."}
        </li>
        <li>Erstellte Bilder: werden aufbewahrt, damit für dieselbe Kombination aus Wort und Bedeutung das zwischengespeicherte Bild wiederverwendet werden kann. Sie können unbegrenzt aufbewahrt werden, solange Ihr Konto aktiv ist.</li>
        <li>Abrechnungs- und Steuerunterlagen: wie nach geltendem Recht vorgeschrieben (in der Regel 7 Jahre).</li>
        <li>
          {"Gelöschte Konten: eine kurze Aufzeichnung darüber, dass das Konto gelöscht wurde (seine E-Mail-Adresse, sein Tarif sowie der Grund und die Anmerkung, die Sie angegeben haben, falls vorhanden), die aufbewahrt wird, damit wir Fragen zur Löschung beantworten können."}
        </li>
        <li>Analysedaten: aggregiert, in der Regel vom Analyseanbieter 13 Monate lang aufbewahrt.</li>
      </ul>

      <h2>5. Ihre Rechte</h2>
      <p>Je nach Ihrem Wohnort haben Sie möglicherweise das Recht:</p>
      <ul>
        <li>Auskunft über die personenbezogenen Daten zu verlangen, die wir über Sie gespeichert haben;</li>
        <li>die Berichtigung unrichtiger Informationen zu verlangen;</li>
        <li>die Löschung Ihres Kontos und der zugehörigen Daten zu verlangen;</li>
        <li>Ihre Daten in einem übertragbaren Format zu exportieren;</li>
        <li>bestimmten Verwendungen Ihrer Informationen zu widersprechen oder diese einzuschränken;</li>
        <li>bestimmten Weitergaben von Daten zu widersprechen (soweit nach dem CCPA oder ähnlichen Gesetzen anwendbar).</li>
      </ul>
      <p>
        Um eines dieser Rechte auszuüben, senden Sie eine E-Mail an{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Wir antworten innerhalb
        von 30 Tagen.
      </p>

      <h2>6. Sicherheit</h2>
      <p>
        Wir setzen branchenübliche Schutzmaßnahmen ein, nämlich verschlüsselte Verbindungen (HTTPS), authentifizierte
        APIs und Zugriffskontrollen, um Ihre Informationen zu schützen. Keine Methode der Übertragung oder Speicherung im
        Internet ist zu 100% sicher, daher können wir keine absolute Sicherheit garantieren, wir arbeiten jedoch
        kontinuierlich daran, Risiken zu verringern.
      </p>

      <h2>7. Kinder</h2>
      <p>
        {"Ein Gadit-Konto ist für Erwachsene ab 18 Jahren bestimmt. Kinder und Jugendliche nutzen Gadit nur über einen Erwachsenen, und zwar auf eine von zwei Arten."}
      </p>
      <p>
        {"Family-Profile: Ein Elternteil fügt jedes Kind als Profil innerhalb des Family-Kontos des Elternteils hinzu, mit einem Namen und der Angabe, ob das Kind ein Junge oder ein Mädchen ist, und, wenn der Elternteil diese Angaben hinzufügt, auch mit Alter, Klassenstufe und Foto. Kinder haben bei uns keine E-Mail-Adresse und kein Passwort. Die Wörter, nach denen ein Kind sucht, sowie das Notizbuch, die Spiele und der Fortschritt des Kindes werden im Konto der Familie gespeichert. Die Eltern in der Familie und alle Personen, denen sie Zugang geben, zum Beispiel eine Nachhilfelehrkraft, können dies sehen, und ein Elternteil kann wählen, ob es Benachrichtigungen, per Mitteilung oder E-Mail, mit den Wörtern erhalten möchte, nach denen ein Kind sucht. Ein Elternteil kann das Profil eines Kindes jederzeit in der App entfernen."}
      </p>
      <p>
        {"Klassenlinks: Eine Schülerin oder ein Schüler öffnet den Link oder Code, den eine Lehrkraft gibt, ohne Konto und ohne E-Mail-Adresse. Wenn die Lehrkraft eine Namensliste eingegeben hat, wählt die Schülerin oder der Schüler daraus den eigenen Namen aus, und die Wörter, nach denen die Schülerin oder der Schüler sucht, werden unter diesem Namen für die Klasse gespeichert, damit die Lehrkraft sie sehen kann. Die Schule entscheidet sich für die Nutzung von Gadit und ist dafür verantwortlich, die Eltern zu informieren, soweit das Gesetz dies verlangt."}
      </p>
      <p>
        {"Wir verwenden Informationen über Kinder niemals für Werbung, und die unter Werbung und Analyse in Abschnitt 3 aufgeführten Tools werden in einem Kinderprofil, im Kids Mode oder auf Seiten mit Klassenlinks niemals geladen. Um das Profil eines Kindes und seine Daten löschen zu lassen, kann ein Elternteil an "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" schreiben, und wir werden sie löschen. Wenn Sie glauben, dass ein Kind selbst ein Konto eröffnet hat, schreiben Sie uns, und wir werden das Konto und seine Daten löschen."}
      </p>

      <h2>8. Internationale Nutzer</h2>
      <p>
        Gadit wird von den Vereinigten Staaten aus betrieben. Wenn Sie von außerhalb der Vereinigten Staaten auf den
        Dienst zugreifen, werden Ihre Informationen in die Vereinigten Staaten und in die von unseren Dienstleistern
        genutzten Rechenzentrumsregionen übermittelt und dort gespeichert und verarbeitet.
      </p>

      <h2>9. Änderungen dieser Erklärung</h2>
      <p>
        Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Wesentliche Änderungen werden auf dieser
        Seite mit einem überarbeiteten Datum unter &bdquo;Zuletzt aktualisiert&ldquo; veröffentlicht. Wenn Sie Gadit
        nach Inkrafttreten der Änderungen weiterhin nutzen, gilt dies als Annahme der aktualisierten Erklärung.
      </p>

      <h2>10. Kontakt</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-Mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyDe(): ReactElement {
  return (
    <>
      <p>
        Willkommen bei Gadit. Diese Nutzungsbedingungen (die &bdquo;Bedingungen&ldquo;) regeln Ihren Zugang zu und Ihre
        Nutzung der Website, der Anwendungen und der Dienste von Gadit (zusammen der &bdquo;Dienst&ldquo;), die von{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&bdquo;wir&ldquo;, &bdquo;uns&ldquo; oder
        &bdquo;unser&ldquo;) betrieben werden. Durch die Nutzung des Dienstes erklären Sie sich mit diesen Bedingungen
        einverstanden und an sie gebunden. Wenn Sie nicht einverstanden sind, nutzen Sie den Dienst nicht.
      </p>

      <h2>1. Wer Gadit nutzen darf</h2>
      <p>
        {"Sie müssen 18 Jahre oder älter sein, um ein Gadit-Konto zu eröffnen. Kinder und Jugendliche unter 18 Jahren nutzen Gadit nur über einen Erwachsenen: Ein Elternteil oder gesetzlicher Vormund kann sie als Profile im Family-Tarif hinzufügen, und eine Schule kann ihren Schülerinnen und Schülern einen Klassenlink geben. Der Elternteil, gesetzliche Vormund oder die Schule, die diesen Zugang gewährt, ist dafür verantwortlich. Mit der Eröffnung eines Kontos bestätigen Sie, dass Sie 18 Jahre oder älter sind."}
      </p>

      <h2>2. Ihr Konto</h2>
      <p>
        Sie sind für die Wahrung der Vertraulichkeit Ihrer Anmeldedaten sowie für alle Aktivitäten verantwortlich,
        die über Ihr Konto erfolgen. Benachrichtigen Sie uns umgehend unter{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>, wenn Sie glauben, dass
        Ihr Konto kompromittiert wurde.
      </p>

      <h2>3. Abonnements und Abrechnung</h2>
      <h3>Tarife und Gebühren</h3>
      <p>
        {"Gadit bietet einen kostenlosen Basic-Tarif und kostenpflichtige Tarife mit den auf der Preisseite aufgeführten Funktionen und Preisen an. Die Preise werden in der Währung angegeben, die auf der Preisseite und an der Kasse für den jeweiligen Standort angezeigt wird (in Israel in neuen israelischen Schekeln einschließlich MwSt.), und können für bestehende Abonnenten mit einer Ankündigungsfrist von mindestens 30 Tagen geändert werden."}
      </p>
      <h3>Automatische Verlängerung</h3>
      <p>
        Kostenpflichtige Abonnements verlängern sich am Ende jedes Abrechnungszeitraums (monatlich oder jährlich, je
        nach Auswahl) automatisch zum dann gültigen Preis, sofern sie nicht vor dem Verlängerungsdatum gekündigt werden.
      </p>
      <h3>Kündigung</h3>
      <p>
        {"Sie können jederzeit über Ihre Kontoseite kündigen. Die Kündigung beendet künftige Verlängerungen. Sie behalten den Zugang zu den kostenpflichtigen Funktionen bis zum Ende des laufenden Abrechnungszeitraums. Abgesehen von den nachstehend beschriebenen Rückerstattungen erstatten wir nicht genutzte Zeit nicht, es sei denn, das Gesetz schreibt etwas anderes vor."}
      </p>
      <h3>Rückerstattungen</h3>
      <p>
        {"Wenn Sie innerhalb von 14 Tagen nach der ersten Zahlung auf Ihrem Konto oder innerhalb von 14 Tagen nach einer jährlichen Verlängerung darum bitten, erstatten wir diese Zahlung in voller Höhe. Sie müssen dafür keinen Grund angeben. Schreiben Sie an "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" von der E-Mail-Adresse Ihres Kontos aus. Eine Rückerstattung beendet auch das Abonnement. Andere Zahlungen sind nicht erstattungsfähig, außer soweit das Gesetz eine Rückerstattung vorschreibt. Wenn Sie glauben, dass Ihnen ein Betrag irrtümlich belastet wurde, schreiben Sie uns innerhalb von 30 Tagen nach der Belastung. Käufe in der iOS-App werden von Apple abgerechnet, und nur Apple kann sie erstatten, unter reportaproblem.apple.com."}
      </p>

      <h2>4. Zulässige Nutzung</h2>
      <p>Sie verpflichten sich, Folgendes zu unterlassen:</p>
      <ul>
        <li>den Dienst für rechtswidrige Zwecke oder unter Verstoß gegen geltendes Recht zu nutzen;</li>
        <li>zu versuchen, den Dienst zurückzuentwickeln (Reverse Engineering), zu dekompilieren oder seinen Quellcode zu extrahieren;</li>
        <li>andere Nutzer zu missbrauchen, zu belästigen oder ihnen zu schaden oder Inhalte zu übermitteln, die hasserfüllt, bedrohlich oder obszön sind;</li>
        <li>den Zugriff auf den Dienst über eine angemessene persönliche Nutzung hinaus zu automatisieren (zum Beispiel durch massenhaftes Auslesen von Definitionen);</li>
        <li>Ratenbegrenzungen oder Tarifbeschränkungen zu umgehen oder mehrere Konten zu verwenden, um Kontingente zu umgehen;</li>
        <li>den Dienst zu nutzen, um ein konkurrierendes KI-Modell oder Wörterbuchprodukt zu trainieren oder feinabzustimmen;</li>
        <li>Inhalte hochzuladen oder zu übermitteln, zu deren Übermittlung Sie nicht berechtigt sind.</li>
      </ul>
      <p>
        Wir behalten uns das Recht vor, Konten, die gegen diese Bedingungen verstoßen, zu sperren oder zu kündigen.
      </p>

      <h2>5. KI-generierte Inhalte</h2>
      <p>
        {"Gadit verwendet Modelle künstlicher Intelligenz, einschließlich Modellen von OpenAI und Google, um Definitionen, Beispiele, Etymologien, Rückmeldungen, Quizfragen, Bilder, Sprachausgabe und Transkriptionen zu erstellen. Sie verstehen und erklären sich damit einverstanden, dass:"}
      </p>
      <ul>
        <li>
          KI-Ausgaben <strong>ungenau, unvollständig oder unangemessen</strong> sein können. Gadit ist als Lernhilfe
          gedacht, und Sie sollten sich bei rechtlichen, medizinischen, beruflichen oder akademischen Entscheidungen
          nicht darauf verlassen.
        </li>
        <li>
          KI-generierte Definitionen von offiziellen Wörterbüchern abweichen können. Wir garantieren nicht, dass jede
          Definition sprachwissenschaftlich maßgeblich ist.
        </li>
        <li>
          Bilder algorithmisch erzeugt werden und gelegentlich unerwartet oder ungenau sein können. Sie sind
          Illustrationen, keine wörtlichen Darstellungen.
        </li>
        <li>
          Sie allein dafür verantwortlich sind, wie Sie KI-generierte Inhalte auslegen und verwenden.
        </li>
      </ul>

      <h2>6. Ihre Inhalte</h2>
      <p>
        Wenn Sie Wörter, Sätze oder Audioaufnahmen an Gadit übermitteln (zum Beispiel bei Verwendung von &bdquo;Bilden
        Sie Ihren eigenen Satz&ldquo; oder der Spracheingabe), räumen Sie uns eine weltweite, nicht ausschließliche,
        unentgeltliche Lizenz (royalty-free) ein, diese Inhalte zum Zweck der Bereitstellung und Verbesserung des
        Dienstes zu verarbeiten. Wir beanspruchen kein Eigentum an Ihren Übermittlungen.
      </p>

      <h2>7. Geistiges Eigentum</h2>
      <p>
        Der Name Gadit, das Logo, die Website und die zugrunde liegende Software sind unser Eigentum oder Eigentum
        unserer Lizenzgeber. Ihnen wird eine persönliche, widerrufliche, nicht ausschließliche Lizenz zur Nutzung des
        Dienstes im Rahmen dieser Bedingungen gewährt.
      </p>
      <p>
        Inhalte, die Gadit als Antwort auf Ihre Eingaben erstellt (Definitionen, Bilder usw.), dürfen Sie für
        persönliche, schulische oder nicht kommerzielle Zwecke verwenden. Für eine kommerzielle Nutzung (zum Beispiel in
        einem kostenpflichtigen Produkt) wenden Sie sich bitte an uns.
      </p>

      <h2>8. Verfügbarkeit und Änderungen</h2>
      <p>
        Wir bemühen uns, den Dienst verfügbar zu halten, garantieren jedoch keinen unterbrechungsfreien oder
        fehlerfreien Betrieb. Wir können jeden Teil des Dienstes jederzeit ändern, aussetzen oder einstellen,
        einschließlich Funktionen, Preisen oder der Verfügbarkeit in bestimmten Regionen.
      </p>

      <h2>9. Dienste Dritter</h2>
      <p>
        Der Dienst stützt sich auf Drittanbieter (darunter OpenAI, Google Firebase, Stripe und Vercel). Deren
        Verfügbarkeit oder Verhalten kann Ihre Nutzung beeinträchtigen. Unsere Haftung ist unabhängig von durch diese
        Anbieter verursachten Problemen durch Abschnitt 11 beschränkt.
      </p>

      <h2>10. Haftungsausschluss</h2>
      <p>
        DER DIENST WIRD &bdquo;WIE BESEHEN&ldquo; UND &bdquo;WIE VERFÜGBAR&ldquo; BEREITGESTELLT, OHNE GEWÄHRLEISTUNGEN JEGLICHER ART, WEDER AUSDRÜCKLICH NOCH STILLSCHWEIGEND,
        EINSCHLIESSLICH, ABER NICHT BESCHRÄNKT AUF GEWÄHRLEISTUNGEN DER MARKTGÄNGIGKEIT (MERCHANTABILITY), DER EIGNUNG
        FÜR EINEN BESTIMMTEN ZWECK UND DER NICHTVERLETZUNG VON RECHTEN DRITTER (NON-INFRINGEMENT).
      </p>

      <h2>11. Haftungsbeschränkung</h2>
      <p>
        IM GESETZLICH HÖCHSTZULÄSSIGEN UMFANG HAFTEN LAVI LEARNING AND TRAINING TECHNOLOGIES LLC UND IHRE
        FÜHRUNGSKRÄFTE, MITARBEITER UND BEAUFTRAGTEN NICHT FÜR INDIREKTE SCHÄDEN, NEBEN- ODER BEGLEITSCHÄDEN,
        BESONDERE SCHÄDEN, FOLGESCHÄDEN ODER SCHADENSERSATZ MIT STRAFCHARAKTER (PUNITIVE DAMAGES) ODER FÜR ENTGANGENE
        GEWINNE ODER UMSÄTZE, DIE SICH AUS ODER IM ZUSAMMENHANG MIT IHRER NUTZUNG DES DIENSTES ERGEBEN.
      </p>
      <p>
        UNSERE GESAMTHAFTUNG FÜR ALLE ANSPRÜCHE, DIE SICH AUS DEM DIENST ERGEBEN ODER MIT IHM IN ZUSAMMENHANG STEHEN,
        IST AUF DEN HÖHEREN DER FOLGENDEN BETRÄGE BEGRENZT: (A) DEN BETRAG, DEN SIE UNS IN DEN ZWÖLF MONATEN VOR DEM
        ANSPRUCH GEZAHLT HABEN, ODER (B) USD $100.
      </p>

      <h2>12. Beendigung</h2>
      <p>
        Sie können die Nutzung des Dienstes jederzeit einstellen. Wir können Ihren Zugang sperren oder beenden, wenn Sie
        gegen diese Bedingungen verstoßen oder wenn dies gesetzlich vorgeschrieben ist. Nach der Beendigung bleiben die
        Bestimmungen, die ihrer Natur nach fortgelten sollen (einschließlich der Abschnitte 7, 10, 11 und 14), in Kraft.
      </p>

      <h2>13. Änderungen dieser Bedingungen</h2>
      <p>
        Wir können diese Bedingungen von Zeit zu Zeit überarbeiten. Wesentliche Änderungen werden auf dieser Seite mit
        einem überarbeiteten Datum unter &bdquo;Zuletzt aktualisiert&ldquo; veröffentlicht. Wenn Sie den Dienst nach
        Inkrafttreten der Änderungen weiterhin nutzen, gilt dies als Annahme der aktualisierten Bedingungen.
      </p>

      <h2>14. Anwendbares Recht und Streitigkeiten</h2>
      <p>
        Diese Bedingungen unterliegen dem Recht des Bundesstaates Delaware, Vereinigte Staaten, unter Ausschluss seiner
        Kollisionsnormen (conflict-of-law rules). Alle Streitigkeiten, die sich aus diesen Bedingungen oder dem Dienst
        ergeben oder damit in Zusammenhang stehen, werden ausschließlich vor den einzelstaatlichen Gerichten oder den
        Bundesgerichten mit Sitz in Delaware, Vereinigte Staaten, entschieden, und Sie unterwerfen sich der
        persönlichen Zuständigkeit (personal jurisdiction) dieser Gerichte.
      </p>

      <h2>15. Kontakt</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-Mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
