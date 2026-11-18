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
      <p>
        {"V aplikaci pro iOS se můžete přihlásit také přes Apple. Apple nám pak poskytne jméno a e-mailovou adresu, které se rozhodnete sdílet, a tou může být i soukromá přeposílací adresa, která vám přeposílá naše e-maily. Vaše heslo k Apple nedostáváme."}
      </p>
      <h3>Informace o používání</h3>
      <p>Když používáte Gadit, zpracováváme:</p>
      <ul>
        <li>slova a volitelné věty, které vyhledáváte;</li>
        <li>obrázky vygenerované na vaši žádost;</li>
        <li>váš předplatitelský tarif a stav fakturace;</li>
        <li>nedávnou historii vyhledávání (u platících uživatelů až posledních 10 slov), uloženou, abyste se k ní mohli později vrátit;</li>
        <li>
          {"pokud používáte asistenta Gadit v centru nápovědy: otázky, které mu pokládáte, jeho odpovědi a to, zda jste odpověď označili jako užitečnou, spolu s ID vašeho účtu (a ID rodiny, pokud je máte), e-mailovou adresou, vaším tarifem, jazykem rozhraní a informací o tom, zda jste použili webové stránky nebo aplikaci;"}
        </li>
        <li>měsíční kvóty (například počet obrázků, které jste vygenerovali v aktuálním fakturačním období).</li>
      </ul>
      <p>
        {"Asistent Gadit není dostupný na dětských profilech, v Dětském režimu ani návštěvníkům, kteří nejsou přihlášeni. Nezadávejte do něj prosím hesla ani čísla platebních karet."}
      </p>
      <h3>Technické a analytické údaje</h3>
      <p>
        Automaticky shromažďujeme základní technické informace, jako je IP adresa, typ prohlížeče, typ zařízení,
        odkazující URL a zobrazené stránky. Tyto informace slouží k zajištění bezpečnosti, sledování výkonu a souhrnné
        analytice. Analytiku poskytuje společnost Vercel a údaje jsou anonymizovány již v místě sběru (neukládají se
        žádné osobní identifikátory). Na našich marketingových, registračních a platebních stránkách používáme také
        reklamní a analytické nástroje popsané v oddílu 3.
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
        <li>
          {"k zodpovídání vašich otázek v asistentu Gadit a ke zlepšování našich odpovědí v nápovědě a, když asistent předá otázku našemu týmu, k odeslání nedávné konverzace týmu e-mailem spolu s vaším jménem, e-mailovou adresou, tarifem, jazykem rozhraní a informací o tom, zda jste použili webové stránky nebo aplikaci, aby vám tým mohl odpovědět e-mailem;"}
        </li>
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
          <strong>OpenAI</strong>{": zpracovává slova a věty, které odešlete, za účelem generování definic, zpětné vazby k větám a kvízů, převádí text na řeč, přepisuje hlasový vstup, čte text na fotografiích a v PDF souborech, které nahrajete (například stránky domácích úkolů), a generuje obrázky. Vytváří také odpovědi asistenta Gadit: odesíláme mu vaši otázku, předchozí zprávy ze stejné konverzace, jazyk vašeho rozhraní, váš tarif a informaci o tom, zda používáte webové stránky nebo aplikaci, a nepřipojujeme vaše jméno ani e-mailovou adresu. Na údaje odesílané společnosti OpenAI se vztahují zásady OpenAI pro používání dat v rámci API."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): ukládá váš účet, profil, stav
          předplatného, historii vyhledávání a vygenerované obrázky.
        </li>
        <li>
          <strong>Google</strong>{"(Gemini, prostřednictvím Google Cloud): převádí text na řeč. Odesíláme mu pouze text, který má být přečten nahlas, například slova, věty a příběhy, a zvuk se ukládá do našeho úložiště Firebase, aby jej bylo možné znovu přehrát. V jedné čtenářské hře také slyší zvuk, který dítě vysloví nahlas, aby jej zkontroloval, a tento záznam se neukládá. Google Fonts poskytuje písma pro rozhraní v čínštině, japonštině a korejštině a vidí vaši IP adresu."}
        </li>
        <li>
          <strong>Dicta</strong>{": izraelská nezisková organizace, doplňuje do hebrejského textu samohlásková znaménka (niqqud) pro mladé čtenáře. Odesíláme jí pouze hebrejský text."}
        </li>
        <li>
          <strong>Stripe</strong>: zajišťuje platby, předplatné a fakturační portál.
        </li>
        <li>
          <strong>Apple</strong>{": poskytuje Přihlášení přes Apple v aplikaci pro iOS (viz oddíl 1) a prodává a účtuje předplatná zakoupená v aplikaci pro iOS. U těchto nákupů zpracovává platbu Apple a my dostáváme pouze potvrzení o nákupu a jeho stavu (například obnovení nebo vrácení peněz)."}
        </li>
        <li>
          <strong>PayPal</strong>{": vyplácí naše partnery. Předáváme mu partnerovu e-mailovou adresu pro PayPal a částku."}
        </li>
        <li>
          <strong>Resend</strong>{": odesílá naše e-maily (například přihlašovací odkazy a oznámení) a doručuje našemu týmu otázky, které asistent Gadit předá dál, přičemž vaše e-mailová adresa slouží jako adresa pro odpověď."}
        </li>
        <li>
          <strong>Expo</strong>{": doručuje oznámení aplikace pro iOS, například upozornění, která může rodič zapnout a která zahrnují jméno dítěte a slovo, které dítě vyhledalo."}
        </li>
        <li>
          <strong>Vercel</strong>: hostuje a provozuje webové stránky a poskytuje anonymizovanou analytiku a měření
          výkonu.
        </li>
        <li>
          <strong>Yooniz</strong>{": samostatná služba pro rodinné vzdělávání od stejného zakladatele. Yooniz se nás může zeptat, zda má e-mailová adresa rodiče aktivní tarif Gadit Family, a my odpovíme pouze ano nebo ne. Pokud ano, může rodina otevřít Gadit z Yooniz bez hesla: Yooniz nám pošle e-mailovou adresu rodiče, zobrazovaná jména členů rodiny a informaci o tom, zda je každý z nich rodič, chlapec nebo dívka. Když dítě, které otevřelo Gadit z Yooniz, porozumí slovu, pošleme Yooniz e-mailovou adresu rodiče, Yooniz ID dítěte a počet získaných studijních bodů, nikdy však ne samotné slovo."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": poskytuje malé obrázky vlajek zobrazované na našich stránkách, a vidí tak vaši IP adresu a údaje o prohlížeči."}
        </li>
        <li>
          <strong>Reklama a analytika</strong>{": Meta (Meta Pixel), Google Analytics a TikTok (TikTok Pixel a Events API) měří návštěvy a výsledky našich reklam. Na našich marketingových, registračních a platebních stránkách používají soubory cookie a podobné technologie. Když se zaregistrujete nebo zaplatíte, můžeme těmto službám odeslat hashovanou (jednosměrně zašifrovanou) e-mailovou adresu a ID účtu spolu s vaší IP adresou a údaji o prohlížeči, a to pouze za účelem měření našich reklam. Affonso, služba pro partnerské odkazy, se načítá na stejných stránkách a na každé stránce, na kterou návštěvník přijde přes partnerský odkaz, a ukládá soubor cookie až na 60 dnů. Pokud se zaregistrujete poté, co přijdete přes partnerský odkaz Affonso, pošleme Affonso vaši e-mailovou adresu, jméno a ID účtu, aby partner, který vás doporučil, získal zásluhu. Nikdy žádné z těchto služeb neposíláme informace o dětech a tyto nástroje neběží na dětském profilu, v Dětském režimu ani na stránkách s odkazem do třídy."}
        </li>
      </ul>

      <h2>4. Jak dlouho vaše informace uchováváme</h2>
      <ul>
        <li>Informace o účtu: po dobu existence vašeho účtu.</li>
        <li>Historie vyhledávání: posledních 10 vyhledávání na uživatele, aktualizovaná při každém novém vyhledávání.</li>
        <li>
          {"Konverzace s asistentem Gadit: 180 dní, poté jsou automaticky smazány, nebo dříve, pokud svůj účet smažete. Denní počet vašich otázek, používaný pro denní limit, se maže po 3 dnech."}
        </li>
        <li>
          {"Otázky, které asistent Gadit předá našemu týmu: uchovávají se v poštovní schránce našeho týmu stejně jako jakýkoli jiný e-mail, který nám odešlete."}
        </li>
        <li>Vygenerované obrázky: uchovávají se, aby stejná kombinace slovo+význam mohla znovu použít obrázek uložený v mezipaměti. Mohou být uchovávány po neomezenou dobu, dokud je váš účet aktivní.</li>
        <li>Fakturační a daňové záznamy: v rozsahu vyžadovaném platnými právními předpisy (obvykle 7 let).</li>
        <li>
          {"Smazané účty: stručný záznam o tom, že účet byl smazán, obsahující jeho e-mailovou adresu, tarif a důvod a poznámku, které jste uvedli, pokud jste je uvedli; uchovává se, abychom mohli odpovídat na dotazy týkající se smazání."}
        </li>
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
        {"Účet Gadit je určen pro dospělé ve věku 18 let a starší. Děti a dospívající používají Gadit pouze prostřednictvím dospělé osoby, a to jedním ze dvou způsobů."}
      </p>
      <p>
        {"Profily Family: rodič přidá každé dítě jako profil v rámci svého účtu Family, a to se jménem a údajem, zda jde o chlapce nebo dívku, a pokud je rodič doplní, také s věkem, školním ročníkem a fotografií. Děti u nás nemají e-mailovou adresu ani heslo. Slova, která dítě vyhledává, a také jeho zápisník, hry a pokrok se ukládají do rodinného účtu. Vidět je mohou rodiče v rodině i kdokoli, komu udělí přístup, například doučovatel, a rodič si může zvolit, že bude dostávat upozornění, prostřednictvím oznámení nebo e-mailu, se slovy, která dítě vyhledává. Rodič může profil dítěte v aplikaci kdykoli odstranit."}
      </p>
      <p>
        {"Odkazy do třídy: student otevře odkaz nebo kód, který mu poskytne učitel, bez účtu a bez e-mailové adresy. Pokud učitel zadal seznam jmen, student si z něj vybere své jméno a slova, která vyhledává, se pro danou třídu ukládají pod tímto jménem, aby je učitel mohl vidět. O použití Gadit rozhoduje škola a je odpovědná za informování rodičů tam, kde to vyžaduje zákon."}
      </p>
      <p>
        {"Informace o dětech nikdy nepoužíváme k reklamním účelům a nástroje uvedené pod položkou Reklama a analytika v oddílu 3 se nikdy nenačítají na profilu dítěte, v dětském režimu ani na stránkách odkazů do třídy. Pokud chcete odstranit profil dítěte a jeho údaje, může rodič napsat na "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" a my je smažeme. Pokud se domníváte, že si dítě vytvořilo vlastní účet, napište nám a my účet i jeho údaje smažeme."}
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
        {"K vytvoření účtu Gadit vám musí být alespoň 18 let. Děti a dospívající mladší 18 let používají Gadit pouze prostřednictvím dospělé osoby: rodič nebo zákonný zástupce je může přidat jako profily do tarifu Family a škola může svým studentům poskytnout odkaz do třídy. Rodič, zákonný zástupce nebo škola, kteří tento přístup poskytují, za něj nesou odpovědnost. Vytvořením účtu potvrzujete, že je vám alespoň 18 let."}
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
        {"Gadit nabízí bezplatný tarif Basic a placené tarify s funkcemi a cenami uvedenými na stránce s ceníkem. Ceny jsou uváděny v měně zobrazené na stránce s ceníkem a při placení pro vaši lokalitu (v Izraeli v nových izraelských šekelech včetně DPH) a u stávajících předplatitelů mohou být změněny s oznámením nejméně 30 dní předem."}
      </p>
      <h3>Automatické obnovení</h3>
      <p>
        Placená předplatná se automaticky obnovují na konci každého fakturačního období (měsíčního nebo ročního, podle
        zvolené možnosti) za cenu platnou v daném okamžiku, pokud nejsou zrušena před datem obnovení.
      </p>
      <h3>Zrušení</h3>
      <p>
        {"Předplatné můžete kdykoli zrušit na stránce svého účtu. Zrušením se zastaví budoucí obnovení. Přístup k placeným funkcím si ponecháte do konce aktuálního fakturačního období. S výjimkou refundací popsaných níže peníze za nevyužitou dobu nevracíme, ledaže zákon vyžaduje jinak."}
      </p>
      <h3>Vrácení peněz</h3>
      <p>
        {"Pokud o to požádáte do 14 dnů od první platby na vašem účtu nebo do 14 dnů od ročního obnovení, vrátíme vám tuto platbu v plné výši. Nemusíte uvádět důvod. Napište na "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" z e-mailové adresy vašeho účtu. Refundací se zároveň ukončuje i předplatné. Ostatní platby jsou nevratné, s výjimkou případů, kdy zákon vrácení peněz vyžaduje. Pokud se domníváte, že vám byla částka naúčtována omylem, napište nám do 30 dnů od naúčtování platby. Nákupy provedené v aplikaci pro iOS účtuje Apple a refundaci za ně může poskytnout pouze Apple na adrese reportaproblem.apple.com."}
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
        {"Gadit využívá modely umělé inteligence, včetně modelů od OpenAI a Google, ke generování definic, příkladů, etymologií, zpětné vazby, kvízů, obrázků, řeči a přepisů. Berete na vědomí a souhlasíte s tím, že:"}
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
