import type { ReactElement } from "react";

export const titlesTr = { privacy: "Gizlilik Politikası", terms: "Kullanım Koşulları" };

export function PrivacyBodyTr(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;biz&rdquo;, &ldquo;bize&rdquo; veya &ldquo;bizim&rdquo;), Amerika Birleşik
        Devletleri’nde kayıtlı bir şirket olan <strong>Lavi Learning and Training Technologies LLC</strong> tarafından
        işletilen bir hizmettir. Bu Gizlilik Politikası, hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve
        sahip olduğunuz seçenekleri açıklar.
      </p>
      <p>
        Herhangi bir sorunuz varsa bize{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> adresinden ulaşabilirsiniz.
      </p>

      <h2>1. Topladığımız bilgiler</h2>
      <h3>Hesap bilgileri</h3>
      <p>
        Bir hesap oluşturduğunuzda e-posta adresinizi ve Google ile oturum açarsanız Google’ın sağladığı temel profil
        bilgilerini (görünen ad, profil fotoğrafı) toplarız. Google şifrenizi almayız.
      </p>
      <h3>Kullanım bilgileri</h3>
      <p>Gadit’i kullandığınızda şunları işleriz:</p>
      <ul>
        <li>aradığınız kelimeler ve isteğe bağlı cümleler;</li>
        <li>talebiniz üzerine oluşturulan görseller;</li>
        <li>abonelik planınız ve faturalandırma durumunuz;</li>
        <li>daha sonra yeniden erişebilmeniz için saklanan yakın tarihli arama geçmişi (ücretli kullanıcılar için son 10 kelimeye kadar);</li>
        <li>aylık kotalar (örneğin, mevcut faturalandırma döneminde oluşturduğunuz görsel sayısı).</li>
      </ul>
      <h3>Teknik ve analitik veriler</h3>
      <p>
        IP adresi, tarayıcı türü, cihaz türü, yönlendiren URL ve görüntülenen sayfalar gibi temel teknik bilgileri
        otomatik olarak toplarız. Bu bilgiler güvenlik, performans izleme ve toplu analiz amacıyla kullanılır. Analiz
        hizmetleri Vercel tarafından sağlanır ve toplama noktasında anonimleştirilir (hiçbir kişisel tanımlayıcı
        saklanmaz).
      </p>
      <h3>Ödeme bilgileri</h3>
      <p>
        Abone olursanız ödeme <strong>Stripe, Inc.</strong> tarafından işlenir. Kartınızın tam numarasını görmeyiz veya
        saklamayız; yalnızca aboneliği tanımlamak için gereken bir müşteri belirtecini (token) ve meta verileri alırız.
      </p>

      <h2>2. Bilgilerinizi nasıl kullanırız</h2>
      <ul>
        <li>Gadit hizmetini sunmak ve geliştirmek (tanımlar, görseller, cümle geri bildirimleri ve testler oluşturmak);</li>
        <li>hesabınızı sürdürmek ve deneyiminizi kişiselleştirmek (arama geçmişi, tercih edilen dil, &ldquo;Çocuk modu&rdquo; anahtarı);</li>
        <li>abonelikleri işleme almak ve işlemsel e-postalar (makbuzlar, abonelik değişiklikleri) göndermek;</li>
        <li>ürün performansını ölçmek ve iyileştirmek ve kötüye kullanımı önlemek;</li>
        <li>yasal yükümlülüklere uymak.</li>
      </ul>
      <p>
        Kişisel bilgilerinizi <strong>satmayız</strong> ve içeriğinizi size reklam göstermek için kullanmayız.
      </p>

      <h2>3. Kullandığımız üçüncü taraf hizmetler</h2>
      <p>
        Gadit aşağıdaki veri işleyenlerden yararlanır. Her biri yalnızca ilgili hizmeti sağlamak için gereken asgari
        bilgiyi alır:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>: tanımlar, cümle geri bildirimleri, testler ve sesli transkripsiyon (Whisper)
          oluşturmak için gönderdiğiniz kelimeleri ve cümleleri işler ve görseller (DALL·E 3) oluşturur. OpenAI’a
          gönderilen veriler, OpenAI’ın API veri kullanım politikasına tabidir.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): hesabınızı, profilinizi, abonelik
          durumunuzu, arama geçmişinizi ve oluşturulan görselleri saklar.
        </li>
        <li>
          <strong>Stripe</strong>: ödemeleri, abonelikleri ve faturalandırma portalını yönetir.
        </li>
        <li>
          <strong>Vercel</strong>: web sitesini barındırır ve sunar; anonimleştirilmiş analiz ve performans ölçümü
          sağlar.
        </li>
      </ul>

      <h2>4. Bilgilerinizi ne kadar süre saklarız</h2>
      <ul>
        <li>Hesap bilgileri: hesabınız var olduğu sürece.</li>
        <li>Arama geçmişi: kullanıcı başına son 10 arama; her yeni aramada güncellenir.</li>
        <li>Oluşturulan görseller: aynı kelime+anlam çiftinin önbelleğe alınmış görseli yeniden kullanabilmesi için saklanır. Hesabınız aktif olduğu sürece süresiz olarak saklanabilir.</li>
        <li>Faturalandırma ve vergi kayıtları: yürürlükteki mevzuatın gerektirdiği süre boyunca (genellikle 7 yıl).</li>
        <li>Analiz verileri: toplu hâlde; genellikle analiz sağlayıcısı tarafından 13 ay süreyle saklanır.</li>
      </ul>

      <h2>5. Haklarınız</h2>
      <p>Yaşadığınız yere bağlı olarak aşağıdaki haklara sahip olabilirsiniz:</p>
      <ul>
        <li>hakkınızda tuttuğumuz kişisel bilgilere erişim talep etmek;</li>
        <li>yanlış bilgilerin düzeltilmesini talep etmek;</li>
        <li>hesabınızın ve ilişkili verilerin silinmesini talep etmek;</li>
        <li>verilerinizi taşınabilir bir formatta dışa aktarmak;</li>
        <li>bilgilerinizin belirli kullanımlarına itiraz etmek veya bunları kısıtlamak;</li>
        <li>belirli veri paylaşımlarını reddetmek (CCPA veya benzeri yasalar kapsamında geçerli olduğu durumlarda).</li>
      </ul>
      <p>
        Bu haklardan herhangi birini kullanmak için{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> adresine e-posta
        gönderin. 30 gün içinde yanıt vereceğiz.
      </p>

      <h2>6. Güvenlik</h2>
      <p>
        Bilgilerinizi korumak için sektör standardı önlemler, yani şifreli bağlantılar (HTTPS), kimliği doğrulanmış
        API’ler ve erişim denetimleri kullanırız. İnternet üzerinden hiçbir iletim veya depolama yöntemi %100 güvenli
        değildir; bu nedenle mutlak güvenliği garanti edemeyiz, ancak riskleri azaltmak için sürekli çalışırız.
      </p>

      <h2>7. Çocuklar</h2>
      <p>
        Gadit, 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki bir çocuğun hesap oluşturduğunu
        düşünüyorsanız bize e-posta gönderin; hesabı ve ilişkili verileri sileriz.
      </p>

      <h2>8. Uluslararası kullanıcılar</h2>
      <p>
        Gadit, Amerika Birleşik Devletleri’nden işletilmektedir. Hizmete Amerika Birleşik Devletleri dışından
        erişiyorsanız bilgileriniz Amerika Birleşik Devletleri’ne ve hizmet sağlayıcılarımızın kullandığı veri merkezi
        bölgelerine aktarılacak, buralarda saklanacak ve işlenecektir.
      </p>

      <h2>9. Bu politikadaki değişiklikler</h2>
      <p>
        Bu Gizlilik Politikası’nı zaman zaman güncelleyebiliriz. Önemli değişiklikler, revize edilmiş bir &ldquo;Son
        güncelleme&rdquo; tarihiyle bu sayfada yayımlanacaktır. Değişiklikler yürürlüğe girdikten sonra Gadit’i
        kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-posta:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyTr(): ReactElement {
  return (
    <>
      <p>
        Gadit’e hoş geldiniz. Bu Kullanım Koşulları (&ldquo;Koşullar&rdquo;), Gadit web sitesine, uygulamalarına ve
        hizmetlerine (birlikte &ldquo;Hizmet&rdquo;) erişiminizi ve bunları kullanımınızı düzenler. Hizmet,{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;biz&rdquo;, &ldquo;bize&rdquo; veya
        &ldquo;bizim&rdquo;) tarafından işletilmektedir. Hizmet’i kullanarak bu Koşullarla bağlı olmayı kabul etmiş
        olursunuz. Kabul etmiyorsanız Hizmet’i kullanmayın.
      </p>

      <h2>1. Gadit’i kimler kullanabilir</h2>
      <p>
        Hesap oluşturmak için en az 13 yaşında olmanız gerekir. 13 ile 18 yaş arasındaysanız bir ebeveynin veya yasal
        vasinin iznine sahip olmanız gerekir. Gadit’i kullanarak bu şartları karşıladığınızı beyan etmiş olursunuz.
      </p>

      <h2>2. Hesabınız</h2>
      <p>
        Oturum açma bilgilerinizin gizliliğini korumaktan ve hesabınız altında gerçekleşen tüm etkinliklerden siz
        sorumlusunuz. Hesabınızın ele geçirildiğini düşünüyorsanız derhal{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> adresinden bize
        bildirin.
      </p>

      <h2>3. Abonelikler ve faturalandırma</h2>
      <h3>Planlar ve ücretler</h3>
      <p>
        Gadit, ücretsiz bir Basic planı ile fiyatlandırma sayfasında belirtilen özelliklere ve fiyatlara sahip ücretli
        planlar (Clear ve Deep) sunar. Fiyatlar USD cinsinden belirtilir ve mevcut abonelere en az 30 gün önceden
        bildirimde bulunularak değiştirilebilir.
      </p>
      <h3>Otomatik yenileme</h3>
      <p>
        Ücretli abonelikler, yenileme tarihinden önce iptal edilmedikçe, her faturalandırma döneminin (seçiminize göre
        aylık veya yıllık) sonunda o tarihte geçerli olan fiyattan otomatik olarak yenilenir.
      </p>
      <h3>İptal</h3>
      <p>
        Hesap sayfanızdan istediğiniz zaman iptal edebilirsiniz. İptal, gelecekteki yenilemeleri durdurur. Ücretli
        özelliklere erişiminiz mevcut faturalandırma döneminin sonuna kadar devam eder. Kullanılmayan süre için kısmi
        iade yapmayız.
      </p>
      <h3>İadeler</h3>
      <p>
        Yasanın gerektirdiği durumlar dışında ödemeler iade edilmez. Yanlışlıkla ücretlendirildiğinizi düşünüyorsanız,
        ücretlendirmeden itibaren 30 gün içinde{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> adresiyle iletişime
        geçin.
      </p>

      <h2>4. Kabul edilebilir kullanım</h2>
      <p>Aşağıdakileri yapmamayı kabul edersiniz:</p>
      <ul>
        <li>Hizmet’i herhangi bir yasa dışı amaçla veya herhangi bir yasayı ihlal ederek kullanmak;</li>
        <li>Hizmet’e tersine mühendislik uygulamaya, Hizmet’i kaynak koda dönüştürmeye (decompile) veya Hizmet’in kaynak kodunu çıkarmaya teşebbüs etmek;</li>
        <li>diğer kullanıcılara kötü davranmak, onları taciz etmek veya onlara zarar vermek ya da nefret içeren, tehditkâr veya müstehcen içerik göndermek;</li>
        <li>Hizmet’e erişimi makul kişisel kullanımın ötesinde otomatikleştirmek (örneğin, tanımların büyük ölçekte otomatik olarak toplanması, yani scraping);</li>
        <li>hız sınırlarını veya plan kısıtlamalarını atlatmak ya da kotalardan kaçınmak için birden fazla hesap kullanmak;</li>
        <li>Hizmet’i rakip herhangi bir yapay zekâ modelini veya sözlük ürününü eğitmek ya da bunlara ince ayar (fine-tuning) yapmak için kullanmak;</li>
        <li>gönderme hakkına sahip olmadığınız içerikleri yüklemek veya göndermek.</li>
      </ul>
      <p>
        Bu Koşulları ihlal eden hesapları askıya alma veya sonlandırma hakkını saklı tutarız.
      </p>

      <h2>5. Yapay zekâ tarafından oluşturulan içerik</h2>
      <p>
        Gadit; tanımlar, örnekler, etimolojiler, geri bildirimler, testler, görseller ve transkripsiyonlar oluşturmak
        için yapay zekâ modelleri (OpenAI’ın GPT, Whisper ve DALL·E modelleri dahil) kullanır. Şunları anlar ve kabul
        edersiniz:
      </p>
      <ul>
        <li>
          Yapay zekâ çıktısı <strong>yanlış, eksik veya uygunsuz</strong> olabilir. Gadit bir öğrenme yardımcısı olarak
          tasarlanmıştır ve hukuki, tıbbi, mesleki veya akademik kararlarda dayanak olarak kullanılmamalıdır.
        </li>
        <li>
          Yapay zekâ tarafından oluşturulan tanımlar resmî sözlüklerdekilerden farklı olabilir. Her tanımın dil
          bakımından yetkili bir kaynak niteliğinde olduğunu garanti etmeyiz.
        </li>
        <li>
          Görseller algoritmik olarak oluşturulur ve zaman zaman beklenmedik veya kesinlikten yoksun olabilir. Bunlar
          birebir tasvirler değil, illüstrasyonlardır.
        </li>
        <li>
          Yapay zekâ tarafından oluşturulan içeriği nasıl yorumladığınızdan ve kullandığınızdan yalnızca siz
          sorumlusunuz.
        </li>
      </ul>

      <h2>6. İçeriğiniz</h2>
      <p>
        Gadit’e kelime, cümle veya ses gönderdiğinizde (örneğin &ldquo;Kendi cümleni kur&rdquo; özelliğini veya sesli
        girişi kullanırken), bu içeriği Hizmet’i sunmak ve geliştirmek amacıyla işlememiz için bize dünya çapında,
        münhasır olmayan, telif ücretsiz (royalty-free) bir lisans vermiş olursunuz. Gönderimlerinizin mülkiyetini talep
        etmeyiz.
      </p>

      <h2>7. Fikri mülkiyet</h2>
      <p>
        Gadit adı, logosu, web sitesi ve temelindeki yazılım bize veya lisans verenlerimize aittir. Size, Hizmet’i bu
        Koşulların izin verdiği şekilde kullanmanız için kişisel, geri alınabilir, münhasır olmayan bir lisans
        verilmektedir.
      </p>
      <p>
        Girdinize yanıt olarak Gadit tarafından oluşturulan içerik (tanımlar, görseller vb.) tarafınızdan kişisel,
        eğitsel veya ticari olmayan amaçlarla kullanılabilir. Ticari kullanım için (örneğin ücretli bir üründe) lütfen
        bizimle iletişime geçin.
      </p>

      <h2>8. Kullanılabilirlik ve değişiklikler</h2>
      <p>
        Hizmet’i kullanılabilir durumda tutmaya çalışırız, ancak kesintisiz veya hatasız çalışacağını garanti etmeyiz.
        Özellikler, fiyatlandırma veya belirli bölgelerdeki kullanılabilirlik dahil olmak üzere Hizmet’in herhangi bir
        bölümünü istediğimiz zaman değiştirebilir, askıya alabilir veya sonlandırabiliriz.
      </p>

      <h2>9. Üçüncü taraf hizmetler</h2>
      <p>
        Hizmet, üçüncü taraf sağlayıcılara (OpenAI, Google Firebase, Stripe ve Vercel dahil) dayanır. Bu sağlayıcıların
        kullanılabilirliği veya davranışı deneyiminizi etkileyebilir. Bu sağlayıcıların neden olduğu sorunlardan
        bağımsız olarak sorumluluğumuz 11. Bölüm ile sınırlıdır.
      </p>

      <h2>10. Sorumluluk reddi</h2>
      <p>
        HİZMET, BUNLARLA SINIRLI OLMAMAK ÜZERE TİCARİ ELVERİŞLİLİK (MERCHANTABILITY), BELİRLİ BİR AMACA UYGUNLUK VE HAK
        İHLALİNDE BULUNMAMA (NON-INFRINGEMENT) GARANTİLERİ DAHİL, AÇIK VEYA ZIMNİ HİÇBİR TÜRDE GARANTİ VERİLMEKSİZİN
        &ldquo;OLDUĞU GİBİ&rdquo; VE &ldquo;MEVCUT OLDUĞU ŞEKİLDE&rdquo; SUNULMAKTADIR.
      </p>

      <h2>11. Sorumluluğun sınırlandırılması</h2>
      <p>
        YASANIN İZİN VERDİĞİ AZAMİ ÖLÇÜDE, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC VE YÖNETİCİLERİ, ÇALIŞANLARI VE
        TEMSİLCİLERİ, HİZMET’İ KULLANIMINIZDAN KAYNAKLANAN VEYA BUNUNLA BAĞLANTILI OLARAK ORTAYA ÇIKAN HİÇBİR DOLAYLI,
        ARIZİ, ÖZEL, SONUÇSAL VEYA CEZAİ ZARARDAN (PUNITIVE DAMAGES) YA DA HERHANGİ BİR KÂR VEYA GELİR KAYBINDAN
        SORUMLU TUTULAMAZ.
      </p>
      <p>
        HİZMET’TEN KAYNAKLANAN VEYA HİZMET İLE İLGİLİ HERHANGİ BİR TALEBE İLİŞKİN TOPLAM SORUMLULUĞUMUZ, (A) TALEPTEN
        ÖNCEKİ ON İKİ AY İÇİNDE BİZE ÖDEDİĞİNİZ TUTAR VEYA (B) USD $100 TUTARLARINDAN HANGİSİ DAHA YÜKSEKSE O TUTARI
        AŞMAYACAKTIR.
      </p>

      <h2>12. Fesih</h2>
      <p>
        Hizmet’i kullanmayı istediğiniz zaman bırakabilirsiniz. Bu Koşulları ihlal etmeniz veya yasanın gerektirmesi
        hâlinde erişiminizi askıya alabilir veya sonlandırabiliriz. Fesih durumunda, nitelikleri gereği yürürlükte
        kalması gereken hükümler (7, 10, 11 ve 14. Bölümler dahil) yürürlükte kalmaya devam edecektir.
      </p>

      <h2>13. Bu Koşullardaki değişiklikler</h2>
      <p>
        Bu Koşulları zaman zaman revize edebiliriz. Önemli değişiklikler, revize edilmiş bir &ldquo;Son
        güncelleme&rdquo; tarihiyle bu sayfada yayımlanacaktır. Değişiklikler yürürlüğe girdikten sonra Hizmet’i
        kullanmaya devam etmeniz, güncellenmiş Koşulları kabul ettiğiniz anlamına gelir.
      </p>

      <h2>14. Uygulanacak hukuk ve uyuşmazlıklar</h2>
      <p>
        Bu Koşullar, Amerika Birleşik Devletleri’ndeki Delaware Eyaleti yasalarına, bu eyaletin kanunlar ihtilafı
        kurallarına (conflict-of-law rules) bakılmaksızın tabidir. Bu Koşullardan veya Hizmet’ten kaynaklanan ya da
        bunlarla ilgili her türlü uyuşmazlık, yalnızca Amerika Birleşik Devletleri’nin Delaware eyaletinde bulunan eyalet
        veya federal mahkemelerinde çözülecektir ve bu mahkemelerin kişisel yargı yetkisini (personal jurisdiction) kabul
        edersiniz.
      </p>

      <h2>15. İletişim</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-posta:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
