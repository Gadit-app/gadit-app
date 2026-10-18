import type { ReactElement } from "react";

export const titlesCs = { privacy: "Zásady ochrany osobních údajů", terms: "Podmínky používání" };

export function PrivacyBodyCs(): ReactElement {
  return (
    <>
      <p>
        Gadit („Gadit“, „my“, „nás“ nebo „náš“) je služba provozovaná společností{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, registrovanou ve Spojených státech amerických.
        Tyto Zásady ochrany osobních údajů vysvětlují, jaké informace shromažďujeme, jak je používáme a jaké máte
        možnosti volby.
      </p>
      <p>
        Máte-li jakýkoli dotaz, kontaktujte nás na adrese{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informace, které shromažďujeme</h2>
      <h3>Informace o účtu</h3>
      <p>
        Když si vytvoříte účet, shromažďujeme vaši e-mailovou adresu a, pokud se přihlásíte prostřednictvím Google,
        základní profilové informace, které Google poskytuje (zobrazované jméno, profilový obrázek). Vaše heslo k účtu
        Google nedostáváme.
      </p>
      <h3>Informace o používání</h3>
      <p>Když používáte Gadit, zpracováváme:</p>
      <ul>
        <li>slova a volitelné věty, které vyhledáváte;</li>
        <li>obrázky vygenerované na vaši žádost;</li>
        <li>váš předplatitelský tarif a stav fakturace;</li>
        <li>nedávnou historii vyhledávání (u platících uživatelů až posledních 10 slov), uloženou, abyste se k ní mohli později vrátit;</li>
        <li>měsíční kvóty (například počet obrázků, které jste vygenerovali v aktuálním fakturačním období).</li>
      </ul>
      <h3>Technické a analytické údaje</h3>
      <p>
        Automaticky shromažďujeme základní technické informace, jako je IP adresa, typ prohlížeče, typ zařízení,
        odkazující URL a zobrazené stránky. Tyto informace slouží k zajištění bezpečnosti, sledování výkonu a souhrnné
        analytice. Analytiku poskytuje společnost Vercel a údaje jsou anonymizovány již v místě sběru (neukládají se
        žádné osobní identifikátory).
      </p>
      <h3>Platební informace</h3>
      <p>
        Pokud si zakoupíte předplatné, platbu zpracovává společnost <strong>Stripe, Inc.</strong> Celé číslo vaší
        karty nevidíme ani neukládáme; obdržíme pouze zákaznický token a metadata potřebná k identifikaci předplatného.
      </p>

      <h2>2. Jak vaše informace používáme</h2>
      <ul>
        <li>k poskytování a zlepšování služby Gadit (generování definic, obrázků, zpětné vazby k větám, kvízů);</li>
        <li>ke správě vašeho účtu a přizpůsobení vašeho prostředí (historie vyhledávání, preferovaný jazyk, přepínač „Dětský režim“);</li>
        <li>ke zpracování předplatného a zasílání transakčních e-mailů (potvrzení o platbě, změny předplatného);</li>
        <li>k měření a zlepšování výkonu produktu a k předcházení zneužití;</li>
        <li>k plnění zákonných povinností.</li>
      </ul>
      <p>
        Vaše osobní údaje <strong>neprodáváme</strong> a váš obsah nepoužíváme k tomu, abychom vám zobrazovali reklamu.
      </p>

      <h2>3. Služby třetích stran, které využíváme</h2>
      <p>
        Gadit využívá následující zpracovatele. Každý z nich obdrží pouze minimum informací nezbytných k poskytnutí
        příslušné služby:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>: zpracovává slova a věty, které odešlete, za účelem generování definic, zpětné vazby
          k větám, kvízů a přepisu hlasu (Whisper) a generuje obrázky (DALL·E 3). Na údaje odesílané společnosti OpenAI
          se vztahují zásady OpenAI pro používání dat v rámci API.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): ukládá váš účet, profil, stav
          předplatného, historii vyhledávání a vygenerované obrázky.
        </li>
        <li>
          <strong>Stripe</strong>: zajišťuje platby, předplatné a fakturační portál.
        </li>
        <li>
          <strong>Vercel</strong>: hostuje a provozuje webové stránky a poskytuje anonymizovanou analytiku a měření
          výkonu.
        </li>
      </ul>

      <h2>4. Jak dlouho vaše informace uchováváme</h2>
      <ul>
        <li>Informace o účtu: po dobu existence vašeho účtu.</li>
        <li>Historie vyhledávání: posledních 10 vyhledávání na uživatele, aktualizovaná při každém novém vyhledávání.</li>
        <li>Vygenerované obrázky: uchovávají se, aby stejná kombinace slovo+význam mohla znovu použít obrázek uložený v mezipaměti. Mohou být uchovávány po neomezenou dobu, dokud je váš účet aktivní.</li>
        <li>Fakturační a daňové záznamy: v rozsahu vyžadovaném platnými právními předpisy (obvykle 7 let).</li>
        <li>Analytické údaje: v souhrnné podobě, poskytovatel analytiky je obvykle uchovává po dobu 13 měsíců.</li>
      </ul>

      <h2>5. Vaše práva</h2>
      <p>V závislosti na tom, kde žijete, můžete mít právo:</p>
      <ul>
        <li>požádat o přístup k osobním údajům, které o vás uchováváme;</li>
        <li>požádat o opravu nepřesných informací;</li>
        <li>požádat o smazání svého účtu a souvisejících údajů;</li>
        <li>exportovat své údaje v přenositelném formátu;</li>
        <li>vznést námitku proti určitým způsobům použití vašich informací nebo je omezit;</li>
        <li>odmítnout určité sdílení údajů (pokud to umožňuje CCPA nebo obdobné právní předpisy).</li>
      </ul>
      <p>
        Chcete-li uplatnit kterékoli z těchto práv, napište na adresu{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Odpovíme vám do
        30 dnů.
      </p>

      <h2>6. Zabezpečení</h2>
      <p>
        K ochraně vašich informací používáme bezpečnostní opatření standardní v oboru: šifrovaná připojení (HTTPS),
        ověřovaná API a řízení přístupu. Žádný způsob přenosu nebo ukládání dat na internetu není 100% bezpečný, proto
        nemůžeme zaručit absolutní bezpečnost, ale neustále pracujeme na snižování rizik.
      </p>

      <h2>7. Děti</h2>
      <p>
        Gadit není určen dětem mladším 13 let. Pokud se domníváte, že účet vytvořilo dítě mladší 13 let, napište nám
        e-mail a my účet i související údaje smažeme.
      </p>

      <h2>8. Mezinárodní uživatelé</h2>
      <p>
        Gadit je provozován ze Spojených států amerických. Pokud ke službě přistupujete z místa mimo Spojené státy, budou
        vaše informace předány, uloženy a zpracovány ve Spojených státech a v regionech datových center, které využívají
        naši poskytovatelé služeb.
      </p>

      <h2>9. Změny těchto zásad</h2>
      <p>
        Tyto Zásady ochrany osobních údajů můžeme čas od času aktualizovat. Podstatné změny zveřejníme na této stránce
        spolu s upraveným datem „Naposledy aktualizováno“. Pokračováním v používání služby Gadit poté, co změny nabudou
        účinnosti, vyjadřujete souhlas s aktualizovanými zásadami.
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

export function TermsBodyCs(): ReactElement {
  return (
    <>
      <p>
        Vítejte ve službě Gadit. Tyto Podmínky používání („Podmínky“) upravují váš přístup k webovým stránkám, aplikacím a
        službám Gadit (společně „Služba“) a jejich používání. Službu provozuje společnost{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> („my“, „nás“ nebo „náš“). Používáním Služby
        souhlasíte s tím, že jste těmito Podmínkami vázáni. Pokud nesouhlasíte, Službu nepoužívejte.
      </p>

      <h2>1. Kdo smí Gadit používat</h2>
      <p>
        K vytvoření účtu vám musí být alespoň 13 let. Pokud je vám mezi 13 a 18 lety, musíte mít souhlas rodiče nebo
        zákonného zástupce. Používáním služby Gadit prohlašujete, že tyto požadavky splňujete.
      </p>

      <h2>2. Váš účet</h2>
      <p>
        Odpovídáte za zachování důvěrnosti svých přihlašovacích údajů a za veškerou činnost, k níž dojde pod vaším
        účtem. Pokud se domníváte, že byl váš účet napaden, neprodleně nás informujte na adrese{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>3. Předplatné a fakturace</h2>
      <h3>Tarify a poplatky</h3>
      <p>
        Gadit nabízí bezplatný tarif Basic a placené tarify (Clear a Deep) s funkcemi a cenami uvedenými na stránce s
        ceníkem. Ceny jsou uváděny v USD a u stávajících předplatitelů mohou být změněny s oznámením nejméně 30 dní
        předem.
      </p>
      <h3>Automatické obnovení</h3>
      <p>
        Placená předplatná se automaticky obnovují na konci každého fakturačního období (měsíčního nebo ročního, podle
        zvolené možnosti) za cenu platnou v daném okamžiku, pokud nejsou zrušena před datem obnovení.
      </p>
      <h3>Zrušení</h3>
      <p>
        Předplatné můžete kdykoli zrušit na stránce svého účtu. Zrušením se zastaví budoucí obnovení. Přístup k placeným
        funkcím si ponecháte do konce aktuálního fakturačního období. Za nevyužitou dobu neposkytujeme částečné
        refundace.
      </p>
      <h3>Vrácení peněz</h3>
      <p>
        S výjimkou případů, kdy to vyžaduje zákon, jsou platby nevratné. Pokud se domníváte, že vám byla částka
        naúčtována omylem, kontaktujte{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> do 30 dnů od
        naúčtování platby.
      </p>

      <h2>4. Přijatelné používání</h2>
      <p>Zavazujete se, že nebudete:</p>
      <ul>
        <li>používat Službu k jakémukoli nezákonnému účelu nebo v rozporu s jakýmkoli zákonem;</li>
        <li>pokoušet se o zpětnou analýzu, dekompilaci nebo extrakci zdrojového kódu Služby;</li>
        <li>zneužívat či obtěžovat ostatní uživatele nebo jim škodit ani odesílat obsah, který je nenávistný, výhružný nebo obscénní;</li>
        <li>automatizovat přístup ke Službě nad rámec přiměřeného osobního použití (například hromadně stahovat definice);</li>
        <li>obcházet limity počtu požadavků nebo omezení tarifu ani používat více účtů k obcházení kvót;</li>
        <li>používat Službu k trénování nebo dolaďování jakéhokoli konkurenčního modelu umělé inteligence nebo slovníkového produktu;</li>
        <li>nahrávat nebo odesílat obsah, k jehož odeslání nemáte právo.</li>
      </ul>
      <p>
        Vyhrazujeme si právo pozastavit nebo zrušit účty, které porušují tyto Podmínky.
      </p>

      <h2>5. Obsah generovaný umělou inteligencí</h2>
      <p>
        Gadit využívá modely umělé inteligence (včetně modelů GPT, Whisper a DALL·E od společnosti OpenAI) ke
        generování definic, příkladů, etymologií, zpětné vazby, kvízů, obrázků a přepisů. Berete na vědomí a souhlasíte
        s tím, že:
      </p>
      <ul>
        <li>
          Výstup umělé inteligence může být <strong>nepřesný, neúplný nebo nevhodný</strong>. Gadit je zamýšlen jako
          pomůcka pro učení a nelze se na něj spoléhat při právních, lékařských, profesních nebo akademických
          rozhodnutích.
        </li>
        <li>
          Definice generované umělou inteligencí se mohou lišit od oficiálních slovníků. Nezaručujeme, že každá
          definice je z jazykového hlediska autoritativní.
        </li>
        <li>
          Obrázky jsou generovány algoritmicky a mohou být občas neočekávané nebo nepřesné. Jde o ilustrace, nikoli o
          doslovná zobrazení.
        </li>
        <li>
          Výhradně vy odpovídáte za to, jak obsah generovaný umělou inteligencí vykládáte a používáte.
        </li>
      </ul>

      <h2>6. Váš obsah</h2>
      <p>
        Když do služby Gadit odešlete slova, věty nebo zvukový záznam (například při použití funkce „Napište vlastní
        větu“ nebo hlasového zadávání), udělujete nám celosvětovou, nevýhradní a bezúplatnou licenci ke zpracování
        tohoto obsahu za účelem poskytování a zlepšování Služby. Nečiníme si nárok na vlastnictví obsahu, který
        odešlete.
      </p>

      <h2>7. Duševní vlastnictví</h2>
      <p>
        Název Gadit, logo, webové stránky a software, na kterém jsou založeny, jsou naším vlastnictvím nebo vlastnictvím
        našich poskytovatelů licencí. Je vám udělena osobní, odvolatelná, nevýhradní licence k používání Služby v
        rozsahu povoleném těmito Podmínkami.
      </p>
      <p>
        Obsah vygenerovaný službou Gadit v reakci na vaše zadání (definice, obrázky atd.) můžete používat pro osobní,
        vzdělávací nebo nekomerční účely. Pro komerční použití (například v placeném produktu) nás prosím kontaktujte.
      </p>

      <h2>8. Dostupnost a změny</h2>
      <p>
        Snažíme se udržovat Službu dostupnou, nezaručujeme však nepřerušený ani bezchybný provoz. Kteroukoli část
        Služby můžeme kdykoli upravit, pozastavit nebo ukončit, včetně funkcí, cen nebo dostupnosti v konkrétních
        regionech.
      </p>

      <h2>9. Služby třetích stran</h2>
      <p>
        Služba využívá externí poskytovatele (včetně OpenAI, Google Firebase, Stripe a Vercel). Jejich dostupnost nebo
        chování mohou ovlivnit vaše zkušenosti se Službou. Naše odpovědnost je omezena oddílem 11 bez ohledu na problémy
        způsobené těmito poskytovateli.
      </p>

      <h2>10. Vyloučení záruk</h2>
      <p>
        SLUŽBA JE POSKYTOVÁNA „TAK, JAK JE“ A „TAK, JAK JE DOSTUPNÁ“, BEZ JAKÝCHKOLI ZÁRUK, AŤ UŽ VÝSLOVNÝCH, NEBO
        IMPLICITNÍCH, MIMO JINÉ VČETNĚ ZÁRUK OBCHODOVATELNOSTI (MERCHANTABILITY), VHODNOSTI PRO URČITÝ ÚČEL A
        NEPORUŠOVÁNÍ PRÁV TŘETÍCH OSOB (NON-INFRINGEMENT).
      </p>

      <h2>11. Omezení odpovědnosti</h2>
      <p>
        V MAXIMÁLNÍM ROZSAHU POVOLENÉM ZÁKONEM NENESOU LAVI LEARNING AND TRAINING TECHNOLOGIES LLC ANI JEJÍ VEDOUCÍ
        PRACOVNÍCI, ZAMĚSTNANCI A ZÁSTUPCI ODPOVĚDNOST ZA ŽÁDNÉ NEPŘÍMÉ, VEDLEJŠÍ, ZVLÁŠTNÍ, NÁSLEDNÉ NEBO SANKČNÍ
        ŠKODY (PUNITIVE DAMAGES) ANI ZA ŽÁDNOU ZTRÁTU ZISKU NEBO PŘÍJMŮ, KTERÉ VYPLÝVAJÍ Z VAŠEHO POUŽÍVÁNÍ SLUŽBY
        NEBO VZNIKNOU V SOUVISLOSTI S NÍM.
      </p>
      <p>
        NAŠE CELKOVÁ ODPOVĚDNOST ZA JAKÝKOLI NÁROK VYPLÝVAJÍCÍ ZE SLUŽBY NEBO SOUVISEJÍCÍ SE SLUŽBOU NEPŘESÁHNE VYŠŠÍ
        Z TĚCHTO ČÁSTEK: (A) ČÁSTKU, KTEROU JSTE NÁM ZAPLATILI ZA DVANÁCT MĚSÍCŮ PŘEDCHÁZEJÍCÍCH UPLATNĚNÍ NÁROKU, NEBO
        (B) USD $100.
      </p>

      <h2>12. Ukončení</h2>
      <p>
        Službu můžete kdykoli přestat používat. Váš přístup můžeme pozastavit nebo ukončit, pokud porušíte tyto Podmínky
        nebo pokud to vyžaduje zákon. Po ukončení zůstávají v platnosti ustanovení, která by vzhledem ke své povaze měla
        trvat i nadále (včetně oddílů 7, 10, 11 a 14).
      </p>

      <h2>13. Změny těchto Podmínek</h2>
      <p>
        Tyto Podmínky můžeme čas od času revidovat. Podstatné změny zveřejníme na této stránce spolu s upraveným datem
        „Naposledy aktualizováno“. Pokračováním v používání Služby poté, co změny nabudou účinnosti, vyjadřujete souhlas
        s aktualizovanými Podmínkami.
      </p>

      <h2>14. Rozhodné právo a spory</h2>
      <p>
        Tyto Podmínky se řídí právem státu Delaware, Spojené státy americké, bez ohledu na jeho kolizní normy. Veškeré
        spory vyplývající z těchto Podmínek nebo ze Služby nebo s nimi související budou řešeny výhradně u státních nebo
        federálních soudů se sídlem v Delaware, Spojené státy americké, a vy souhlasíte s osobní příslušností (personal
        jurisdiction) těchto soudů.
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
