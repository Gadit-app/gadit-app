import type { ReactElement } from "react";

export const titlesHu = { privacy: "Adatvédelmi szabályzat", terms: "Felhasználási feltételek" };

export function PrivacyBodyHu(): ReactElement {
  return (
    <>
      <p>
        A Gadit („Gadit”, „mi”, „minket” vagy „miénk”) egy szolgáltatás, amelyet a{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong>, egy az Egyesült Államokban bejegyzett vállalat
        üzemeltet. Ez az Adatvédelmi szabályzat ismerteti, milyen információkat gyűjtünk, hogyan használjuk fel azokat,
        és milyen választási lehetőségei vannak Önnek.
      </p>
      <p>
        Ha bármilyen kérdése van, forduljon hozzánk a következő címen:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Az általunk gyűjtött információk</h2>
      <h3>Fiókadatok</h3>
      <p>
        Amikor Ön fiókot hoz létre, összegyűjtjük az e-mail-címét, és ha Google-fiókkal jelentkezik be, a Google által
        megadott alapvető profiladatokat (megjelenített név, profilkép). A Google-jelszavát nem kapjuk meg.
      </p>
      <h3>Használati adatok</h3>
      <p>Amikor Ön a Gadit szolgáltatást használja, a következőket kezeljük:</p>
      <ul>
        <li>az Ön által keresett szavak és opcionális mondatok;</li>
        <li>az Ön kérésére generált képek;</li>
        <li>az Ön előfizetési csomagja és számlázási állapota;</li>
        <li>a legutóbbi keresési előzmények (fizető felhasználók esetében legfeljebb az utolsó 10 szó), amelyeket azért tárolunk, hogy Ön később ismét hozzáférhessen azokhoz;</li>
        <li>havi kvóták (például az aktuális számlázási ciklusban Ön által generált képek száma).</li>
      </ul>
      <h3>Technikai és analitikai adatok</h3>
      <p>
        Automatikusan gyűjtünk alapvető technikai információkat, például IP-címet, böngészőtípust, eszköztípust,
        hivatkozó URL-t és a megtekintett oldalakat. Ezeket biztonsági célokra, teljesítményfigyelésre és összesített
        analitikára használjuk. Az analitikát a Vercel biztosítja, és az adatokat már a gyűjtés helyén anonimizáljuk
        (személyes azonosítókat nem tárolunk).
      </p>
      <h3>Fizetési információk</h3>
      <p>
        Ha Ön előfizet, a fizetést a <strong>Stripe, Inc.</strong> dolgozza fel. A teljes kártyaszámát nem látjuk és nem
        tároljuk; csak egy ügyféltokent és az előfizetés azonosításához szükséges metaadatokat kapjuk meg.
      </p>

      <h2>2. Hogyan használjuk fel az Ön adatait</h2>
      <ul>
        <li>a Gadit szolgáltatás nyújtására és fejlesztésére (definíciók, képek, mondatokra adott visszajelzések, kvízek generálása);</li>
        <li>az Ön fiókjának fenntartására és felhasználói élményének személyre szabására (keresési előzmények, előnyben részesített nyelv, „Gyerekmód” kapcsoló);</li>
        <li>az előfizetések feldolgozására és tranzakciós e-mailek küldésére (nyugták, előfizetés-módosítások);</li>
        <li>a termék teljesítményének mérésére és javítására, valamint a visszaélések megelőzésére;</li>
        <li>jogi kötelezettségek teljesítésére.</li>
      </ul>
      <p>
        Az Ön személyes adatait <strong>nem adjuk el</strong>, és az Ön tartalmát nem használjuk fel arra, hogy Önnek
        hirdetéseket jelenítsünk meg.
      </p>

      <h2>3. Harmadik felek általunk igénybe vett szolgáltatásai</h2>
      <p>
        A Gadit a következő adatfeldolgozókra támaszkodik. Mindegyikük csak az adott szolgáltatás nyújtásához szükséges
        minimális információt kapja meg:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>: feldolgozza az Ön által beküldött szavakat és mondatokat definíciók, mondatokra adott
          visszajelzések, kvízek és hangátírás (Whisper) generálása céljából, valamint képeket generál (DALL·E 3). Az
          OpenAI részére küldött adatokra az OpenAI API-adathasználati szabályzata vonatkozik.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): tárolja az Ön fiókját, profilját,
          előfizetési állapotát, keresési előzményeit és a generált képeket.
        </li>
        <li>
          <strong>Stripe</strong>: kezeli a fizetéseket, az előfizetéseket és a számlázási portált.
        </li>
        <li>
          <strong>Vercel</strong>: tárhelyet biztosít a weboldalnak és kiszolgálja azt, valamint anonimizált analitikát
          és teljesítménymérést nyújt.
        </li>
      </ul>

      <h2>4. Meddig őrizzük meg az Ön adatait</h2>
      <ul>
        <li>Fiókadatok: amíg az Ön fiókja létezik.</li>
        <li>Keresési előzmények: felhasználónként az utolsó 10 keresés, minden új kereséssel frissítve.</li>
        <li>Generált képek: megőrizzük őket, hogy ugyanaz a szó+jelentés kombináció újra felhasználhassa a gyorsítótárban tárolt képet. Határozatlan ideig megőrizhetők, amíg az Ön fiókja aktív.</li>
        <li>Számlázási és adózási nyilvántartások: az alkalmazandó jogszabályok által előírt ideig (jellemzően 7 évig).</li>
        <li>Analitikai adatok: összesített formában, amelyeket az analitikai szolgáltató jellemzően 13 hónapig őriz meg.</li>
      </ul>

      <h2>5. Az Ön jogai</h2>
      <p>Lakóhelyétől függően Önnek joga lehet:</p>
      <ul>
        <li>hozzáférést kérni az Önről általunk tárolt személyes adatokhoz;</li>
        <li>kérni a pontatlan információk helyesbítését;</li>
        <li>kérni fiókja és a kapcsolódó adatok törlését;</li>
        <li>adatait hordozható formátumban exportálni;</li>
        <li>tiltakozni adatai bizonyos felhasználása ellen, vagy korlátozni azt;</li>
        <li>letiltani bizonyos adatmegosztást (ahol ez a CCPA vagy hasonló jogszabályok alapján alkalmazandó).</li>
      </ul>
      <p>
        Ezen jogok bármelyikének gyakorlásához írjon a következő címre:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. 30 napon belül
        válaszolunk.
      </p>

      <h2>6. Biztonság</h2>
      <p>
        Az Ön adatainak védelmére iparági szabványnak megfelelő biztonsági intézkedéseket alkalmazunk: titkosított
        kapcsolatokat (HTTPS), hitelesített API-kat és hozzáférés-szabályozást. Az interneten történő adattovábbítás vagy
        adattárolás egyetlen módja sem 100%-ban biztonságos, ezért abszolút biztonságot nem tudunk garantálni, de
        folyamatosan dolgozunk a kockázatok csökkentésén.
      </p>

      <h2>7. Gyermekek</h2>
      <p>
        A Gadit nem 13 év alatti gyermekeknek szól. Ha úgy gondolja, hogy egy 13 év alatti gyermek fiókot hozott létre,
        írjon nekünk e-mailt, és töröljük a fiókot és a kapcsolódó adatokat.
      </p>

      <h2>8. Nemzetközi felhasználók</h2>
      <p>
        A Gadit üzemeltetése az Egyesült Államokból történik. Ha Ön az Egyesült Államokon kívülről fér hozzá a
        szolgáltatáshoz, adatait az Egyesült Államokba és a szolgáltatóink által használt adatközponti régiókba
        továbbítjuk, és ott tároljuk és kezeljük.
      </p>

      <h2>9. A szabályzat módosításai</h2>
      <p>
        Ezt az Adatvédelmi szabályzatot időről időre frissíthetjük. A lényeges változásokat ezen az oldalon tesszük
        közzé, módosított „Utolsó frissítés” dátummal. Ha Ön a változások hatálybalépését követően tovább használja a
        Gadit szolgáltatást, azzal elfogadja a frissített szabályzatot.
      </p>

      <h2>10. Kapcsolat</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyHu(): ReactElement {
  return (
    <>
      <p>
        Üdvözöljük a Gadit szolgáltatásban. Ezek a Felhasználási feltételek („Feltételek”) szabályozzák az Ön
        hozzáférését a Gadit weboldalához, alkalmazásaihoz és szolgáltatásaihoz (együttesen: „Szolgáltatás”), valamint
        azok használatát. A Szolgáltatást a{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> („mi”, „minket” vagy „miénk”) üzemelteti. A
        Szolgáltatás használatával Ön elfogadja, hogy e Feltételek kötelezőek Önre nézve. Ha nem ért egyet velük, ne
        használja a Szolgáltatást.
      </p>

      <h2>1. Ki használhatja a Gadit szolgáltatást</h2>
      <p>
        Fiók létrehozásához legalább 13 évesnek kell lennie. Ha Ön 13 és 18 év közötti, szülője vagy törvényes gyámja
        engedélyével kell rendelkeznie. A Gadit használatával Ön kijelenti, hogy megfelel ezeknek a követelményeknek.
      </p>

      <h2>2. Az Ön fiókja</h2>
      <p>
        Ön felelős a bejelentkezési adatai bizalmas kezeléséért, valamint a fiókjában végzett minden tevékenységért. Ha
        úgy gondolja, hogy fiókja illetéktelen kezekbe került, haladéktalanul értesítsen minket a következő címen:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>3. Előfizetések és számlázás</h2>
      <h3>Csomagok és díjak</h3>
      <p>
        A Gadit ingyenes Basic csomagot és fizetős csomagokat (Clear és Deep) kínál, az árazási oldalon feltüntetett
        funkciókkal és árakkal. Az árak USD-ben értendők, és a meglévő előfizetők számára legalább 30 nappal korábbi
        értesítés mellett módosíthatók.
      </p>
      <h3>Automatikus megújítás</h3>
      <p>
        A fizetős előfizetések minden számlázási időszak végén (a választásnak megfelelően havonta vagy évente)
        automatikusan megújulnak az akkor érvényes áron, kivéve, ha a megújítás dátuma előtt lemondják őket.
      </p>
      <h3>Lemondás</h3>
      <p>
        Előfizetését bármikor lemondhatja a fiókja oldalán. A lemondás leállítja a jövőbeli megújításokat. A fizetős
        funkciókhoz az aktuális számlázási időszak végéig továbbra is hozzáfér. A fel nem használt időre részleges
        visszatérítést nem nyújtunk.
      </p>
      <h3>Visszatérítések</h3>
      <p>
        A jogszabály által előírt esetek kivételével a befizetések nem téríthetők vissza. Ha úgy gondolja, hogy tévesen
        terheltük meg, a terheléstől számított 30 napon belül forduljon hozzánk a következő címen:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>4. Elfogadható használat</h2>
      <p>Ön vállalja, hogy nem fogja:</p>
      <ul>
        <li>a Szolgáltatást jogellenes célra vagy bármely jogszabályt sértő módon használni;</li>
        <li>megkísérelni a Szolgáltatás visszafejtését, dekompilálását vagy forráskódjának kinyerését;</li>
        <li>más felhasználókkal visszaélni, őket zaklatni vagy nekik kárt okozni, illetve gyűlöletkeltő, fenyegető vagy obszcén tartalmat beküldeni;</li>
        <li>a Szolgáltatáshoz való hozzáférést az ésszerű személyes használaton túl automatizálni (például definíciók tömeges lekérésével);</li>
        <li>megkerülni a lekérdezési korlátokat vagy a csomagkorlátozásokat, illetve több fiókot használni a kvóták kijátszására;</li>
        <li>a Szolgáltatást bármely versengő mesterségesintelligencia-modell vagy szótártermék betanítására vagy finomhangolására használni;</li>
        <li>olyan tartalmat feltölteni vagy beküldeni, amelynek beküldésére nem jogosult.</li>
      </ul>
      <p>
        Fenntartjuk a jogot, hogy felfüggesszük vagy megszüntessük azokat a fiókokat, amelyek megsértik ezeket a
        Feltételeket.
      </p>

      <h2>5. Mesterséges intelligencia által generált tartalom</h2>
      <p>
        A Gadit mesterségesintelligencia-modelleket használ (köztük az OpenAI GPT, Whisper és DALL·E modelljeit)
        definíciók, példák, etimológiák, visszajelzések, kvízek, képek és átiratok generálására. Ön tudomásul veszi és
        elfogadja, hogy:
      </p>
      <ul>
        <li>
          A mesterséges intelligencia kimenete lehet <strong>pontatlan, hiányos vagy nem megfelelő</strong>. A Gadit
          tanulást segítő eszköznek készült, és nem szabad rá támaszkodni jogi, orvosi, szakmai vagy akadémiai döntések
          meghozatalakor.
        </li>
        <li>
          A mesterséges intelligencia által generált definíciók eltérhetnek a hivatalos szótáraktól. Nem garantáljuk,
          hogy minden definíció nyelvészetileg mérvadó.
        </li>
        <li>
          A képek algoritmikusan készülnek, és esetenként váratlanok vagy pontatlanok lehetnek. Ezek illusztrációk, nem
          szó szerinti ábrázolások.
        </li>
        <li>
          Kizárólag Ön felelős azért, hogyan értelmezi és használja a mesterséges intelligencia által generált
          tartalmat.
        </li>
      </ul>

      <h2>6. Az Ön tartalma</h2>
      <p>
        Amikor Ön szavakat, mondatokat vagy hanganyagot küld be a Gadit szolgáltatásba (például az „Írjon saját
        mondatot” funkció vagy a hangalapú bevitel használatakor), Ön a Szolgáltatás nyújtása és fejlesztése céljából
        világszerte érvényes, nem kizárólagos, jogdíjmentes felhasználási engedélyt ad nekünk az adott tartalom
        feldolgozására. Nem tartunk igényt az Ön által beküldött tartalmak tulajdonjogára.
      </p>

      <h2>7. Szellemi tulajdon</h2>
      <p>
        A Gadit név, logó, weboldal és az alapjául szolgáló szoftver a mi tulajdonunkat vagy licencadóink tulajdonát
        képezi. Ön személyes, visszavonható, nem kizárólagos engedélyt kap a Szolgáltatás e Feltételek által megengedett
        módon történő használatára.
      </p>
      <p>
        A Gadit által az Ön bevitelére válaszul generált tartalmat (definíciók, képek stb.) Ön személyes, oktatási vagy
        nem kereskedelmi célokra használhatja. Kereskedelmi felhasználás esetén (például egy fizetős termékben) kérjük,
        vegye fel velünk a kapcsolatot.
      </p>

      <h2>8. Elérhetőség és változások</h2>
      <p>
        Igyekszünk a Szolgáltatást elérhetővé tenni, de nem garantáljuk annak megszakításmentes és hibamentes működését.
        A Szolgáltatás bármely részét bármikor módosíthatjuk, felfüggeszthetjük vagy megszüntethetjük, beleértve a
        funkciókat, az árakat vagy az egyes régiókban való elérhetőséget.
      </p>

      <h2>9. Harmadik felek szolgáltatásai</h2>
      <p>
        A Szolgáltatás külső szolgáltatókra támaszkodik (köztük az OpenAI, a Google Firebase, a Stripe és a Vercel).
        Ezek elérhetősége vagy működése befolyásolhatja az Ön felhasználói élményét. Felelősségünket a 11. pont
        korlátozza, függetlenül az e szolgáltatók által okozott problémáktól.
      </p>

      <h2>10. Felelősségkizárás</h2>
      <p>
        A SZOLGÁLTATÁST „ADOTT ÁLLAPOTÁBAN” ÉS „A RENDELKEZÉSRE ÁLLÁS SZERINT” BIZTOSÍTJUK, BÁRMIFÉLE KIFEJEZETT VAGY
        HALLGATÓLAGOS SZAVATOSSÁG NÉLKÜL, BELEÉRTVE TÖBBEK KÖZÖTT A FORGALOMKÉPESSÉGRE (MERCHANTABILITY), AZ ADOTT CÉLRA
        VALÓ ALKALMASSÁGRA ÉS A JOGSÉRTÉS HIÁNYÁRA (NON-INFRINGEMENT) VONATKOZÓ SZAVATOSSÁGOT.
      </p>

      <h2>11. A felelősség korlátozása</h2>
      <p>
        A JOGSZABÁLYOK ÁLTAL MEGENGEDETT LEGNAGYOBB MÉRTÉKBEN A LAVI LEARNING AND TRAINING TECHNOLOGIES LLC, VALAMINT
        ANNAK VEZETŐ TISZTSÉGVISELŐI, MUNKAVÁLLALÓI ÉS MEGBÍZOTTJAI NEM FELELNEK SEMMILYEN KÖZVETETT, JÁRULÉKOS,
        KÜLÖNLEGES VAGY KÖVETKEZMÉNYI KÁRÉRT, ILLETVE BÜNTETŐ JELLEGŰ KÁRTÉRÍTÉSÉRT (PUNITIVE DAMAGES), SEM ELMARADT
        NYERESÉGÉRT VAGY BEVÉTELÉRT, AMELY A SZOLGÁLTATÁS ÖN ÁLTALI HASZNÁLATÁBÓL ERED VAGY AZZAL ÖSSZEFÜGGÉSBEN
        KELETKEZIK.
      </p>
      <p>
        A SZOLGÁLTATÁSBÓL EREDŐ VAGY AZZAL KAPCSOLATOS BÁRMELY KÖVETELÉSÉRT FENNÁLLÓ TELJES FELELŐSSÉGÜNK NEM HALADJA MEG
        A KÖVETKEZŐK KÖZÜL A NAGYOBB ÖSSZEGET: (A) AZ AZ ÖSSZEG, AMELYET ÖN A KÖVETELÉST MEGELŐZŐ TIZENKÉT HÓNAPBAN
        NEKÜNK FIZETETT, VAGY (B) USD $100.
      </p>

      <h2>12. Megszüntetés</h2>
      <p>
        Ön bármikor abbahagyhatja a Szolgáltatás használatát. Felfüggeszthetjük vagy megszüntethetjük az Ön
        hozzáférését, ha Ön megsérti ezeket a Feltételeket, vagy ha ezt jogszabály írja elő. A megszüntetést követően
        azok a rendelkezések, amelyeknek természetüknél fogva továbbra is fenn kell maradniuk (beleértve a 7., 10., 11.
        és 14. pontot), hatályban maradnak.
      </p>

      <h2>13. A Feltételek módosításai</h2>
      <p>
        Ezeket a Feltételeket időről időre felülvizsgálhatjuk. A lényeges változásokat ezen az oldalon tesszük közzé,
        módosított „Utolsó frissítés” dátummal. Ha Ön a változások hatálybalépését követően tovább használja a
        Szolgáltatást, azzal elfogadja a frissített Feltételeket.
      </p>

      <h2>14. Irányadó jog és jogviták</h2>
      <p>
        E Feltételekre Delaware állam (Egyesült Államok) joga az irányadó, annak kollíziós szabályaira való tekintet
        nélkül. Az e Feltételekből vagy a Szolgáltatásból eredő vagy azokkal kapcsolatos bármely jogvitát kizárólag a
        Delaware államban (Egyesült Államok) található állami vagy szövetségi bíróságok előtt kell rendezni, és Ön
        hozzájárul ahhoz, hogy e bíróságok személyes joghatósága (personal jurisdiction) kiterjedjen Önre.
      </p>

      <h2>15. Kapcsolat</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
