import type { ReactElement } from "react";

export const titlesSk = { privacy: "Zásady ochrany osobných údajov", terms: "Podmienky používania" };

export function PrivacyBodySk(): ReactElement {
  return (
    <>
      <p>
        Gadit („Gadit“, „my“, „nás“ alebo „náš“) je služba prevádzkovaná spoločnosťou{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, registrovanou v Spojených štátoch amerických.
        Tieto Zásady ochrany osobných údajov vysvetľujú, aké informácie zhromažďujeme, ako ich používame a aké máte
        možnosti voľby.
      </p>
      <p>
        Ak máte akúkoľvek otázku, kontaktujte nás na adrese{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informácie, ktoré zhromažďujeme</h2>
      <h3>Informácie o účte</h3>
      <p>
        Keď si vytvoríte účet, zhromažďujeme vašu e-mailovú adresu a, ak sa prihlásite prostredníctvom Google, základné
        profilové informácie, ktoré Google poskytuje (zobrazované meno, profilový obrázok). Vaše heslo k účtu Google
        nedostávame.
      </p>
      <p>
        {"V aplikácii pre iOS sa môžete prihlásiť aj cez Apple. Apple nám potom poskytne meno a e-mailovú adresu, ktoré sa rozhodnete zdieľať; môže ísť aj o súkromnú relay adresu, ktorá vám preposiela naše e-maily. Vaše heslo k Apple od nás nedostávame."}
      </p>
      <h3>Informácie o používaní</h3>
      <p>Keď používate Gadit, spracúvame:</p>
      <ul>
        <li>slová a voliteľné vety, ktoré vyhľadávate;</li>
        <li>obrázky vygenerované na vašu žiadosť;</li>
        <li>váš plán predplatného a stav fakturácie;</li>
        <li>nedávnu históriu vyhľadávania (pri platiacich používateľoch až posledných 10 slov), uloženú, aby ste sa k nej mohli neskôr vrátiť;</li>
        <li>
          {"ak používate asistenta Gadit v centre pomoci: otázky, ktoré kladiete, jeho odpovede a to, či ste označili odpoveď ako užitočnú, spolu s identifikátorom vášho účtu (a identifikátorom rodiny, ak ho máte), e-mailovou adresou, plánom, jazykom rozhrania a tým, či ste použili web alebo aplikáciu;"}
        </li>
        <li>mesačné kvóty (napríklad počet obrázkov, ktoré ste vygenerovali v aktuálnom fakturačnom období).</li>
      </ul>
      <p>
        {"Asistent Gadit sa neponúka na detských profiloch, v Detskom režime ani návštevníkom, ktorí nie sú prihlásení. Nezadávajte doň heslá ani čísla platobných kariet."}
      </p>
      <h3>Technické a analytické údaje</h3>
      <p>
        Automaticky zhromažďujeme základné technické informácie, ako je IP adresa, typ prehliadača, typ zariadenia,
        odkazujúca URL adresa a zobrazené stránky. Tieto informácie slúžia na zaistenie bezpečnosti, monitorovanie
        výkonu a súhrnnú analytiku. Analytiku poskytuje spoločnosť Vercel a údaje sa anonymizujú už v mieste zberu
        (neukladajú sa žiadne osobné identifikátory). Na našich marketingových, registračných a platobných stránkach
        používame aj reklamné a analytické nástroje opísané v oddiele 3.
      </p>
      <h3>Platobné informácie</h3>
      <p>
        Ak si zakúpite predplatné, platbu spracúva spoločnosť <strong>Stripe, Inc.</strong> Celé číslo vašej karty
        nevidíme ani neukladáme; dostávame iba zákaznícky token a metaúdaje potrebné na identifikáciu predplatného.
      </p>

      <h2>2. Ako používame vaše informácie</h2>
      <ul>
        <li>na poskytovanie a zlepšovanie služby Gadit (generovanie definícií, obrázkov, spätnej väzby k vetám, kvízov);</li>
        <li>na správu vášho účtu a prispôsobenie vášho prostredia (história vyhľadávania, preferovaný jazyk, prepínač „Detský režim“);</li>
        <li>na spracovanie predplatného a odosielanie transakčných e-mailov (potvrdenia o platbe, zmeny predplatného);</li>
        <li>
          {"na odpovedanie na vaše otázky v asistentovi Gadit a zlepšovanie našich odpovedí v centre pomoci, a keď asistent odovzdá otázku nášmu tímu, na odoslanie nedávnej konverzácie tímu e-mailom spolu s vaším menom, e-mailovou adresou, plánom, jazykom rozhrania a tým, či ste použili web alebo aplikáciu, aby vám tím mohol odpovedať e-mailom;"}
        </li>
        <li>na meranie a zlepšovanie výkonu produktu a na predchádzanie zneužitiu;</li>
        <li>na plnenie zákonných povinností.</li>
      </ul>
      <p>
        Vaše osobné údaje <strong>nepredávame</strong> a váš obsah nepoužívame na to, aby sme vám zobrazovali reklamu.
      </p>

      <h2>3. Služby tretích strán, ktoré využívame</h2>
      <p>
        Gadit využíva nasledujúcich sprostredkovateľov. Každý z nich dostáva iba minimum informácií potrebných na
        poskytnutie príslušnej služby:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": spracúva slová a vety, ktoré odošlete, s cieľom generovať definície, spätnú väzbu k vetám a kvízy, prevádza text na reč, prepisuje hlasový vstup, číta text na fotografiách a v súboroch PDF, ktoré nahráte (napríklad strany domácich úloh), a generuje obrázky. Píše aj odpovede asistenta Gadit: odosielame mu vašu otázku, predchádzajúce správy z tej istej konverzácie, jazyk vášho rozhrania, váš plán a informáciu o tom, či používate web alebo aplikáciu, a nepripájame vaše meno ani e-mailovú adresu. Na údaje odosielané spoločnosti OpenAI sa vzťahujú zásady OpenAI pre používanie údajov v rámci API."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): ukladá váš účet, profil, stav
          predplatného, históriu vyhľadávania a vygenerované obrázky.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, prostredníctvom Google Cloud) prevádza text na reč. Odosielame mu iba text, ktorý sa má čítať nahlas, napríklad slová, vety a príbehy, a zvuk sa ukladá v našom úložisku Firebase, aby sa dal prehrať znova. V jednej hre na čítanie tiež počúva zvuk, ktorý dieťa vysloví nahlas, aby ho skontroloval, a tento záznam sa neukladá. Google Fonts poskytuje písma pre rozhranie v čínštine, japončine a kórejčine a vidí vašu IP adresu."}
        </li>
        <li>
          <strong>Dicta</strong>{": izraelská nezisková organizácia, dopĺňa do hebrejského textu samohláskové znamienka (nikud) pre mladých čitateľov. Odosielame jej iba hebrejský text."}
        </li>
        <li>
          <strong>Stripe</strong>: zabezpečuje platby, predplatné a fakturačný portál.
        </li>
        <li>
          <strong>Apple</strong>{": poskytuje funkciu Sign in with Apple v aplikácii pre iOS (pozri oddiel 1) a predáva a účtuje predplatné zakúpené v aplikácii pre iOS. Pri týchto nákupoch spracúva platbu spoločnosť Apple a my dostávame iba potvrdenie o nákupe a jeho stave (napríklad obnovenie alebo vrátenie platby)."}
        </li>
        <li>
          <strong>PayPal</strong>{": vypláca našich partnerov. Poskytujeme mu PayPal e-mailovú adresu partnera a sumu."}
        </li>
        <li>
          <strong>Resend</strong>{": odosiela naše e-maily (napríklad prihlasovacie odkazy a oznámenia) a doručuje nášmu tímu otázky, ktoré asistent Gadit odovzdá ďalej, s vašou e-mailovou adresou ako adresou na odpoveď."}
        </li>
        <li>
          <strong>Expo</strong>{": doručuje oznámenia aplikácie pre iOS, napríklad upozornenia, ktoré môže rodič zapnúť a ktoré obsahujú meno dieťaťa a slovo, ktoré si dieťa vyhľadalo."}
        </li>
        <li>
          <strong>Vercel</strong>: hosťuje a prevádzkuje webovú stránku a poskytuje anonymizovanú analytiku a meranie
          výkonu.
        </li>
        <li>
          <strong>Yooniz</strong>{": samostatná služba rodinného vzdelávania od toho istého zakladateľa. Yooniz sa nás môže opýtať, či má e-mailová adresa rodiča aktívny plán Gadit Family, a my odpovieme iba áno alebo nie. Ak áno, rodina môže otvoriť Gadit z Yooniz bez hesla: Yooniz nám pošle e-mailovú adresu rodiča, zobrazované mená členov rodiny a informáciu o tom, či je každý z nich rodič, chlapec alebo dievča. Keď dieťa, ktoré otvorilo Gadit z Yooniz, porozumie slovu, odošleme Yooniz e-mailovú adresu rodiča, Yooniz ID dieťaťa a počet získaných bodov za učenie, nikdy nie samotné slovo."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": poskytuje malé obrázky vlajok zobrazované na našich stránkach, a preto vidí vašu IP adresu a údaje o prehliadači."}
        </li>
        <li>
          <strong>Reklama a analytika</strong>{": Meta (Meta Pixel), Google Analytics a TikTok (TikTok Pixel a Events API) merajú návštevy a výsledky našich reklám. Na našich marketingových, registračných a platobných stránkach používajú súbory cookie a podobné technológie. Keď sa zaregistrujete alebo zaplatíte, môžeme týmto službám odoslať hašovanú (jednosmerne zašifrovanú) e-mailovú adresu a ID účtu spolu s vašou IP adresou a údajmi o prehliadači, a to iba na účely merania našich reklám. Affonso, služba pre partnerské odkazy, sa načítava na tých istých stránkach a na každej stránke, na ktorú návštevník prejde cez partnerský odkaz, a uchováva súbor cookie až 60 dní. Ak sa zaregistrujete po príchode cez partnerský odkaz Affonso, odošleme spoločnosti Affonso vašu e-mailovú adresu, meno a ID účtu, aby partner, ktorý vás odporučil, získal uznanie. Žiadnej z týchto služieb nikdy neposielame informácie o deťoch a tieto nástroje nebežia na profile dieťaťa, v Kids Mode ani na stránkach odkazov pre triedu."}
        </li>
      </ul>

      <h2>4. Ako dlho uchovávame vaše informácie</h2>
      <ul>
        <li>Informácie o účte: počas existencie vášho účtu.</li>
        <li>História vyhľadávania: posledných 10 vyhľadávaní na používateľa, aktualizovaná pri každom novom vyhľadávaní.</li>
        <li>
          {"Konverzácie s asistentom Gadit: 180 dní, potom sa automaticky vymažú, alebo skôr, ak svoj účet vymažete. Denný počet vašich otázok, používaný na denný limit, sa vymaže po 3 dňoch."}
        </li>
        <li>
          {"Otázky, ktoré asistent Gadit odovzdá nášmu tímu: uchovávajú sa v schránke nášho tímu, rovnako ako akýkoľvek e-mail, ktorý nám pošlete."}
        </li>
        <li>Vygenerované obrázky: uchovávajú sa, aby rovnaká kombinácia slovo+význam mohla znova použiť obrázok uložený vo vyrovnávacej pamäti. Môžu sa uchovávať neobmedzene, kým je váš účet aktívny.</li>
        <li>Fakturačné a daňové záznamy: v rozsahu vyžadovanom platnými právnymi predpismi (zvyčajne 7 rokov).</li>
        <li>
          {"Vymazané účty: krátky záznam o tom, že účet bol vymazaný (jeho e-mailová adresa, plán a dôvod a poznámka, ktoré ste uviedli, ak nejaké boli), uchovávaný, aby sme mohli odpovedať na otázky o vymazaní."}
        </li>
        <li>Analytické údaje: v súhrnnej podobe, poskytovateľ analytiky ich zvyčajne uchováva 13 mesiacov.</li>
      </ul>

      <h2>5. Vaše práva</h2>
      <p>V závislosti od toho, kde žijete, môžete mať právo:</p>
      <ul>
        <li>požiadať o prístup k osobným údajom, ktoré o vás uchovávame;</li>
        <li>požiadať o opravu nepresných informácií;</li>
        <li>požiadať o vymazanie svojho účtu a súvisiacich údajov;</li>
        <li>exportovať svoje údaje v prenosnom formáte;</li>
        <li>namietať proti určitým spôsobom použitia vašich informácií alebo ich obmedziť;</li>
        <li>odmietnuť určité zdieľanie údajov (ak to umožňuje CCPA alebo podobné právne predpisy).</li>
      </ul>
      <p>
        Ak chcete uplatniť ktorékoľvek z týchto práv, napíšte na adresu{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Odpovieme vám do
        30 dní.
      </p>

      <h2>6. Bezpečnosť</h2>
      <p>
        Na ochranu vašich informácií používame bezpečnostné opatrenia štandardné v odvetví: šifrované pripojenia
        (HTTPS), overované API a riadenie prístupu. Žiadny spôsob prenosu alebo ukladania údajov na internete nie je
        100 % bezpečný, preto nemôžeme zaručiť absolútnu bezpečnosť, ale neustále pracujeme na znižovaní rizík.
      </p>

      <h2>7. Deti</h2>
      <p>
        {"Účet v službe Gadit je určený pre dospelých vo veku 18 rokov a viac. Deti a dospievajúci používajú Gadit len prostredníctvom dospelej osoby, jedným z dvoch spôsobov."}
      </p>
      <p>
        {"Rodinné profily: rodič pridá každé dieťa ako profil v rámci svojho účtu Family, uvedie meno a to, či ide o chlapca alebo dievča, a ak ich rodič doplní, aj vek, školský ročník a fotografiu. Deti u nás nemajú e-mailovú adresu ani heslo. Slová, ktoré dieťa vyhľadáva, a jeho zošit, hry a pokrok sa ukladajú v rodinnom účte. Vidieť ich môžu rodičia v rodine aj každý, komu udelia prístup, napríklad doučovateľ, a rodič si môže zvoliť, že bude dostávať upozornenia, notifikáciou alebo e-mailom, so slovami, ktoré dieťa vyhľadáva. Rodič môže profil dieťaťa v aplikácii kedykoľvek odstrániť."}
      </p>
      <p>
        {"Odkazy na triedu: žiak otvorí odkaz alebo kód, ktorý mu poskytne učiteľ, bez účtu a bez e-mailovej adresy. Ak učiteľ zadal zoznam mien, žiak si z neho vyberie svoje meno a slová, ktoré žiak vyhľadáva, sa pre triedu uložia pod týmto menom, aby ich učiteľ mohol vidieť. O používaní služby Gadit rozhoduje škola a je zodpovedná za informovanie rodičov tam, kde to vyžaduje zákon."}
      </p>
      <p>
        {"Informácie o deťoch nikdy nepoužívame na reklamu a nástroje uvedené pod položkou Reklama a analytika v časti 3 sa nikdy nenačítavajú v detskom profile, v Kids Mode ani na stránkach odkazov na triedu. Ak chcete vymazať profil dieťaťa a jeho údaje, rodič môže napísať na "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" a my ich vymažeme. Ak sa domnievate, že si dieťa otvorilo vlastný účet, napíšte nám a účet aj jeho údaje vymažeme."}
      </p>

      <h2>8. Medzinárodní používatelia</h2>
      <p>
        Gadit je prevádzkovaný zo Spojených štátov amerických. Ak k službe pristupujete z miesta mimo Spojených štátov,
        vaše informácie budú prenesené, uložené a spracúvané v Spojených štátoch a v regiónoch dátových centier, ktoré
        využívajú naši poskytovatelia služieb.
      </p>

      <h2>9. Zmeny týchto zásad</h2>
      <p>
        Tieto Zásady ochrany osobných údajov môžeme z času na čas aktualizovať. Podstatné zmeny zverejníme na tejto
        stránke spolu s upraveným dátumom „Naposledy aktualizované“. Pokračovaním v používaní služby Gadit po
        nadobudnutí účinnosti zmien vyjadrujete súhlas s aktualizovanými zásadami.
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

export function TermsBodySk(): ReactElement {
  return (
    <>
      <p>
        Vitajte v službe Gadit. Tieto Podmienky používania („Podmienky“) upravujú váš prístup k webovej stránke,
        aplikáciám a službám Gadit (spolu „Služba“) a ich používanie. Službu prevádzkuje spoločnosť{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> („my“, „nás“ alebo „náš“). Používaním Služby
        súhlasíte s tým, že ste týmito Podmienkami viazaní. Ak nesúhlasíte, Službu nepoužívajte.
      </p>

      <h2>1. Kto môže používať Gadit</h2>
      <p>
        {"Na otvorenie účtu v službe Gadit musíte mať 18 rokov alebo viac. Deti a dospievajúci mladší ako 18 rokov používajú Gadit len prostredníctvom dospelej osoby: rodič alebo zákonný zástupca ich môže pridať ako profily v pláne Family a škola môže svojim žiakom poskytnúť odkaz na triedu. Rodič, zákonný zástupca alebo škola, ktorí tento prístup poskytujú, zaň nesú zodpovednosť. Otvorením účtu potvrdzujete, že máte 18 rokov alebo viac."}
      </p>

      <h2>2. Váš účet</h2>
      <p>
        Zodpovedáte za zachovanie dôvernosti svojich prihlasovacích údajov a za všetku činnosť, ku ktorej dôjde pod
        vaším účtom. Ak sa domnievate, že váš účet bol napadnutý, bezodkladne nás informujte na adrese{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>3. Predplatné a fakturácia</h2>
      <h3>Plány a poplatky</h3>
      <p>
        {"Gadit ponúka bezplatný plán Basic a platené plány s funkciami a cenami uvedenými na stránke s cenníkom. Ceny sú uvedené v mene zobrazenej na stránke s cenníkom a pri platbe pre vašu lokalitu (v Izraeli v nových izraelských šekeloch vrátane DPH) a pre existujúcich predplatiteľov sa môžu zmeniť s oznámením najmenej 30 dní vopred."}
      </p>
      <h3>Automatické obnovenie</h3>
      <p>
        Platené predplatné sa automaticky obnovuje na konci každého fakturačného obdobia (mesačného alebo ročného, podľa
        zvolenej možnosti) za cenu platnú v danom čase, pokiaľ nie je zrušené pred dátumom obnovenia.
      </p>
      <h3>Zrušenie</h3>
      <p>
        {"Predplatné môžete kedykoľvek zrušiť na stránke svojho účtu. Zrušením sa zastavia budúce obnovenia. Prístup k plateným funkciám si ponecháte do konca aktuálneho fakturačného obdobia. Okrem vrátení peňazí opísaných nižšie neposkytujeme vrátenie peňazí za nevyužitý čas, pokiaľ zákon nevyžaduje inak."}
      </p>
      <h3>Vrátenie peňazí</h3>
      <p>
        {"Ak o to požiadate do 14 dní od prvej platby na vašom účte alebo do 14 dní od ročného obnovenia, túto platbu vám v plnej výške vrátime. Nemusíte uvádzať dôvod. Napíšte na "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" z e-mailovej adresy vášho účtu. Vrátením peňazí sa zároveň ukončí aj predplatné. Ostatné platby sú nevratné, okrem prípadov, keď zákon vyžaduje vrátenie peňazí. Ak sa domnievate, že vám bola suma zaúčtovaná omylom, napíšte nám do 30 dní od zaúčtovania. Nákupy uskutočnené v aplikácii pre iOS účtuje Apple a vrátiť ich môže len Apple na adrese reportaproblem.apple.com."}
      </p>

      <h2>4. Prijateľné používanie</h2>
      <p>Zaväzujete sa, že nebudete:</p>
      <ul>
        <li>používať Službu na akýkoľvek nezákonný účel alebo v rozpore s akýmkoľvek zákonom;</li>
        <li>pokúšať sa o spätnú analýzu, dekompiláciu alebo extrakciu zdrojového kódu Služby;</li>
        <li>zneužívať či obťažovať iných používateľov alebo im škodiť ani odosielať obsah, ktorý je nenávistný, výhražný alebo obscénny;</li>
        <li>automatizovať prístup k Službe nad rámec primeraného osobného používania (napríklad hromadne sťahovať definície);</li>
        <li>obchádzať limity počtu požiadaviek alebo obmedzenia plánu ani používať viacero účtov na obchádzanie kvót;</li>
        <li>používať Službu na trénovanie alebo dolaďovanie akéhokoľvek konkurenčného modelu umelej inteligencie alebo slovníkového produktu;</li>
        <li>nahrávať alebo odosielať obsah, na ktorého odoslanie nemáte právo.</li>
      </ul>
      <p>
        Vyhradzujeme si právo pozastaviť alebo zrušiť účty, ktoré porušujú tieto Podmienky.
      </p>

      <h2>5. Obsah generovaný umelou inteligenciou</h2>
      <p>
        {"Gadit využíva modely umelej inteligencie, vrátane modelov od OpenAI a Google, na generovanie definícií, príkladov, etymológií, spätnej väzby, kvízov, obrázkov, hlasového prednesu a prepisov. Beriete na vedomie a súhlasíte s tým, že:"}
      </p>
      <ul>
        <li>
          Výstup umelej inteligencie môže byť <strong>nepresný, neúplný alebo nevhodný</strong>. Gadit je určený ako
          učebná pomôcka a nemožno sa naň spoliehať pri právnych, lekárskych, profesionálnych ani akademických
          rozhodnutiach.
        </li>
        <li>
          Definície generované umelou inteligenciou sa môžu líšiť od oficiálnych slovníkov. Nezaručujeme, že každá
          definícia je z jazykového hľadiska autoritatívna.
        </li>
        <li>
          Obrázky sa generujú algoritmicky a môžu byť niekedy neočakávané alebo nepresné. Ide o ilustrácie, nie o
          doslovné zobrazenia.
        </li>
        <li>
          Výlučne vy zodpovedáte za to, ako obsah generovaný umelou inteligenciou interpretujete a používate.
        </li>
      </ul>

      <h2>6. Váš obsah</h2>
      <p>
        Keď do služby Gadit odošlete slová, vety alebo zvukový záznam (napríklad pri používaní funkcie „Napíšte vlastnú
        vetu“ alebo hlasového vstupu), udeľujete nám celosvetovú, nevýhradnú a bezodplatnú licenciu na spracúvanie tohto
        obsahu na účely poskytovania a zlepšovania Služby. Nenárokujeme si vlastníctvo obsahu, ktorý odošlete.
      </p>

      <h2>7. Duševné vlastníctvo</h2>
      <p>
        Názov Gadit, logo, webová stránka a softvér, na ktorom sú založené, sú naším vlastníctvom alebo vlastníctvom
        našich poskytovateľov licencií. Udeľuje sa vám osobná, odvolateľná, nevýhradná licencia na používanie Služby v
        rozsahu povolenom týmito Podmienkami.
      </p>
      <p>
        Obsah vygenerovaný službou Gadit v reakcii na váš vstup (definície, obrázky atď.) môžete používať na osobné,
        vzdelávacie alebo nekomerčné účely. Pri komerčnom použití (napríklad v platenom produkte) nás, prosím,
        kontaktujte.
      </p>

      <h2>8. Dostupnosť a zmeny</h2>
      <p>
        Snažíme sa udržiavať Službu dostupnú, nezaručujeme však neprerušovanú ani bezchybnú prevádzku. Ktorúkoľvek časť
        Služby môžeme kedykoľvek upraviť, pozastaviť alebo ukončiť, vrátane funkcií, cien alebo dostupnosti v
        konkrétnych regiónoch.
      </p>

      <h2>9. Služby tretích strán</h2>
      <p>
        Služba využíva externých poskytovateľov (vrátane OpenAI, Google Firebase, Stripe a Vercel). Ich dostupnosť alebo
        správanie môžu ovplyvniť vaše skúsenosti so Službou. Naša zodpovednosť je obmedzená oddielom 11 bez ohľadu na
        problémy spôsobené týmito poskytovateľmi.
      </p>

      <h2>10. Vylúčenie záruk</h2>
      <p>
        SLUŽBA SA POSKYTUJE „TAK, AKO JE“ A „TAK, AKO JE DOSTUPNÁ“, BEZ AKÝCHKOĽVEK ZÁRUK, ČI UŽ VÝSLOVNÝCH, ALEBO
        IMPLICITNÝCH, VRÁTANE, OKREM INÉHO, ZÁRUK OBCHODOVATEĽNOSTI (MERCHANTABILITY), VHODNOSTI NA URČITÝ ÚČEL A
        NEPORUŠOVANIA PRÁV TRETÍCH OSÔB (NON-INFRINGEMENT).
      </p>

      <h2>11. Obmedzenie zodpovednosti</h2>
      <p>
        V MAXIMÁLNOM ROZSAHU POVOLENOM ZÁKONOM NENESÚ LAVI LEARNING AND TRAINING TECHNOLOGIES LLC ANI JEJ VEDÚCI
        PRACOVNÍCI, ZAMESTNANCI A ZÁSTUPCOVIA ZODPOVEDNOSŤ ZA ŽIADNE NEPRIAME, VEDĽAJŠIE, OSOBITNÉ, NÁSLEDNÉ ANI SANKČNÉ
        ŠKODY (PUNITIVE DAMAGES) ANI ZA ŽIADNU STRATU ZISKU ALEBO PRÍJMOV, KTORÉ VYPLÝVAJÚ Z VÁŠHO POUŽÍVANIA SLUŽBY
        ALEBO VZNIKNÚ V SÚVISLOSTI S NÍM.
      </p>
      <p>
        NAŠA CELKOVÁ ZODPOVEDNOSŤ ZA AKÝKOĽVEK NÁROK VYPLÝVAJÚCI ZO SLUŽBY ALEBO SÚVISIACI SO SLUŽBOU NEPREKROČÍ VYŠŠIU
        Z TÝCHTO SÚM: (A) SUMU, KTORÚ STE NÁM ZAPLATILI ZA DVANÁSŤ MESIACOV PREDCHÁDZAJÚCICH UPLATNENIU NÁROKU, ALEBO
        (B) USD $100.
      </p>

      <h2>12. Ukončenie</h2>
      <p>
        Službu môžete kedykoľvek prestať používať. Váš prístup môžeme pozastaviť alebo ukončiť, ak porušíte tieto
        Podmienky alebo ak to vyžaduje zákon. Po ukončení zostávajú v platnosti ustanovenia, ktoré by vzhľadom na svoju
        povahu mali trvať aj naďalej (vrátane oddielov 7, 10, 11 a 14).
      </p>

      <h2>13. Zmeny týchto Podmienok</h2>
      <p>
        Tieto Podmienky môžeme z času na čas revidovať. Podstatné zmeny zverejníme na tejto stránke spolu s upraveným
        dátumom „Naposledy aktualizované“. Pokračovaním v používaní Služby po nadobudnutí účinnosti zmien vyjadrujete
        súhlas s aktualizovanými Podmienkami.
      </p>

      <h2>14. Rozhodné právo a spory</h2>
      <p>
        Tieto Podmienky sa riadia právom štátu Delaware, Spojené štáty americké, bez ohľadu na jeho kolízne normy.
        Akékoľvek spory vyplývajúce z týchto Podmienok alebo zo Služby alebo s nimi súvisiace sa budú riešiť výlučne na
        štátnych alebo federálnych súdoch so sídlom v Delaware, Spojené štáty americké, a vy súhlasíte s osobnou
        právomocou (personal jurisdiction) týchto súdov.
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
