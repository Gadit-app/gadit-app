import type { ReactElement } from "react";

export const titlesPl = { privacy: "Polityka prywatności", terms: "Warunki korzystania" };

export function PrivacyBodyPl(): ReactElement {
  return (
    <>
      <p>
        Gadit („Gadit”, „my”, „nas” lub „nasz”) to usługa prowadzona przez{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, spółkę zarejestrowaną w Stanach Zjednoczonych.
        Niniejsza Polityka prywatności wyjaśnia, jakie informacje zbieramy, w jaki sposób je wykorzystujemy oraz jakie
        możliwości wyboru Państwu przysługują.
      </p>
      <p>
        W razie jakichkolwiek pytań prosimy o kontakt pod adresem{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informacje, które zbieramy</h2>
      <h3>Informacje o koncie</h3>
      <p>
        Gdy zakładają Państwo konto, zbieramy Państwa adres e-mail oraz, jeśli logują się Państwo za pomocą Google,
        podstawowe informacje profilowe udostępniane przez Google (wyświetlana nazwa, zdjęcie profilowe). Nie otrzymujemy
        Państwa hasła do konta Google.
      </p>
      <p>
        {"W aplikacji iOS mogą Państwo również zalogować się za pomocą Apple. W takim przypadku Apple przekazuje nam imię i nazwisko oraz adres e-mail, które zdecydują się Państwo udostępnić; może to być prywatny adres przekaźnikowy, który przekazuje Państwu nasze wiadomości e-mail. Nie otrzymujemy Państwa hasła do Apple."}
      </p>
      <h3>Informacje o korzystaniu</h3>
      <p>Gdy korzystają Państwo z Gadit, przetwarzamy:</p>
      <ul>
        <li>wyszukiwane przez Państwa słowa i opcjonalne zdania;</li>
        <li>obrazy wygenerowane na Państwa żądanie;</li>
        <li>Państwa plan subskrypcji i status rozliczeń;</li>
        <li>niedawną historię wyszukiwania (w przypadku płatnych użytkowników do 10 ostatnich słów), przechowywaną, aby mogli Państwo później do niej wrócić;</li>
        <li>
          {"jeśli korzystają Państwo z asystenta Gadit w centrum pomocy: zadawane przez Państwa pytania, jego odpowiedzi oraz informacja o tym, czy oznaczyli Państwo odpowiedź jako pomocną, wraz z identyfikatorem konta (oraz identyfikatorem rodziny, jeśli go Państwo mają), adresem e-mail, planem, językiem interfejsu oraz informacją o tym, czy korzystali Państwo ze strony internetowej czy z aplikacji;"}
        </li>
        <li>miesięczne limity (na przykład liczbę obrazów wygenerowanych przez Państwa w bieżącym okresie rozliczeniowym).</li>
      </ul>
      <p>
        {"Asystent Gadit nie jest oferowany na profilach dziecięcych, w Trybie dziecięcym ani osobom, które nie są zalogowane. Prosimy nie wpisywać do niego haseł ani numerów kart płatniczych."}
      </p>
      <h3>Dane techniczne i analityczne</h3>
      <p>
        Automatycznie zbieramy podstawowe informacje techniczne, takie jak adres IP, typ przeglądarki, typ urządzenia,
        adres URL strony odsyłającej i wyświetlone strony. Wykorzystujemy je do celów bezpieczeństwa, monitorowania
        wydajności i zbiorczych analiz. Analitykę zapewnia Vercel, a dane są anonimizowane w miejscu ich zbierania (nie
        są przechowywane żadne identyfikatory osobowe). Na naszych stronach marketingowych, rejestracji i płatności
        korzystamy również z narzędzi reklamowych i analitycznych, opisanych w sekcji 3.
      </p>
      <h3>Informacje o płatnościach</h3>
      <p>
        W przypadku wykupienia subskrypcji płatność jest przetwarzana przez <strong>Stripe, Inc.</strong> Nie widzimy
        ani nie przechowujemy pełnego numeru Państwa karty; otrzymujemy jedynie token klienta oraz metadane niezbędne do
        identyfikacji subskrypcji.
      </p>

      <h2>2. Jak wykorzystujemy Państwa informacje</h2>
      <ul>
        <li>w celu świadczenia i ulepszania usługi Gadit (generowanie definicji, obrazów, informacji zwrotnych dotyczących zdań, quizów);</li>
        <li>w celu prowadzenia Państwa konta i personalizacji korzystania z usługi (historia wyszukiwania, preferowany język, przełącznik „Tryb dziecięcy”);</li>
        <li>w celu obsługi subskrypcji i wysyłania wiadomości e-mail dotyczących transakcji (potwierdzenia płatności, zmiany subskrypcji);</li>
        <li>
          {"w celu odpowiadania na Państwa pytania w asystencie Gadit i ulepszania naszych odpowiedzi pomocy, a także, gdy asystent przekazuje pytanie do naszego zespołu, w celu przesłania zespołowi pocztą e-mail ostatniej rozmowy wraz z Państwa imieniem, adresem e-mail, planem, językiem interfejsu oraz informacją o tym, czy korzystali Państwo ze strony internetowej czy z aplikacji, aby zespół mógł odpowiedzieć Państwu e-mailem;"}
        </li>
        <li>w celu pomiaru i poprawy wydajności produktu oraz zapobiegania nadużyciom;</li>
        <li>w celu wypełniania obowiązków prawnych.</li>
      </ul>
      <p>
        <strong>Nie sprzedajemy</strong> Państwa danych osobowych i nie wykorzystujemy Państwa treści do kierowania do
        Państwa reklam.
      </p>

      <h2>3. Usługi zewnętrzne, z których korzystamy</h2>
      <p>
        Gadit korzysta z usług następujących podmiotów przetwarzających. Każdy z nich otrzymuje wyłącznie minimum
        informacji niezbędnych do świadczenia danej usługi:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": przetwarza słowa i zdania przesyłane przez Państwa w celu generowania definicji, informacji zwrotnych dotyczących zdań i quizów, zamienia tekst na mowę, transkrybuje dane głosowe, odczytuje tekst na zdjęciach i w przesyłanych przez Państwa plikach PDF, na przykład na stronach pracy domowej, oraz generuje obrazy. Pisze również odpowiedzi asystenta Gadit: wysyłamy do niego Państwa pytanie, wcześniejsze wiadomości z tej samej rozmowy, język interfejsu, plan oraz informację o tym, czy korzystają Państwo ze strony internetowej czy z aplikacji, i nie dołączamy Państwa imienia ani adresu e-mail. Dane przesyłane do OpenAI podlegają zasadom OpenAI dotyczącym wykorzystywania danych w API."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): przechowuje Państwa konto,
          profil, status subskrypcji, historię wyszukiwania i wygenerowane obrazy.
        </li>
        <li>
          <strong>Google</strong>{"(Gemini, przez Google Cloud): zamienia tekst na mowę. Wysyłamy do niego wyłącznie tekst przeznaczony do odczytania na głos, taki jak słowa, zdania i opowiadania, a dźwięk jest przechowywany w naszym magazynie Firebase, aby można go było odtworzyć ponownie. W jednej grze czytelniczej słyszy on również dźwięk wypowiadany na głos przez dziecko, aby go sprawdzić, a to nagranie nie jest przechowywane. Google Fonts udostępnia czcionki interfejsu w językach chińskim, japońskim i koreańskim oraz widzi Państwa adres IP."}
        </li>
        <li>
          <strong>Dicta</strong>{": izraelska organizacja non-profit, dodaje znaki samogłoskowe (niqqud) do tekstu hebrajskiego dla młodych czytelników. Wysyłamy do niej wyłącznie tekst w języku hebrajskim."}
        </li>
        <li>
          <strong>Stripe</strong>: obsługuje płatności, subskrypcje i portal rozliczeniowy.
        </li>
        <li>
          <strong>Apple</strong>{": udostępnia funkcję Sign in with Apple w aplikacji na iOS, zob. sekcja 1, oraz sprzedaje subskrypcje kupowane w aplikacji na iOS i pobiera za nie opłaty. W przypadku tych zakupów Apple obsługuje płatność, a my otrzymujemy wyłącznie potwierdzenie zakupu i jego statusu, na przykład odnowienia lub zwrotu."}
        </li>
        <li>
          <strong>PayPal</strong>{": wypłaca środki naszym partnerom. Przekazujemy mu adres e-mail PayPal partnera oraz kwotę."}
        </li>
        <li>
          <strong>Resend</strong>{": wysyła nasze wiadomości e-mail (takie jak linki do logowania i powiadomienia) oraz dostarcza naszemu zespołowi pytania przekazane przez asystenta Gadit, z Państwa adresem e-mail jako adresem do odpowiedzi."}
        </li>
        <li>
          <strong>Expo</strong>{": dostarcza powiadomienia aplikacji na iOS, takie jak alerty, które rodzic może włączyć, obejmujące imię dziecka i słowo wyszukane przez dziecko."}
        </li>
        <li>
          <strong>Vercel</strong>: hostuje i udostępnia stronę internetową oraz zapewnia zanonimizowaną analitykę i
          pomiar wydajności.
        </li>
        <li>
          <strong>Yooniz</strong>{": odrębna rodzinna usługa edukacyjna tego samego założyciela. Yooniz może zapytać nas, czy adres e-mail rodzica ma aktywny plan Gadit Family, a my odpowiadamy wyłącznie tak albo nie. Jeśli tak, rodzina może otworzyć Gadit z Yooniz bez hasła: Yooniz wysyła nam adres e-mail rodzica, wyświetlane nazwy członków rodziny oraz informację, czy każda z tych osób jest rodzicem, chłopcem czy dziewczynką. Gdy dziecko, które otworzyło Gadit z Yooniz, zrozumie słowo, wysyłamy do Yooniz adres e-mail rodzica, identyfikator dziecka w Yooniz oraz liczbę zdobytych punktów nauki, nigdy samo słowo."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": udostępnia małe obrazy flag wyświetlane na naszych stronach, a zatem widzi Państwa adres IP i informacje o przeglądarce."}
        </li>
        <li>
          <strong>Reklama i analityka</strong>{": Meta (Meta Pixel), Google Analytics i TikTok (TikTok Pixel i Events API) mierzą odwiedziny oraz wyniki naszych reklam. Korzystają z plików cookie i podobnych technologii na naszych stronach marketingowych, rejestracji i płatności. Podczas rejestracji lub płatności możemy przekazać tym usługom zahaszowany, czyli jednokierunkowo zaszyfrowany, adres e-mail i identyfikator konta wraz z Państwa adresem IP i informacjami o przeglądarce, wyłącznie w celu pomiaru skuteczności naszych reklam. Affonso, usługa do linków partnerskich, ładuje się na tych samych stronach oraz na każdej stronie, na którą odwiedzający trafia przez link partnera, i przechowuje plik cookie przez maksymalnie 60 dni. Jeśli zarejestrują się Państwo po wejściu przez link partnerski Affonso, przekazujemy Affonso Państwa adres e-mail, imię i nazwisko oraz identyfikator konta, aby partner, który Państwa polecił, otrzymał odpowiednie uznanie. Nigdy nie przekazujemy żadnej z tych usług informacji o dzieciach, a narzędzia te nie działają na profilu dziecka, w Trybie dzieci ani na stronach linków klasowych."}
        </li>
      </ul>

      <h2>4. Jak długo przechowujemy Państwa informacje</h2>
      <ul>
        <li>Informacje o koncie: przez cały okres istnienia Państwa konta.</li>
        <li>Historia wyszukiwania: 10 ostatnich wyszukiwań na użytkownika, aktualizowana przy każdym nowym wyszukiwaniu.</li>
        <li>
          {"Rozmowy z asystentem Gadit: 180 dni, a następnie usuwane automatycznie, lub wcześniej, jeśli usuną Państwo konto. Dzienna liczba Państwa pytań, wykorzystywana do dziennego limitu, jest usuwana po 3 dniach."}
        </li>
        <li>
          {"Pytania przekazane przez asystenta Gadit do naszego zespołu: przechowywane w skrzynce pocztowej naszego zespołu, jak każda wiadomość e-mail wysłana do nas przez Państwa."}
        </li>
        <li>Wygenerowane obrazy: przechowywane, aby ta sama kombinacja słowo+znaczenie mogła ponownie wykorzystać obraz zapisany w pamięci podręcznej. Mogą być przechowywane bezterminowo, dopóki Państwa konto jest aktywne.</li>
        <li>Dokumentacja rozliczeniowa i podatkowa: zgodnie z wymogami obowiązującego prawa (zazwyczaj 7 lat).</li>
        <li>
          {"Usunięte konta: krótki zapis usunięcia konta (jego adres e-mail, plan oraz podany przez Państwa powód i uwaga, jeśli zostały podane), przechowywany, abyśmy mogli odpowiadać na pytania dotyczące usunięcia."}
        </li>
        <li>Dane analityczne: w formie zbiorczej, zazwyczaj przechowywane przez dostawcę analityki przez 13 miesięcy.</li>
      </ul>

      <h2>5. Państwa prawa</h2>
      <p>W zależności od miejsca zamieszkania mogą Państwo mieć prawo do:</p>
      <ul>
        <li>żądania dostępu do danych osobowych, które przechowujemy na Państwa temat;</li>
        <li>żądania sprostowania nieprawidłowych informacji;</li>
        <li>żądania usunięcia Państwa konta i powiązanych danych;</li>
        <li>eksportu Państwa danych w przenośnym formacie;</li>
        <li>wniesienia sprzeciwu wobec określonych sposobów wykorzystania Państwa informacji lub ich ograniczenia;</li>
        <li>rezygnacji z określonego udostępniania danych (tam, gdzie ma to zastosowanie na mocy CCPA lub podobnych przepisów).</li>
      </ul>
      <p>
        Aby skorzystać z któregokolwiek z tych praw, prosimy o wiadomość e-mail na adres{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Odpowiemy w ciągu
        30 dni.
      </p>

      <h2>6. Bezpieczeństwo</h2>
      <p>
        Do ochrony Państwa informacji stosujemy standardowe w branży zabezpieczenia: szyfrowane połączenia (HTTPS),
        uwierzytelniane API i kontrolę dostępu. Żadna metoda przesyłania ani przechowywania danych w internecie nie jest w
        100% bezpieczna, dlatego nie możemy zagwarantować absolutnego bezpieczeństwa, ale stale pracujemy nad
        ograniczaniem ryzyka.
      </p>

      <h2>7. Dzieci</h2>
      <p>
        {"Konto Gadit jest przeznaczone dla osób dorosłych, które mają ukończone 18 lat. Dzieci i nastolatki mogą korzystać z Gadit wyłącznie za pośrednictwem osoby dorosłej, na jeden z dwóch sposobów."}
      </p>
      <p>
        {"Profile Family: rodzic dodaje każde dziecko jako profil w ramach swojego konta Family, podając imię oraz informację, czy dziecko jest chłopcem czy dziewczynką, a także, jeśli rodzic zdecyduje się je dodać, wiek, klasę szkolną i zdjęcie. Dzieci nie mają u nas adresu e-mail ani hasła. Słowa wyszukiwane przez dziecko oraz jego notatnik, gry i postępy są zapisywane na koncie rodziny. Rodzice w rodzinie oraz każda osoba, której udzielą dostępu, na przykład korepetytor, mogą je zobaczyć, a rodzic może wybrać otrzymywanie powiadomień, w aplikacji lub e-mailem, zawierających słowa wyszukiwane przez dziecko. Rodzic może w każdej chwili usunąć profil dziecka w aplikacji."}
      </p>
      <p>
        {"Linki do klasy: uczeń otwiera link lub kod przekazany przez nauczyciela, bez konta i bez adresu e-mail. Jeżeli nauczyciel wprowadził listę imion, uczeń wybiera z niej swoje imię, a słowa wyszukiwane przez ucznia są zapisywane dla klasy pod tym imieniem, aby nauczyciel mógł je zobaczyć. To szkoła podejmuje decyzję o korzystaniu z Gadit i odpowiada za poinformowanie rodziców, jeżeli wymagają tego przepisy prawa."}
      </p>
      <p>
        {"Nigdy nie wykorzystujemy informacji o dzieciach do celów reklamowych, a narzędzia wymienione w punkcie Reklama i analityka w sekcji 3 nigdy nie są uruchamiane w profilu dziecka, w trybie dziecięcym ani na stronach linków do klasy. Aby usunąć profil dziecka i jego dane, rodzic może napisać na adres "}<a href="mailto:support@gadit.app">support@gadit.app</a>{", a my je usuniemy. Jeżeli uważają Państwo, że dziecko samodzielnie otworzyło konto, prosimy do nas napisać, a usuniemy konto i jego dane."}
      </p>

      <h2>8. Użytkownicy międzynarodowi</h2>
      <p>
        Gadit jest prowadzony ze Stanów Zjednoczonych. Jeśli korzystają Państwo z usługi spoza Stanów Zjednoczonych,
        Państwa informacje będą przekazywane, przechowywane i przetwarzane w Stanach Zjednoczonych oraz w regionach
        centrów danych wykorzystywanych przez naszych usługodawców.
      </p>

      <h2>9. Zmiany niniejszej polityki</h2>
      <p>
        Możemy od czasu do czasu aktualizować niniejszą Politykę prywatności. Istotne zmiany zostaną opublikowane na tej
        stronie wraz ze zmienioną datą „Ostatnia aktualizacja”. Dalsze korzystanie z Gadit po wejściu zmian w życie
        oznacza akceptację zaktualizowanej polityki.
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

export function TermsBodyPl(): ReactElement {
  return (
    <>
      <p>
        Witamy w Gadit. Niniejsze Warunki korzystania („Warunki”) regulują Państwa dostęp do strony internetowej,
        aplikacji i usług Gadit (łącznie „Usługa”) oraz korzystanie z nich. Usługa jest prowadzona przez{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> („my”, „nas” lub „nasz”). Korzystając z Usługi,
        zgadzają się Państwo na związanie niniejszymi Warunkami. Jeśli nie wyrażają Państwo zgody, nie należy korzystać z
        Usługi.
      </p>

      <h2>1. Kto może korzystać z Gadit</h2>
      <p>
        {"Aby otworzyć konto Gadit, muszą Państwo mieć ukończone 18 lat. Dzieci i nastolatki poniżej 18 roku życia mogą korzystać z Gadit wyłącznie za pośrednictwem osoby dorosłej: rodzic lub opiekun może dodać je jako profile w planie Family, a szkoła może udostępnić swoim uczniom link do klasy. Rodzic, opiekun lub szkoła, którzy udzielają takiego dostępu, ponoszą za niego odpowiedzialność. Otwierając konto, potwierdzają Państwo, że mają ukończone 18 lat."}
      </p>

      <h2>2. Państwa konto</h2>
      <p>
        Ponoszą Państwo odpowiedzialność za zachowanie poufności swoich danych logowania oraz za wszelkie działania
        podejmowane w ramach Państwa konta. Jeśli uważają Państwo, że bezpieczeństwo konta zostało naruszone, prosimy
        niezwłocznie powiadomić nas pod adresem{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>3. Subskrypcje i rozliczenia</h2>
      <h3>Plany i opłaty</h3>
      <p>
        {"Gadit oferuje bezpłatny plan Basic oraz płatne plany z funkcjami i cenami podanymi na stronie z cennikiem. Ceny są podawane w walucie wyświetlanej na stronie z cennikiem i przy finalizacji zakupu dla Twojej lokalizacji (w Izraelu: nowe szekle izraelskie z VAT) i mogą zostać zmienione z co najmniej 30-dniowym wyprzedzeniem w przypadku obecnych subskrybentów."}
      </p>
      <h3>Automatyczne odnawianie</h3>
      <p>
        Płatne subskrypcje odnawiają się automatycznie na koniec każdego okresu rozliczeniowego (miesięcznego lub
        rocznego, zgodnie z dokonanym wyborem) po cenie obowiązującej w danym momencie, chyba że zostaną anulowane przed
        datą odnowienia.
      </p>
      <h3>Anulowanie</h3>
      <p>
        {"Mogą Państwo anulować subskrypcję w dowolnym momencie na stronie swojego konta. Anulowanie wstrzymuje przyszłe odnowienia. Zachowują Państwo dostęp do płatnych funkcji do końca bieżącego okresu rozliczeniowego. Poza zwrotami opisanymi poniżej nie zwracamy opłat za niewykorzystany czas, chyba że obowiązujące prawo stanowi inaczej."}
      </p>
      <h3>Zwroty</h3>
      <p>
        {"Jeżeli zgłoszą się Państwo w ciągu 14 dni od pierwszej płatności na koncie albo w ciągu 14 dni od rocznego odnowienia, zwrócimy tę płatność w całości. Nie muszą Państwo podawać przyczyny. Prosimy napisać na adres "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" z adresu e-mail przypisanego do konta. Zwrot powoduje również zakończenie subskrypcji. Pozostałe płatności nie podlegają zwrotowi, chyba że prawo wymaga dokonania zwrotu. Jeśli uważają Państwo, że opłata została pobrana omyłkowo, prosimy o kontakt w ciągu 30 dni od jej pobrania. Zakupy dokonane w aplikacji iOS są rozliczane przez Apple i tylko Apple może dokonać ich zwrotu na stronie reportaproblem.apple.com."}
      </p>

      <h2>4. Dopuszczalne korzystanie</h2>
      <p>Zobowiązują się Państwo nie:</p>
      <ul>
        <li>korzystać z Usługi w jakimkolwiek celu niezgodnym z prawem ani z naruszeniem jakiegokolwiek prawa;</li>
        <li>podejmować prób inżynierii wstecznej, dekompilacji ani wyodrębnienia kodu źródłowego Usługi;</li>
        <li>nadużywać, nękać ani krzywdzić innych użytkowników ani przesyłać treści nienawistnych, zawierających groźby lub obscenicznych;</li>
        <li>automatyzować dostępu do Usługi w zakresie wykraczającym poza rozsądny użytek osobisty (na przykład poprzez masowe pobieranie definicji);</li>
        <li>obchodzić limitów częstotliwości zapytań ani ograniczeń planu, ani używać wielu kont w celu uniknięcia limitów;</li>
        <li>wykorzystywać Usługi do trenowania lub dostrajania jakiegokolwiek konkurencyjnego modelu sztucznej inteligencji lub produktu słownikowego;</li>
        <li>przesyłać ani udostępniać treści, do których przesyłania nie mają Państwo prawa.</li>
      </ul>
      <p>
        Zastrzegamy sobie prawo do zawieszenia lub usunięcia kont naruszających niniejsze Warunki.
      </p>

      <h2>5. Treści generowane przez sztuczną inteligencję</h2>
      <p>
        {"Gadit wykorzystuje modele sztucznej inteligencji, w tym modele OpenAI i Google, do generowania definicji, przykładów, etymologii, informacji zwrotnych, quizów, obrazów, mowy i transkrypcji. Przyjmują Państwo do wiadomości i zgadzają się, że:"}
      </p>
      <ul>
        <li>
          Wyniki generowane przez sztuczną inteligencję mogą być <strong>niedokładne, niekompletne lub
          nieodpowiednie</strong>. Gadit jest pomocą w nauce i nie należy na nim polegać przy podejmowaniu decyzji
          prawnych, medycznych, zawodowych lub akademickich.
        </li>
        <li>
          Definicje generowane przez sztuczną inteligencję mogą różnić się od definicji w oficjalnych słownikach. Nie
          gwarantujemy, że każda definicja jest autorytatywna pod względem językowym.
        </li>
        <li>
          Obrazy są generowane algorytmicznie i mogą czasami być nieoczekiwane lub nieprecyzyjne. Są to ilustracje, a
          nie dosłowne przedstawienia.
        </li>
        <li>
          Ponoszą Państwo wyłączną odpowiedzialność za sposób interpretowania i wykorzystywania treści generowanych przez
          sztuczną inteligencję.
        </li>
      </ul>

      <h2>6. Państwa treści</h2>
      <p>
        Przesyłając do Gadit słowa, zdania lub nagrania audio (na przykład podczas korzystania z funkcji „Ułóż własne
        zdanie” lub wprowadzania głosowego), udzielają nam Państwo ogólnoświatowej, niewyłącznej i nieodpłatnej licencji
        na przetwarzanie tych treści w celu świadczenia i ulepszania Usługi. Nie rościmy sobie praw własności do
        przesłanych przez Państwa treści.
      </p>

      <h2>7. Własność intelektualna</h2>
      <p>
        Nazwa Gadit, logo, strona internetowa i oprogramowanie, na którym się opierają, stanowią naszą własność lub
        własność naszych licencjodawców. Udziela się Państwu osobistej, odwołalnej, niewyłącznej licencji na korzystanie z
        Usługi w zakresie dozwolonym przez niniejsze Warunki.
      </p>
      <p>
        Treści generowane przez Gadit w odpowiedzi na Państwa dane wejściowe (definicje, obrazy itp.) mogą być przez
        Państwa wykorzystywane do celów osobistych, edukacyjnych lub niekomercyjnych. W przypadku wykorzystania
        komercyjnego (na przykład w płatnym produkcie) prosimy o kontakt.
      </p>

      <h2>8. Dostępność i zmiany</h2>
      <p>
        Dokładamy starań, aby Usługa była dostępna, ale nie gwarantujemy jej nieprzerwanego ani bezbłędnego działania.
        Możemy w dowolnym momencie zmodyfikować, zawiesić lub zakończyć działanie dowolnej części Usługi, w tym funkcji,
        cen lub dostępności w określonych regionach.
      </p>

      <h2>9. Usługi zewnętrzne</h2>
      <p>
        Usługa korzysta z usług zewnętrznych dostawców (w tym OpenAI, Google Firebase, Stripe i Vercel). Ich dostępność
        lub działanie mogą wpływać na Państwa doświadczenia. Nasza odpowiedzialność jest ograniczona zgodnie z sekcją 11,
        niezależnie od problemów spowodowanych przez tych dostawców.
      </p>

      <h2>10. Wyłączenie gwarancji</h2>
      <p>
        USŁUGA JEST UDOSTĘPNIANA „W TAKIM STANIE, W JAKIM JEST” ORAZ „W MIARĘ DOSTĘPNOŚCI”, BEZ JAKICHKOLWIEK GWARANCJI,
        WYRAŹNYCH LUB DOROZUMIANYCH, W TYM MIĘDZY INNYMI GWARANCJI PRZYDATNOŚCI HANDLOWEJ (MERCHANTABILITY), PRZYDATNOŚCI
        DO OKREŚLONEGO CELU ORAZ NIENARUSZANIA PRAW OSÓB TRZECICH (NON-INFRINGEMENT).
      </p>

      <h2>11. Ograniczenie odpowiedzialności</h2>
      <p>
        W MAKSYMALNYM ZAKRESIE DOZWOLONYM PRZEZ PRAWO LAVI LEARNING AND TRAINING TECHNOLOGIES LLC ORAZ JEJ KADRA
        KIEROWNICZA, PRACOWNICY I PRZEDSTAWICIELE NIE PONOSZĄ ODPOWIEDZIALNOŚCI ZA JAKIEKOLWIEK SZKODY POŚREDNIE,
        UBOCZNE, SZCZEGÓLNE, WYNIKOWE LUB O CHARAKTERZE KARNYM (PUNITIVE DAMAGES) ANI ZA JAKĄKOLWIEK UTRATĘ ZYSKÓW LUB
        PRZYCHODÓW, WYNIKAJĄCE Z KORZYSTANIA PRZEZ PAŃSTWA Z USŁUGI LUB POWSTAŁE W ZWIĄZKU Z TYM KORZYSTANIEM.
      </p>
      <p>
        NASZA CAŁKOWITA ODPOWIEDZIALNOŚĆ Z TYTUŁU JAKIEGOKOLWIEK ROSZCZENIA WYNIKAJĄCEGO Z USŁUGI LUB Z NIĄ ZWIĄZANEGO NIE
        PRZEKROCZY WYŻSZEJ Z NASTĘPUJĄCYCH KWOT: (A) KWOTY ZAPŁACONEJ NAM PRZEZ PAŃSTWA W CIĄGU DWUNASTU MIESIĘCY
        POPRZEDZAJĄCYCH ROSZCZENIE LUB (B) USD $100.
      </p>

      <h2>12. Rozwiązanie</h2>
      <p>
        Mogą Państwo w dowolnym momencie zaprzestać korzystania z Usługi. Możemy zawiesić lub zakończyć Państwa dostęp,
        jeśli naruszą Państwo niniejsze Warunki lub jeśli wymaga tego prawo. Po rozwiązaniu postanowienia, które ze
        względu na swój charakter powinny obowiązywać nadal (w tym sekcje 7, 10, 11 i 14), pozostają w mocy.
      </p>

      <h2>13. Zmiany niniejszych Warunków</h2>
      <p>
        Możemy od czasu do czasu zmieniać niniejsze Warunki. Istotne zmiany zostaną opublikowane na tej stronie wraz ze
        zmienioną datą „Ostatnia aktualizacja”. Dalsze korzystanie z Usługi po wejściu zmian w życie oznacza akceptację
        zaktualizowanych Warunków.
      </p>

      <h2>14. Prawo właściwe i spory</h2>
      <p>
        Niniejsze Warunki podlegają prawu stanu Delaware, Stany Zjednoczone, z wyłączeniem jego norm kolizyjnych.
        Wszelkie spory wynikające z niniejszych Warunków lub Usługi albo z nimi związane będą rozstrzygane wyłącznie przez
        sądy stanowe lub federalne mające siedzibę w Delaware, Stany Zjednoczone, a Państwo wyrażają zgodę na jurysdykcję
        osobową (personal jurisdiction) tych sądów.
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
