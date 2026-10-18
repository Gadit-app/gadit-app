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
      <h3>Informácie o používaní</h3>
      <p>Keď používate Gadit, spracúvame:</p>
      <ul>
        <li>slová a voliteľné vety, ktoré vyhľadávate;</li>
        <li>obrázky vygenerované na vašu žiadosť;</li>
        <li>váš plán predplatného a stav fakturácie;</li>
        <li>nedávnu históriu vyhľadávania (pri platiacich používateľoch až posledných 10 slov), uloženú, aby ste sa k nej mohli neskôr vrátiť;</li>
        <li>mesačné kvóty (napríklad počet obrázkov, ktoré ste vygenerovali v aktuálnom fakturačnom období).</li>
      </ul>
      <h3>Technické a analytické údaje</h3>
      <p>
        Automaticky zhromažďujeme základné technické informácie, ako je IP adresa, typ prehliadača, typ zariadenia,
        odkazujúca URL adresa a zobrazené stránky. Tieto informácie slúžia na zaistenie bezpečnosti, monitorovanie
        výkonu a súhrnnú analytiku. Analytiku poskytuje spoločnosť Vercel a údaje sa anonymizujú už v mieste zberu
        (neukladajú sa žiadne osobné identifikátory).
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
          <strong>OpenAI</strong>: spracúva slová a vety, ktoré odošlete, s cieľom generovať definície, spätnú väzbu k
          vetám, kvízy a prepis hlasu (Whisper), a generuje obrázky (DALL·E 3). Na údaje odosielané spoločnosti OpenAI
          sa vzťahujú zásady OpenAI pre používanie údajov v rámci API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): ukladá váš účet, profil, stav
          predplatného, históriu vyhľadávania a vygenerované obrázky.
        </li>
        <li>
          <strong>Stripe</strong>: zabezpečuje platby, predplatné a fakturačný portál.
        </li>
        <li>
          <strong>Vercel</strong>: hosťuje a prevádzkuje webovú stránku a poskytuje anonymizovanú analytiku a meranie
          výkonu.
        </li>
      </ul>

      <h2>4. Ako dlho uchovávame vaše informácie</h2>
      <ul>
        <li>Informácie o účte: počas existencie vášho účtu.</li>
        <li>História vyhľadávania: posledných 10 vyhľadávaní na používateľa, aktualizovaná pri každom novom vyhľadávaní.</li>
        <li>Vygenerované obrázky: uchovávajú sa, aby rovnaká kombinácia slovo+význam mohla znova použiť obrázok uložený vo vyrovnávacej pamäti. Môžu sa uchovávať neobmedzene, kým je váš účet aktívny.</li>
        <li>Fakturačné a daňové záznamy: v rozsahu vyžadovanom platnými právnymi predpismi (zvyčajne 7 rokov).</li>
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
        Gadit nie je určený deťom mladším ako 13 rokov. Ak sa domnievate, že účet vytvorilo dieťa mladšie ako 13 rokov,
        napíšte nám e-mail a my účet aj súvisiace údaje vymažeme.
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
        Na vytvorenie účtu musíte mať aspoň 13 rokov. Ak máte od 13 do 18 rokov, musíte mať súhlas rodiča alebo
        zákonného zástupcu. Používaním služby Gadit vyhlasujete, že spĺňate tieto požiadavky.
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
        Gadit ponúka bezplatný plán Basic a platené plány (Clear a Deep) s funkciami a cenami uvedenými na stránke s
        cenníkom. Ceny sú uvedené v USD a pre existujúcich predplatiteľov sa môžu zmeniť s oznámením najmenej 30 dní
        vopred.
      </p>
      <h3>Automatické obnovenie</h3>
      <p>
        Platené predplatné sa automaticky obnovuje na konci každého fakturačného obdobia (mesačného alebo ročného, podľa
        zvolenej možnosti) za cenu platnú v danom čase, pokiaľ nie je zrušené pred dátumom obnovenia.
      </p>
      <h3>Zrušenie</h3>
      <p>
        Predplatné môžete kedykoľvek zrušiť na stránke svojho účtu. Zrušením sa zastavia budúce obnovenia. Prístup k
        plateným funkciám si ponecháte do konca aktuálneho fakturačného obdobia. Za nevyužitý čas neposkytujeme
        čiastočné vrátenie peňazí.
      </p>
      <h3>Vrátenie peňazí</h3>
      <p>
        S výnimkou prípadov, keď to vyžaduje zákon, sú platby nevratné. Ak sa domnievate, že vám bola suma zaúčtovaná
        omylom, kontaktujte{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> do 30 dní od
        zaúčtovania platby.
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
        Gadit využíva modely umelej inteligencie (vrátane modelov GPT, Whisper a DALL·E od spoločnosti OpenAI) na
        generovanie definícií, príkladov, etymológií, spätnej väzby, kvízov, obrázkov a prepisov. Beriete na vedomie a
        súhlasíte s tým, že:
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
