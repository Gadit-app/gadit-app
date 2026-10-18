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
      <h3>Informacje o korzystaniu</h3>
      <p>Gdy korzystają Państwo z Gadit, przetwarzamy:</p>
      <ul>
        <li>wyszukiwane przez Państwa słowa i opcjonalne zdania;</li>
        <li>obrazy wygenerowane na Państwa żądanie;</li>
        <li>Państwa plan subskrypcji i status rozliczeń;</li>
        <li>niedawną historię wyszukiwania (w przypadku płatnych użytkowników do 10 ostatnich słów), przechowywaną, aby mogli Państwo później do niej wrócić;</li>
        <li>miesięczne limity (na przykład liczbę obrazów wygenerowanych przez Państwa w bieżącym okresie rozliczeniowym).</li>
      </ul>
      <h3>Dane techniczne i analityczne</h3>
      <p>
        Automatycznie zbieramy podstawowe informacje techniczne, takie jak adres IP, typ przeglądarki, typ urządzenia,
        adres URL strony odsyłającej i wyświetlone strony. Wykorzystujemy je do celów bezpieczeństwa, monitorowania
        wydajności i zbiorczych analiz. Analitykę zapewnia Vercel, a dane są anonimizowane w miejscu ich zbierania (nie
        są przechowywane żadne identyfikatory osobowe).
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
          <strong>OpenAI</strong>: przetwarza przesyłane przez Państwa słowa i zdania w celu generowania definicji,
          informacji zwrotnych dotyczących zdań, quizów i transkrypcji mowy (Whisper) oraz generuje obrazy (DALL·E 3).
          Dane przesyłane do OpenAI podlegają zasadom OpenAI dotyczącym wykorzystywania danych w API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): przechowuje Państwa konto,
          profil, status subskrypcji, historię wyszukiwania i wygenerowane obrazy.
        </li>
        <li>
          <strong>Stripe</strong>: obsługuje płatności, subskrypcje i portal rozliczeniowy.
        </li>
        <li>
          <strong>Vercel</strong>: hostuje i udostępnia stronę internetową oraz zapewnia zanonimizowaną analitykę i
          pomiar wydajności.
        </li>
      </ul>

      <h2>4. Jak długo przechowujemy Państwa informacje</h2>
      <ul>
        <li>Informacje o koncie: przez cały okres istnienia Państwa konta.</li>
        <li>Historia wyszukiwania: 10 ostatnich wyszukiwań na użytkownika, aktualizowana przy każdym nowym wyszukiwaniu.</li>
        <li>Wygenerowane obrazy: przechowywane, aby ta sama kombinacja słowo+znaczenie mogła ponownie wykorzystać obraz zapisany w pamięci podręcznej. Mogą być przechowywane bezterminowo, dopóki Państwa konto jest aktywne.</li>
        <li>Dokumentacja rozliczeniowa i podatkowa: zgodnie z wymogami obowiązującego prawa (zazwyczaj 7 lat).</li>
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
        Gadit nie jest przeznaczony dla dzieci w wieku poniżej 13 lat. Jeśli uważają Państwo, że konto założyło dziecko w
        wieku poniżej 13 lat, prosimy o wiadomość e-mail, a usuniemy konto i powiązane dane.
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
        Aby założyć konto, muszą Państwo mieć ukończone co najmniej 13 lat. Jeśli mają Państwo od 13 do 18 lat, muszą
        Państwo posiadać zgodę rodzica lub opiekuna prawnego. Korzystając z Gadit, oświadczają Państwo, że spełniają te
        wymagania.
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
        Gadit oferuje bezpłatny plan Basic oraz płatne plany (Clear i Deep) z funkcjami i cenami podanymi na stronie z
        cennikiem. Ceny są podawane w USD i mogą zostać zmienione z co najmniej 30-dniowym wyprzedzeniem w przypadku
        obecnych subskrybentów.
      </p>
      <h3>Automatyczne odnawianie</h3>
      <p>
        Płatne subskrypcje odnawiają się automatycznie na koniec każdego okresu rozliczeniowego (miesięcznego lub
        rocznego, zgodnie z dokonanym wyborem) po cenie obowiązującej w danym momencie, chyba że zostaną anulowane przed
        datą odnowienia.
      </p>
      <h3>Anulowanie</h3>
      <p>
        Subskrypcję mogą Państwo anulować w dowolnym momencie na stronie swojego konta. Anulowanie wstrzymuje przyszłe
        odnowienia. Zachowują Państwo dostęp do płatnych funkcji do końca bieżącego okresu rozliczeniowego. Nie
        zapewniamy częściowych zwrotów za niewykorzystany czas.
      </p>
      <h3>Zwroty</h3>
      <p>
        Z wyjątkiem przypadków, w których wymaga tego prawo, płatności nie podlegają zwrotowi. Jeśli uważają Państwo, że
        opłata została pobrana omyłkowo, prosimy o kontakt pod adresem{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> w ciągu 30 dni od jej
        pobrania.
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
        Gadit wykorzystuje modele sztucznej inteligencji (w tym GPT, Whisper i DALL·E firmy OpenAI) do generowania
        definicji, przykładów, etymologii, informacji zwrotnych, quizów, obrazów i transkrypcji. Przyjmują Państwo do
        wiadomości i zgadzają się, że:
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
