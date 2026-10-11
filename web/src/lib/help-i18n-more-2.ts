import type { HelpContent } from "./help-i18n";
import type { Lang } from "./i18n";

/** Help Center in cs, sk, it, ja, hi, am (2026-10-10 i18n sweep). Same ids, order and meaning as the English block in help-i18n.ts. */
export const HELP_MORE_2: Partial<Record<Lang, HelpContent>> = {
  cs: {
    eyebrow: "Centrum nápovědy",
    heading: "Najděte odpověď, rychle.",
    lede: "Časté otázky a postupy krok za krokem, seřazené podle oblastí. Pokud tu svůj problém nenajdete, ozvěte se našemu týmu, kontakt najdete dole na stránce.",
    stillNeedHelpHeading: "Stále si nevíte rady?",
    stillNeedHelpBody: "Napište nám přímo. Každou zprávu si tým přečte a odpověď dostanete do jednoho až dvou dnů.",
    emailCta: "Napište nám e-mail",
    responseTime: "Obvyklá doba odpovědi: do 24 až 48 hodin.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Platby a předplatné",
        items: [
          {
            id: "change-card",
            q: "Jak změním platební kartu u svého předplatného?",
            a: [
              "Na novou kartu přejdete za méně než minutu a nemusíte nic rušit. Vaše současné předplatné běží dál, jen na novou kartu.",
              "1. Přihlaste se na gadit.app a otevřete stránku Účet (vpravo nahoře). 2. Klikněte na \"Spravovat platby\". 3. Otevře se zabezpečená stránka Stripe. Klikněte na \"Přidat platební metodu\", zadejte novou kartu a nastavte ji jako výchozí. 4. Pokud chcete, starou kartu odeberte.",
              "Od dalšího zúčtovacího období se vše strhává z nové karty. Předchozí platba (už stržená) zůstává na staré kartě. Vracet peníze není potřeba, pokud si to výslovně nepřejete.",
            ],
          },
          {
            id: "cancel",
            q: "Jak zruším předplatné?",
            a: [
              "Sami, kdykoli. Přihlaste se, otevřete Účet a pod svým tarifem klepněte na Zrušit předplatné.",
              "Přístup vám zůstane do konce období, které už máte zaplacené. Poté se účet vrátí na Basic (zdarma). Vaše uložená slova, historie i sešit zůstanou v bezpečí a dostupné.",
              "Pokud zrušíte omylem nebo si to rozmyslíte, můžete předplatné na stejné stránce obnovit, dokud období neskončí.",
            ],
          },
          {
            id: "switch-plan",
            q: "Jak přejdu z Clear na Deep (nebo naopak)?",
            a: [
              "Účet, pak Spravovat platby, pak Upravit předplatné. Vyberte nový plán.",
              "Stripe rozdíl v ceně spočítá automaticky, poměrně podle dní zbývajících do konce aktuálního období. Při přechodu na vyšší plán zaplatíte jen rozdíl za zbytek období. Při přechodu na nižší plán se kredit započítá do příští platby.",
            ],
          },
          {
            id: "invoice",
            q: "Jak stáhnu fakturu nebo účtenku?",
            a: [
              "Účet, pak Spravovat platby, pak Historie faktur. Ke každé platbě je ke stažení účtenka v PDF s fakturačními údaji, které jste uložili.",
              "Pokud na faktuře potřebujete jiné jméno, adresu nebo DIČ (například název firmy kvůli daním), upravte fakturační údaje na stejné stránce ještě před stažením. Další účtenka už použije nové údaje.",
            ],
          },
          {
            id: "portal-error",
            q: "Po kliknutí na Spravovat platby se objevila chyba. Co teď?",
            a: [
              "Dvě časté příčiny. Zaprvé, váš účet nemá aktivní předplatné ve Stripe. Zadruhé, Stripe možná pro váš účet ještě nemá úplný fakturační profil.",
              "Jednoduchá první kontrola: odhlaste se, znovu se přihlaste e-mailem, který jste použili při platbě, a zkuste to znovu. Pokud to pořád nefunguje, napište nám s e-mailem svého účtu a tým to na naší straně během chvilky opraví.",
            ],
          },
          {
            id: "autorenew",
            q: "Obnovuje se moje předplatné automaticky?",
            a: [
              "Ano. Měsíční plány se obnovují každý měsíc, roční plány každý rok ve stejný den. Datum další platby uvidíte ve svém účtu i na portálu Stripe.",
              "Pokud automatické obnovení nechcete, zrušte předplatné kdykoli před datem obnovení. Zrušení neplatí okamžitě. Přístup vám zůstane po celé už zaplacené období.",
            ],
          },
          {
            id: "refund",
            q: "Je možné vrátit peníze?",
            a: [
              "Ano. Pokud od nákupu uplynulo méně než 14 dní a službu jste příliš nevyužili, napište nám s e-mailem svého účtu a krátkou poznámkou, proč. Takové žádosti schvalujeme bez dohadování.",
              "Pokud uplynulo víc než 14 dní, tým posuzuje každý případ zvlášť. Zrušte předplatné, aby se dál neobnovovalo, a napište nám e-mail.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Vidím platbu, kterou nepoznávám.",
            a: [
              "Platby se zobrazují jako GADIT nebo GADIT.APP s částkou $2.99 (Clear měsíčně), $4.99 (Deep měsíčně), $29.99 (Clear ročně) nebo $49.99 (Deep ročně). Pokud to nesedí, může jít o jinou službu.",
              "Pokud jste si jistí, že platba není vaše, zatím ji nereklamujte přes banku. Nejdřív nám napište přímo s datem a částkou. Tým platbu dohledá, vysvětlí, o co jde, a v případě potřeby peníze vrátí. Reklamace přes banku může budoucí platby zkomplikovat, takže vyřešení přes podporu bývá rychlejší a bezpečnější.",
            ],
          },
          {
            id: "failed-payment",
            q: "Platba se nezdařila. Co mám dělat?",
            a: [
              "Stripe neúspěšné platby v následujících dnech automaticky několikrát zopakuje. Většina problémů se vyřeší sama, jakmile banka uvolní blokaci nebo je na kartě dost prostředků.",
              "Pokud to chcete vyřešit hned, přejděte do Účet → Spravovat platby → Přidat platební metodu, zadejte funkční kartu a nastavte ji jako výchozí. Stripe neúspěšnou platbu na nové kartě okamžitě zopakuje. Pokud vaše předplatné už spadlo na Basic, můžete si ho znovu objednat na stránce Ceník a váš sešit zůstane nedotčený.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Jaký je rozdíl mezi Basic, Clear a Deep?",
            a: [
              "Basic (zdarma): až 20 vyhledání slov denně, všechny významy, příklady ke každému významu, idiomy a původ slova. Pro základní vyhledávání není potřeba registrace.",
              "Clear ($2.99/měsíc nebo $29.99/rok): neomezené vyhledávání, vysvětlení pro děti, obrázek ke slovu (30 měsíčně), vlastní věty se zpětnou vazbou, podrobnosti k idiomům a 30 dní historie hledání.",
              "Deep ($4.99/měsíc nebo $49.99/rok): vše z Clear a navíc procvičovací kvízy, osobní sešit s chytrým opakováním v rozestupech, rozlišování podobných slov a větší limit obrázků (100 měsíčně).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Účet a přihlášení",
        items: [
          {
            id: "no-verification-email",
            q: "Nepřišel mi ověřovací e-mail.",
            a: [
              "Nejdřív zkontrolujte složky Spam a Promoakce. Gmail a Outlook tam e-maily k účtu občas přesouvají, dokud jeden z nich neoznačíte jako \"Není spam\".",
              "Pokud tam není, adresa mohla být při registraci zadaná s překlepem. Zkuste se zaregistrovat znovu a adresu si pečlivě zkontrolujte. Pokud jste se registrovali přes Google, ověřovací e-mail není potřeba.",
            ],
          },
          {
            id: "forgot-password",
            q: "Zapomenuté heslo.",
            a: [
              "Otevřete přihlašovací okno a klikněte na \"Zapomněli jste heslo?\". Zadejte e-mail, který pro Gadit používáte, a do minuty či dvou vám přijde odkaz pro obnovení.",
              "Pokud e-mail nepřijde, zkontrolujte spam. Pokud nepřijde ani tak, možná jste se registrovali přes Google, a ne e-mailem a heslem. Zkuste tlačítko \"Pokračovat přes Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Heslo mám určitě správně, ale zobrazuje se \"Nesprávný e-mail nebo heslo\".",
            a: [
              "Zkontrolujte tři věci. Zaprvé Caps Lock. Zadruhé mezeru na konci při kopírování a vkládání. Zatřetí, jestli jste se nezaregistrovali přes Google místo hesla (pak použijte \"Pokračovat přes Google\").",
              "Pořád nic? Obnovte heslo ve stejném okně. Začnete načisto.",
            ],
          },
          {
            id: "google-fails",
            q: "Přihlášení přes Google nefunguje.",
            a: [
              "Nejčastější příčina: váš prohlížeč pro gadit.app blokuje cookies třetích stran nebo vyskakovací okna. Povolte je v oprávněních v adresním řádku a zkuste to znovu.",
              "V anonymním režimu je přihlášení přes Google záměrně omezené. Přepněte do běžného okna prohlížeče.",
            ],
          },
          {
            id: "change-email",
            q: "Jak změním e-mail u svého účtu?",
            a: [
              "Účet, klikněte na svůj e-mail, Změnit e-mail. Novou adresu je potřeba potvrdit, než se změna uloží. Předplatné, historie i sešit se přenesou.",
              "Pokud je e-mail propojený se zákazníkem ve Stripe, změňte ho i na fakturačním portálu Stripe, aby budoucí účtenky chodily na novou adresu.",
            ],
          },
          {
            id: "delete-account",
            q: "Jak smažu svůj účet?",
            a: [
              "Účet, dole na stránce, Smazat účet. Je to nevratné. Předplatné se zruší, sešit a historie se vymažou a e-mail se uvolní pro novou registraci.",
              "Záznamy Stripe o minulých platbách zůstávají (ze zákona je musíme uchovávat pro účetnictví). Nic jiného nezůstane.",
            ],
          },
          {
            id: "share-account",
            q: "Může můj partner nebo dítě sdílet můj účet?",
            a: [
              "Na jednom účtu může být v jednu chvíli přihlášený jen jeden uživatel. Dětský režim umožňuje, aby jeden účet Clear nebo Deep sloužil rodiči i dítěti: přepněte přepínač a definice se zobrazí srozumitelně pro děti, bez samostatného přihlašování.",
              "Pokud dva dospělí chtějí každý vlastní sešit a pokrok, vytvořte dva účty. Clear stojí $2.99 měsíčně za účet.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Myslím, že mám omylem dva účty. Co teď?",
            a: [
              "Obvykle se to stane, když se někdo se stejnou adresou jednou zaregistruje přes Google a jednou e-mailem a heslem, nebo když se zaregistrujete dvakrát s různými e-mailovými adresami. Každá registrace vytvoří samostatný účet Gadit s vlastním sešitem, historií a stavem předplatného.",
              "Napište nám obě e-mailové adresy (nebo UID ze stránky Účet) a který účet si chcete ponechat. Tým sloučí sešity a historii do vybraného účtu a ten druhý čistě uzavře. O žádná data nepřijdete.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Používání Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Myslím, že definice je špatně. Co mám dělat?",
            a: [
              "Na každé stránce s výsledkem je dole malé tlačítko \"Nahlásit\". Klepněte na něj, vyberte kategorii (definice, etymologie, příklad, idiom, vysvětlení pro děti a tak dále) a napište krátkou poznámku. Přijde přímo týmu a každé hlášení projdeme.",
              "Nebojte se, že jste moc puntičkářští. Slovník se díky takové zpětné vazbě zlepšuje rychleji než díky čemukoli jinému.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Dětský režim nemění vysvětlení.",
            a: [
              "Dětský režim přepne text jen tam, kde už pro slovo existuje vysvětlení pro děti. U úplně nových slov, která jste právě vyhledali, počkejte 10 až 15 sekund. Dětská verze se poprvé vytváří přímo na místě.",
              "A ještě: dětský režim vyžaduje Clear nebo Deep. Pokud máte Basic, přepínač vám nabídne přechod na vyšší plán. Nepřihlášení uživatelé dostanou výzvu k registraci.",
            ],
          },
          {
            id: "voice-fails",
            q: "Hlasové vyhledávání nefunguje.",
            a: [
              "Hlasové vyhledávání potřebuje oprávnění k mikrofonu. Většina prohlížečů se ptá jednou pro každý web. Pokud jste omylem klikli na Blokovat, musíte to změnit ručně: klikněte na ikonu zámku nebo informací vedle gadit.app v adresním řádku, pak Nastavení webu, pak Mikrofon, pak Povolit.",
              "V Safari na iOS vyžaduje přístup k mikrofonu také přepínač v Nastavení → Safari → Mikrofon. Hlas je zatím funkce plánů Clear a Deep: uživatelé Basic uvidí nabídku vyššího plánu, nepřihlášení návštěvníci výzvu k přihlášení.",
            ],
          },
          {
            id: "no-image",
            q: "Nedaří se mi vytvořit obrázek ke slovu.",
            a: [
              "Vytváření obrázků je funkce plánů Clear a Deep s měsíčním limitem. Clear má 30 obrázků měsíčně, Deep 100. Pokud jste limit vyčerpali, zobrazí se blokace. Limit se obnovuje 1. dne každého měsíce.",
              "Pokud limit vyčerpaný nemáte a chyby se přesto objevují, bývá to obvykle dočasné. Zkuste to znovu za 30 sekund. Opakované selhání je chyba. Nahlaste ji prosím ze stránky slova.",
            ],
          },
          {
            id: "save-word",
            q: "Jak uložím slovo do sešitu?",
            a: [
              "Na stránce výsledku libovolného slova klepněte u nadpisu na Uložit do sešitu. Sešit je funkce plánů Clear a Deep, kde si uložená slova můžete později zopakovat, prohlédnout je v zobrazení galaxie a spouštět chytré procvičování (Deep).",
              "Slova, která jste uložili a aspoň jednou otevřeli, jsou dostupná offline z místní mezipaměti. Offline balíček navíc ukládá nejoblíbenější slova ve vašem jazyce, takže jste připraveni i bez internetu.",
            ],
          },
          {
            id: "offline",
            q: "Jak funguje offline režim?",
            a: [
              "Slova, která jste už zobrazili, se ukládají místně. Když je otevřete znovu bez internetu, načtou se okamžitě. Celý offline balíček (nejčastější slova ve vašem jazyce) si stáhnete na vyžádání ze stránky sešitu.",
              "Hledání úplně nového slova stále vyžaduje připojení, protože Gadit musí definici vytvořit od začátku. Offline mezipaměť je pro slova, která jste už prozkoumali.",
            ],
          },
          {
            id: "slow",
            q: "Aplikace působí pomalu.",
            a: [
              "První vyhledání slova je nejpomalejší, protože Gadit vytváří celý výsledek od začátku: obvykle pár sekund, u složitých slov někdy déle. Další vyhledání stejného slova jsou okamžitá, z mezipaměti.",
              "Pokud je pomalé všechno, zkuste tvrdé obnovení: Cmd+Shift+R na Macu, Ctrl+Shift+R ve Windows. Pokud pomalost přetrvává na všech stránkách, napište nám prosím svou zemi a prohlížeč, aby tým mohl zkontrolovat síťovou trasu z vašeho regionu k našim serverům.",
            ],
          },
          {
            id: "word-not-found",
            q: "Po vyhledání slova se nezobrazil žádný výsledek. Co se děje?",
            a: [
              "Nejdřív zkontrolujte pravopis. Gadit si s drobnými překlepy většinou poradí, ale špatná samohláska nebo chybějící písmeno ho může zmást. Pokud se objeví navržená oprava, zkuste ji.",
              "Kromě toho: u velmi vzácných nebo slangových slov nemusí být výsledek dost jistý. Pokud víte, že slovo existuje, klikněte na tlačítko Nahlásit na stránce výsledku (nebo na chybové obrazovce) a dejte nám vědět. Každé hlášení projdeme a skutečná chybějící slova doplníme do systému.",
            ],
          },
          {
            id: "change-language",
            q: "Jak změním jazyk rozhraní?",
            a: [
              "Vpravo nahoře na každé stránce uvidíte malou ikonu vlajky (nebo název aktuálního jazyka). Klepněte na ni a vyberte z více než 30 jazyků: angličtina, řečtina, hebrejština, arabština, ruština, španělština, portugalština, francouzština, němčina, čeština, slovenština, italština, japonština, hindština, amharština, zuluština.",
              "Vaše volba se uloží v tomto zařízení. Vše se znovu načte v novém jazyce: rozhraní, nabídky, budoucí definice slov, příklady, vysvětlení pro děti, dokonce i etymologie. Výsledky uložené v mezipaměti ve starém jazyce zůstanou, dokud tato slova znovu nevyhledáte.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partnerský program",
        items: [
          {
            id: "join-partner",
            q: "Jak se stanu partnerem Gadit?",
            a: [
              "Otevřete /partners z libovolné stránky a klikněte na \"Stát se partnerem\". Zaregistrujte se jménem a e-mailem a váš jedinečný doporučující odkaz i přehled pro sledování kliknutí a provizí jsou hned připravené. Na schválení se nečeká.",
              "Připojení je zdarma a otevřené komukoli. Abyste se stali partnerem, nepotřebujete předplatné Gadit.",
            ],
          },
          {
            id: "commission-model",
            q: "Jak se počítají provize?",
            a: [
              "Standardní podmínky jsou 25 % z každé platby, kterou zákazník provede během prvního roku. Po prvním roce získáváte 10 % z každé platby, dokud zákazník platí.",
              "Funguje to stejně pro měsíční i roční plány, protože provize se počítá z každé skutečné platby. Pokud zákazník předplatné zruší, vaše provize končí jeho poslední platbou.",
              "Tým může pro konkrétní partnery nastavit jiné sazby. Vaše vlastní sazby vždy uvidíte v partnerském přehledu, kam se dostanete přes /partners.",
            ],
          },
          {
            id: "payout",
            q: "Kdy dostanu výplatu?",
            a: [
              "Měsíčně, jakmile váš zůstatek přesáhne $50. Použijeme způsob výplaty, který jste nastavili v partnerském přehledu (bankovní převod, PayPal a podobně). $50 je minimální hranice, ne strop. Vydělat můžete mnohem víc, výplatu jen dostanete, až hranici překročíte.",
              "Provize se uvolňují 30 dní po platbě předplatného, kvůli lhůtě pro vrácení peněz. Předplatné z ledna se tedy uvolní na začátku února a dostanete ho v nejbližší výplatě, jakmile zůstatek přesáhne $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Jsem v programu, ale můj přehled je prázdný.",
            a: [
              "Statistiky se zobrazí po prvním kliknutí na váš odkaz. Prázdný přehled jen znamená, že zatím nikdo neklikl. Sdílejte odkaz. Jakmile začne aktivita, přehled se aktualizuje téměř v reálném čase.",
              "Pokud jste odkaz sdíleli a někdo se zaregistroval, ale přehled to neukazuje, napište nám přibližný čas registrace a tým přiřazení zkontroluje.",
            ],
          },
          {
            id: "attribution-window",
            q: "Jak dlouho můj doporučující odkaz sleduje návštěvníka?",
            a: [
              "Šedesát dní. Když návštěvník klikne na váš odkaz, uložíme cookie, která vás označí jako doporučitele. Pokud se zaregistruje a předplatí si službu kdykoli během následujících 60 dní (i když web opustí a vrátí se později přes vyhledávání Google), přiřazení se stále připíše vám.",
              "Mazání cookies: pokud návštěvník před registrací vymaže cookies nebo změní prohlížeč či zařízení, přiřazení se může ztratit. Na to řešení neexistuje, ale 60 dní je ve srovnání s většinou partnerských programů štědrá lhůta.",
            ],
          },
          {
            id: "missing-commission",
            q: "Někdo se zaregistroval přes můj odkaz, ale provizi nevidím.",
            a: [
              "Nejčastěji jde o načasování: registrace se v přehledu objeví během pár minut, ale provize se zaúčtuje až po skutečném zaplacení předplatného (což může být o několik dní později, pokud má zákazník zkušební období zdarma). Podívejte se znovu po skončení zkušebního období.",
              "Pokud bylo předplatné zaplacené a provizi ani po 48 hodinách nevidíte, napište nám přibližný čas registrace a e-mail nebo přibližné jméno předplatitele, pokud je znáte. Tým projde celý řetězec přiřazení a případnou chybu ručně opraví.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Obecné",
        items: [
          {
            id: "what-is-gadit",
            q: "Co je Gadit?",
            a: [
              "Vícejazyčný slovník vytvořený tak, aby vám slovo opravdu docvaklo, a ne jen podal jednořádkovou definici. Každé slovo se otevře se všemi významy, skutečnými příklady ke každému významu, idiomy, etymologií, volitelným obrázkem a (s Clear a Deep) vysvětlením pro děti, vlastními větami se zpětnou vazbou a kvízy.",
              "Aktuálně víc než 30 jazyků rozhraní. Interně tomu tým říká \"udělat slovu GAD\": pochopit slovo až do konce, a ne ho jen přeložit.",
            ],
          },
          {
            id: "languages",
            q: "Jaké jazyky podporujete?",
            a: [
              "Rozhraní: angličtina, řečtina, hebrejština, arabština, ruština, španělština, portugalština, francouzština, němčina, čeština, slovenština, italština, japonština, zuluština.",
              "Slovo můžete vyhledat v kterémkoli z těchto jazyků a definici, příklady i vše ostatní dostanete ve zvoleném jazyce rozhraní. Hebrejština a arabština jsou plně RTL a používají svá vlastní písma.",
            ],
          },
          {
            id: "kid-safety",
            q: "Je Gadit bezpečný pro děti?",
            a: [
              "Gadit je navržený tak, aby ho rodič mohl bezpečně používat spolu s dítětem. Dětský režim vytváří vysvětlení, která jsou jednoduchá, konkrétní a přiměřená věku (zhruba na úrovni 5 až 10 let), pomocí stejného nástroje, který vytváří obsah pro dospělé, s výslovnými pokyny ke zjednodušení. Dětem se nikdy nezobrazuje obsah vytvořený uživateli.",
              "V souladu s našimi zásadami a pravidly ochrany soukromí dětí po celém světě je samostatné vlastnictví účtu možné od 13 let. Běžný model je účet rodiče, který rodič používá společně s dítětem, a právě pro to je dětský režim vytvořený.",
            ],
          },
          {
            id: "data",
            q: "Kde jsou uložená moje data? Prodáváte je?",
            a: [
              "Účet, historie, sešit a vytvořené obrázky jsou bezpečně uložené ve Firebase, v úložišti šifrované. Vaše data nikomu neprodáváme. Sdílíme jen to, co je potřeba k provozu Gadit (úložiště, platby, poskytovatelé obsahu), jak uvádějí Zásady ochrany osobních údajů.",
              "Sešit můžete kdykoli exportovat nebo účet smazat na stránce Účet.",
            ],
          },
          {
            id: "contact-direct",
            q: "Jak vás mohu kontaktovat přímo?",
            a: [
              "Použijte tlačítko e-mailu dole na této stránce. Zpráva jde rovnou do schránky týmu. Každou zprávu si přečteme a odpovíme do 24 až 48 hodin (často dřív).",
              "Pro podporu je e-mail lepší než chat: tým má čas si vše pečlivě přečíst a promyšleně odpovědět. Telefonickou podporu zatím nenabízíme.",
            ],
          },
        ],
      },
    ],
  },
  sk: {
    eyebrow: "Centrum pomoci",
    heading: "Nájdite odpoveď, rýchlo.",
    lede: "Časté otázky a postupy krok za krokom, zoradené podľa oblastí. Ak tu svoj problém nenájdete, ozvite sa nášmu tímu, kontakt nájdete dole na stránke.",
    stillNeedHelpHeading: "Stále si neviete rady?",
    stillNeedHelpBody: "Napíšte nám priamo. Každú správu si tím prečíta a odpoveď dostanete do jedného až dvoch dní.",
    emailCta: "Napíšte nám e-mail",
    responseTime: "Zvyčajná doba odpovede: do 24 až 48 hodín.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Platby a predplatné",
        items: [
          {
            id: "change-card",
            q: "Ako zmením platobnú kartu pri svojom predplatnom?",
            a: [
              "Na novú kartu prejdete za menej ako minútu a nemusíte nič rušiť. Vaše súčasné predplatné beží ďalej, len na novú kartu.",
              "1. Prihláste sa na gadit.app a otvorte stránku Účet (vpravo hore). 2. Kliknite na \"Spravovať platby\". 3. Otvorí sa zabezpečená stránka Stripe. Kliknite na \"Pridať platobnú metódu\", zadajte novú kartu a nastavte ju ako predvolenú. 4. Ak chcete, starú kartu odstráňte.",
              "Od ďalšieho zúčtovacieho obdobia sa všetko strháva z novej karty. Predchádzajúca platba (už stiahnutá) zostáva na starej karte. Vracať peniaze netreba, ak si to výslovne neželáte.",
            ],
          },
          {
            id: "cancel",
            q: "Ako zruším predplatné?",
            a: [
              "Sami, kedykoľvek. Prihláste sa, otvorte Účet a pod svojím plánom ťuknite na Zrušiť predplatné.",
              "Prístup vám zostane do konca obdobia, ktoré už máte zaplatené. Potom sa účet vráti na Basic (zadarmo). Vaše uložené slová, história aj zošit zostanú v bezpečí a dostupné.",
              "Ak zrušíte omylom alebo si to rozmyslíte, predplatné môžete na tej istej stránke obnoviť, kým obdobie neskončí.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ako prejdem z Clear na Deep (alebo naopak)?",
            a: [
              "Účet, potom Spravovať platby, potom Upraviť predplatné. Vyberte nový plán.",
              "Stripe rozdiel v cene vypočíta automaticky, pomerne podľa dní zostávajúcich do konca aktuálneho obdobia. Pri prechode na vyšší plán zaplatíte len rozdiel za zvyšok obdobia. Pri prechode na nižší plán sa kredit započíta do ďalšej platby.",
            ],
          },
          {
            id: "invoice",
            q: "Ako si stiahnem faktúru alebo potvrdenie?",
            a: [
              "Účet, potom Spravovať platby, potom História faktúr. Ku každej platbe je na stiahnutie potvrdenie v PDF s fakturačnými údajmi, ktoré ste uložili.",
              "Ak na faktúre potrebujete iné meno, adresu alebo DIČ (napríklad názov firmy kvôli daniam), upravte fakturačné údaje na tej istej stránke ešte pred stiahnutím. Ďalšie potvrdenie už použije nové údaje.",
            ],
          },
          {
            id: "portal-error",
            q: "Po kliknutí na Spravovať platby sa objavila chyba. Čo teraz?",
            a: [
              "Dve časté príčiny. Po prvé, váš účet nemá aktívne predplatné v Stripe. Po druhé, Stripe možno pre váš účet ešte nemá úplný fakturačný profil.",
              "Jednoduchá prvá kontrola: odhláste sa, znova sa prihláste e-mailom, ktorý ste použili pri platbe, a skúste to znova. Ak to stále nefunguje, napíšte nám s e-mailom svojho účtu a tím to na našej strane o chvíľu opraví.",
            ],
          },
          {
            id: "autorenew",
            q: "Obnovuje sa moje predplatné automaticky?",
            a: [
              "Áno. Mesačné plány sa obnovujú každý mesiac, ročné plány každý rok v ten istý deň. Dátum ďalšej platby uvidíte vo svojom účte aj na portáli Stripe.",
              "Ak automatické obnovenie nechcete, zrušte predplatné kedykoľvek pred dátumom obnovenia. Zrušenie neplatí okamžite. Prístup vám zostane počas celého už zaplateného obdobia.",
            ],
          },
          {
            id: "refund",
            q: "Je možné vrátiť peniaze?",
            a: [
              "Áno. Ak od nákupu uplynulo menej ako 14 dní a službu ste veľmi nevyužili, napíšte nám s e-mailom svojho účtu a krátkou poznámkou, prečo. Takéto žiadosti schvaľujeme bez dohadovania.",
              "Ak uplynulo viac ako 14 dní, tím posudzuje každý prípad samostatne. Zrušte predplatné, aby sa ďalej neobnovovalo, a napíšte nám e-mail.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Vidím platbu, ktorú nepoznám.",
            a: [
              "Platby sa zobrazujú ako GADIT alebo GADIT.APP so sumou $2.99 (Clear mesačne), $4.99 (Deep mesačne), $29.99 (Clear ročne) alebo $49.99 (Deep ročne). Ak to nesedí, môže ísť o inú službu.",
              "Ak ste si istí, že platba nie je vaša, zatiaľ ju nereklamujte cez banku. Najprv nám napíšte priamo s dátumom a sumou. Tím platbu dohľadá, vysvetlí, o čo ide, a v prípade potreby peniaze vráti. Reklamácia cez banku môže budúce platby skomplikovať, takže vyriešenie cez podporu býva rýchlejšie a bezpečnejšie.",
            ],
          },
          {
            id: "failed-payment",
            q: "Platba zlyhala. Čo mám robiť?",
            a: [
              "Stripe neúspešné platby v nasledujúcich dňoch automaticky niekoľkokrát zopakuje. Väčšina problémov sa vyrieši sama, keď banka uvoľní blokáciu alebo je na karte dosť prostriedkov.",
              "Ak to chcete vyriešiť hneď, prejdite do Účet → Spravovať platby → Pridať platobnú metódu, zadajte funkčnú kartu a nastavte ju ako predvolenú. Stripe neúspešnú platbu na novej karte okamžite zopakuje. Ak vaše predplatné už kleslo na Basic, môžete si ho znova objednať na stránke Cenník a váš zošit zostane nedotknutý.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Aký je rozdiel medzi Basic, Clear a Deep?",
            a: [
              "Basic (zadarmo): až 20 vyhľadaní slov denne, všetky významy, príklady ku každému významu, idiómy a pôvod slova. Na základné vyhľadávanie netreba registráciu.",
              "Clear ($2.99/mesiac alebo $29.99/rok): neobmedzené vyhľadávanie, vysvetlenia pre deti, obrázok ku slovu (30 mesačne), vlastné vety so spätnou väzbou, podrobnosti k idiómom a 30 dní histórie hľadania.",
              "Deep ($4.99/mesiac alebo $49.99/rok): všetko z Clear a navyše precvičovacie kvízy, osobný zošit s inteligentným opakovaním v intervaloch, rozlišovanie podobných slov a väčší limit obrázkov (100 mesačne).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Účet a prihlásenie",
        items: [
          {
            id: "no-verification-email",
            q: "Neprišiel mi overovací e-mail.",
            a: [
              "Najprv skontrolujte priečinky Spam a Reklamy. Gmail a Outlook tam e-maily k účtu niekedy presúvajú, kým jeden z nich neoznačíte ako \"Nie je spam\".",
              "Ak tam nie je, adresa mohla byť pri registrácii zadaná s preklepom. Skúste sa zaregistrovať znova a adresu si dôkladne skontrolujte. Ak ste sa registrovali cez Google, overovací e-mail netreba.",
            ],
          },
          {
            id: "forgot-password",
            q: "Zabudnuté heslo.",
            a: [
              "Otvorte prihlasovacie okno a kliknite na \"Zabudli ste heslo?\". Zadajte e-mail, ktorý pre Gadit používate, a do minúty či dvoch vám príde odkaz na obnovenie.",
              "Ak e-mail nepríde, skontrolujte spam. Ak nepríde ani potom, možno ste sa registrovali cez Google, a nie e-mailom a heslom. Skúste tlačidlo \"Pokračovať cez Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Heslo mám určite správne, ale zobrazuje sa \"Nesprávny e-mail alebo heslo\".",
            a: [
              "Skontrolujte tri veci. Po prvé Caps Lock. Po druhé medzeru na konci pri kopírovaní a vkladaní. Po tretie, či ste sa nezaregistrovali cez Google namiesto hesla (vtedy použite \"Pokračovať cez Google\").",
              "Stále nič? Obnovte heslo v tom istom okne. Začnete načisto.",
            ],
          },
          {
            id: "google-fails",
            q: "Prihlásenie cez Google nefunguje.",
            a: [
              "Najčastejšia príčina: váš prehliadač pre gadit.app blokuje cookies tretích strán alebo vyskakovacie okná. Povoľte ich v povoleniach v paneli s adresou a skúste to znova.",
              "V režime inkognito je prihlásenie cez Google zámerne obmedzené. Prepnite do bežného okna prehliadača.",
            ],
          },
          {
            id: "change-email",
            q: "Ako zmením e-mail pri svojom účte?",
            a: [
              "Účet, kliknite na svoj e-mail, Zmeniť e-mail. Novú adresu treba potvrdiť, kým sa zmena uloží. Predplatné, história aj zošit sa prenesú.",
              "Ak je e-mail prepojený so zákazníkom v Stripe, zmeňte ho aj na fakturačnom portáli Stripe, aby budúce potvrdenia chodili na novú adresu.",
            ],
          },
          {
            id: "delete-account",
            q: "Ako zmažem svoj účet?",
            a: [
              "Účet, dole na stránke, Zmazať účet. Je to nevratné. Predplatné sa zruší, zošit a história sa vymažú a e-mail sa uvoľní na novú registráciu.",
              "Záznamy Stripe o minulých platbách zostávajú (zo zákona ich musíme uchovávať na účtovné účely). Nič iné nezostane.",
            ],
          },
          {
            id: "share-account",
            q: "Môže môj partner alebo dieťa zdieľať môj účet?",
            a: [
              "Na jednom účte môže byť v jednej chvíli prihlásený len jeden používateľ. Detský režim umožňuje, aby jeden účet Clear alebo Deep slúžil rodičovi aj dieťaťu: prepnite prepínač a definície sa zobrazia zrozumiteľne pre deti, bez samostatného prihlasovania.",
              "Ak dvaja dospelí chcú každý vlastný zošit a pokrok, vytvorte dva účty. Clear stojí $2.99 mesačne za účet.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Myslím, že mám omylom dva účty. Čo teraz?",
            a: [
              "Zvyčajne sa to stane, keď sa niekto s tou istou adresou raz zaregistruje cez Google a raz e-mailom a heslom, alebo keď sa zaregistrujete dvakrát s rôznymi e-mailovými adresami. Každá registrácia vytvorí samostatný účet Gadit s vlastným zošitom, históriou a stavom predplatného.",
              "Napíšte nám obe e-mailové adresy (alebo UID zo stránky Účet) a ktorý účet si chcete ponechať. Tím zlúči zošity a históriu do vybraného účtu a ten druhý čisto uzavrie. O žiadne údaje neprídete.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Používanie Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Myslím, že definícia je nesprávna. Čo mám robiť?",
            a: [
              "Na každej stránke s výsledkom je dole malé tlačidlo \"Nahlásiť\". Ťuknite naň, vyberte kategóriu (definícia, etymológia, príklad, idióm, vysvetlenie pre deti a podobne) a napíšte krátku poznámku. Príde priamo tímu a každé hlásenie prejdeme.",
              "Nebojte sa, že ste príliš puntičkárski. Slovník sa vďaka takejto spätnej väzbe zlepšuje rýchlejšie ako vďaka čomukoľvek inému.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Detský režim nemení vysvetlenie.",
            a: [
              "Detský režim prepne text len tam, kde už pre slovo existuje vysvetlenie pre deti. Pri úplne nových slovách, ktoré ste práve vyhľadali, počkajte 10 až 15 sekúnd. Detská verzia sa prvýkrát vytvára priamo na mieste.",
              "A ešte: detský režim vyžaduje Clear alebo Deep. Ak máte Basic, prepínač vám ponúkne prechod na vyšší plán. Neprihlásení používatelia dostanú výzvu na registráciu.",
            ],
          },
          {
            id: "voice-fails",
            q: "Hlasové vyhľadávanie nefunguje.",
            a: [
              "Hlasové vyhľadávanie potrebuje povolenie pre mikrofón. Väčšina prehliadačov sa pýta raz pre každú stránku. Ak ste omylom klikli na Blokovať, musíte to zmeniť ručne: kliknite na ikonu zámky alebo informácií vedľa gadit.app v paneli s adresou, potom Nastavenia stránky, potom Mikrofón, potom Povoliť.",
              "V Safari na iOS vyžaduje prístup k mikrofónu aj prepínač v Nastavenia → Safari → Mikrofón. Hlas je zatiaľ funkcia plánov Clear a Deep: používatelia Basic uvidia ponuku vyššieho plánu, neprihlásení návštevníci výzvu na prihlásenie.",
            ],
          },
          {
            id: "no-image",
            q: "Nedarí sa mi vytvoriť obrázok ku slovu.",
            a: [
              "Vytváranie obrázkov je funkcia plánov Clear a Deep s mesačným limitom. Clear má 30 obrázkov mesačne, Deep 100. Ak ste limit vyčerpali, zobrazí sa blokácia. Limit sa obnovuje 1. dňa každého mesiaca.",
              "Ak limit vyčerpaný nemáte a chyby sa aj tak objavujú, býva to zvyčajne dočasné. Skúste to znova o 30 sekúnd. Opakované zlyhanie je chyba. Nahláste ju, prosím, zo stránky slova.",
            ],
          },
          {
            id: "save-word",
            q: "Ako uložím slovo do zošita?",
            a: [
              "Na stránke výsledku ľubovoľného slova ťuknite pri nadpise na Uložiť do zošita. Zošit je funkcia plánov Clear a Deep, kde si uložené slová môžete neskôr zopakovať, pozrieť si ich v zobrazení galaxie a spúšťať inteligentné precvičovanie (Deep).",
              "Slová, ktoré ste uložili a aspoň raz otvorili, sú dostupné offline z miestnej vyrovnávacej pamäte. Offline balík navyše ukladá najobľúbenejšie slová vo vašom jazyku, takže ste pripravení aj bez internetu.",
            ],
          },
          {
            id: "offline",
            q: "Ako funguje offline režim?",
            a: [
              "Slová, ktoré ste si už pozreli, sa ukladajú miestne. Keď ich znova otvoríte bez internetu, načítajú sa okamžite. Celý offline balík (najčastejšie slová vo vašom jazyku) si stiahnete na požiadanie zo stránky zošita.",
              "Hľadanie úplne nového slova stále vyžaduje pripojenie, pretože Gadit musí definíciu vytvoriť od začiatku. Offline vyrovnávacia pamäť je pre slová, ktoré ste už preskúmali.",
            ],
          },
          {
            id: "slow",
            q: "Aplikácia pôsobí pomaly.",
            a: [
              "Prvé vyhľadanie slova je najpomalšie, pretože Gadit vytvára celý výsledok od začiatku: zvyčajne pár sekúnd, pri zložitých slovách niekedy dlhšie. Ďalšie vyhľadania toho istého slova sú okamžité, z vyrovnávacej pamäte.",
              "Ak je pomalé všetko, skúste tvrdé obnovenie: Cmd+Shift+R na Macu, Ctrl+Shift+R vo Windows. Ak pomalosť pretrváva na všetkých stránkach, napíšte nám, prosím, svoju krajinu a prehliadač, aby tím mohol skontrolovať sieťovú trasu z vášho regiónu k našim serverom.",
            ],
          },
          {
            id: "word-not-found",
            q: "Po vyhľadaní slova sa nezobrazil žiadny výsledok. Čo sa deje?",
            a: [
              "Najprv skontrolujte pravopis. Gadit si s drobnými preklepmi väčšinou poradí, ale nesprávna samohláska alebo chýbajúce písmeno ho môže zmiasť. Ak sa objaví navrhovaná oprava, skúste ju.",
              "Okrem toho: pri veľmi zriedkavých alebo slangových slovách nemusí byť výsledok dosť istý. Ak viete, že slovo existuje, kliknite na tlačidlo Nahlásiť na stránke výsledku (alebo na chybovej obrazovke) a dajte nám vedieť. Každé hlásenie prejdeme a skutočne chýbajúce slová doplníme do systému.",
            ],
          },
          {
            id: "change-language",
            q: "Ako zmením jazyk rozhrania?",
            a: [
              "Vpravo hore na každej stránke uvidíte malú ikonu vlajky (alebo názov aktuálneho jazyka). Ťuknite na ňu a vyberte z viac ako 30 jazykov: angličtina, gréčtina, hebrejčina, arabčina, ruština, španielčina, portugalčina, francúzština, nemčina, čeština, slovenčina, taliančina, japončina, hindčina, amharčina, zuluština.",
              "Vaša voľba sa uloží v tomto zariadení. Všetko sa znova načíta v novom jazyku: rozhranie, ponuky, budúce definície slov, príklady, vysvetlenia pre deti, dokonca aj etymológia. Výsledky uložené vo vyrovnávacej pamäti v starom jazyku zostanú, kým tieto slová znova nevyhľadáte.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partnerský program",
        items: [
          {
            id: "join-partner",
            q: "Ako sa stanem partnerom Gadit?",
            a: [
              "Otvorte /partners z ľubovoľnej stránky a kliknite na \"Stať sa partnerom\". Zaregistrujte sa menom a e-mailom a váš jedinečný odporúčací odkaz aj prehľad na sledovanie kliknutí a provízií sú hneď pripravené. Na schválenie sa nečaká.",
              "Pripojenie je zadarmo a otvorené pre každého. Aby ste sa stali partnerom, nepotrebujete predplatné Gadit.",
            ],
          },
          {
            id: "commission-model",
            q: "Ako sa počítajú provízie?",
            a: [
              "Štandardné podmienky sú 25 % z každej platby, ktorú zákazník uskutoční počas prvého roka. Po prvom roku získavate 10 % z každej platby, kým zákazník platí.",
              "Funguje to rovnako pre mesačné aj ročné plány, pretože provízia sa počíta z každej skutočnej platby. Ak zákazník predplatné zruší, vaša provízia končí jeho poslednou platbou.",
              "Tím môže pre konkrétnych partnerov nastaviť iné sadzby. Vaše vlastné sadzby vždy uvidíte v partnerskom prehľade, kam sa dostanete cez /partners.",
            ],
          },
          {
            id: "payout",
            q: "Kedy dostanem výplatu?",
            a: [
              "Mesačne, keď váš zostatok prekročí $50. Použijeme spôsob výplaty, ktorý ste nastavili v partnerskom prehľade (bankový prevod, PayPal a podobne). $50 je minimálna hranica, nie strop. Zarobiť môžete oveľa viac, výplatu len dostanete, keď hranicu prekročíte.",
              "Provízie sa uvoľňujú 30 dní po platbe predplatného, kvôli lehote na vrátenie peňazí. Predplatné z januára sa teda uvoľní začiatkom februára a dostanete ho v najbližšej výplate, keď zostatok prekročí $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Som v programe, ale môj prehľad je prázdny.",
            a: [
              "Štatistiky sa zobrazia po prvom kliknutí na váš odkaz. Prázdny prehľad len znamená, že zatiaľ nikto neklikol. Zdieľajte odkaz. Keď sa začne aktivita, prehľad sa aktualizuje takmer v reálnom čase.",
              "Ak ste odkaz zdieľali a niekto sa zaregistroval, ale prehľad to neukazuje, napíšte nám približný čas registrácie a tím priradenie skontroluje.",
            ],
          },
          {
            id: "attribution-window",
            q: "Ako dlho môj odporúčací odkaz sleduje návštevníka?",
            a: [
              "Šesťdesiat dní. Keď návštevník klikne na váš odkaz, uložíme cookie, ktorá vás označí ako odporúčateľa. Ak sa zaregistruje a predplatí si službu kedykoľvek počas nasledujúcich 60 dní (aj keď stránku opustí a vráti sa neskôr cez vyhľadávanie Google), priradenie sa stále pripíše vám.",
              "Mazanie cookies: ak návštevník pred registráciou vymaže cookies alebo zmení prehliadač či zariadenie, priradenie sa môže stratiť. Na to riešenie neexistuje, ale 60 dní je v porovnaní s väčšinou partnerských programov štedrá lehota.",
            ],
          },
          {
            id: "missing-commission",
            q: "Niekto sa zaregistroval cez môj odkaz, ale províziu nevidím.",
            a: [
              "Najčastejšie ide o načasovanie: registrácia sa v prehľade objaví do pár minút, ale provízia sa zaúčtuje až po skutočnom zaplatení predplatného (čo môže byť o niekoľko dní neskôr, ak má zákazník skúšobné obdobie zadarmo). Pozrite sa znova po skončení skúšobného obdobia.",
              "Ak bolo predplatné zaplatené a províziu ani po 48 hodinách nevidíte, napíšte nám približný čas registrácie a e-mail alebo približné meno predplatiteľa, ak ich poznáte. Tím prejde celý reťazec priradenia a prípadnú chybu ručne opraví.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Všeobecné",
        items: [
          {
            id: "what-is-gadit",
            q: "Čo je Gadit?",
            a: [
              "Viacjazyčný slovník vytvorený tak, aby vám slovo naozaj docvaklo, a nie len podal jednoriadkovú definíciu. Každé slovo sa otvorí so všetkými významami, skutočnými príkladmi ku každému významu, idiómami, etymológiou, voliteľným obrázkom a (s Clear a Deep) vysvetlením pre deti, vlastnými vetami so spätnou väzbou a kvízmi.",
              "Aktuálne viac ako 30 jazykov rozhrania. Interne tomu tím hovorí \"urobiť slovu GAD\": pochopiť slovo až do konca, a nie ho len preložiť.",
            ],
          },
          {
            id: "languages",
            q: "Aké jazyky podporujete?",
            a: [
              "Rozhranie: angličtina, gréčtina, hebrejčina, arabčina, ruština, španielčina, portugalčina, francúzština, nemčina, čeština, slovenčina, taliančina, japončina, zuluština.",
              "Slovo môžete vyhľadať v ktoromkoľvek z týchto jazykov a definíciu, príklady aj všetko ostatné dostanete vo zvolenom jazyku rozhrania. Hebrejčina a arabčina sú plne RTL a používajú svoje vlastné písma.",
            ],
          },
          {
            id: "kid-safety",
            q: "Je Gadit bezpečný pre deti?",
            a: [
              "Gadit je navrhnutý tak, aby ho rodič mohol bezpečne používať spolu s dieťaťom. Detský režim vytvára vysvetlenia, ktoré sú jednoduché, konkrétne a primerané veku (približne na úrovni 5 až 10 rokov), pomocou toho istého nástroja, ktorý vytvára obsah pre dospelých, s výslovnými pokynmi na zjednodušenie. Deťom sa nikdy nezobrazuje obsah vytvorený používateľmi.",
              "V súlade s našimi zásadami a pravidlami ochrany súkromia detí na celom svete je samostatné vlastníctvo účtu možné od 13 rokov. Bežný model je účet rodiča, ktorý rodič používa spolu s dieťaťom, a práve na to je detský režim vytvorený.",
            ],
          },
          {
            id: "data",
            q: "Kde sú uložené moje údaje? Predávate ich?",
            a: [
              "Účet, história, zošit a vytvorené obrázky sú bezpečne uložené vo Firebase, v úložisku šifrované. Vaše údaje nikomu nepredávame. Zdieľame len to, čo je potrebné na prevádzku Gadit (úložisko, platby, poskytovatelia obsahu), ako uvádzajú Zásady ochrany osobných údajov.",
              "Zošit môžete kedykoľvek exportovať alebo účet zmazať na stránke Účet.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ako vás môžem kontaktovať priamo?",
            a: [
              "Použite tlačidlo e-mailu dole na tejto stránke. Správa ide rovno do schránky tímu. Každú správu si prečítame a odpovieme do 24 až 48 hodín (často skôr).",
              "Na podporu je e-mail lepší ako chat: tím má čas si všetko pozorne prečítať a premyslene odpovedať. Telefonickú podporu zatiaľ neponúkame.",
            ],
          },
        ],
      },
    ],
  },
  it: {
    eyebrow: "Centro assistenza",
    heading: "Trova subito una risposta.",
    lede: "Domande frequenti e soluzioni passo passo, organizzate per area. Se non trovi il tuo problema, contatta il team in fondo alla pagina.",
    stillNeedHelpHeading: "Ti serve ancora aiuto?",
    stillNeedHelpBody: "Scrivici direttamente. Il team legge ogni messaggio e risponde entro un giorno o due.",
    emailCta: "Scrivici un'email",
    responseTime: "Risposta tipica: entro 24-48 ore.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Pagamenti e abbonamento",
        items: [
          {
            id: "change-card",
            q: "Come cambio la carta di credito del mio abbonamento?",
            a: [
              "Puoi passare a una nuova carta in meno di un minuto, senza annullare nulla. Il tuo abbonamento attuale continua, semplicemente sulla nuova carta.",
              "1. Accedi su gadit.app e apri la pagina Account (in alto a destra). 2. Clicca su \"Gestisci pagamenti\". 3. Si apre una pagina sicura di Stripe. Clicca su \"Aggiungi metodo di pagamento\", inserisci la nuova carta e impostala come predefinita. 4. Se vuoi, rimuovi la vecchia carta.",
              "Dal ciclo di fatturazione successivo, tutto viene addebitato sulla nuova carta. L'addebito precedente (già incassato) resta sulla vecchia carta. Non serve alcun rimborso, a meno che tu non lo voglia espressamente.",
            ],
          },
          {
            id: "cancel",
            q: "Come annullo il mio abbonamento?",
            a: [
              "In autonomia, in qualsiasi momento. Accedi, apri Account e tocca Annulla abbonamento sotto il tuo piano.",
              "L'accesso resta attivo fino alla fine del periodo che hai già pagato. Dopo, l'account torna a Basic (gratuito). Le parole salvate, la cronologia e il quaderno restano al sicuro e accessibili.",
              "Se annulli per sbaglio o cambi idea, puoi riattivare l'abbonamento dalla stessa pagina prima che il periodo finisca.",
            ],
          },
          {
            id: "switch-plan",
            q: "Come passo da Clear a Deep (o viceversa)?",
            a: [
              "Account, poi Gestisci pagamenti, poi Aggiorna abbonamento. Scegli il nuovo piano.",
              "Stripe calcola automaticamente la differenza di prezzo, in proporzione ai giorni che mancano alla fine del periodo in corso. Se passi a un piano superiore, ti viene addebitata solo la differenza per il resto del periodo. Se passi a un piano inferiore, il credito viene applicato alla fattura successiva.",
            ],
          },
          {
            id: "invoice",
            q: "Come scarico una fattura o una ricevuta?",
            a: [
              "Account, poi Gestisci pagamenti, poi Cronologia fatture. Per ogni addebito c'è una ricevuta PDF scaricabile con i dati di fatturazione che hai salvato.",
              "Se ti serve un nome, un indirizzo o una partita IVA diversi sulla fattura (per esempio il nome di un'azienda a fini fiscali), aggiorna i dati di fatturazione nella stessa pagina prima di scaricarla. La ricevuta successiva userà i nuovi dati.",
            ],
          },
          {
            id: "portal-error",
            q: "Ho cliccato su Gestisci pagamenti ma è comparso un errore. E ora?",
            a: [
              "Due cause comuni. Primo, il tuo account non ha un abbonamento Stripe attivo. Secondo, Stripe potrebbe non avere ancora un profilo di fatturazione completo per il tuo account.",
              "Primo controllo semplice: esci, accedi di nuovo con l'email che hai usato al pagamento e riprova. Se continua a non funzionare, contattaci con l'email del tuo account e il team lo sistemerà dal nostro lato in un minuto.",
            ],
          },
          {
            id: "autorenew",
            q: "Il mio abbonamento si rinnova automaticamente?",
            a: [
              "Sì. I piani mensili si rinnovano ogni mese, quelli annuali ogni anno nella stessa data. Puoi vedere la data del prossimo addebito nel tuo account e nel portale di Stripe.",
              "Se non vuoi il rinnovo automatico, annulla in qualsiasi momento prima della data di rinnovo. L'annullamento non è immediato. Mantieni l'accesso per tutto il periodo che hai già pagato.",
            ],
          },
          {
            id: "refund",
            q: "Posso avere un rimborso?",
            a: [
              "Sì. Se l'acquisto risale a meno di 14 giorni fa e il servizio è stato usato poco, scrivici con l'email del tuo account e una breve nota sul motivo. Questi rimborsi vengono approvati senza discussioni.",
              "Se sono passati più di 14 giorni, il team valuta caso per caso. Annulla l'abbonamento perché non continui a rinnovarsi, e scrivici un'email.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Vedo un addebito che non riconosco.",
            a: [
              "Gli addebiti compaiono come GADIT o GADIT.APP con importo $2.99 (Clear mensile), $4.99 (Deep mensile), $29.99 (Clear annuale) o $49.99 (Deep annuale). Se non corrisponde, potrebbe provenire da un altro servizio.",
              "Se sei sicuro che non sia tuo, non contestarlo ancora tramite la banca. Prima scrivici direttamente con data e importo. Il team lo troverà, ti spiegherà di cosa si tratta e, se serve, ti rimborserà. Una contestazione bancaria può complicare i pagamenti futuri, quindi risolvere tramite l'assistenza di solito è più rapido e sicuro.",
            ],
          },
          {
            id: "failed-payment",
            q: "Il mio pagamento non è andato a buon fine. Cosa devo fare?",
            a: [
              "Stripe riprova automaticamente i pagamenti non riusciti alcune volte nei giorni successivi. La maggior parte dei problemi si risolve da sola quando la banca sblocca la transazione o la carta ha fondi sufficienti.",
              "Se vuoi risolvere subito, vai su Account → Gestisci pagamenti → Aggiungi metodo di pagamento, inserisci una carta funzionante e impostala come predefinita. Stripe riproverà subito l'addebito non riuscito sulla nuova carta. Se l'abbonamento è già tornato a Basic, puoi riabbonarti dalla pagina Prezzi e il tuo quaderno resta intatto.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Qual è la differenza tra Basic, Clear e Deep?",
            a: [
              "Basic (gratuito): fino a 20 ricerche di parole al giorno, tutti i significati, esempi per ogni significato, modi di dire e origine della parola. Per le ricerche di base non serve registrarsi.",
              "Clear ($2.99/mese o $29.99/anno): ricerche illimitate, spiegazioni adatte ai bambini, un'immagine per parola (30 al mese), frasi scritte da te con un riscontro, dettagli sui modi di dire e 30 giorni di cronologia delle ricerche.",
              "Deep ($4.99/mese o $49.99/anno): tutto ciò che c'è in Clear, più quiz di esercitazione, il quaderno personale con ripasso intelligente a intervalli, la distinzione tra parole simili e un limite di immagini più alto (100 al mese).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Account e accesso",
        items: [
          {
            id: "no-verification-email",
            q: "Non ho ricevuto l'email di verifica.",
            a: [
              "Controlla prima le cartelle spam e promozioni. Gmail e Outlook a volte spostano lì le email dell'account finché non ne segni una come \"Non è spam\".",
              "Se non c'è, l'indirizzo potrebbe essere stato digitato male durante la registrazione. Prova a registrarti di nuovo e ricontrolla l'indirizzo. Se ti sei registrato con Google, l'email di verifica non serve.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ho dimenticato la password.",
            a: [
              "Apri la finestra di accesso e clicca su \"Password dimenticata?\". Inserisci l'email che usi per Gadit e riceverai un link di reimpostazione entro un paio di minuti.",
              "Se l'email non arriva, controlla lo spam. Se continua a non arrivare, forse ti sei registrato con Google invece che con email e password. Prova il pulsante \"Continua con Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Sono sicuro che la password è giusta, ma compare \"Email o password errate\".",
            a: [
              "Tre cose da controllare. Primo, il blocco maiuscole. Secondo, uno spazio finale quando copi e incolli. Terzo, ti sei registrato con Google invece che con una password (in quel caso usa \"Continua con Google\").",
              "Ancora niente? Reimposta la password dalla stessa finestra. Così riparti da zero.",
            ],
          },
          {
            id: "google-fails",
            q: "L'accesso con Google non funziona.",
            a: [
              "Causa più comune: il browser blocca i cookie di terze parti o i pop-up per gadit.app. Consentili dalle autorizzazioni nella barra degli indirizzi e riprova.",
              "In modalità in incognito l'accesso con Google è limitato di proposito. Passa a una normale finestra del browser.",
            ],
          },
          {
            id: "change-email",
            q: "Come cambio l'email del mio account?",
            a: [
              "Account, clicca sulla tua email, Cambia email. Dovrai confermare il nuovo indirizzo prima che la modifica sia effettiva. Abbonamento, cronologia e quaderno vengono tutti trasferiti.",
              "Se l'email è collegata a un cliente Stripe, aggiornala anche nel portale di fatturazione di Stripe, così le ricevute future arriveranno al nuovo indirizzo.",
            ],
          },
          {
            id: "delete-account",
            q: "Come elimino il mio account?",
            a: [
              "Account, in fondo alla pagina, Elimina account. L'operazione è definitiva. L'abbonamento viene annullato, quaderno e cronologia vengono cancellati e l'email torna libera per una nuova registrazione.",
              "Restano i registri Stripe degli addebiti passati (per legge dobbiamo conservarli a fini contabili). Nient'altro.",
            ],
          },
          {
            id: "share-account",
            q: "Il mio partner o mio figlio possono usare il mio account?",
            a: [
              "Un solo utente collegato per account alla volta. La modalità bambini permette a un unico account Clear o Deep di servire un genitore e un bambino: attiva l'interruttore e le definizioni appaiono adatte ai bambini, senza accessi separati.",
              "Per due adulti che vogliono ciascuno il proprio quaderno e i propri progressi, create due account. Clear costa $2.99 al mese per account.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Credo di avere due account per errore. E ora?",
            a: [
              "Di solito succede quando qualcuno si registra una volta con Google e una volta con email e password usando lo stesso indirizzo, oppure quando ti registri due volte con indirizzi email diversi. Ogni registrazione crea un account Gadit separato, con il proprio quaderno, la propria cronologia e il proprio stato di abbonamento.",
              "Scrivici entrambi gli indirizzi email (o gli UID dalla pagina Account) e indica quale vuoi tenere. Il team unirà quaderni e cronologia sull'account che scegli e chiuderà l'altro in modo pulito. Nessun dato perso.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Usare Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Penso che la definizione sia sbagliata. Cosa faccio?",
            a: [
              "Ogni pagina dei risultati ha in fondo un piccolo pulsante \"Segnala\". Toccalo, scegli una categoria (definizione, etimologia, esempio, modo di dire, spiegazione per bambini e così via) e scrivi una breve nota. Arriva direttamente al team e ogni segnalazione viene esaminata.",
              "Non preoccuparti di essere troppo pignolo. Il dizionario migliora grazie a questo riscontro più velocemente che con qualsiasi altra cosa.",
            ],
          },
          {
            id: "kids-not-working",
            q: "La modalità bambini non cambia la spiegazione.",
            a: [
              "La modalità bambini cambia il testo solo quando per la parola esiste già una spiegazione adatta ai bambini. Per le parole nuove che hai appena cercato, aspetta da 10 a 15 secondi. La versione per bambini viene creata al momento, la prima volta.",
              "Inoltre: la modalità bambini richiede Clear o Deep. Se hai Basic, l'interruttore ti proporrà di passare a un piano superiore. Agli utenti non registrati viene chiesto di registrarsi.",
            ],
          },
          {
            id: "voice-fails",
            q: "La ricerca vocale non funziona.",
            a: [
              "La ricerca vocale richiede l'autorizzazione al microfono. La maggior parte dei browser la chiede una volta per sito. Se hai cliccato per sbaglio su Blocca, dovrai riattivarla a mano: clicca sull'icona del lucchetto o delle informazioni accanto a gadit.app nella barra degli indirizzi, poi Impostazioni sito, poi Microfono, poi Consenti.",
              "Su Safari per iOS, l'accesso al microfono richiede anche l'interruttore in Impostazioni → Safari → Microfono. La voce per ora è una funzione di Clear e Deep: gli utenti Basic vedono un invito a passare a un piano superiore, i visitatori non collegati un invito ad accedere.",
            ],
          },
          {
            id: "no-image",
            q: "Non riesco a creare un'immagine per la parola.",
            a: [
              "La creazione di immagini è una funzione di Clear e Deep con un limite mensile. Clear ha 30 immagini al mese, Deep 100. Se hai esaurito il limite, vedrai un blocco. Il limite si azzera il 1° di ogni mese.",
              "Se sei sotto il limite e continui a vedere errori, di solito è un problema temporaneo. Riprova tra 30 secondi. Gli errori persistenti sono un bug. Segnalalo dalla pagina della parola.",
            ],
          },
          {
            id: "save-word",
            q: "Come salvo una parola nel mio quaderno?",
            a: [
              "In qualsiasi pagina dei risultati, tocca Salva nel quaderno accanto al titolo. Il quaderno è una funzione di Clear e Deep in cui puoi ripassare più tardi le parole salvate, vederle nella vista a galassia e fare sessioni di esercizio intelligente (Deep).",
              "Le parole che hai salvato e aperto almeno una volta sono disponibili offline dalla cache locale. Il pacchetto offline salva anche le parole più popolari nella tua lingua, così sei pronto anche senza internet.",
            ],
          },
          {
            id: "offline",
            q: "Come funziona la modalità offline?",
            a: [
              "Le parole che hai già visto vengono salvate in locale. Riaprile senza internet e si caricano all'istante. Il pacchetto offline completo (le parole più usate nella tua lingua) si scarica su richiesta dalla pagina del quaderno.",
              "Per cercare una parola del tutto nuova serve comunque la connessione, perché Gadit deve creare la definizione da zero. La cache offline è per le parole che hai già esplorato.",
            ],
          },
          {
            id: "slow",
            q: "L'app sembra lenta.",
            a: [
              "La prima ricerca di una parola è la più lenta, perché Gadit crea il risultato completo da zero: di solito qualche secondo, a volte di più per le parole complesse. Le ricerche successive della stessa parola sono istantanee, servite dalla cache.",
              "Se tutto sembra lento, prova un aggiornamento forzato: Cmd+Shift+R su Mac, Ctrl+Shift+R su Windows. Se la lentezza continua su tutte le pagine, scrivici indicando il tuo paese e il browser, così il team può controllare il percorso di rete dalla tua zona ai nostri server.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ho cercato una parola e non ho ottenuto risultati. Cosa succede?",
            a: [
              "Per prima cosa controlla l'ortografia. Gadit gestisce quasi sempre i piccoli errori di battitura, ma una vocale sbagliata o una lettera mancante possono confonderlo. Se compare una correzione suggerita, provala.",
              "Oltre a questo: parole molto rare o gergali potrebbero non dare un risultato affidabile. Se sei sicuro che la parola esista, clicca sul pulsante Segnala nella pagina dei risultati (o nella schermata di errore) e faccelo sapere. Ogni segnalazione viene esaminata e le parole davvero mancanti vengono inserite nel sistema.",
            ],
          },
          {
            id: "change-language",
            q: "Come cambio la lingua dell'interfaccia?",
            a: [
              "In alto a destra di ogni pagina vedrai una piccola icona con una bandiera (o il nome della lingua attuale). Toccala e scegli tra più di 30 lingue: inglese, greco, ebraico, arabo, russo, spagnolo, portoghese, francese, tedesco, ceco, slovacco, italiano, giapponese, hindi, amarico, zulu.",
              "La tua scelta viene salvata su questo dispositivo. Tutto si ricarica nella nuova lingua: l'interfaccia, i menu, le future definizioni, gli esempi, le spiegazioni per bambini, perfino l'etimologia. I risultati già salvati in cache nella vecchia lingua restano finché non cerchi di nuovo quelle parole.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Programma partner",
        items: [
          {
            id: "join-partner",
            q: "Come divento partner di Gadit?",
            a: [
              "Apri /partners da qualsiasi pagina e clicca su \"Diventa partner\". Registrati con nome ed email e avrai subito il tuo link di referral personale e una dashboard per seguire clic e commissioni. Nessuna attesa di approvazione.",
              "Partecipare è gratuito e aperto a tutti. Non serve un abbonamento Gadit per diventare partner.",
            ],
          },
          {
            id: "commission-model",
            q: "Come vengono calcolate le commissioni?",
            a: [
              "Le condizioni standard sono il 25% di ogni pagamento che un cliente effettua nel suo primo anno. Dopo il primo anno, guadagni il 10% di ogni pagamento finché il cliente continua a pagare.",
              "Funziona allo stesso modo per i piani mensili e annuali, perché la commissione si calcola su ogni pagamento effettivo. Se un cliente annulla, la tua commissione si ferma con il suo ultimo pagamento.",
              "Il team può fissare tariffe diverse per partner specifici. Le tue tariffe sono sempre visibili nella tua dashboard partner, che raggiungi da /partners.",
            ],
          },
          {
            id: "payout",
            q: "Quando vengo pagato?",
            a: [
              "Ogni mese, quando il tuo saldo supera $50. Usiamo il metodo di pagamento che hai impostato nella dashboard partner (bonifico bancario, PayPal e così via). $50 è la soglia minima, non un tetto. Puoi guadagnare molto di più, ricevi semplicemente il pagamento quando superi la soglia.",
              "Le commissioni vengono sbloccate 30 giorni dopo il pagamento dell'abbonamento, per coprire il periodo di rimborso. Quindi un abbonamento di gennaio si sblocca a inizio febbraio e arriva nel tuo pagamento successivo, quando il saldo supera $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Mi sono iscritto ma la mia dashboard è vuota.",
            a: [
              "Le statistiche compaiono dopo il primo clic sul tuo link. Vuota significa solo che nessuno ha ancora cliccato. Condividi il link. Quando inizia l'attività, la dashboard si aggiorna quasi in tempo reale.",
              "Se hai condiviso il link e qualcuno si è registrato ma la dashboard non lo mostra, scrivici l'orario approssimativo della registrazione e il team controllerà l'attribuzione.",
            ],
          },
          {
            id: "attribution-window",
            q: "Per quanto tempo il mio link di referral traccia un visitatore?",
            a: [
              "Sessanta giorni. Quando un visitatore clicca sul tuo link, impostiamo un cookie che ti identifica come referente. Se si registra e si abbona in qualsiasi momento nei 60 giorni successivi (anche se lascia il sito e torna più tardi tramite una ricerca su Google), l'attribuzione va comunque a te.",
              "Cancellazione dei cookie: se il visitatore cancella i cookie o cambia browser o dispositivo prima di registrarsi, l'attribuzione può andare persa. Non c'è modo di evitarlo, ma 60 giorni sono una finestra generosa rispetto alla maggior parte dei programmi partner.",
            ],
          },
          {
            id: "missing-commission",
            q: "Qualcuno si è registrato tramite il mio link ma non vedo la commissione.",
            a: [
              "Il più delle volte è una questione di tempi: la registrazione compare nella dashboard in pochi minuti, ma la commissione viene registrata solo quando l'abbonamento viene effettivamente pagato (il che può avvenire giorni dopo, se il cliente è in prova gratuita). Ricontrolla dopo la fine della prova.",
              "Se l'abbonamento è stato pagato ma dopo 48 ore non vedi ancora la commissione, scrivici l'orario approssimativo della registrazione e l'email o il nome approssimativo dell'abbonato, se li conosci. Il team ricostruirà la catena di attribuzione e correggerà a mano eventuali errori.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Generale",
        items: [
          {
            id: "what-is-gadit",
            q: "Che cos'è Gadit?",
            a: [
              "Un dizionario multilingue pensato per farti capire davvero una parola, non solo per darti una definizione di una riga. Ogni parola si apre con tutti i suoi significati, esempi reali per ogni significato, modi di dire, etimologia, un'immagine facoltativa e (con Clear e Deep) una spiegazione adatta ai bambini, frasi scritte da te con un riscontro e quiz.",
              "Al momento più di 30 lingue di interfaccia. Nel team lo chiamiamo \"fare GAD a una parola\": capirla fino in fondo, non solo tradurla.",
            ],
          },
          {
            id: "languages",
            q: "Quali lingue supportate?",
            a: [
              "Interfaccia: inglese, greco, ebraico, arabo, russo, spagnolo, portoghese, francese, tedesco, ceco, slovacco, italiano, giapponese, zulu.",
              "Puoi cercare una parola in una qualsiasi di queste lingue e ottenere definizione, esempi e tutto il resto nella lingua di interfaccia che hai scelto. Ebraico e arabo sono completamente RTL e usano i loro caratteri nativi.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit è sicuro per i bambini?",
            a: [
              "Gadit è pensato per essere usato in sicurezza da un genitore insieme a un bambino. La modalità bambini produce spiegazioni semplici, concrete e adatte all'età (intorno al livello dei 5-10 anni), usando lo stesso motore che genera i contenuti per adulti, con istruzioni esplicite per semplificare. Ai bambini non vengono mai mostrati contenuti creati dagli utenti.",
              "In linea con le nostre politiche e con le norme sulla privacy dei minori in tutto il mondo, un account personale si può avere dai 13 anni in su. Lo schema tipico è l'account di un genitore che il genitore usa insieme al figlio, ed è esattamente lo scopo della modalità bambini.",
            ],
          },
          {
            id: "data",
            q: "Dove sono conservati i miei dati? Li vendete?",
            a: [
              "Account, cronologia, quaderno e immagini create sono conservati in modo sicuro su Firebase, crittografati nell'archivio. Non vendiamo i tuoi dati a nessuno. Condividiamo solo ciò che serve a far funzionare Gadit (archiviazione, pagamenti, fornitori di contenuti), come spiegato nell'Informativa sulla privacy.",
              "Puoi esportare il tuo quaderno o eliminare il tuo account in qualsiasi momento dalla pagina Account.",
            ],
          },
          {
            id: "contact-direct",
            q: "Come posso contattarvi direttamente?",
            a: [
              "Usa il pulsante email in fondo a questa pagina. Va direttamente nella casella del team. Leggiamo ogni messaggio e rispondiamo entro 24-48 ore (spesso prima).",
              "Per l'assistenza l'email è meglio della chat: dà al team il tempo di leggere con attenzione e rispondere con cura. L'assistenza telefonica non è ancora disponibile.",
            ],
          },
        ],
      },
    ],
  },
  ja: {
    eyebrow: "ヘルプセンター",
    heading: "答えをすばやく見つけましょう。",
    lede: "よくある質問と手順ごとの解決方法を、分野別にまとめています。お困りの内容が見つからない場合は、ページ下部からチームにご連絡ください。",
    stillNeedHelpHeading: "まだ解決しませんか？",
    stillNeedHelpBody: "直接ご連絡ください。すべてのメッセージにチームが目を通し、1、2日以内に返信します。",
    emailCta: "メールで問い合わせる",
    responseTime: "通常の返信: 24時間から48時間以内。",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "お支払いとサブスクリプション",
        items: [
          {
            id: "change-card",
            q: "サブスクリプションのクレジットカードを変更するには？",
            a: [
              "解約せずに、1分もかからずに新しいカードへ切り替えられます。現在のサブスクリプションはそのまま続き、新しいカードで支払われます。",
              "1. gadit.app にログインし、アカウントページ（右上）を開きます。2. 「お支払いの管理」をクリックします。3. Stripe の安全なページが開きます。「お支払い方法を追加」をクリックし、新しいカードを入力して、デフォルトに設定します。4. 必要に応じて古いカードを削除します。",
              "次の請求サイクルから、すべて新しいカードに請求されます。前回の請求（すでに支払い済み）は古いカードのままです。特にご希望がない限り、返金の必要はありません。",
            ],
          },
          {
            id: "cancel",
            q: "サブスクリプションを解約するには？",
            a: [
              "いつでもご自身で解約できます。ログインして「アカウント」を開き、ご利用中のプランの下にある「サブスクリプションを解約」をタップしてください。",
              "すでにお支払い済みの期間が終わるまで、引き続きご利用いただけます。その後、アカウントは Basic（無料）に戻ります。保存した単語、履歴、ノートはそのまま安全に保たれ、引き続き利用できます。",
              "誤って解約した場合や気が変わった場合は、期間が終わる前に同じページからサブスクリプションを再開できます。",
            ],
          },
          {
            id: "switch-plan",
            q: "Clear から Deep へ（またはその逆に）切り替えるには？",
            a: [
              "アカウント、「お支払いの管理」、「サブスクリプションを更新」の順に進み、新しいプランを選びます。",
              "Stripe が、現在の期間の残り日数に応じて日割りで差額を自動計算します。上位プランへ変更する場合は、期間の残り分の差額だけが請求されます。下位プランへ変更する場合は、差額が次回の請求に充当されます。",
            ],
          },
          {
            id: "invoice",
            q: "請求書や領収書をダウンロードするには？",
            a: [
              "アカウント、「お支払いの管理」、「請求履歴」の順に進みます。各請求には、保存済みの請求先情報が入った PDF の領収書があり、ダウンロードできます。",
              "請求書に別の氏名、住所、税番号（たとえば税務上の会社名）が必要な場合は、ダウンロードする前に同じページで請求先情報を更新してください。次の領収書から新しい情報が使われます。",
            ],
          },
          {
            id: "portal-error",
            q: "「お支払いの管理」をクリックしたらエラーが出ました。どうすればいいですか？",
            a: [
              "よくある原因は2つです。1つ目は、アカウントに有効な Stripe のサブスクリプションがないこと。2つ目は、Stripe 側でアカウントの請求情報がまだそろっていないことです。",
              "まずは簡単な確認から。いったんログアウトし、お支払い時に使ったメールアドレスで再度ログインして、もう一度お試しください。それでもうまくいかない場合は、アカウントのメールアドレスを添えてご連絡ください。チームがこちら側ですぐに対応します。",
            ],
          },
          {
            id: "autorenew",
            q: "サブスクリプションは自動更新されますか？",
            a: [
              "はい。月額プランは毎月、年額プランは毎年同じ日付に更新されます。次回の請求日は、アカウントと Stripe のポータルで確認できます。",
              "自動更新を希望しない場合は、更新日より前ならいつでも解約できます。解約はすぐには反映されず、お支払い済みの期間中は引き続きご利用いただけます。",
            ],
          },
          {
            id: "refund",
            q: "返金してもらえますか？",
            a: [
              "はい。購入から14日以内で、サービスをあまり使っていない場合は、アカウントのメールアドレスと理由をひと言添えてご連絡ください。こうした返金は問題なく承認されます。",
              "14日を過ぎている場合は、チームが個別に対応します。更新が続かないようにサブスクリプションを解約したうえで、メールでご連絡ください。",
            ],
          },
          {
            id: "unknown-charge",
            q: "身に覚えのない請求があります。",
            a: [
              "請求は GADIT または GADIT.APP の名前で、$2.99（Clear 月額）、$4.99（Deep 月額）、$29.99（Clear 年額）、$49.99（Deep 年額）のいずれかの金額で表示されます。一致しない場合は、別のサービスからの請求かもしれません。",
              "ご自身のものではないと確信している場合も、まだ銀行に異議申し立てはしないでください。まずは日付と金額を添えて、直接ご連絡ください。チームが請求を特定して内容をご説明し、必要であれば返金します。銀行への異議申し立ては今後のお支払いを難しくすることがあるため、サポート経由で解決するほうが、たいていは早くて安全です。",
            ],
          },
          {
            id: "failed-payment",
            q: "支払いが失敗しました。どうすればいいですか？",
            a: [
              "Stripe は、失敗した支払いをその後の数日間に何度か自動で再試行します。銀行の保留が解除されたり、カードの残高が足りるようになったりすると、ほとんどの場合は自然に解決します。",
              "すぐに解決したい場合は、アカウント → 「お支払いの管理」 → 「お支払い方法を追加」に進み、使えるカードを入力してデフォルトに設定してください。Stripe が新しいカードで、失敗した請求をすぐに再試行します。サブスクリプションがすでに Basic に戻っている場合は、料金ページから再登録できます。ノートはそのまま残ります。",
            ],
          },
          {
            id: "plan-comparison",
            q: "Basic、Clear、Deep の違いは何ですか？",
            a: [
              "Basic（無料）: 1日20回までの単語検索、すべての意味、意味ごとの例文、慣用句、語源。基本的な検索に登録は不要です。",
              "Clear（月額 $2.99 または年額 $29.99）: 検索回数無制限、子ども向けの説明、単語ごとの画像（月30枚）、自分で作った文へのフィードバック、慣用句の詳細、30日分の検索履歴。",
              "Deep（月額 $4.99 または年額 $49.99）: Clear のすべてに加え、練習クイズ、間隔をあけて効率よく復習できる個人ノート、似た単語の使い分け、より多い画像枠（月100枚）。",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "アカウントとログイン",
        items: [
          {
            id: "no-verification-email",
            q: "確認メールが届きません。",
            a: [
              "まず迷惑メールフォルダとプロモーションフォルダをご確認ください。Gmail や Outlook では、どれか1通を「迷惑メールではない」に設定するまで、アカウント関連のメールがそこに振り分けられることがあります。",
              "見つからない場合は、登録時にメールアドレスを打ち間違えた可能性があります。アドレスをよく確認して、もう一度登録してみてください。Google で登録した場合は、確認メールは必要ありません。",
            ],
          },
          {
            id: "forgot-password",
            q: "パスワードを忘れました。",
            a: [
              "ログイン画面を開き、「パスワードをお忘れですか？」をクリックします。Gadit で使っているメールアドレスを入力すると、1、2分以内に再設定用のリンクが届きます。",
              "メールが届かない場合は、迷惑メールフォルダをご確認ください。それでも届かない場合は、メールアドレスとパスワードではなく Google で登録したのかもしれません。「Google で続ける」ボタンをお試しください。",
            ],
          },
          {
            id: "wrong-credentials",
            q: "パスワードは正しいはずなのに「メールアドレスまたはパスワードが違います」と表示されます。",
            a: [
              "確認していただきたい点が3つあります。1つ目は Caps Lock。2つ目は、コピーして貼り付けたときの末尾の空白。3つ目は、パスワードではなく Google で登録していないか（その場合は「Google で続ける」をお使いください）。",
              "それでも解決しない場合は、同じ画面からパスワードを再設定してください。まっさらな状態でやり直せます。",
            ],
          },
          {
            id: "google-fails",
            q: "Google でログインできません。",
            a: [
              "よくある原因は、ブラウザが gadit.app のサードパーティ Cookie やポップアップをブロックしていることです。アドレスバーの権限設定で許可してから、もう一度お試しください。",
              "シークレットモードでは、Google ログインは意図的に制限されています。通常のブラウザウィンドウに切り替えてください。",
            ],
          },
          {
            id: "change-email",
            q: "アカウントのメールアドレスを変更するには？",
            a: [
              "アカウントでご自身のメールアドレスをクリックし、「メールアドレスを変更」を選びます。変更を確定するには、新しいアドレスの確認が必要です。サブスクリプション、履歴、ノートはすべて引き継がれます。",
              "メールアドレスが Stripe の顧客情報に紐づいている場合は、今後の領収書が新しいアドレスに届くよう、Stripe の請求ポータルでも更新してください。",
            ],
          },
          {
            id: "delete-account",
            q: "アカウントを削除するには？",
            a: [
              "アカウントページの一番下にある「アカウントを削除」から行えます。削除は元に戻せません。サブスクリプションは解約され、ノートと履歴は消去され、メールアドレスは新しい登録に使えるようになります。",
              "過去の請求に関する Stripe の記録は残ります（会計上、法律で保管が義務づけられています）。それ以外は何も残りません。",
            ],
          },
          {
            id: "share-account",
            q: "パートナーや子どもとアカウントを共有できますか？",
            a: [
              "1つのアカウントに同時にログインできるのは1人だけです。キッズモードを使えば、1つの Clear または Deep アカウントを親子で使えます。切り替えるだけで、別々にログインしなくても定義が子ども向けに表示されます。",
              "大人2人がそれぞれ自分のノートや進み具合を持ちたい場合は、アカウントを2つ作成してください。Clear は1アカウントにつき月額 $2.99 です。",
            ],
          },
          {
            id: "multiple-accounts",
            q: "誤ってアカウントを2つ作ってしまったようです。どうすればいいですか？",
            a: [
              "これはたいてい、同じアドレスで一度は Google、一度はメールアドレスとパスワードで登録した場合や、別々のメールアドレスで2回登録した場合に起こります。登録のたびに、ノート、履歴、サブスクリプション状況をそれぞれ持つ別の Gadit アカウントが作られます。",
              "両方のメールアドレス（またはアカウントページの UID）と、残したいほうのアカウントをお知らせください。チームが選んだアカウントにノートと履歴をまとめ、もう一方をきれいに閉じます。データは失われません。",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Gadit の使い方",
        items: [
          {
            id: "wrong-definition",
            q: "定義が間違っていると思います。どうすればいいですか？",
            a: [
              "結果ページの下部には、小さな「報告」ボタンがあります。タップしてカテゴリ（定義、語源、例文、慣用句、子ども向けの説明など）を選び、短いメモを書いてください。報告はチームに直接届き、すべて確認しています。",
              "細かすぎるかも、と遠慮する必要はありません。こうしたフィードバックこそが、辞書を何よりも早く良くしてくれます。",
            ],
          },
          {
            id: "kids-not-working",
            q: "キッズモードにしても説明が変わりません。",
            a: [
              "キッズモードで表示が切り替わるのは、その単語の子ども向けの説明がすでに作られている場合だけです。調べたばかりの新しい単語では、10秒から15秒ほどお待ちください。子ども向けの説明は、初回にその場で作成されます。",
              "また、キッズモードには Clear または Deep が必要です。Basic をご利用の場合は、切り替えるとアップグレードのご案内が表示されます。ログインしていない方には登録のご案内が表示されます。",
            ],
          },
          {
            id: "voice-fails",
            q: "音声検索が使えません。",
            a: [
              "音声検索にはマイクの許可が必要です。ほとんどのブラウザはサイトごとに一度だけ確認します。誤って「ブロック」をクリックした場合は、手動で戻す必要があります。アドレスバーで gadit.app の横にある鍵または情報アイコンをクリックし、「サイトの設定」、「マイク」、「許可」の順に進んでください。",
              "iOS の Safari では、設定 → Safari → マイク のスイッチもオンにする必要があります。音声機能は現在 Clear と Deep の機能です。Basic の方にはアップグレードのご案内、ログインしていない方にはログインのご案内が表示されます。",
            ],
          },
          {
            id: "no-image",
            q: "単語の画像を作成できません。",
            a: [
              "画像の作成は Clear と Deep の機能で、月ごとの上限があります。Clear は月30枚、Deep は月100枚です。上限に達すると、それ以上は作成できない旨が表示されます。上限は毎月1日にリセットされます。",
              "上限に達していないのに失敗する場合は、たいてい一時的なものです。30秒後にもう一度お試しください。何度も失敗する場合は不具合です。単語ページから報告をお願いします。",
            ],
          },
          {
            id: "save-word",
            q: "単語をノートに保存するには？",
            a: [
              "単語の結果ページで、タイトルの近くにある「ノートに保存」をタップします。ノートは Clear と Deep の機能で、保存した単語をあとから見直したり、ギャラクシー表示で眺めたり、スマート練習（Deep）を行ったりできます。",
              "保存して一度でも開いた単語は、端末内のキャッシュからオフラインでも利用できます。オフラインパックには、お使いの言語でよく調べられる単語も保存されるので、インターネットがなくても安心です。",
            ],
          },
          {
            id: "offline",
            q: "オフラインモードはどのように動きますか？",
            a: [
              "一度表示した単語は端末内に保存されます。インターネットがなくても、もう一度開けばすぐに読み込まれます。完全なオフラインパック（お使いの言語でよく使われる単語）は、ノートのページから必要なときにダウンロードできます。",
              "まったく新しい単語を検索するには、引き続きインターネット接続が必要です。Gadit が定義を一から作成する必要があるためです。オフラインキャッシュは、すでに調べた単語のためのものです。",
            ],
          },
          {
            id: "slow",
            q: "アプリの動作が遅く感じます。",
            a: [
              "単語を初めて検索するときがいちばん時間がかかります。Gadit が結果全体を一から作成するためで、通常は数秒、複雑な単語ではもう少しかかることもあります。同じ単語の2回目以降はキャッシュから表示されるので、すぐに表示されます。",
              "すべてが遅く感じる場合は、強制再読み込みをお試しください。Mac では Cmd+Shift+R、Windows では Ctrl+Shift+R です。どのページでも遅さが続く場合は、お住まいの国とお使いのブラウザをメールでお知らせください。チームが、お住まいの地域から当社サーバーまでのネットワーク経路を確認します。",
            ],
          },
          {
            id: "word-not-found",
            q: "単語を検索しても結果が出ません。どうなっていますか？",
            a: [
              "まずはつづりをご確認ください。Gadit はちょっとした打ち間違いならたいてい対応できますが、母音の間違いや文字の抜けがあると正しく判断できないことがあります。修正候補が表示されたら、それをお試しください。",
              "それ以外では、ごくまれな単語やスラングは、確かな結果が出ないことがあります。実在する単語だと確信がある場合は、結果ページ（またはエラー画面）の「報告」ボタンをクリックしてお知らせください。報告はすべて確認し、本当に抜けていた単語はシステムに反映します。",
            ],
          },
          {
            id: "change-language",
            q: "表示言語を変更するには？",
            a: [
              "どのページでも右上に、小さな国旗アイコン（または現在の言語名）があります。タップすると、30以上の言語から選べます。英語、ギリシャ語、ヘブライ語、アラビア語、ロシア語、スペイン語、ポルトガル語、フランス語、ドイツ語、チェコ語、スロバキア語、イタリア語、日本語、ヒンディー語、アムハラ語、ズールー語。",
              "選んだ言語はこの端末に保存されます。インターフェース、メニュー、これから調べる単語の定義、例文、子ども向けの説明、語源まで、すべてが新しい言語で読み込まれます。以前の言語でキャッシュ済みの結果は、その単語をもう一度検索するまでそのまま残ります。",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "パートナープログラム",
        items: [
          {
            id: "join-partner",
            q: "Gadit のパートナーになるには？",
            a: [
              "どのページからでも /partners を開き、「パートナーになる」をクリックします。お名前とメールアドレスで登録すると、専用の紹介リンクと、クリック数や報酬を確認できるダッシュボードがすぐに使えるようになります。承認を待つ必要はありません。",
              "参加は無料で、どなたでも参加できます。パートナーになるのに Gadit のサブスクリプションは必要ありません。",
            ],
          },
          {
            id: "commission-model",
            q: "報酬はどのように計算されますか？",
            a: [
              "標準の条件では、お客様が最初の1年間に支払う毎回の支払額の25%です。最初の1年が過ぎたあとは、お客様が支払いを続ける限り、毎回の支払額の10%を受け取れます。",
              "報酬は実際の支払いごとに計算されるため、月額プランでも年額プランでも同じ仕組みです。お客様が解約した場合、報酬は最後の支払いで終了します。",
              "チームが特定のパートナーに別の料率を設定することもあります。ご自身の料率は、/partners から開けるパートナーダッシュボードでいつでも確認できます。",
            ],
          },
          {
            id: "payout",
            q: "報酬はいつ支払われますか？",
            a: [
              "残高が $50 を超えると、毎月お支払いします。パートナーダッシュボードで設定した受け取り方法（銀行振込、PayPal など）を使います。$50 は最低基準額であり、上限ではありません。もっと多く稼ぐこともでき、基準額を超えた時点で支払いを受け取れるという意味です。",
              "返金期間を考慮し、報酬はサブスクリプションの支払いから30日後に確定します。たとえば1月のサブスクリプションは2月上旬に確定し、残高が $50 を超えた時点で次回のお支払いに含まれます。",
            ],
          },
          {
            id: "empty-dashboard",
            q: "参加したのにダッシュボードが空のままです。",
            a: [
              "統計はリンクが初めてクリックされたあとに表示されます。空なのは、まだ誰もクリックしていないというだけです。リンクをシェアしてみましょう。アクティビティが始まれば、ダッシュボードはほぼリアルタイムで更新されます。",
              "リンクをシェアして誰かが登録したのに、ダッシュボードに反映されない場合は、おおよその登録時刻を添えてご連絡ください。チームが紹介の記録を確認します。",
            ],
          },
          {
            id: "attribution-window",
            q: "紹介リンクは訪問者をどのくらいの期間追跡しますか？",
            a: [
              "60日間です。訪問者がリンクをクリックすると、あなたを紹介者として識別する Cookie を設定します。その後60日以内に登録してサブスクリプションを開始すれば（いったんサイトを離れ、あとで Google 検索から戻ってきた場合でも）、あなたの紹介として記録されます。",
              "Cookie の削除について: 訪問者が登録前に Cookie を削除したり、ブラウザや端末を変えたりすると、紹介の記録が失われることがあります。これを回避する方法はありませんが、60日はほとんどのパートナープログラムと比べて十分に長い期間です。",
            ],
          },
          {
            id: "missing-commission",
            q: "リンクから登録した人がいるのに、報酬が表示されません。",
            a: [
              "多くの場合はタイミングの問題です。登録は数分以内にダッシュボードに表示されますが、報酬が計上されるのはサブスクリプションの支払いが実際に行われてからです（無料トライアル中なら数日後になることもあります）。トライアル終了後にもう一度ご確認ください。",
              "サブスクリプションの支払いが済んでいるのに48時間たっても報酬が表示されない場合は、おおよその登録時刻と、わかれば登録者のメールアドレスかおおよその名前を添えてご連絡ください。チームが紹介の記録をたどり、漏れがあれば手動で修正します。",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "一般",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit とは何ですか？",
            a: [
              "1行の定義を返すだけでなく、単語を本当に腑に落ちるまで理解するための多言語辞書です。どの単語も、すべての意味、意味ごとの実際の例文、慣用句、語源、任意の画像、そして（Clear と Deep では）子ども向けの説明、自分で作った文へのフィードバック、クイズとともに表示されます。",
              "現在30以上の表示言語に対応しています。チーム内では、これを単語を「GAD する」と呼んでいます。単に訳すのではなく、単語を最後まで理解するという意味です。",
            ],
          },
          {
            id: "languages",
            q: "どの言語に対応していますか？",
            a: [
              "インターフェース: 英語、ギリシャ語、ヘブライ語、アラビア語、ロシア語、スペイン語、ポルトガル語、フランス語、ドイツ語、チェコ語、スロバキア語、イタリア語、日本語、ズールー語。",
              "これらのどの言語でも単語を調べられ、定義や例文などはすべて、選んだ表示言語で表示されます。ヘブライ語とアラビア語は完全な RTL 表示に対応し、それぞれの言語本来のフォントを使用します。",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit は子どもにとって安全ですか？",
            a: [
              "Gadit は、保護者がお子さまと一緒に安心して使えるように設計されています。キッズモードでは、大人向けの内容を作るのと同じエンジンに、わかりやすくするための明確な指示を与え、シンプルで具体的な、年齢にふさわしい（5歳から10歳くらいのレベルの）説明を作成します。ほかのユーザーが作成したコンテンツが子どもに表示されることは一切ありません。",
              "当社のポリシーと世界各国の子どものプライバシーに関する規則に従い、ご自身でアカウントを持てるのは13歳以上です。標準的な使い方は、保護者のアカウントを保護者がお子さまと一緒に使う形で、キッズモードはまさにそのために作られています。",
            ],
          },
          {
            id: "data",
            q: "データはどこに保存されますか？販売していますか？",
            a: [
              "アカウント、履歴、ノート、作成された画像は Firebase に安全に保存され、保存時に暗号化されています。お客様のデータを誰かに販売することはありません。プライバシーポリシーに記載のとおり、Gadit の運営に必要なもの（ストレージ、決済、コンテンツ提供元）だけを共有します。",
              "ノートのエクスポートやアカウントの削除は、アカウントページからいつでも行えます。",
            ],
          },
          {
            id: "contact-direct",
            q: "直接連絡するにはどうすればいいですか？",
            a: [
              "このページの下部にあるメールボタンをお使いください。チームの受信箱に直接届きます。すべてのメッセージに目を通し、24時間から48時間以内に（多くの場合はもっと早く）返信します。",
              "サポートにはチャットよりメールが適しています。チームが内容をじっくり読み、丁寧に返信できるからです。電話サポートは現在提供していません。",
            ],
          },
        ],
      },
    ],
  },
  hi: {
    eyebrow: "सहायता केंद्र",
    heading: "जवाब पाएँ, जल्दी।",
    lede: "आम सवाल और चरण-दर-चरण समाधान, विषय के अनुसार व्यवस्थित। अगर आपकी समस्या यहाँ नहीं दिखती, तो पेज के नीचे से हमारी टीम से संपर्क करें।",
    stillNeedHelpHeading: "अब भी अटके हुए हैं?",
    stillNeedHelpBody: "हमें सीधे लिखें। हर संदेश टीम पढ़ती है और एक या दो दिन में जवाब देती है।",
    emailCta: "हमें ईमेल करें",
    responseTime: "आम तौर पर जवाब: 24 से 48 घंटे के भीतर।",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "बिलिंग और सदस्यता",
        items: [
          {
            id: "change-card",
            q: "मैं अपनी सदस्यता का क्रेडिट कार्ड कैसे बदलूँ?",
            a: [
              "आप बिना रद्द किए एक मिनट से भी कम समय में नए कार्ड पर स्विच कर सकते हैं। आपकी मौजूदा सदस्यता चलती रहती है, बस नए कार्ड पर।",
              "1. gadit.app पर साइन इन करें और अपना अकाउंट पेज खोलें (ऊपर दाईं ओर)। 2. \"बिलिंग प्रबंधित करें\" पर क्लिक करें। 3. Stripe का एक सुरक्षित पेज खुलेगा। \"भुगतान विधि जोड़ें\" पर क्लिक करें, नया कार्ड दर्ज करें और उसे डिफ़ॉल्ट के रूप में चुनें। 4. चाहें तो पुराना कार्ड हटा दें।",
              "अगले बिलिंग चक्र से सारे भुगतान नए कार्ड से होंगे। पिछला शुल्क (जो पहले ही लिया जा चुका है) पुराने कार्ड पर ही रहेगा। रिफ़ंड की ज़रूरत नहीं है, जब तक कि आप खास तौर पर न चाहें।",
            ],
          },
          {
            id: "cancel",
            q: "मैं अपनी सदस्यता कैसे रद्द करूँ?",
            a: [
              "आप खुद, कभी भी कर सकते हैं। साइन इन करें, खाता खोलें, और अपने प्लान के नीचे \"सदस्यता रद्द करें\" पर टैप करें।",
              "आपकी पहुँच उस अवधि के अंत तक बनी रहती है जिसका आप भुगतान कर चुके हैं। उसके बाद अकाउंट Basic (मुफ़्त) पर लौट आता है। आपके सहेजे हुए शब्द, इतिहास और नोटबुक सुरक्षित और उपलब्ध रहते हैं।",
              "अगर आपने गलती से रद्द कर दिया या आपका इरादा बदल गया, तो अवधि खत्म होने से पहले आप उसी पेज से सदस्यता फिर से शुरू कर सकते हैं।",
            ],
          },
          {
            id: "switch-plan",
            q: "मैं Clear से Deep पर (या उल्टा) कैसे स्विच करूँ?",
            a: [
              "अकाउंट, फिर बिलिंग प्रबंधित करें, फिर सदस्यता अपडेट करें। नया प्लान चुनें।",
              "Stripe मौजूदा अवधि में बचे दिनों के अनुपात में कीमत का अंतर अपने आप निकालता है। अगर आप अपग्रेड कर रहे हैं, तो बाकी अवधि के लिए सिर्फ़ अंतर का शुल्क लगेगा। अगर आप निचले प्लान पर जा रहे हैं, तो बचा हुआ क्रेडिट आपके अगले बिल में जुड़ जाएगा।",
            ],
          },
          {
            id: "invoice",
            q: "मैं इनवॉइस या रसीद कैसे डाउनलोड करूँ?",
            a: [
              "अकाउंट, फिर बिलिंग प्रबंधित करें, फिर इनवॉइस इतिहास। हर शुल्क के लिए आपके सहेजे गए बिलिंग विवरण के साथ एक PDF रसीद डाउनलोड के लिए उपलब्ध है।",
              "अगर आपको इनवॉइस पर कोई अलग नाम, पता या टैक्स ID चाहिए (उदाहरण के लिए टैक्स के लिए कंपनी का नाम), तो डाउनलोड करने से पहले उसी पेज पर अपना बिलिंग विवरण अपडेट करें। अगली रसीद में नया विवरण इस्तेमाल होगा।",
            ],
          },
          {
            id: "portal-error",
            q: "मैंने बिलिंग प्रबंधित करें पर क्लिक किया लेकिन एक त्रुटि आई। अब क्या करूँ?",
            a: [
              "दो आम कारण हैं। पहला, आपके अकाउंट में कोई सक्रिय Stripe सदस्यता नहीं है। दूसरा, हो सकता है Stripe के पास अभी आपके अकाउंट की पूरी बिलिंग प्रोफ़ाइल न हो।",
              "पहली आसान जाँच: साइन आउट करें, चेकआउट में इस्तेमाल किए गए ईमेल से फिर से साइन इन करें और दोबारा कोशिश करें। अगर फिर भी काम न करे, तो अपने अकाउंट के ईमेल के साथ हमसे संपर्क करें और टीम हमारी तरफ़ से एक मिनट में इसे ठीक कर देगी।",
            ],
          },
          {
            id: "autorenew",
            q: "क्या मेरी सदस्यता अपने आप रिन्यू होगी?",
            a: [
              "हाँ। मासिक प्लान हर महीने और सालाना प्लान हर साल उसी तारीख को रिन्यू होते हैं। अगली बिलिंग तारीख आप अपने अकाउंट में और Stripe पोर्टल पर देख सकते हैं।",
              "अगर आप ऑटो-रिन्यू नहीं चाहते, तो रिन्यू की तारीख से पहले कभी भी रद्द कर दें। रद्द करना तुरंत लागू नहीं होता। जिस अवधि का आप भुगतान कर चुके हैं, उसके अंत तक पहुँच बनी रहती है।",
            ],
          },
          {
            id: "refund",
            q: "क्या मुझे रिफ़ंड मिल सकता है?",
            a: [
              "हाँ। अगर खरीदारी को 14 दिन से कम हुए हैं और सेवा का ज़्यादा इस्तेमाल नहीं हुआ है, तो अपने अकाउंट के ईमेल और वजह के बारे में एक छोटे नोट के साथ हमें लिखें। ऐसे रिफ़ंड बिना किसी बहस के मंज़ूर हो जाते हैं।",
              "अगर 14 दिन से ज़्यादा हो गए हैं, तो टीम हर मामले को अलग से देखती है। सदस्यता रद्द करें ताकि वह रिन्यू होती न रहे, और हमें ईमेल करें।",
            ],
          },
          {
            id: "unknown-charge",
            q: "मुझे एक ऐसा शुल्क दिख रहा है जो पहचान में नहीं आ रहा।",
            a: [
              "शुल्क GADIT या GADIT.APP के नाम से $2.99 (Clear मासिक), $4.99 (Deep मासिक), $29.99 (Clear सालाना) या $49.99 (Deep सालाना) की राशि के साथ दिखते हैं। अगर यह मेल नहीं खाता, तो हो सकता है यह किसी दूसरी सेवा का हो।",
              "अगर आपको पक्का यकीन है कि यह आपका नहीं है, तब भी अभी बैंक के ज़रिए विवाद दर्ज न करें। पहले तारीख और राशि के साथ हमें सीधे लिखें। टीम उसे ढूँढेगी, बताएगी कि वह क्या है और ज़रूरत हो तो रिफ़ंड करेगी। बैंक विवाद से आगे की बिलिंग मुश्किल हो सकती है, इसलिए सपोर्ट के ज़रिए सुलझाना आम तौर पर ज़्यादा तेज़ और सुरक्षित होता है।",
            ],
          },
          {
            id: "failed-payment",
            q: "मेरा भुगतान विफल हो गया। मुझे क्या करना चाहिए?",
            a: [
              "Stripe अगले कुछ दिनों में विफल भुगतानों को अपने आप कुछ बार फिर से आज़माता है। ज़्यादातर मामले अपने आप सुलझ जाते हैं, जब बैंक रोक हटा देता है या कार्ड में पर्याप्त बैलेंस आ जाता है।",
              "अगर आप इसे अभी ठीक करना चाहते हैं, तो अकाउंट → बिलिंग प्रबंधित करें → भुगतान विधि जोड़ें पर जाएँ, एक चालू कार्ड दर्ज करें और उसे डिफ़ॉल्ट बनाएँ। Stripe नए कार्ड पर विफल शुल्क को तुरंत फिर से आज़माएगा। अगर आपकी सदस्यता पहले ही Basic पर आ चुकी है, तो आप कीमतें पेज से फिर से सदस्यता ले सकते हैं और आपकी नोटबुक वैसी ही बनी रहेगी।",
            ],
          },
          {
            id: "plan-comparison",
            q: "Basic, Clear और Deep में क्या अंतर है?",
            a: [
              "Basic (मुफ़्त): दिन में 20 शब्दों तक की खोज, हर अर्थ, हर अर्थ के उदाहरण, मुहावरे और शब्द की उत्पत्ति। बुनियादी खोज के लिए साइन अप ज़रूरी नहीं।",
              "Clear ($2.99/माह या $29.99/वर्ष): असीमित खोज, बच्चों के लिए आसान व्याख्या, हर शब्द के लिए एक चित्र (30/माह), अपना वाक्य लिखें और उस पर फ़ीडबैक पाएँ, मुहावरों का विस्तार और 30 दिन का खोज इतिहास।",
              "Deep ($4.99/माह या $49.99/वर्ष): Clear की हर सुविधा, साथ में अभ्यास क्विज़, अंतराल पर स्मार्ट दोहराव वाली निजी नोटबुक, मिलते-जुलते शब्दों में फ़र्क समझना और ज़्यादा चित्र कोटा (100/माह)।",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "अकाउंट और साइन इन",
        items: [
          {
            id: "no-verification-email",
            q: "मुझे पुष्टि (वेरिफ़िकेशन) ईमेल नहीं मिला।",
            a: [
              "सबसे पहले स्पैम और प्रमोशन फ़ोल्डर देखें। Gmail और Outlook कभी-कभी अकाउंट से जुड़े ईमेल वहाँ भेज देते हैं, जब तक आप किसी एक को \"स्पैम नहीं\" के रूप में चिह्नित न करें।",
              "अगर वहाँ नहीं है, तो हो सकता है साइन अप के समय ईमेल गलत टाइप हुआ हो। फिर से साइन अप करके पते को ध्यान से जाँचें। अगर आपने Google से साइन अप किया है, तो पुष्टि ईमेल की ज़रूरत नहीं है।",
            ],
          },
          {
            id: "forgot-password",
            q: "पासवर्ड याद नहीं आ रहा।",
            a: [
              "साइन इन विंडो खोलें और \"पासवर्ड भूल गए?\" पर क्लिक करें। Gadit के लिए इस्तेमाल होने वाला ईमेल दर्ज करें और एक या दो मिनट में आपको रीसेट लिंक मिल जाएगा।",
              "अगर ईमेल नहीं आता, तो स्पैम देखें। अगर फिर भी नहीं आता, तो हो सकता है आपने ईमेल और पासवर्ड के बजाय Google से साइन अप किया हो। \"Google के साथ जारी रखें\" बटन आज़माएँ।",
            ],
          },
          {
            id: "wrong-credentials",
            q: "मुझे यकीन है कि पासवर्ड सही है, फिर भी \"गलत ईमेल या पासवर्ड\" दिखता है।",
            a: [
              "तीन चीज़ें जाँचें। पहला, Caps Lock। दूसरा, कॉपी-पेस्ट करते समय आखिर में छूटी खाली जगह। तीसरा, कहीं आपने पासवर्ड के बजाय Google से साइन अप तो नहीं किया (तब \"Google के साथ जारी रखें\" इस्तेमाल करें)।",
              "अब भी नहीं हुआ? उसी विंडो से पासवर्ड रीसेट करें। इससे सब कुछ नए सिरे से सेट हो जाता है।",
            ],
          },
          {
            id: "google-fails",
            q: "Google से साइन इन काम नहीं कर रहा।",
            a: [
              "सबसे आम कारण: आपका ब्राउज़र gadit.app के लिए थर्ड-पार्टी कुकीज़ या पॉप-अप ब्लॉक कर रहा है। एड्रेस बार की अनुमतियों में उन्हें अनुमति दें और फिर से कोशिश करें।",
              "अगर आप इनकॉग्निटो मोड में हैं, तो Google साइन इन जान-बूझकर सीमित होता है। सामान्य ब्राउज़र विंडो पर जाएँ।",
            ],
          },
          {
            id: "change-email",
            q: "मैं अपने अकाउंट का ईमेल कैसे बदलूँ?",
            a: [
              "अकाउंट, अपने ईमेल पर क्लिक करें, ईमेल बदलें। बदलाव लागू होने से पहले आपको नए पते की पुष्टि करनी होगी। आपकी सदस्यता, इतिहास और नोटबुक सब साथ आ जाते हैं।",
              "अगर ईमेल किसी Stripe ग्राहक से जुड़ा है, तो उसे Stripe बिलिंग पोर्टल पर भी अपडेट करें ताकि आगे की रसीदें नए पते पर आएँ।",
            ],
          },
          {
            id: "delete-account",
            q: "मैं अपना अकाउंट कैसे डिलीट करूँ?",
            a: [
              "अकाउंट, पेज के सबसे नीचे, अकाउंट डिलीट करें। यह स्थायी है। आपकी सदस्यता रद्द हो जाती है, आपकी नोटबुक और इतिहास मिट जाते हैं, और ईमेल नए साइन अप के लिए खाली हो जाता है।",
              "पिछले शुल्कों के Stripe रिकॉर्ड बने रहते हैं (हिसाब-किताब के लिए कानूनन हमें उन्हें रखना होता है)। इसके अलावा कुछ नहीं रहता।",
            ],
          },
          {
            id: "share-account",
            q: "क्या मेरा जीवनसाथी या बच्चा मेरा अकाउंट शेयर कर सकता है?",
            a: [
              "एक अकाउंट पर एक समय में एक ही यूज़र साइन इन रह सकता है। किड्स मोड से एक ही Clear या Deep अकाउंट माता-पिता और बच्चे दोनों के काम आता है: टॉगल बदलें और परिभाषाएँ बच्चों के अनुकूल दिखने लगती हैं, अलग लॉगिन की ज़रूरत नहीं।",
              "अगर दो वयस्क अपनी-अपनी अलग नोटबुक और प्रगति चाहते हैं, तो दो अकाउंट बनाएँ। Clear की कीमत हर अकाउंट के लिए $2.99 प्रति माह है।",
            ],
          },
          {
            id: "multiple-accounts",
            q: "मुझे लगता है कि गलती से मेरे दो अकाउंट बन गए हैं। अब क्या करूँ?",
            a: [
              "आम तौर पर ऐसा तब होता है जब कोई एक ही पते से एक बार Google से और एक बार ईमेल और पासवर्ड से साइन अप करता है, या जब आप दो अलग ईमेल पतों से दो बार साइन अप करते हैं। हर साइन अप एक अलग Gadit अकाउंट बनाता है, जिसकी अपनी नोटबुक, इतिहास और सदस्यता स्थिति होती है।",
              "दोनों ईमेल पते (या अकाउंट पेज से UID) और आप कौन-सा अकाउंट रखना चाहते हैं, यह लिखकर हमें भेजें। टीम नोटबुक और इतिहास को आपके चुने हुए अकाउंट में मिला देगी, फिर दूसरे को साफ़-सुथरे तरीके से बंद कर देगी। कोई डेटा नहीं खोएगा।",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Gadit का इस्तेमाल",
        items: [
          {
            id: "wrong-definition",
            q: "मुझे लगता है कि परिभाषा गलत है। मैं क्या करूँ?",
            a: [
              "हर नतीजे वाले पेज के नीचे एक छोटा \"रिपोर्ट करें\" बटन है। उस पर टैप करें, एक श्रेणी चुनें (परिभाषा, व्युत्पत्ति, उदाहरण, मुहावरा, बच्चों की व्याख्या वगैरह) और एक छोटा नोट लिखें। यह सीधे टीम तक पहुँचता है और हर रिपोर्ट की समीक्षा होती है।",
              "बहुत ज़्यादा बारीकी की चिंता न करें। इस फ़ीडबैक से डिक्शनरी किसी भी और चीज़ से ज़्यादा तेज़ी से बेहतर होती है।",
            ],
          },
          {
            id: "kids-not-working",
            q: "किड्स मोड व्याख्या नहीं बदल रहा।",
            a: [
              "किड्स मोड सिर्फ़ उन्हीं शब्दों का टेक्स्ट बदलता है जिनकी बच्चों के अनुकूल व्याख्या पहले से बनी हुई है। जो बिल्कुल नए शब्द आपने अभी खोजे हैं, उनके लिए 10 से 15 सेकंड रुकें। बच्चों वाला संस्करण पहली बार उसी समय बनाया जाता है।",
              "साथ ही: किड्स मोड के लिए Clear या Deep ज़रूरी है। अगर आप Basic पर हैं, तो टॉगल आपको अपग्रेड करने का सुझाव देगा। बिना साइन इन वाले यूज़र्स को साइन अप करने के लिए कहा जाता है।",
            ],
          },
          {
            id: "voice-fails",
            q: "वॉइस सर्च काम नहीं कर रहा।",
            a: [
              "वॉइस सर्च के लिए माइक्रोफ़ोन की अनुमति चाहिए। ज़्यादातर ब्राउज़र हर साइट के लिए एक बार पूछते हैं। अगर आपने गलती से ब्लॉक पर क्लिक कर दिया, तो आपको इसे हाथ से वापस बदलना होगा: एड्रेस बार में gadit.app के पास ताले या जानकारी वाले आइकन पर क्लिक करें, फिर साइट सेटिंग्स, फिर माइक्रोफ़ोन, फिर अनुमति दें।",
              "iOS के Safari पर माइक्रोफ़ोन के लिए सेटिंग्स → Safari → माइक्रोफ़ोन का टॉगल भी चालू होना चाहिए। वॉइस अभी Clear और Deep की सुविधा है: Basic यूज़र्स को अपग्रेड का सुझाव दिखता है, साइन आउट विज़िटर्स को साइन इन का।",
            ],
          },
          {
            id: "no-image",
            q: "शब्द के लिए चित्र नहीं बन रहा।",
            a: [
              "चित्र बनाना Clear या Deep की सुविधा है, जिसका एक मासिक कोटा है। Clear में हर महीने 30 चित्र मिलते हैं, Deep में 100। अगर आपका कोटा खत्म हो गया है, तो आपको एक रोक दिखेगी। यह हर महीने की 1 तारीख को रीसेट होता है।",
              "अगर आपका कोटा बचा है और फिर भी विफलता दिख रही है, तो आम तौर पर यह अस्थायी होता है। 30 सेकंड बाद फिर कोशिश करें। लगातार विफलता एक बग है। कृपया शब्द वाले पेज से रिपोर्ट करें।",
            ],
          },
          {
            id: "save-word",
            q: "मैं किसी शब्द को अपनी नोटबुक में कैसे सहेजूँ?",
            a: [
              "किसी भी शब्द के नतीजे वाले पेज पर, शीर्षक के पास नोटबुक में सहेजें पर टैप करें। नोटबुक Clear और Deep की सुविधा है, जहाँ आप सहेजे गए शब्दों को बाद में दोहरा सकते हैं, उन्हें गैलेक्सी व्यू में देख सकते हैं और स्मार्ट अभ्यास सत्र चला सकते हैं (Deep)।",
              "जो शब्द आपने सहेजे हैं और कम से कम एक बार खोले हैं, वे लोकल कैश से ऑफ़लाइन उपलब्ध रहते हैं। ऑफ़लाइन पैक आपकी भाषा के सबसे लोकप्रिय शब्द भी सहेज लेता है, ताकि आप बिना इंटरनेट के भी तैयार रहें।",
            ],
          },
          {
            id: "offline",
            q: "ऑफ़लाइन मोड कैसे काम करता है?",
            a: [
              "जो शब्द आप पहले देख चुके हैं, वे डिवाइस पर सहेज लिए जाते हैं। बिना इंटरनेट के उन्हें फिर खोलें और वे तुरंत लोड हो जाते हैं। पूरा ऑफ़लाइन पैक (आपकी भाषा के प्रमुख शब्द) नोटबुक पेज से माँगने पर डाउनलोड होता है।",
              "बिल्कुल नए शब्द की खोज के लिए अब भी इंटरनेट चाहिए, क्योंकि Gadit को परिभाषा शुरू से बनानी होती है। ऑफ़लाइन कैश उन शब्दों के लिए है जिन्हें आप पहले देख चुके हैं।",
            ],
          },
          {
            id: "slow",
            q: "ऐप धीमा लग रहा है।",
            a: [
              "किसी शब्द की पहली खोज सबसे धीमी होती है, क्योंकि Gadit पूरा नतीजा शुरू से बनाता है: आम तौर पर कुछ सेकंड, कठिन शब्दों के लिए कभी-कभी ज़्यादा। उसी शब्द की बाद की खोजें कैश से तुरंत आ जाती हैं।",
              "अगर सब कुछ धीमा लगे, तो हार्ड रिफ़्रेश आज़माएँ: Mac पर Cmd+Shift+R, Windows पर Ctrl+Shift+R। अगर हर पेज पर धीमापन बना रहे, तो कृपया अपने देश और ब्राउज़र के बारे में हमें ईमेल करें, ताकि टीम आपके क्षेत्र से हमारे सर्वरों तक के नेटवर्क रास्ते की जाँच कर सके।",
            ],
          },
          {
            id: "word-not-found",
            q: "मैंने एक शब्द खोजा और कोई नतीजा नहीं मिला। क्या हो रहा है?",
            a: [
              "सबसे पहले वर्तनी जाँचें। Gadit ज़्यादातर छोटी टाइपिंग गलतियाँ संभाल लेता है, लेकिन गलत स्वर या छूटा हुआ अक्षर उसे भटका सकता है। अगर कोई सुझाया गया सुधार दिखे, तो उसे आज़माएँ।",
              "इसके अलावा: बहुत दुर्लभ या बोलचाल (स्लैंग) के शब्दों का नतीजा भरोसेमंद न भी हो। अगर आपको यकीन है कि शब्द असली है, तो नतीजे वाले पेज (या त्रुटि स्क्रीन) पर रिपोर्ट करें बटन पर क्लिक करें और हमें बताएँ। हर रिपोर्ट की समीक्षा होती है और सचमुच छूटे शब्द सिस्टम में वापस जोड़े जाते हैं।",
            ],
          },
          {
            id: "change-language",
            q: "मैं इंटरफ़ेस की भाषा कैसे बदलूँ?",
            a: [
              "हर पेज के ऊपर दाईं ओर आपको एक छोटा झंडे वाला आइकन (या आपकी मौजूदा भाषा का नाम) दिखेगा। उस पर टैप करें और 30+ भाषाओं में से चुनें: अंग्रेज़ी, ग्रीक, हिब्रू, अरबी, रूसी, स्पेनिश, पुर्तगाली, फ़्रेंच, जर्मन, चेक, स्लोवाक, इतालवी, जापानी, हिन्दी, अम्हारिक, ज़ुलु।",
              "आपकी पसंद इस डिवाइस पर सहेजी जाती है। सब कुछ नई भाषा में फिर से लोड होता है: इंटरफ़ेस, मेन्यू, आगे की शब्द परिभाषाएँ, उदाहरण, बच्चों की व्याख्याएँ, यहाँ तक कि व्युत्पत्ति भी। पुरानी भाषा में पहले से कैश हुए नतीजे तब तक रहते हैं जब तक आप उन शब्दों को फिर से नहीं खोजते।",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "पार्टनर प्रोग्राम",
        items: [
          {
            id: "join-partner",
            q: "मैं Gadit पार्टनर कैसे बनूँ?",
            a: [
              "किसी भी पेज से /partners खोलें और \"पार्टनर बनें\" पर क्लिक करें। अपने नाम और ईमेल से साइन अप करें, और आपका खास रेफ़रल लिंक और क्लिक व कमीशन देखने के लिए एक डैशबोर्ड तुरंत तैयार हो जाता है। मंज़ूरी का इंतज़ार नहीं।",
              "जुड़ना मुफ़्त है और सबके लिए खुला है। पार्टनर बनने के लिए आपको Gadit सदस्यता की ज़रूरत नहीं है।",
            ],
          },
          {
            id: "commission-model",
            q: "कमीशन कैसे तय होता है?",
            a: [
              "मानक शर्तें हैं: ग्राहक अपने पहले साल में जो भी भुगतान करता है, हर भुगतान का 25%। पहले साल के बाद, जब तक ग्राहक भुगतान करता रहता है, आपको हर भुगतान का 10% मिलता है।",
              "यह मासिक और सालाना दोनों प्लान के लिए एक जैसा काम करता है, क्योंकि कमीशन हर वास्तविक भुगतान पर गिना जाता है। अगर ग्राहक रद्द करता है, तो आपका कमीशन उसके आखिरी भुगतान के साथ रुक जाता है।",
              "टीम कुछ खास पार्टनर्स के लिए अलग दरें तय कर सकती है। आपकी अपनी दरें हमेशा आपके पार्टनर डैशबोर्ड में दिखती हैं, जहाँ आप /partners से पहुँच सकते हैं।",
            ],
          },
          {
            id: "payout",
            q: "मुझे भुगतान कब मिलता है?",
            a: [
              "हर महीने, जब आपका बैलेंस $50 से ऊपर चला जाए। हम वही भुगतान तरीका इस्तेमाल करते हैं जो आपने पार्टनर डैशबोर्ड में चुना है (बैंक ट्रांसफ़र, PayPal वगैरह)। $50 न्यूनतम सीमा है, कोई ऊपरी सीमा नहीं। आप इससे कहीं ज़्यादा कमा सकते हैं, बस भुगतान तब मिलता है जब आप यह सीमा पार करते हैं।",
              "रिफ़ंड की अवधि को ध्यान में रखते हुए, कमीशन सदस्यता भुगतान के 30 दिन बाद जारी होता है। यानी जनवरी की सदस्यता फ़रवरी की शुरुआत में जारी होती है और बैलेंस $50 से ऊपर जाने पर आपके अगले भुगतान में आ जाती है।",
            ],
          },
          {
            id: "empty-dashboard",
            q: "जुड़ने के बाद भी मेरा डैशबोर्ड खाली है।",
            a: [
              "आँकड़े आपके लिंक पर पहले क्लिक के बाद दिखते हैं। खाली होने का मतलब बस इतना है कि अभी तक किसी ने क्लिक नहीं किया। जाइए, लिंक शेयर कीजिए। गतिविधि शुरू होते ही डैशबोर्ड लगभग रियल टाइम में अपडेट होता है।",
              "अगर आपने लिंक शेयर किया है और किसी ने साइन अप किया है, लेकिन डैशबोर्ड में नहीं दिख रहा, तो साइन अप के अंदाज़न समय के साथ हमें लिखें और टीम एट्रिब्यूशन की जाँच करेगी।",
            ],
          },
          {
            id: "attribution-window",
            q: "मेरा रेफ़रल लिंक किसी विज़िटर को कितने समय तक ट्रैक करता है?",
            a: [
              "साठ दिन। जब कोई विज़िटर आपके लिंक पर क्लिक करता है, तो हम एक कुकी सेट करते हैं जो आपको रेफ़र करने वाले के रूप में पहचानती है। अगर वह अगले 60 दिनों में कभी भी साइन अप करके सदस्यता लेता है (भले ही वह साइट छोड़कर बाद में Google सर्च से वापस आए), तब भी श्रेय आपको मिलता है।",
              "कुकी हटाना: अगर विज़िटर साइन अप से पहले अपनी कुकीज़ हटा देता है या ब्राउज़र/डिवाइस बदल लेता है, तो एट्रिब्यूशन खो सकता है। इसका कोई उपाय नहीं है, लेकिन ज़्यादातर पार्टनर प्रोग्राम की तुलना में 60 दिन एक उदार अवधि है।",
            ],
          },
          {
            id: "missing-commission",
            q: "किसी ने मेरे लिंक से साइन अप किया, लेकिन मुझे कमीशन नहीं दिख रहा।",
            a: [
              "ज़्यादातर यह समय की बात होती है: साइन अप कुछ ही मिनटों में डैशबोर्ड में दिख जाता है, लेकिन कमीशन तभी दर्ज होता है जब सदस्यता का वास्तव में भुगतान हो जाए (अगर वे फ़्री ट्रायल पर हैं तो इसमें कुछ दिन लग सकते हैं)। ट्रायल खत्म होने के बाद फिर देखें।",
              "अगर सदस्यता का भुगतान हो गया है, लेकिन 48 घंटे बाद भी कमीशन नहीं दिख रहा, तो साइन अप का अंदाज़न समय और अगर पता हो तो सदस्य का ईमेल या अंदाज़न नाम लिखकर हमें भेजें। टीम एट्रिब्यूशन की पूरी कड़ी जाँचेगी और कोई चूक हो तो उसे हाथ से ठीक करेगी।",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "सामान्य",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit क्या है?",
            a: [
              "एक बहुभाषी डिक्शनरी, जो सिर्फ़ एक लाइन की परिभाषा देने के बजाय शब्द को सचमुच समझ में बिठाने के लिए बनी है। हर शब्द अपने सभी अर्थों, हर अर्थ के असली उदाहरणों, मुहावरों, व्युत्पत्ति, एक वैकल्पिक चित्र और (Clear और Deep के साथ) बच्चों के लिए आसान व्याख्या, अपना वाक्य लिखकर फ़ीडबैक और क्विज़ के साथ खुलता है।",
              "फ़िलहाल 30+ इंटरफ़ेस भाषाएँ। टीम के अंदर हम इसे किसी शब्द को \"GAD करना\" कहते हैं: शब्द को सिर्फ़ अनुवाद करना नहीं, उसे पूरी तरह समझना।",
            ],
          },
          {
            id: "languages",
            q: "आप किन भाषाओं को सपोर्ट करते हैं?",
            a: [
              "इंटरफ़ेस: अंग्रेज़ी, ग्रीक, हिब्रू, अरबी, रूसी, स्पेनिश, पुर्तगाली, फ़्रेंच, जर्मन, चेक, स्लोवाक, इतालवी, जापानी, ज़ुलु।",
              "आप इनमें से किसी भी भाषा में शब्द खोज सकते हैं और परिभाषा, उदाहरण और बाकी सब कुछ अपनी चुनी हुई इंटरफ़ेस भाषा में पा सकते हैं। हिब्रू और अरबी पूरी तरह RTL हैं और अपने मूल फ़ॉन्ट इस्तेमाल करती हैं।",
            ],
          },
          {
            id: "kid-safety",
            q: "क्या Gadit बच्चों के लिए सुरक्षित है?",
            a: [
              "Gadit इस तरह बनाया गया है कि माता-पिता इसे बच्चे के साथ सुरक्षित रूप से इस्तेमाल कर सकें। किड्स मोड ऐसी व्याख्याएँ बनाता है जो सरल, ठोस और उम्र के अनुकूल हों (लगभग 5 से 10 साल के स्तर की), उसी इंजन से जो वयस्कों का कंटेंट बनाता है, लेकिन सरल बनाने के स्पष्ट निर्देशों के साथ। बच्चों को कभी भी यूज़र्स का बनाया कंटेंट नहीं दिखाया जाता।",
              "हमारी नीतियों और दुनिया भर के बच्चों की निजता के नियमों के अनुसार, खुद का अलग अकाउंट 13 साल और उससे ज़्यादा उम्र के लिए है। आम तरीका यह है कि माता-पिता का अकाउंट हो जिसे वे अपने बच्चे के साथ मिलकर इस्तेमाल करें, और किड्स मोड ठीक इसी के लिए बना है।",
            ],
          },
          {
            id: "data",
            q: "मेरा डेटा कहाँ रखा जाता है? क्या आप उसे बेचते हैं?",
            a: [
              "अकाउंट, इतिहास, नोटबुक और बनाए गए चित्र Firebase में सुरक्षित रूप से, स्टोरेज में एन्क्रिप्ट करके रखे जाते हैं। हम आपका डेटा किसी को नहीं बेचते। हम सिर्फ़ वही शेयर करते हैं जो Gadit चलाने के लिए ज़रूरी है (स्टोरेज, भुगतान, कंटेंट प्रदाता), जैसा कि गोपनीयता नीति में बताया गया है।",
              "आप अकाउंट पेज से कभी भी अपनी नोटबुक एक्सपोर्ट कर सकते हैं या अपना अकाउंट डिलीट कर सकते हैं।",
            ],
          },
          {
            id: "contact-direct",
            q: "मैं आपसे सीधे कैसे संपर्क करूँ?",
            a: [
              "इस पेज के नीचे दिए ईमेल बटन का इस्तेमाल करें। यह सीधे टीम के इनबॉक्स में जाता है। हर संदेश पढ़ा जाता है और 24 से 48 घंटे के भीतर (अक्सर उससे पहले) जवाब मिलता है।",
              "सपोर्ट के लिए ईमेल चैट से बेहतर है: इससे टीम को ध्यान से पढ़ने और सोच-समझकर जवाब देने का मौका मिलता है। फ़ोन सपोर्ट अभी उपलब्ध नहीं है।",
            ],
          },
        ],
      },
    ],
  },
  am: {
    eyebrow: "የእገዛ ማዕከል",
    heading: "መልስ በፍጥነት ያግኙ።",
    lede: "የተለመዱ ጥያቄዎችና ደረጃ በደረጃ መፍትሄዎች፣ በዘርፍ ተደራጅተው። ችግርዎን እዚህ ካላገኙት፣ ከገጹ ግርጌ ቡድናችንን ያግኙ።",
    stillNeedHelpHeading: "አሁንም አልተፈታም?",
    stillNeedHelpBody: "በቀጥታ ይጻፉልን። እያንዳንዱን መልእክት ቡድኑ ያነባል፣ በአንድ ወይም በሁለት ቀን ውስጥም መልስ ይሰጣል።",
    emailCta: "ኢሜይል ይላኩልን",
    responseTime: "የተለመደው የመልስ ጊዜ: ከ24 እስከ 48 ሰዓት ውስጥ።",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "ክፍያ እና ምዝገባ",
        items: [
          {
            id: "change-card",
            q: "የምዝገባዬን ክሬዲት ካርድ እንዴት መቀየር እችላለሁ?",
            a: [
              "ምዝገባዎን ሳይሰርዙ ከአንድ ደቂቃ ባነሰ ጊዜ ወደ አዲስ ካርድ መቀየር ይችላሉ። አሁን ያለዎት ምዝገባ እንደቀጠለ ይቆያል፣ በአዲሱ ካርድ ብቻ።",
              "1. በ gadit.app ይግቡና የመለያዎን ገጽ ይክፈቱ (ከላይ በቀኝ)። 2. \"ክፍያን ያስተዳድሩ\" የሚለውን ይጫኑ። 3. ደህንነቱ የተጠበቀ የ Stripe ገጽ ይከፈታል። \"የክፍያ ዘዴ ያክሉ\" የሚለውን ይጫኑ፣ አዲሱን ካርድ ያስገቡ፣ እንደ ዋና (Default) ምልክት ያድርጉበት። 4. ከፈለጉ የድሮውን ካርድ ያስወግዱ።",
              "ከቀጣዩ የክፍያ ዙር ጀምሮ ሁሉም ክፍያ በአዲሱ ካርድ ይፈጸማል። ቀደም ሲል የተከፈለው ክፍያ (አስቀድሞ የተሰበሰበው) በድሮው ካርድ ላይ ይቆያል። በተለይ ካልፈለጉ በስተቀር ገንዘብ መመለስ አያስፈልግም።",
            ],
          },
          {
            id: "cancel",
            q: "ምዝገባዬን እንዴት መሰረዝ እችላለሁ?",
            a: [
              "በራስዎ፣ በማንኛውም ጊዜ። ይግቡ፣ መለያን ይክፈቱ፣ እና በእቅድዎ ስር \"ምዝገባውን ይሰርዙ\" የሚለውን ይንኩ።",
              "አስቀድመው የከፈሉበት ጊዜ እስኪያልቅ ድረስ መጠቀምዎን ይቀጥላሉ። ከዚያ በኋላ መለያው ወደ Basic (ነጻ) ይመለሳል። ያስቀመጧቸው ቃላት፣ ታሪክዎና ማስታወሻ ደብተርዎ ደህንነታቸው ተጠብቆ ተደራሽ ሆነው ይቆያሉ።",
              "በስህተት ከሰረዙ ወይም ሐሳብዎን ከቀየሩ፣ ጊዜው ከማለቁ በፊት ከዚያው ገጽ ምዝገባውን መቀጠል ይችላሉ።",
            ],
          },
          {
            id: "switch-plan",
            q: "ከ Clear ወደ Deep (ወይም በተቃራኒው) እንዴት መቀየር እችላለሁ?",
            a: [
              "መለያ፣ ከዚያ ክፍያን ያስተዳድሩ፣ ከዚያ ምዝገባን ያዘምኑ። አዲሱን ዕቅድ ይምረጡ።",
              "Stripe የዋጋውን ልዩነት በአሁኑ ጊዜ ውስጥ በቀሩት ቀናት መጠን በራሱ ያሰላል። ወደ ከፍተኛ ዕቅድ የሚያሳድጉ ከሆነ፣ ለቀረው ጊዜ ልዩነቱን ብቻ ይከፍላሉ። ወደ ዝቅተኛ ዕቅድ የሚቀይሩ ከሆነ፣ ቀሪው ሂሳብ በቀጣዩ ክፍያዎ ላይ ይታሰባል።",
            ],
          },
          {
            id: "invoice",
            q: "ደረሰኝ ወይም የክፍያ ማረጋገጫ እንዴት ማውረድ እችላለሁ?",
            a: [
              "መለያ፣ ከዚያ ክፍያን ያስተዳድሩ፣ ከዚያ የደረሰኝ ታሪክ። ለእያንዳንዱ ክፍያ ያስቀመጡትን የክፍያ መረጃ የያዘ PDF ደረሰኝ ማውረድ ይቻላል።",
              "በደረሰኙ ላይ የተለየ ስም፣ አድራሻ ወይም የግብር መለያ ቁጥር ካስፈለገዎት (ለምሳሌ ለግብር ዓላማ የድርጅት ስም)፣ ከማውረድዎ በፊት በዚያው ገጽ የክፍያ መረጃዎን ያዘምኑ። ቀጣዩ ደረሰኝ አዲሱን መረጃ ይጠቀማል።",
            ],
          },
          {
            id: "portal-error",
            q: "ክፍያን ያስተዳድሩ የሚለውን ስጫን ስህተት መጣ። አሁን ምን ላድርግ?",
            a: [
              "ሁለት የተለመዱ ምክንያቶች አሉ። አንደኛ፣ መለያዎ ንቁ የ Stripe ምዝገባ የለውም። ሁለተኛ፣ Stripe ለመለያዎ የተሟላ የክፍያ መገለጫ ገና ላይኖረው ይችላል።",
              "ቀላሉ የመጀመሪያ ማረጋገጫ: ይውጡ፣ ሲከፍሉ በተጠቀሙበት ኢሜይል እንደገና ይግቡ፣ እንደገናም ይሞክሩ። አሁንም ካልሰራ፣ የመለያዎን ኢሜይል ይዘው ያግኙን፣ ቡድኑም ከእኛ በኩል በደቂቃ ውስጥ ያስተካክለዋል።",
            ],
          },
          {
            id: "autorenew",
            q: "ምዝገባዬ በራሱ ይታደሳል?",
            a: [
              "አዎ። ወርሃዊ ዕቅዶች በየወሩ፣ ዓመታዊ ዕቅዶች ደግሞ በየዓመቱ በዚያው ቀን ይታደሳሉ። ቀጣዩን የክፍያ ቀን በመለያዎ ውስጥና በ Stripe መግቢያ ገጽ ላይ ማየት ይችላሉ።",
              "በራስ መታደስን ካልፈለጉ፣ ከመታደሻው ቀን በፊት በማንኛውም ጊዜ ይሰርዙ። መሰረዙ ወዲያውኑ ተግባራዊ አይሆንም። አስቀድመው በከፈሉበት ጊዜ ሁሉ መጠቀምዎን ይቀጥላሉ።",
            ],
          },
          {
            id: "refund",
            q: "ገንዘቤ ሊመለስልኝ ይችላል?",
            a: [
              "አዎ። ግዢው ከ14 ቀን በታች ከሆነና አገልግሎቱን ብዙም ካልተጠቀሙበት፣ የመለያዎን ኢሜይልና ምክንያቱን የሚገልጽ አጭር ማስታወሻ ይዘው ይጻፉልን። እንዲህ ያሉ ጥያቄዎች ያለ ክርክር ይጸድቃሉ።",
              "ከ14 ቀን በላይ ከሆነ፣ ቡድኑ እያንዳንዱን ጉዳይ በተናጠል ይመለከታል። መታደሱን እንዳይቀጥል ምዝገባውን ይሰርዙና ኢሜይል ይላኩልን።",
            ],
          },
          {
            id: "unknown-charge",
            q: "የማላውቀው ክፍያ አያለሁ።",
            a: [
              "ክፍያዎች GADIT ወይም GADIT.APP በሚል ስም፣ በ $2.99 (Clear ወርሃዊ)፣ $4.99 (Deep ወርሃዊ)፣ $29.99 (Clear ዓመታዊ) ወይም $49.99 (Deep ዓመታዊ) መጠን ይታያሉ። የማይዛመድ ከሆነ፣ ከሌላ አገልግሎት ሊሆን ይችላል።",
              "የእርስዎ እንዳልሆነ እርግጠኛ ቢሆኑም፣ ገና በባንክዎ በኩል ቅሬታ አያቅርቡ። መጀመሪያ ቀኑንና መጠኑን ይዘው በቀጥታ ይጻፉልን። ቡድኑ ክፍያውን አግኝቶ ምን እንደሆነ ያስረዳል፣ ካስፈለገም ገንዘቡን ይመልሳል። የባንክ ቅሬታ ወደፊት ክፍያን ሊያወሳስብ ስለሚችል፣ በድጋፍ በኩል መፍታት ብዙውን ጊዜ ፈጣንና ደህንነቱ የተጠበቀ ነው።",
            ],
          },
          {
            id: "failed-payment",
            q: "ክፍያዬ አልተሳካም። ምን ማድረግ አለብኝ?",
            a: [
              "Stripe ያልተሳኩ ክፍያዎችን በሚቀጥሉት ቀናት ውስጥ በራሱ ጥቂት ጊዜ እንደገና ይሞክራል። ባንኩ እገዳውን ሲያነሳ ወይም ካርዱ በቂ ቀሪ ሂሳብ ሲኖረው አብዛኞቹ ችግሮች በራሳቸው ይፈታሉ።",
              "ወዲያውኑ ማስተካከል ከፈለጉ፣ ወደ መለያ → ክፍያን ያስተዳድሩ → የክፍያ ዘዴ ያክሉ ይሂዱ፣ የሚሰራ ካርድ ያስገቡና እንደ ዋና ያድርጉት። Stripe ያልተሳካውን ክፍያ በአዲሱ ካርድ ወዲያውኑ እንደገና ይሞክራል። ምዝገባዎ አስቀድሞ ወደ Basic ተመልሶ ከሆነ፣ ከዋጋዎች ገጽ እንደገና መመዝገብ ይችላሉ፣ ማስታወሻ ደብተርዎም እንዳለ ይቆያል።",
            ],
          },
          {
            id: "plan-comparison",
            q: "በ Basic፣ Clear እና Deep መካከል ያለው ልዩነት ምንድን ነው?",
            a: [
              "Basic (ነጻ): በቀን እስከ 20 የቃል ፍለጋዎች፣ ሁሉም ትርጉሞች፣ ለእያንዳንዱ ትርጉም ምሳሌዎች፣ ፈሊጦችና የቃሉ መነሻ። ለመሠረታዊ ፍለጋ መመዝገብ አያስፈልግም።",
              "Clear ($2.99 በወር ወይም $29.99 በዓመት): ያልተገደበ ፍለጋ፣ ለልጆች የሚመቹ ማብራሪያዎች፣ ለእያንዳንዱ ቃል ምስል (በወር 30)፣ የራስዎን ዓረፍተ ነገር ጽፈው ግብረ መልስ ማግኘት፣ የፈሊጦች ዝርዝርና የ30 ቀን የፍለጋ ታሪክ።",
              "Deep ($4.99 በወር ወይም $49.99 በዓመት): በ Clear ያለው ሁሉ፣ በተጨማሪም የልምምድ ፈተናዎች፣ በተወሰነ ልዩነት ብልህ መደጋገም ያለው የግል ማስታወሻ ደብተር፣ ተመሳሳይ ቃላትን መለየትና ከፍ ያለ የምስል ኮታ (በወር 100)።",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "መለያ እና መግቢያ",
        items: [
          {
            id: "no-verification-email",
            q: "የማረጋገጫ ኢሜይል አልደረሰኝም።",
            a: [
              "መጀመሪያ የአይፈለጌ መልእክት (spam) እና የማስታወቂያ አቃፊዎችን ይመልከቱ። Gmail እና Outlook አንዱን \"አይፈለጌ አይደለም\" ብለው ምልክት እስኪያደርጉ ድረስ አንዳንድ ጊዜ የመለያ ኢሜይሎችን ወደዚያ ይልካሉ።",
              "እዚያ ከሌለ፣ ሲመዘገቡ ኢሜይሉ በስህተት ተጽፎ ሊሆን ይችላል። አድራሻውን በጥንቃቄ አረጋግጠው እንደገና ለመመዝገብ ይሞክሩ። በ Google ከተመዘገቡ፣ የማረጋገጫ ኢሜይል አያስፈልግም።",
            ],
          },
          {
            id: "forgot-password",
            q: "የይለፍ ቃሌን ረሳሁት።",
            a: [
              "የመግቢያ መስኮቱን ይክፈቱና \"የይለፍ ቃል ረሱ?\" የሚለውን ይጫኑ። ለ Gadit የሚጠቀሙበትን ኢሜይል ያስገቡ፣ በአንድ ወይም በሁለት ደቂቃ ውስጥም የዳግም ማስጀመሪያ አገናኝ ይደርስዎታል።",
              "ኢሜይሉ ካልደረሰ፣ የአይፈለጌ መልእክት አቃፊውን ይመልከቱ። አሁንም ካልደረሰ፣ በኢሜይልና በይለፍ ቃል ሳይሆን በ Google ተመዝግበው ሊሆን ይችላል። \"በ Google ይቀጥሉ\" የሚለውን አዝራር ይሞክሩ።",
            ],
          },
          {
            id: "wrong-credentials",
            q: "የይለፍ ቃሌ ትክክል እንደሆነ እርግጠኛ ነኝ፣ ግን \"የተሳሳተ ኢሜይል ወይም የይለፍ ቃል\" ይላል።",
            a: [
              "ሦስት ነገሮችን ያረጋግጡ። አንደኛ፣ Caps Lock። ሁለተኛ፣ ሲቀዱና ሲለጥፉ መጨረሻ ላይ የቀረ ባዶ ቦታ። ሦስተኛ፣ በይለፍ ቃል ፈንታ በ Google ተመዝግበው እንደሆነ (ያን ጊዜ \"በ Google ይቀጥሉ\" የሚለውን ይጠቀሙ)።",
              "አሁንም አልሆነም? ከዚያው መስኮት የይለፍ ቃሉን ዳግም ያስጀምሩ። ሁሉንም ነገር ከአዲስ ያስተካክልልዎታል።",
            ],
          },
          {
            id: "google-fails",
            q: "በ Google መግባት አይሰራም።",
            a: [
              "በጣም የተለመደው ምክንያት: አሳሽዎ ለ gadit.app የሶስተኛ ወገን ኩኪዎችን ወይም ብቅ ባይ መስኮቶችን እየከለከለ ነው። በአድራሻ አሞሌው ፈቃዶች ውስጥ ይፍቀዷቸውና እንደገና ይሞክሩ።",
              "በማንነት የማያሳውቅ (incognito) ሁነታ ላይ ከሆኑ፣ በ Google መግባት ሆን ተብሎ የተገደበ ነው። ወደ መደበኛ የአሳሽ መስኮት ይቀይሩ።",
            ],
          },
          {
            id: "change-email",
            q: "በመለያዬ ላይ ያለውን ኢሜይል እንዴት መቀየር እችላለሁ?",
            a: [
              "መለያ፣ ኢሜይልዎን ይጫኑ፣ ኢሜይል ቀይር። ለውጡ ከመጽናቱ በፊት አዲሱን አድራሻ ማረጋገጥ ያስፈልግዎታል። ምዝገባዎ፣ ታሪክዎና ማስታወሻ ደብተርዎ ሁሉም ወደ አዲሱ ይዛወራሉ።",
              "ኢሜይሉ ከ Stripe ደንበኛ ጋር የተያያዘ ከሆነ፣ ወደፊት ደረሰኞች ወደ አዲሱ አድራሻ እንዲመጡ በ Stripe የክፍያ መግቢያ ገጽ ላይም ያዘምኑት።",
            ],
          },
          {
            id: "delete-account",
            q: "መለያዬን እንዴት መሰረዝ እችላለሁ?",
            a: [
              "መለያ፣ በገጹ ግርጌ፣ መለያ ሰርዝ። ይህ ቋሚ ነው። ምዝገባዎ ይሰረዛል፣ ማስታወሻ ደብተርዎና ታሪክዎ ይጠፋሉ፣ ኢሜይሉም ለአዲስ ምዝገባ ነጻ ይሆናል።",
              "ያለፉ ክፍያዎች የ Stripe መዛግብት ይቆያሉ (ለሂሳብ አያያዝ እንድንይዛቸው በሕግ ይጠበቅብናል)። ከዚህ ውጪ ምንም አይቀርም።",
            ],
          },
          {
            id: "share-account",
            q: "የትዳር አጋሬ ወይም ልጄ መለያዬን መጋራት ይችላሉ?",
            a: [
              "በአንድ መለያ ላይ በአንድ ጊዜ አንድ ተጠቃሚ ብቻ መግባት ይችላል። የልጆች ሁነታ አንድ Clear ወይም Deep መለያ ወላጅንና ልጅን እንዲያገለግል ያስችላል: ማብሪያ ማጥፊያውን ይቀይሩ፣ ትርጉሞቹም ያለ የተለየ መግቢያ ለልጆች በሚመች መልኩ ይታያሉ።",
              "ሁለት አዋቂዎች እያንዳንዳቸው የራሳቸውን ማስታወሻ ደብተርና እድገት ከፈለጉ፣ ሁለት መለያዎችን ይፍጠሩ። Clear ለእያንዳንዱ መለያ በወር $2.99 ነው።",
            ],
          },
          {
            id: "multiple-accounts",
            q: "በስህተት ሁለት መለያዎች ያሉኝ ይመስለኛል። አሁን ምን ላድርግ?",
            a: [
              "ይህ ብዙውን ጊዜ የሚሆነው አንድ ሰው በአንድ አድራሻ አንድ ጊዜ በ Google፣ አንድ ጊዜ ደግሞ በኢሜይልና በይለፍ ቃል ሲመዘገብ፣ ወይም በተለያዩ የኢሜይል አድራሻዎች ሁለት ጊዜ ሲመዘገቡ ነው። እያንዳንዱ ምዝገባ የራሱ ማስታወሻ ደብተር፣ ታሪክና የምዝገባ ሁኔታ ያለው የተለየ የ Gadit መለያ ይፈጥራል።",
              "ሁለቱንም የኢሜይል አድራሻዎች (ወይም ከመለያ ገጹ የሚገኙትን UID) እና የትኛውን ማቆየት እንደሚፈልጉ ይጻፉልን። ቡድኑ ማስታወሻ ደብተሮቹንና ታሪኩን እርስዎ በመረጡት መለያ ላይ ያዋህዳል፣ ከዚያም ሌላውን በንጽሕና ይዘጋዋል። ምንም መረጃ አይጠፋም።",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Gadit መጠቀም",
        items: [
          {
            id: "wrong-definition",
            q: "ትርጉሙ የተሳሳተ ይመስለኛል። ምን ላድርግ?",
            a: [
              "እያንዳንዱ የውጤት ገጽ ግርጌ ላይ ትንሽ \"ሪፖርት አድርግ\" አዝራር አለ። ይጫኑት፣ ምድብ ይምረጡ (ትርጉም፣ የቃል መነሻ፣ ምሳሌ፣ ፈሊጥ፣ የልጆች ማብራሪያ፣ ወዘተ) እና አጭር ማስታወሻ ይጻፉ። በቀጥታ ቡድኑ ዘንድ ይደርሳል፣ እያንዳንዱ ሪፖርትም ይገመገማል።",
              "ከልክ በላይ ጥቃቅን ነገር እንደሚያነሱ አይጨነቁ። መዝገበ ቃላቱ ከምንም ነገር በላይ በፍጥነት የሚሻሻለው በዚህ ዓይነቱ ግብረ መልስ ነው።",
            ],
          },
          {
            id: "kids-not-working",
            q: "የልጆች ሁነታ ማብራሪያውን እየቀየረ አይደለም።",
            a: [
              "የልጆች ሁነታ ጽሑፉን የሚቀይረው ለቃሉ ለልጆች የሚመች ማብራሪያ አስቀድሞ ከተዘጋጀ ብቻ ነው። አሁን ለፈለጓቸው ፍጹም አዲስ ቃላት፣ ከ10 እስከ 15 ሰከንድ ይጠብቁ። የልጆቹ ስሪት ለመጀመሪያ ጊዜ በዚያው ቅጽበት ይዘጋጃል።",
              "በተጨማሪም: የልጆች ሁነታ Clear ወይም Deep ያስፈልገዋል። Basic ላይ ከሆኑ፣ ማብሪያ ማጥፊያው ዕቅድዎን እንዲያሳድጉ ይጠይቅዎታል። ያልገቡ ተጠቃሚዎች እንዲመዘገቡ ይጠየቃሉ።",
            ],
          },
          {
            id: "voice-fails",
            q: "የድምፅ ፍለጋ አይሰራም።",
            a: [
              "የድምፅ ፍለጋ የማይክሮፎን ፈቃድ ያስፈልገዋል። አብዛኞቹ አሳሾች ለእያንዳንዱ ድረ ገጽ አንድ ጊዜ ይጠይቃሉ። በስህተት አግድ የሚለውን ከተጫኑ፣ በእጅ መመለስ ያስፈልግዎታል: በአድራሻ አሞሌው ውስጥ ከ gadit.app አጠገብ ያለውን የቁልፍ ወይም የመረጃ አዶ ይጫኑ፣ ከዚያ የድረ ገጽ ቅንብሮች፣ ከዚያ ማይክሮፎን፣ ከዚያ ፍቀድ።",
              "በ iOS Safari ላይ የማይክሮፎን መዳረሻ በቅንብሮች → Safari → ማይክሮፎን ያለውን ማብሪያ ማጥፊያም ይፈልጋል። ድምፅ በአሁኑ ጊዜ የ Clear እና Deep ባህሪ ነው: የ Basic ተጠቃሚዎች ዕቅድ የማሳደግ ጥያቄ ያያሉ፣ ያልገቡ ጎብኚዎች ደግሞ የመግቢያ ጥያቄ ያያሉ።",
            ],
          },
          {
            id: "no-image",
            q: "ለቃሉ ምስል መፍጠር አልቻልኩም።",
            a: [
              "ምስል መፍጠር ወርሃዊ ኮታ ያለው የ Clear ወይም Deep ባህሪ ነው። Clear በወር 30 ምስሎች፣ Deep ደግሞ 100 ያገኛል። ኮታውን ከጨረሱ፣ እገዳ ያያሉ። በየወሩ በ1ኛው ቀን እንደገና ይጀምራል።",
              "ከኮታው በታች ሆነው አሁንም ካልተሳካ፣ ብዙውን ጊዜ ጊዜያዊ ነው። ከ30 ሰከንድ በኋላ እንደገና ይሞክሩ። የማያቋርጥ ውድቀት ስህተት ነው። እባክዎ ከቃሉ ገጽ ሪፖርት ያድርጉ።",
            ],
          },
          {
            id: "save-word",
            q: "ቃልን ወደ ማስታወሻ ደብተሬ እንዴት ማስቀመጥ እችላለሁ?",
            a: [
              "በማንኛውም የቃል ውጤት ገጽ ላይ፣ ከርዕሱ አጠገብ ወደ ማስታወሻ ደብተር አስቀምጥ የሚለውን ይጫኑ። ማስታወሻ ደብተሩ የ Clear እና Deep ባህሪ ሲሆን፣ ያስቀመጧቸውን ቃላት በኋላ መከለስ፣ በጋላክሲ እይታ ማየትና ብልህ የልምምድ ክፍለ ጊዜዎችን (Deep) ማካሄድ ይችላሉ።",
              "ያስቀመጧቸውና ቢያንስ አንድ ጊዜ የከፈቷቸው ቃላት ከመሣሪያው ማከማቻ ያለ ኢንተርኔት ይገኛሉ። ከመስመር ውጭ ጥቅሉ በቋንቋዎ በጣም ተወዳጅ የሆኑትን ቃላትም ስለሚያስቀምጥ፣ ያለ ኢንተርኔትም ዝግጁ ይሆናሉ።",
            ],
          },
          {
            id: "offline",
            q: "ከመስመር ውጭ ሁነታ እንዴት ይሰራል?",
            a: [
              "አስቀድመው ያዩዋቸው ቃላት በመሣሪያው ላይ ይቀመጣሉ። ያለ ኢንተርኔት እንደገና ሲከፍቷቸው ወዲያውኑ ይጫናሉ። ሙሉው ከመስመር ውጭ ጥቅል (በቋንቋዎ ዋና ዋና ቃላት) ሲፈልጉ ከማስታወሻ ደብተሩ ገጽ ይወርዳል።",
              "ፍጹም አዲስ ቃል መፈለግ አሁንም ግንኙነት ይፈልጋል፣ ምክንያቱም Gadit ትርጉሙን ከመጀመሪያው ማዘጋጀት አለበት። ከመስመር ውጭ ማከማቻው አስቀድመው ለመረመሯቸው ቃላት ነው።",
            ],
          },
          {
            id: "slow",
            q: "መተግበሪያው ቀርፋፋ ይመስላል።",
            a: [
              "የአንድ ቃል የመጀመሪያ ፍለጋ በጣም ቀርፋፋው ነው፣ ምክንያቱም Gadit ሙሉውን ውጤት ከመጀመሪያው ያዘጋጃል: ብዙውን ጊዜ ጥቂት ሰከንዶች፣ ለውስብስብ ቃላት አንዳንዴ ከዚያ በላይ። የዚያው ቃል ቀጣይ ፍለጋዎች ከማከማቻው ስለሚቀርቡ ወዲያውኑ ይመጣሉ።",
              "ሁሉም ነገር ቀርፋፋ ከመሰለ፣ ሙሉ ማደስ ይሞክሩ: በ Mac ላይ Cmd+Shift+R፣ በ Windows ላይ Ctrl+Shift+R። ቀርፋፋነቱ በሁሉም ገጾች ከቀጠለ፣ ቡድኑ ከአካባቢዎ ወደ አገልጋዮቻችን ያለውን የአውታረ መረብ መስመር እንዲፈትሽ፣ እባክዎ ሀገርዎንና አሳሽዎን ገልጸው ኢሜይል ይላኩልን።",
            ],
          },
          {
            id: "word-not-found",
            q: "ቃል ፈልጌ ምንም ውጤት አላገኘሁም። ምን እየሆነ ነው?",
            a: [
              "መጀመሪያ ፊደሉን ያረጋግጡ። Gadit ትናንሽ የትየባ ስህተቶችን ብዙውን ጊዜ ይረዳል፣ ነገር ግን የተሳሳተ አናባቢ ወይም የጎደለ ፊደል ሊያሳስተው ይችላል። የእርማት ጥቆማ ከታየ ይሞክሩት።",
              "ከዚህ ባሻገር: በጣም ብርቅ የሆኑ ወይም የጎዳና ቋንቋ ቃላት አስተማማኝ ውጤት ላያመጡ ይችላሉ። ቃሉ እውነተኛ እንደሆነ እርግጠኛ ከሆኑ፣ በውጤት ገጹ (ወይም በስህተት ማያው) ላይ ያለውን ሪፖርት አድርግ የሚለውን አዝራር ይጫኑና ያሳውቁን። እያንዳንዱ ሪፖርት ይገመገማል፣ በእርግጥ የጎደሉ ቃላትም ወደ ሥርዓቱ ይጨመራሉ።",
            ],
          },
          {
            id: "change-language",
            q: "የመተግበሪያውን ቋንቋ እንዴት መቀየር እችላለሁ?",
            a: [
              "በማንኛውም ገጽ ከላይ በቀኝ ትንሽ የሰንደቅ ዓላማ አዶ (ወይም የአሁኑ ቋንቋዎ ስም) ያያሉ። ይጫኑትና ከ30 በላይ ቋንቋዎች ይምረጡ: እንግሊዝኛ፣ ግሪክኛ፣ ዕብራይስጥ፣ ዓረብኛ፣ ሩሲያኛ፣ ስፓኒሽ፣ ፖርቱጋልኛ፣ ፈረንሳይኛ፣ ጀርመንኛ፣ ቼክኛ፣ ስሎቫክኛ፣ ጣሊያንኛ፣ ጃፓንኛ፣ ሂንዲ፣ አማርኛ፣ ዙሉ።",
              "ምርጫዎ በዚህ መሣሪያ ላይ ይቀመጣል። ሁሉም ነገር በአዲሱ ቋንቋ እንደገና ይጫናል: መተግበሪያው፣ ምናሌዎቹ፣ ወደፊት የሚፈልጓቸው የቃላት ትርጉሞች፣ ምሳሌዎች፣ የልጆች ማብራሪያዎች፣ የቃሉ መነሻ ጭምር። በድሮው ቋንቋ አስቀድመው የተቀመጡ ውጤቶች እነዚያን ቃላት እንደገና እስኪፈልጉ ድረስ እንዳሉ ይቆያሉ።",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "የአጋርነት ፕሮግራም",
        items: [
          {
            id: "join-partner",
            q: "የ Gadit አጋር እንዴት መሆን እችላለሁ?",
            a: [
              "ከማንኛውም ገጽ /partners ይክፈቱና \"አጋር ይሁኑ\" የሚለውን ይጫኑ። በስምዎና በኢሜይልዎ ይመዝገቡ፣ የራስዎ የሆነ የማጣቀሻ አገናኝና ጠቅታዎችንና ኮሚሽኖችን የሚከታተሉበት ዳሽቦርድ ወዲያውኑ ይዘጋጃሉ። ማጽደቅን መጠበቅ የለም።",
              "መቀላቀል ነጻ ነው፣ ለማንኛውም ሰውም ክፍት ነው። አጋር ለመሆን የ Gadit ምዝገባ አያስፈልግዎትም።",
            ],
          },
          {
            id: "commission-model",
            q: "ኮሚሽኖች እንዴት ይሰላሉ?",
            a: [
              "መደበኛው ውል አንድ ደንበኛ በመጀመሪያው ዓመቱ ከሚፈጽመው እያንዳንዱ ክፍያ 25% ነው። ከመጀመሪያው ዓመት በኋላ፣ ደንበኛው መክፈሉን እስከቀጠለ ድረስ ከእያንዳንዱ ክፍያ 10% ያገኛሉ።",
              "ኮሚሽኑ በእያንዳንዱ ትክክለኛ ክፍያ ላይ ስለሚቆጠር፣ ለወርሃዊም ለዓመታዊም ዕቅዶች በተመሳሳይ መንገድ ይሰራል። ደንበኛው ከሰረዘ፣ ኮሚሽንዎ በመጨረሻው ክፍያው ይቆማል።",
              "ቡድኑ ለተወሰኑ አጋሮች የተለየ መጠን ሊወስን ይችላል። የራስዎ መጠኖች ሁልጊዜ ከ /partners በሚደርሱበት የአጋር ዳሽቦርድዎ ላይ ይታያሉ።",
            ],
          },
          {
            id: "payout",
            q: "ክፍያዬን መቼ አገኛለሁ?",
            a: [
              "በየወሩ፣ ቀሪ ሂሳብዎ ከ $50 ሲያልፍ። በአጋር ዳሽቦርዱ ያዘጋጁትን የክፍያ መቀበያ ዘዴ (የባንክ ዝውውር፣ PayPal፣ ወዘተ) እንጠቀማለን። $50 ዝቅተኛው ገደብ እንጂ ጣሪያ አይደለም። ከዚያ እጅግ የበለጠ ማግኘት ይችላሉ፣ ክፍያውን የሚቀበሉት ገደቡን ሲያልፉ ብቻ ነው።",
              "ለገንዘብ መመለሻ ጊዜው ሲባል፣ ኮሚሽኖች ከምዝገባ ክፍያው 30 ቀናት በኋላ ይለቀቃሉ። ስለዚህ የጥር ወር ምዝገባ በየካቲት መጀመሪያ ይለቀቃል፣ ቀሪ ሂሳብዎ ከ $50 ሲያልፍም በቀጣዩ ክፍያዎ ውስጥ ይገባል።",
            ],
          },
          {
            id: "empty-dashboard",
            q: "ተቀላቅያለሁ ግን ዳሽቦርዴ ባዶ ነው።",
            a: [
              "ስታቲስቲክሱ የሚታየው አገናኝዎ ለመጀመሪያ ጊዜ ከተጫነ በኋላ ነው። ባዶ መሆኑ ገና ማንም አልጫነውም ማለት ብቻ ነው። አገናኙን ያጋሩ። እንቅስቃሴ ሲጀመር ዳሽቦርዱ በቅጽበት ማለት በሚቻል ፍጥነት ይዘምናል።",
              "አገናኙን አጋርተው አንድ ሰው ቢመዘገብም ዳሽቦርዱ ካላሳየ፣ የምዝገባውን ግምታዊ ሰዓት ይዘው ይጻፉልን፣ ቡድኑም የማጣቀሻ ምዝገባውን ይፈትሻል።",
            ],
          },
          {
            id: "attribution-window",
            q: "የማጣቀሻ አገናኜ አንድን ጎብኚ ለምን ያህል ጊዜ ይከታተላል?",
            a: [
              "ስልሳ ቀናት። አንድ ጎብኚ አገናኝዎን ሲጫን፣ እርስዎን እንደ አጣቃሹ የሚለይ ኩኪ እናስቀምጣለን። በሚቀጥሉት 60 ቀናት ውስጥ በማንኛውም ጊዜ ተመዝግቦ ደንበኝነት ከገባ (ድረ ገጹን ለቆ በኋላ በ Google ፍለጋ ቢመለስም)፣ ምስጋናው አሁንም ለእርስዎ ይቆጠራል።",
              "ኩኪዎችን ማጽዳት: ጎብኚው ከመመዝገቡ በፊት ኩኪዎቹን ካጸዳ ወይም አሳሽ/መሣሪያ ከቀየረ፣ ማጣቀሻው ሊጠፋ ይችላል። ለዚህ መፍትሄ የለም፣ ነገር ግን ከአብዛኞቹ የአጋርነት ፕሮግራሞች ጋር ሲነጻጸር 60 ቀናት ለጋስ ጊዜ ነው።",
            ],
          },
          {
            id: "missing-commission",
            q: "አንድ ሰው በአገናኜ ተመዝግቧል ግን ኮሚሽኑን አላየሁም።",
            a: [
              "ብዙውን ጊዜ ይህ የጊዜ ጉዳይ ነው: ምዝገባው በደቂቃዎች ውስጥ በዳሽቦርዱ ላይ ይታያል፣ ኮሚሽኑ ግን የሚመዘገበው ምዝገባው በትክክል ከተከፈለ በኋላ ብቻ ነው (በነጻ ሙከራ ላይ ከሆኑ ይህ ከቀናት በኋላ ሊሆን ይችላል)። የሙከራ ጊዜው ካበቃ በኋላ እንደገና ይመልከቱ።",
              "ምዝገባው ተከፍሎ ከ48 ሰዓት በኋላም ኮሚሽኑን ካላዩ፣ የምዝገባውን ግምታዊ ሰዓትና የሚያውቁት ከሆነ የደንበኛውን ኢሜይል ወይም ግምታዊ ስም ይዘው ይጻፉልን። ቡድኑ የማጣቀሻውን ሰንሰለት መርምሮ የጎደለ ነገር ካለ በእጅ ያስተካክላል።",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "አጠቃላይ",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ምንድን ነው?",
            a: [
              "የአንድ መስመር ትርጉም ከመስጠት ባለፈ ቃሉ በእውነት እንዲገባዎት የተሠራ ባለብዙ ቋንቋ መዝገበ ቃላት። እያንዳንዱ ቃል ከሁሉም ትርጉሞቹ፣ ለእያንዳንዱ ትርጉም ከእውነተኛ ምሳሌዎች፣ ከፈሊጦች፣ ከቃሉ መነሻ፣ ከአማራጭ ምስል እና (በ Clear እና Deep) ለልጆች ከሚመች ማብራሪያ፣ የራስዎን ዓረፍተ ነገር ጽፈው ግብረ መልስ ከማግኘትና ከፈተናዎች ጋር ይከፈታል።",
              "በአሁኑ ጊዜ ከ30 በላይ የመተግበሪያ ቋንቋዎች። በቡድናችን ውስጥ ይህንን ቃልን \"GAD ማድረግ\" እንለዋለን: ቃልን መተርጎም ብቻ ሳይሆን እስከ መጨረሻው መረዳት።",
            ],
          },
          {
            id: "languages",
            q: "የትኞቹን ቋንቋዎች ትደግፋላችሁ?",
            a: [
              "መተግበሪያ: እንግሊዝኛ፣ ግሪክኛ፣ ዕብራይስጥ፣ ዓረብኛ፣ ሩሲያኛ፣ ስፓኒሽ፣ ፖርቱጋልኛ፣ ፈረንሳይኛ፣ ጀርመንኛ፣ ቼክኛ፣ ስሎቫክኛ፣ ጣሊያንኛ፣ ጃፓንኛ፣ ዙሉ።",
              "በእነዚህ ቋንቋዎች በማንኛውም ቃል መፈለግ ይችላሉ፣ ትርጉሙን፣ ምሳሌዎቹንና ሌላውን ሁሉ በመረጡት የመተግበሪያ ቋንቋ ያገኛሉ። ዕብራይስጥና ዓረብኛ ሙሉ በሙሉ RTL ናቸው፣ የራሳቸውን ቅርጸ ቁምፊዎችም ይጠቀማሉ።",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit ለልጆች ደህንነቱ የተጠበቀ ነው?",
            a: [
              "Gadit የተሠራው ወላጅ ከልጁ ጋር በደህንነት እንዲጠቀምበት ነው። የልጆች ሁነታ የአዋቂዎችን ይዘት በሚያዘጋጀው በዚያው ሞተር፣ በግልጽ የማቅለል መመሪያዎች፣ ቀላል፣ ተጨባጭና ለዕድሜ የሚመጥኑ (ከ5 እስከ 10 ዓመት ደረጃ አካባቢ) ማብራሪያዎችን ያዘጋጃል። በተጠቃሚዎች የተፈጠረ ይዘት ለልጆች ፈጽሞ አይታይም።",
              "ከፖሊሲዎቻችንና በዓለም ዙሪያ ካሉ የልጆች ግላዊነት ደንቦች ጋር በሚስማማ መልኩ፣ ራሱን የቻለ መለያ ባለቤትነት ከ13 ዓመት በላይ ነው። የተለመደው አሠራር ወላጁ ከልጁ ጋር አብሮ የሚጠቀምበት የወላጅ መለያ ነው፣ የልጆች ሁነታም በትክክል ለዚህ የተሠራ ነው።",
            ],
          },
          {
            id: "data",
            q: "መረጃዬ የት ይቀመጣል? ትሸጡታላችሁ?",
            a: [
              "መለያ፣ ታሪክ፣ ማስታወሻ ደብተርና የተፈጠሩ ምስሎች በ Firebase ውስጥ በደህንነት፣ በማከማቻ ውስጥ ተመስጥረው ይቀመጣሉ። መረጃዎን ለማንም አንሸጥም። በግላዊነት ፖሊሲው ላይ እንደተገለጸው፣ Gadit ለማስኬድ የሚያስፈልገውን ብቻ (ማከማቻ፣ ክፍያዎች፣ የይዘት አቅራቢዎች) እናጋራለን።",
              "ማስታወሻ ደብተርዎን ወደ ውጭ መላክ ወይም መለያዎን መሰረዝ በማንኛውም ጊዜ ከመለያ ገጹ ይችላሉ።",
            ],
          },
          {
            id: "contact-direct",
            q: "በቀጥታ እንዴት ላገኛችሁ እችላለሁ?",
            a: [
              "በዚህ ገጽ ግርጌ ያለውን የኢሜይል አዝራር ይጠቀሙ። በቀጥታ ወደ ቡድኑ የመልእክት ሳጥን ይሄዳል። እያንዳንዱ መልእክት ይነበባል፣ ከ24 እስከ 48 ሰዓት ውስጥ (ብዙ ጊዜ ከዚያ ቀደም ብሎ) መልስ ይሰጣል።",
              "ለድጋፍ ኢሜይል ከቻት ይሻላል: ቡድኑ በጥንቃቄ እንዲያነብና በአሳቢነት እንዲመልስ ዕድል ይሰጣል። የስልክ ድጋፍ ገና አይሰጥም።",
            ],
          },
        ],
      },
    ],
  },
};
