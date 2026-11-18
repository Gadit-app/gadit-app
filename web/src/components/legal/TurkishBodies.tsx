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
      <p>
        {"iOS uygulamasında Apple ile de oturum açabilirsiniz. Bu durumda Apple, bizimle paylaşmayı seçtiğiniz adı ve e-posta adresini bize iletir; bu adres, e-postalarımızı size yönlendiren özel bir relay adresi olabilir. Apple şifrenizi almayız."}
      </p>
      <h3>Kullanım bilgileri</h3>
      <p>Gadit’i kullandığınızda şunları işleriz:</p>
      <ul>
        <li>aradığınız kelimeler ve isteğe bağlı cümleler;</li>
        <li>talebiniz üzerine oluşturulan görseller;</li>
        <li>abonelik planınız ve faturalandırma durumunuz;</li>
        <li>daha sonra yeniden erişebilmeniz için saklanan yakın tarihli arama geçmişi (ücretli kullanıcılar için son 10 kelimeye kadar);</li>
        <li>
          {"yardım merkezinde Gadit asistanını kullanmanız hâlinde: sorduğunuz sorular, verdiği yanıtlar ve bir yanıtı yararlı olarak işaretleyip işaretlemediğiniz; ayrıca hesap kimliğiniz (ve varsa aile kimliğiniz), e-posta adresiniz, planınız, arayüz diliniz ve web sitesini mi yoksa uygulamayı mı kullandığınız;"}
        </li>
        <li>aylık kotalar (örneğin, mevcut faturalandırma döneminde oluşturduğunuz görsel sayısı).</li>
      </ul>
      <p>
        {"Gadit asistanı, çocuk profillerinde, Çocuk Modu'nda veya hesabına giriş yapmamış ziyaretçilere sunulmaz. Lütfen buna parola veya kart numarası yazmayın."}
      </p>
      <h3>Teknik ve analitik veriler</h3>
      <p>
        IP adresi, tarayıcı türü, cihaz türü, yönlendiren URL ve görüntülenen sayfalar gibi temel teknik bilgileri
        otomatik olarak toplarız. Bu bilgiler güvenlik, performans izleme ve toplu analiz amacıyla kullanılır. Analiz
        hizmetleri Vercel tarafından sağlanır ve toplama noktasında anonimleştirilir (hiçbir kişisel tanımlayıcı
        saklanmaz). Pazarlama, kayıt ve ödeme sayfalarımızda, 3. Bölüm’de açıklanan reklam ve analiz araçlarını da
        kullanırız.
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
        <li>
          {"Gadit asistanında sorularınızı yanıtlamak ve yardım yanıtlarımızı iyileştirmek; ayrıca asistan bir soruyu ekibimize ilettiğinde, ekibin size e-posta ile yanıt verebilmesi için son konuşmayı adınız, e-posta adresiniz, planınız, arayüz diliniz ve web sitesini mi yoksa uygulamayı mı kullandığınız bilgileriyle birlikte ekibimize e-posta ile göndermek;"}
        </li>
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
          <strong>OpenAI</strong>{": gönderdiğiniz kelimeleri ve cümleleri işleyerek tanımlar, cümle geri bildirimleri ve testler oluşturur, metni sese dönüştürür, ses girişini yazıya döker, yüklediğiniz fotoğraf ve PDF dosyalarındaki metni okur (örneğin ödev sayfaları) ve görseller oluşturur. Ayrıca Gadit asistanının yanıtlarını da yazar: sorunuzu, aynı konuşmadaki önceki mesajları, arayüz dilinizi, planınızı ve web sitesinde mi yoksa uygulamada mı olduğunuzu göndeririz; adınızı veya e-posta adresinizi eklemeyiz. OpenAI’a gönderilen veriler, OpenAI’ın API veri kullanım politikasına tabidir."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): hesabınızı, profilinizi, abonelik
          durumunuzu, arama geçmişinizi ve oluşturulan görselleri saklar.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, Google Cloud aracılığıyla) metni sese dönüştürür. Ona yalnızca yüksek sesle okunacak metni, örneğin kelimeleri, cümleleri ve hikâyeleri göndeririz ve ses, tekrar çalınabilmesi için Firebase depolamamızda saklanır. Bir okuma oyununda ayrıca bir çocuğun yüksek sesle söylediği sesi de kontrol etmek için duyar ve bu kayıt saklanmaz. Google Fonts, Çince, Japonca ve Korece arayüzün yazı tiplerini sunar ve IP adresinizi görür."}
        </li>
        <li>
          <strong>Dicta</strong>{": İsrailli bir kâr amacı gütmeyen kuruluştur ve küçük yaştaki okuyucular için İbranice metne sesli harf işaretleri ekler. Ona yalnızca İbranice metni göndeririz."}
        </li>
        <li>
          <strong>Stripe</strong>: ödemeleri, abonelikleri ve faturalandırma portalını yönetir.
        </li>
        <li>
          <strong>Apple</strong>{": iOS uygulamasında Apple ile Giriş özelliğini sağlar (bkz. bölüm 1) ve iOS uygulamasında satın alınan abonelikleri satar ve ücretlendirir. Bu işlemlerde ödemeyi Apple yönetir ve biz yalnızca satın alma işleminin ve durumunun onayını alırız (örneğin yenileme veya iade)."}
        </li>
        <li>
          <strong>PayPal</strong>{": iş ortaklarımıza ödeme yapar. İş ortağının PayPal e-posta adresini ve tutarı ona veririz."}
        </li>
        <li>
          <strong>Resend</strong>{": e-postalarımızı (örneğin giriş bağlantıları ve bildirimler) gönderir ve Gadit asistanının ilettiği soruları, e-posta adresinizi yanıt adresi olarak ekleyerek ekibimize ulaştırır."}
        </li>
        <li>
          <strong>Expo</strong>{": iOS uygulamasının bildirimlerini iletir; buna, bir ebeveynin açabileceği ve çocuğun adını ve çocuğun aradığı kelimeyi içeren uyarılar da dahildir."}
        </li>
        <li>
          <strong>Vercel</strong>: web sitesini barındırır ve sunar; anonimleştirilmiş analiz ve performans ölçümü
          sağlar.
        </li>
        <li>
          <strong>Yooniz</strong>{": aynı kurucunun ayrı bir aile öğrenme hizmetidir. Yooniz, bir ebeveynin e-posta adresinde etkin bir Gadit Family planı olup olmadığını bize sorabilir ve biz yalnızca evet veya hayır yanıtı veririz. Varsa aile, Yooniz içinden Gadit’i parola olmadan açabilir: Yooniz bize ebeveynin e-posta adresini, aile üyelerinin görünen adlarını ve her birinin ebeveyn, erkek çocuk veya kız çocuk olup olmadığını gönderir. Yooniz içinden Gadit’i açan bir çocuk bir kelimeyi anladığında, Yooniz’e ebeveynin e-posta adresini, çocuğun Yooniz kimliğini ve kazanılan öğrenme puanı sayısını göndeririz; kelimenin kendisini asla göndermeyiz."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": sayfalarımızda gösterilen küçük bayrak görsellerini sunar ve bu nedenle IP adresinizi ve tarayıcı bilgilerinizi görür."}
        </li>
        <li>
          <strong>Reklam ve analiz</strong>{": Meta (Meta Pixel), Google Analytics ve TikTok (TikTok Pixel ve Events API), ziyaretleri ve reklamlarımızın sonuçlarını ölçer. Bu hizmetler, pazarlama, kayıt ve ödeme sayfalarımızda çerezler (cookies) ve benzer teknolojiler kullanır. Kaydolduğunuzda veya ödeme yaptığınızda, yalnızca reklamlarımızı ölçmek amacıyla bu hizmetlere karma (hash) uygulanmış (tek yönlü şifrelenmiş) bir e-posta adresi ve hesap kimliğini, IP adresiniz ve tarayıcı bilgilerinizle birlikte gönderebiliriz. İş ortaklığı bağlantıları için bir hizmet olan Affonso, aynı sayfalarda ve bir ziyaretçinin iş ortağı bağlantısı üzerinden ulaştığı her sayfada yüklenir ve 60 güne kadar bir çerez tutar. Bir Affonso iş ortaklığı bağlantısı üzerinden geldikten sonra kaydolursanız, sizi yönlendiren iş ortağına kredi verilebilmesi için Affonso’ya e-posta adresinizi, adınızı ve hesap kimliğinizi göndeririz. Bu hizmetlere çocuklarla ilgili hiçbir bilgiyi asla göndermeyiz ve bu araçlar bir çocuğun profilinde, Çocuk Modunda veya sınıf bağlantısı sayfalarında çalışmaz."}
        </li>
      </ul>

      <h2>4. Bilgilerinizi ne kadar süre saklarız</h2>
      <ul>
        <li>Hesap bilgileri: hesabınız var olduğu sürece.</li>
        <li>Arama geçmişi: kullanıcı başına son 10 arama; her yeni aramada güncellenir.</li>
        <li>
          {"Gadit asistanı konuşmaları: 180 gün; ardından otomatik olarak silinir veya hesabınızı silmeniz hâlinde daha önce silinir. Günlük sınır için kullanılan günlük soru sayınız 3 gün sonra silinir."}
        </li>
        <li>
          {"Gadit asistanının ekibimize ilettiği sorular: bize gönderdiğiniz diğer tüm e-postalar gibi, ekibimizin posta kutusunda saklanır."}
        </li>
        <li>Oluşturulan görseller: aynı kelime+anlam çiftinin önbelleğe alınmış görseli yeniden kullanabilmesi için saklanır. Hesabınız aktif olduğu sürece süresiz olarak saklanabilir.</li>
        <li>Faturalandırma ve vergi kayıtları: yürürlükteki mevzuatın gerektirdiği süre boyunca (genellikle 7 yıl).</li>
        <li>
          {"Silinmiş hesaplar: silme işlemine ilişkin kısa bir kayıt (e-posta adresi, plan ve varsa belirttiğiniz neden ile not); silme işlemine ilişkin soruları yanıtlayabilmemiz için saklanır."}
        </li>
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
        {"Gadit hesabı, 18 yaş ve üzerindeki yetişkinler içindir. Çocuklar ve gençler Gadit’i yalnızca bir yetişkin aracılığıyla, iki yoldan biriyle kullanır."}
      </p>
      <p>
        {"Family profilleri: ebeveyn, her çocuğu kendi Family hesabı içinde bir profil olarak ekler; adını ve erkek mi kız mı olduğunu, ayrıca ebeveyn eklerse yaşını, okul sınıfını ve fotoğrafını girer. Çocukların bizde bir e-posta adresi veya şifresi yoktur. Bir çocuğun aradığı kelimeler ile defteri, oyunları ve ilerlemesi ailenin hesabında saklanır. Ailedeki ebeveynler ve erişim verdikleri kişiler (örneğin özel ders öğretmeni) bunları görebilir; ayrıca bir ebeveyn, bir çocuğun aradığı kelimelerle ilgili bildirim veya e-posta yoluyla uyarı almayı seçebilir. Ebeveyn, bir çocuğun profilini uygulamada istediği zaman kaldırabilir."}
      </p>
      <p>
        {"Sınıf bağlantıları: öğrenci, öğretmenin verdiği bağlantıyı veya kodu hesap olmadan ve e-posta adresi olmadan açar. Öğretmen bir isim listesi girdiyse öğrenci bu listeden kendi adını seçer ve öğrencinin aradığı kelimeler, öğretmenin görebilmesi için sınıf için bu ad altında kaydedilir. Gadit’i kullanmaya okul karar verir ve yasanın gerektirdiği durumlarda ebeveynleri bilgilendirmekten okul sorumludur."}
      </p>
      <p>
        {"Çocuklara ait bilgileri hiçbir zaman reklam amacıyla kullanmayız ve 3. bölümde Reklam ve analiz başlığı altında listelenen araçlar, bir çocuğun profilinde, Çocuk Modunda veya sınıf bağlantısı sayfalarında hiçbir zaman yüklenmez. Bir çocuğun profilinin ve verilerinin silinmesini sağlamak için bir ebeveyn "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" adresine yazabilir; biz de bunları sileriz. Bir çocuğun kendi başına hesap açtığını düşünüyorsanız bize yazın; hesabı ve verilerini silelim."}
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
        {"Gadit hesabı açmak için 18 yaşında veya daha büyük olmanız gerekir. 18 yaşın altındaki çocuklar ve gençler Gadit’i yalnızca bir yetişkin aracılığıyla kullanabilir: bir ebeveyn veya vasi onları Family planına profil olarak ekleyebilir ve bir okul öğrencilerine bir sınıf bağlantısı verebilir. Bu erişimi sağlayan ebeveyn, vasi veya okul bundan sorumludur. Hesap açarak 18 yaşında veya daha büyük olduğunuzu onaylarsınız."}
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
        {"Gadit, ücretsiz bir Basic planı ile fiyatlandırma sayfasında listelenen özelliklere ve fiyatlara sahip ücretli planlar sunar. Fiyatlar, bulunduğunuz konum için fiyatlandırma sayfasında ve ödeme sırasında gösterilen para biriminde belirtilir (İsrail'de, KDV dahil yeni İsrail şekeli) ve mevcut aboneler için en az 30 gün önceden bildirimde bulunularak değiştirilebilir."}
      </p>
      <h3>Otomatik yenileme</h3>
      <p>
        Ücretli abonelikler, yenileme tarihinden önce iptal edilmedikçe, her faturalandırma döneminin (seçiminize göre
        aylık veya yıllık) sonunda o tarihte geçerli olan fiyattan otomatik olarak yenilenir.
      </p>
      <h3>İptal</h3>
      <p>
        {"Hesap sayfanızdan istediğiniz zaman iptal edebilirsiniz. İptal, gelecekteki yenilemeleri durdurur. Ücretli özelliklere erişiminiz mevcut faturalandırma döneminin sonuna kadar devam eder. Aşağıda açıklanan iadeler dışında, yasa aksini gerektirmedikçe kullanılmayan süre için iade yapmayız."}
      </p>
      <h3>İadeler</h3>
      <p>
        {"Hesabınızdaki ilk ödemeden itibaren 14 gün içinde veya yıllık bir yenilemeden itibaren 14 gün içinde talepte bulunursanız, bu ödemenin tamamını iade ederiz. Gerekçe göstermeniz gerekmez. Hesabınıza bağlı e-posta adresinden "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" adresine yazın. İade yapılması aboneliği de sona erdirir. Yasanın iade zorunluluğu getirdiği durumlar dışında diğer ödemeler iade edilmez. Yanlışlıkla ücretlendirildiğinizi düşünüyorsanız, ücretlendirmeden itibaren 30 gün içinde bize yazın. iOS uygulamasında yapılan satın alımlar Apple tarafından ücretlendirilir ve bunları yalnızca Apple reportaproblem.apple.com adresi üzerinden iade edebilir."}
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
        {"Gadit; tanımlar, örnekler, etimolojiler, geri bildirimler, testler, görseller, seslendirme ve transkripsiyonlar oluşturmak için yapay zekâ modelleri (OpenAI ve Google modelleri dahil) kullanır. Şunları anlar ve kabul edersiniz:"}
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
