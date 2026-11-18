import type { ReactElement } from "react";

export const titlesId = { privacy: "Kebijakan Privasi", terms: "Ketentuan Penggunaan" };

export function PrivacyBodyId(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;kami&rdquo;, atau &ldquo;milik kami&rdquo;) adalah layanan yang dioperasikan
        oleh <strong>Lavi Learning and Training Technologies LLC</strong>, sebuah perusahaan yang terdaftar di Amerika
        Serikat. Kebijakan Privasi ini menjelaskan informasi apa yang kami kumpulkan, bagaimana kami menggunakannya, dan
        pilihan yang Anda miliki.
      </p>
      <p>
        Jika Anda memiliki pertanyaan, hubungi kami di{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informasi yang kami kumpulkan</h2>
      <h3>Informasi akun</h3>
      <p>
        Saat Anda membuat akun, kami mengumpulkan alamat email Anda dan, jika Anda masuk dengan Google, informasi profil
        dasar yang diberikan oleh Google (nama tampilan, foto profil). Kami tidak menerima kata sandi Google Anda.
      </p>
      <p>
        {"Di aplikasi iOS Anda juga dapat masuk dengan Apple. Dalam hal ini Apple memberikan kepada kami nama dan alamat email yang Anda pilih untuk dibagikan, yang dapat berupa alamat relay privat yang meneruskan email kami kepada Anda. Kami tidak menerima kata sandi Apple Anda."}
      </p>
      <h3>Informasi penggunaan</h3>
      <p>Saat Anda menggunakan Gadit, kami memproses:</p>
      <ul>
        <li>kata-kata dan kalimat opsional yang Anda cari;</li>
        <li>gambar yang dibuat atas permintaan Anda;</li>
        <li>paket langganan dan status penagihan Anda;</li>
        <li>riwayat pencarian terbaru (untuk pengguna berbayar, hingga 10 kata terakhir), yang disimpan agar Anda dapat mengaksesnya kembali nanti;</li>
        <li>
          {"jika Anda menggunakan asisten Gadit di pusat bantuan: pertanyaan yang Anda ajukan, jawabannya, dan apakah Anda menandai suatu jawaban sebagai membantu, bersama dengan ID akun Anda (dan ID keluarga, jika ada), alamat email, paket langganan, bahasa antarmuka, dan apakah Anda menggunakan situs web atau aplikasi;"}
        </li>
        <li>kuota bulanan (misalnya, jumlah gambar yang telah Anda buat dalam siklus penagihan ini).</li>
      </ul>
      <p>
        {"Asisten Gadit tidak ditawarkan pada profil anak, dalam Mode Anak, atau kepada pengunjung yang tidak masuk ke akun. Mohon jangan mengetikkan kata sandi atau nomor kartu ke dalamnya."}
      </p>
      <h3>Data teknis dan analitik</h3>
      <p>
        Kami secara otomatis mengumpulkan informasi teknis dasar seperti alamat IP, jenis browser, jenis perangkat, URL
        perujuk, dan halaman yang dilihat. Informasi ini digunakan untuk keamanan, pemantauan kinerja, dan analitik
        agregat. Analitik disediakan oleh Vercel dan dianonimkan pada titik pengumpulan (tidak ada pengenal pribadi yang
        disimpan). Di halaman pemasaran, pendaftaran, dan pembayaran kami, kami juga menggunakan alat iklan dan
        analitik, yang dijelaskan di Bagian 3.
      </p>
      <h3>Informasi pembayaran</h3>
      <p>
        Jika Anda berlangganan, pembayaran diproses oleh <strong>Stripe, Inc.</strong> Kami tidak melihat atau menyimpan
        nomor kartu Anda secara lengkap; kami hanya menerima token pelanggan dan metadata yang diperlukan untuk
        mengidentifikasi langganan.
      </p>

      <h2>2. Bagaimana kami menggunakan informasi Anda</h2>
      <ul>
        <li>untuk menyediakan dan meningkatkan layanan Gadit (membuat definisi, gambar, umpan balik kalimat, kuis);</li>
        <li>untuk mengelola akun Anda dan mempersonalisasi pengalaman Anda (riwayat pencarian, bahasa pilihan, sakelar &ldquo;Mode Anak&rdquo;);</li>
        <li>untuk memproses langganan dan mengirim email transaksional (tanda terima, perubahan langganan);</li>
        <li>
          {"untuk menjawab pertanyaan Anda di asisten Gadit dan meningkatkan jawaban bantuan kami, dan, ketika asisten meneruskan pertanyaan kepada tim kami, untuk mengirimkan melalui email kepada tim percakapan terbaru beserta nama, alamat email, paket langganan, bahasa antarmuka, dan apakah Anda menggunakan situs web atau aplikasi, agar tim dapat membalas Anda melalui email;"}
        </li>
        <li>untuk mengukur dan meningkatkan kinerja produk serta mencegah penyalahgunaan;</li>
        <li>untuk mematuhi kewajiban hukum.</li>
      </ul>
      <p>
        Kami <strong>tidak menjual</strong> informasi pribadi Anda, dan kami tidak menggunakan konten Anda untuk
        menayangkan iklan kepada Anda.
      </p>

      <h2>3. Layanan pihak ketiga yang kami gunakan</h2>
      <p>
        Gadit mengandalkan pemroses berikut. Masing-masing hanya menerima informasi minimum yang diperlukan untuk
        menyediakan layanan yang relevan:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": memproses kata dan kalimat yang Anda kirimkan untuk membuat definisi, umpan balik kalimat, dan kuis, mengubah teks menjadi suara, mentranskripsikan masukan suara, membaca teks dalam foto dan file PDF yang Anda unggah, misalnya halaman pekerjaan rumah, dan membuat gambar. OpenAI juga menulis jawaban asisten Gadit: kami mengirimkan pertanyaan Anda, pesan-pesan sebelumnya dalam percakapan yang sama, bahasa antarmuka Anda, paket Anda, dan apakah Anda menggunakan situs web atau aplikasi, dan kami tidak menyertakan nama atau alamat email Anda. Data yang dikirim ke OpenAI tunduk pada kebijakan penggunaan data API OpenAI."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): menyimpan akun, profil, status
          langganan, riwayat pencarian, dan gambar yang dibuat milik Anda.
        </li>
        <li>
          <strong>Google</strong>{": (Gemini, melalui Google Cloud), mengubah teks menjadi suara. Kami hanya mengirimkan teks yang akan dibacakan, seperti kata, kalimat, dan cerita, dan audio tersebut disimpan di penyimpanan Firebase kami agar dapat diputar kembali. Dalam satu permainan membaca, Google juga mendengar bunyi yang diucapkan seorang anak dengan suara keras, untuk memeriksanya, dan rekaman tersebut tidak disimpan. Google Fonts menyajikan font untuk antarmuka dalam bahasa Tionghoa, Jepang, dan Korea, dan melihat alamat IP Anda."}
        </li>
        <li>
          <strong>Dicta</strong>{": organisasi nirlaba Israel, menambahkan tanda vokal pada teks bahasa Ibrani untuk pembaca muda. Kami hanya mengirimkan teks bahasa Ibrani kepadanya."}
        </li>
        <li>
          <strong>Stripe</strong>: menangani pembayaran, langganan, dan portal penagihan.
        </li>
        <li>
          <strong>Apple</strong>{": menyediakan Sign in with Apple di aplikasi iOS, lihat bagian 1, dan menjual serta menagih langganan yang dibeli di aplikasi iOS. Untuk pembelian tersebut, Apple menangani pembayaran, dan kami hanya menerima konfirmasi atas pembelian itu dan statusnya, seperti perpanjangan atau pengembalian dana."}
        </li>
        <li>
          <strong>PayPal</strong>{": membayar mitra kami. Kami memberikan alamat email PayPal mitra tersebut dan jumlahnya."}
        </li>
        <li>
          <strong>Resend</strong>{": mengirim email kami (seperti tautan masuk dan notifikasi), dan meneruskan kepada tim kami pertanyaan yang diteruskan oleh asisten Gadit, dengan alamat email Anda sebagai alamat balasan."}
        </li>
        <li>
          <strong>Expo</strong>{": mengirimkan notifikasi aplikasi iOS, seperti peringatan yang dapat diaktifkan oleh orang tua, yang mencakup nama anak dan kata yang dicari oleh anak tersebut."}
        </li>
        <li>
          <strong>Vercel</strong>: menghosting dan menyajikan situs web, serta menyediakan analitik anonim dan
          pengukuran kinerja.
        </li>
        <li>
          <strong>Yooniz</strong>{": layanan pembelajaran keluarga terpisah dari pendiri yang sama. Yooniz dapat menanyakan kepada kami apakah alamat email orang tua memiliki paket Gadit Family yang aktif, dan kami hanya menjawab ya atau tidak. Jika ada, keluarga dapat membuka Gadit dari Yooniz tanpa kata sandi: Yooniz mengirimkan kepada kami alamat email orang tua, nama tampilan anggota keluarga, dan apakah masing-masing adalah orang tua, anak laki-laki, atau anak perempuan. Ketika seorang anak yang membuka Gadit dari Yooniz memahami sebuah kata, kami mengirimkan kepada Yooniz alamat email orang tua, ID Yooniz anak tersebut, dan jumlah poin pembelajaran yang diperoleh, tidak pernah kata itu sendiri."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": menyajikan gambar bendera kecil yang ditampilkan di halaman kami, sehingga melihat alamat IP dan detail browser Anda."}
        </li>
        <li>
          <strong>Iklan dan analitik</strong>{": Meta (Meta Pixel), Google Analytics, dan TikTok (TikTok Pixel dan Events API) mengukur kunjungan dan hasil iklan kami. Layanan ini menggunakan cookie dan teknologi serupa di halaman pemasaran, pendaftaran, dan pembayaran kami. Saat Anda mendaftar atau membayar, kami dapat mengirimkan kepada layanan ini alamat email dan ID akun yang telah di-hash (dienkripsi satu arah), bersama dengan alamat IP dan detail browser Anda, semata-mata untuk mengukur iklan kami. Affonso, layanan untuk tautan afiliasi, dimuat di halaman-halaman yang sama dan di setiap halaman yang dikunjungi pengunjung melalui tautan mitra, dan menyimpan cookie hingga 60 hari. Jika Anda mendaftar setelah datang melalui tautan afiliasi Affonso, kami mengirimkan kepada Affonso alamat email, nama, dan ID akun Anda, agar afiliasi yang merujuk Anda mendapatkan kredit. Kami tidak pernah mengirimkan informasi tentang anak-anak kepada layanan mana pun ini, dan alat-alat ini tidak berjalan pada profil anak, dalam Kids Mode, atau di halaman tautan kelas."}
        </li>
      </ul>

      <h2>4. Berapa lama kami menyimpan informasi Anda</h2>
      <ul>
        <li>Informasi akun: selama akun Anda masih ada.</li>
        <li>Riwayat pencarian: 10 pencarian terakhir per pengguna, diperbarui pada setiap pencarian baru.</li>
        <li>
          {"Percakapan dengan asisten Gadit: 180 hari, lalu dihapus secara otomatis, atau lebih cepat jika Anda menghapus akun. Jumlah harian pertanyaan Anda, yang digunakan untuk batas harian, dihapus setelah 3 hari."}
        </li>
        <li>
          {"Pertanyaan yang diteruskan oleh asisten Gadit kepada tim kami: disimpan di kotak masuk tim kami, seperti email apa pun yang Anda kirim kepada kami."}
        </li>
        <li>Gambar yang dibuat: disimpan agar kombinasi kata+makna yang sama dapat menggunakan kembali gambar yang tersimpan dalam cache. Dapat disimpan tanpa batas waktu selama akun Anda aktif.</li>
        <li>Catatan penagihan dan pajak: sebagaimana diwajibkan oleh hukum yang berlaku (biasanya 7 tahun).</li>
        <li>
          {"Akun yang dihapus: catatan singkat bahwa akun telah dihapus (alamat email, paket langganan, serta alasan dan catatan yang Anda berikan, jika ada), yang disimpan agar kami dapat menjawab pertanyaan tentang penghapusan tersebut."}
        </li>
        <li>Data analitik: diagregasi, biasanya disimpan oleh penyedia analitik selama 13 bulan.</li>
      </ul>

      <h2>5. Hak-hak Anda</h2>
      <p>Tergantung pada tempat tinggal Anda, Anda mungkin memiliki hak untuk:</p>
      <ul>
        <li>meminta akses ke informasi pribadi yang kami simpan tentang Anda;</li>
        <li>meminta perbaikan informasi yang tidak akurat;</li>
        <li>meminta penghapusan akun Anda dan data terkait;</li>
        <li>mengekspor data Anda dalam format portabel;</li>
        <li>mengajukan keberatan atas atau membatasi penggunaan tertentu atas informasi Anda;</li>
        <li>memilih untuk tidak ikut serta dalam pembagian data tertentu (jika berlaku berdasarkan CCPA atau undang-undang serupa).</li>
      </ul>
      <p>
        Untuk menggunakan salah satu hak ini, kirim email ke{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Kami akan menanggapi dalam
        waktu 30 hari.
      </p>

      <h2>6. Keamanan</h2>
      <p>
        Kami menggunakan perlindungan standar industri, yaitu koneksi terenkripsi (HTTPS), API yang diautentikasi, dan
        kontrol akses, untuk melindungi informasi Anda. Tidak ada metode transmisi atau penyimpanan di internet yang 100%
        aman, sehingga kami tidak dapat menjamin keamanan mutlak, tetapi kami terus berupaya mengurangi risiko.
      </p>

      <h2>7. Anak-anak</h2>
      <p>
        {"Akun Gadit ditujukan untuk orang dewasa, yaitu yang berusia 18 tahun atau lebih. Anak-anak dan remaja menggunakan Gadit hanya melalui orang dewasa, dengan salah satu dari dua cara berikut."}
      </p>
      <p>
        {"Profil Family: orang tua menambahkan setiap anak sebagai profil di dalam akun Family milik orang tua, dengan nama dan apakah anak tersebut laki-laki atau perempuan, dan, jika ditambahkan oleh orang tua, juga usia, tingkat kelas, dan foto. Anak-anak tidak memiliki alamat email atau kata sandi pada kami. Kata-kata yang dicari seorang anak, serta buku catatan, permainan, dan kemajuannya, disimpan di akun keluarga. Orang tua dalam keluarga, dan siapa pun yang mereka beri akses kepadanya, dapat melihatnya, dan orang tua dapat memilih untuk menerima pemberitahuan, melalui notifikasi atau email, berisi kata-kata yang dicari seorang anak. Orang tua dapat menghapus profil anak di aplikasi kapan saja."}
      </p>
      <p>
        {"Tautan kelas: seorang siswa membuka tautan atau kode yang diberikan guru, tanpa akun dan tanpa alamat email. Jika guru memasukkan daftar nama, siswa memilih namanya dari daftar tersebut, dan kata-kata yang dicari siswa disimpan untuk kelas di bawah nama tersebut, sehingga guru dapat melihatnya. Sekolah memutuskan untuk menggunakan Gadit dan bertanggung jawab untuk memberi tahu orang tua apabila diwajibkan oleh hukum."}
      </p>
      <p>
        {"Kami tidak pernah menggunakan informasi anak untuk iklan, dan alat-alat yang tercantum di bawah Iklan dan analitik pada bagian 3 tidak pernah dimuat pada profil anak, dalam Kids Mode, atau pada halaman tautan kelas. Untuk menghapus profil anak dan datanya, orang tua dapat menulis ke "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" dan kami akan menghapusnya. Jika Anda yakin seorang anak telah membuka akun sendiri, hubungi kami dan kami akan menghapus akun tersebut beserta datanya."}
      </p>

      <h2>8. Pengguna internasional</h2>
      <p>
        Gadit dioperasikan dari Amerika Serikat. Jika Anda mengakses layanan dari luar Amerika Serikat, informasi Anda
        akan ditransfer ke, disimpan, dan diproses di Amerika Serikat serta di wilayah pusat data yang digunakan oleh
        penyedia layanan kami.
      </p>

      <h2>9. Perubahan pada kebijakan ini</h2>
      <p>
        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan dipublikasikan di
        halaman ini dengan tanggal &ldquo;Terakhir diperbarui&rdquo; yang direvisi. Penggunaan Gadit secara berkelanjutan
        oleh Anda setelah perubahan berlaku merupakan penerimaan atas kebijakan yang diperbarui.
      </p>

      <h2>10. Kontak</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyId(): ReactElement {
  return (
    <>
      <p>
        Selamat datang di Gadit. Ketentuan Penggunaan ini (&ldquo;Ketentuan&rdquo;) mengatur akses Anda ke dan
        penggunaan situs web, aplikasi, dan layanan Gadit (secara bersama-sama disebut &ldquo;Layanan&rdquo;), yang
        dioperasikan oleh{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;kami&rdquo; atau &ldquo;milik kami&rdquo;).
        Dengan menggunakan Layanan, Anda setuju untuk terikat oleh Ketentuan ini. Jika Anda tidak setuju, jangan gunakan
        Layanan.
      </p>

      <h2>1. Siapa yang boleh menggunakan Gadit</h2>
      <p>
        {"Anda harus berusia 18 tahun atau lebih untuk membuka akun Gadit. Anak-anak dan remaja di bawah usia 18 tahun menggunakan Gadit hanya melalui orang dewasa: orang tua atau wali dapat menambahkan mereka sebagai profil pada paket Family, dan sekolah dapat memberikan tautan kelas kepada para siswanya. Orang tua, wali, atau sekolah yang memberikan akses tersebut bertanggung jawab atasnya. Dengan membuka akun, Anda mengonfirmasi bahwa Anda berusia 18 tahun atau lebih."}
      </p>

      <h2>2. Akun Anda</h2>
      <p>
        Anda bertanggung jawab untuk menjaga kerahasiaan kredensial login Anda dan atas semua aktivitas yang terjadi di
        bawah akun Anda. Segera beri tahu kami di{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> jika Anda yakin akun Anda
        telah disusupi.
      </p>

      <h2>3. Langganan dan penagihan</h2>
      <h3>Paket dan biaya</h3>
      <p>
        {"Gadit menawarkan paket Basic gratis dan paket berbayar dengan fitur dan harga yang tercantum di halaman harga. Harga dinyatakan dalam mata uang yang ditampilkan di halaman harga dan saat checkout untuk lokasi Anda (di Israel, syikal baru Israel termasuk PPN) dan dapat diubah dengan pemberitahuan sekurang-kurangnya 30 hari sebelumnya kepada pelanggan yang sudah ada."}
      </p>
      <h3>Perpanjangan otomatis</h3>
      <p>
        Langganan berbayar diperpanjang secara otomatis pada akhir setiap periode penagihan (bulanan atau tahunan, sesuai
        pilihan) dengan harga yang berlaku saat itu, kecuali dibatalkan sebelum tanggal perpanjangan.
      </p>
      <h3>Pembatalan</h3>
      <p>
        {"Anda dapat membatalkan kapan saja dari halaman akun Anda. Pembatalan menghentikan perpanjangan berikutnya. Anda tetap memiliki akses ke fitur berbayar hingga akhir periode penagihan saat ini. Selain pengembalian dana yang dijelaskan di bawah ini, kami tidak mengembalikan dana untuk waktu yang tidak digunakan, kecuali jika hukum mengharuskan sebaliknya."}
      </p>
      <h3>Pengembalian dana</h3>
      <p>
        {"Jika Anda memintanya dalam waktu 14 hari sejak pembayaran pertama pada akun Anda, atau dalam waktu 14 hari sejak perpanjangan tahunan, kami akan mengembalikan pembayaran tersebut secara penuh. Anda tidak perlu memberikan alasan. Kirim email ke "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" dari alamat email akun Anda. Pengembalian dana juga mengakhiri langganan. Pembayaran lainnya tidak dapat dikembalikan, kecuali jika hukum mengharuskan pengembalian dana. Jika Anda yakin telah dikenai biaya secara keliru, hubungi kami dalam waktu 30 hari sejak tanggal penagihan. Pembelian yang dilakukan di aplikasi iOS ditagihkan oleh Apple, dan hanya Apple yang dapat mengembalikan dananya, di reportaproblem.apple.com."}
      </p>

      <h2>4. Penggunaan yang dapat diterima</h2>
      <p>Anda setuju untuk tidak:</p>
      <ul>
        <li>menggunakan Layanan untuk tujuan ilegal apa pun atau dengan melanggar hukum apa pun;</li>
        <li>mencoba merekayasa balik, mendekompilasi, atau mengekstrak kode sumber Layanan;</li>
        <li>menyalahgunakan, melecehkan, atau merugikan pengguna lain, atau mengirimkan konten yang bersifat kebencian, mengancam, atau cabul;</li>
        <li>mengotomatiskan akses ke Layanan melebihi penggunaan pribadi yang wajar (misalnya, melakukan scraping definisi dalam skala besar);</li>
        <li>mengakali batas laju (rate limit) atau pembatasan paket, atau menggunakan beberapa akun untuk menghindari kuota;</li>
        <li>menggunakan Layanan untuk melatih atau menyempurnakan (fine-tune) model AI atau produk kamus apa pun yang bersaing;</li>
        <li>mengunggah atau mengirimkan konten yang tidak berhak Anda kirimkan.</li>
      </ul>
      <p>
        Kami berhak menangguhkan atau mengakhiri akun yang melanggar Ketentuan ini.
      </p>

      <h2>5. Konten yang dihasilkan AI</h2>
      <p>
        {"Gadit menggunakan model kecerdasan buatan (termasuk model dari OpenAI dan Google) untuk menghasilkan definisi, contoh, etimologi, umpan balik, kuis, gambar, suara, dan transkripsi. Anda memahami dan menyetujui bahwa:"}
      </p>
      <ul>
        <li>
          Keluaran AI dapat <strong>tidak akurat, tidak lengkap, atau tidak pantas</strong>. Gadit dimaksudkan sebagai
          alat bantu belajar dan tidak boleh dijadikan dasar untuk keputusan hukum, medis, profesional, atau akademik.
        </li>
        <li>
          Definisi yang dihasilkan AI dapat berbeda dari kamus resmi. Kami tidak menjamin bahwa setiap definisi
          otoritatif secara linguistik.
        </li>
        <li>
          Gambar dihasilkan secara algoritmis dan sesekali dapat tidak terduga atau tidak tepat. Gambar tersebut adalah
          ilustrasi, bukan penggambaran harfiah.
        </li>
        <li>
          Anda sepenuhnya bertanggung jawab atas cara Anda menafsirkan dan menggunakan konten yang dihasilkan AI.
        </li>
      </ul>

      <h2>6. Konten Anda</h2>
      <p>
        Ketika Anda mengirimkan kata, kalimat, atau audio ke Gadit (misalnya saat menggunakan &ldquo;Susun kalimat Anda
        sendiri&rdquo; atau input suara), Anda memberi kami lisensi yang berlaku di seluruh dunia, noneksklusif, dan
        bebas royalti untuk memproses konten tersebut dengan tujuan menyediakan Layanan dan meningkatkannya. Kami tidak
        mengklaim kepemilikan atas kiriman Anda.
      </p>

      <h2>7. Kekayaan intelektual</h2>
      <p>
        Nama Gadit, logo, situs web, dan perangkat lunak yang mendasarinya adalah milik kami atau milik pemberi lisensi
        kami. Anda diberi lisensi pribadi, dapat dicabut, dan noneksklusif untuk menggunakan Layanan sebagaimana
        diizinkan oleh Ketentuan ini.
      </p>
      <p>
        Konten yang dihasilkan oleh Gadit sebagai tanggapan atas masukan Anda (definisi, gambar, dan sebagainya) dapat
        Anda gunakan untuk tujuan pribadi, pendidikan, atau nonkomersial. Untuk penggunaan komersial (misalnya dalam
        produk berbayar), silakan hubungi kami.
      </p>

      <h2>8. Ketersediaan dan perubahan</h2>
      <p>
        Kami berupaya menjaga Layanan tetap tersedia, tetapi kami tidak menjamin pengoperasian yang tidak terputus atau
        bebas kesalahan. Kami dapat mengubah, menangguhkan, atau menghentikan bagian mana pun dari Layanan kapan saja,
        termasuk fitur, harga, atau ketersediaan di wilayah tertentu.
      </p>

      <h2>9. Layanan pihak ketiga</h2>
      <p>
        Layanan mengandalkan penyedia pihak ketiga (termasuk OpenAI, Google Firebase, Stripe, dan Vercel). Ketersediaan
        atau perilaku mereka dapat memengaruhi pengalaman Anda. Tanggung jawab kami dibatasi oleh Bagian 11 terlepas dari
        masalah yang disebabkan oleh penyedia tersebut.
      </p>

      <h2>10. Penafian</h2>
      <p>
        LAYANAN DISEDIAKAN &ldquo;SEBAGAIMANA ADANYA&rdquo; DAN &ldquo;SEBAGAIMANA TERSEDIA&rdquo;, TANPA JAMINAN DALAM
        BENTUK APA PUN, BAIK TERSURAT MAUPUN TERSIRAT, TERMASUK NAMUN TIDAK TERBATAS PADA JAMINAN KELAYAKAN UNTUK
        DIPERDAGANGKAN (MERCHANTABILITY), KESESUAIAN UNTUK TUJUAN TERTENTU, DAN TIDAK ADANYA PELANGGARAN HAK
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Batasan tanggung jawab</h2>
      <p>
        SEJAUH MAKSIMUM YANG DIIZINKAN OLEH HUKUM, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC BESERTA PEJABAT,
        KARYAWAN, DAN AGENNYA TIDAK BERTANGGUNG JAWAB ATAS KERUGIAN TIDAK LANGSUNG, INSIDENTAL, KHUSUS, KONSEKUENSIAL,
        ATAU YANG BERSIFAT HUKUMAN (PUNITIVE DAMAGES), ATAU ATAS HILANGNYA LABA ATAU PENDAPATAN, YANG TIMBUL DARI ATAU
        SEHUBUNGAN DENGAN PENGGUNAAN LAYANAN OLEH ANDA.
      </p>
      <p>
        TOTAL TANGGUNG JAWAB KAMI ATAS KLAIM APA PUN YANG TIMBUL DARI ATAU TERKAIT DENGAN LAYANAN TIDAK AKAN MELEBIHI
        JUMLAH YANG LEBIH BESAR DI ANTARA (A) JUMLAH YANG ANDA BAYARKAN KEPADA KAMI DALAM DUA BELAS BULAN SEBELUM KLAIM,
        ATAU (B) USD $100.
      </p>

      <h2>12. Pengakhiran</h2>
      <p>
        Anda dapat berhenti menggunakan Layanan kapan saja. Kami dapat menangguhkan atau mengakhiri akses Anda jika Anda
        melanggar Ketentuan ini atau jika diwajibkan oleh hukum. Setelah pengakhiran, ketentuan yang menurut sifatnya
        harus tetap berlaku (termasuk Bagian 7, 10, 11, dan 14) akan tetap berlaku.
      </p>

      <h2>13. Perubahan pada Ketentuan ini</h2>
      <p>
        Kami dapat merevisi Ketentuan ini dari waktu ke waktu. Perubahan material akan dipublikasikan di halaman ini
        dengan tanggal &ldquo;Terakhir diperbarui&rdquo; yang direvisi. Penggunaan Layanan secara berkelanjutan oleh Anda
        setelah perubahan berlaku merupakan penerimaan atas Ketentuan yang diperbarui.
      </p>

      <h2>14. Hukum yang berlaku dan sengketa</h2>
      <p>
        Ketentuan ini diatur oleh hukum Negara Bagian Delaware, Amerika Serikat, tanpa memperhatikan kaidah hukum perdata
        internasionalnya (conflict-of-law rules). Setiap sengketa yang timbul dari atau terkait dengan Ketentuan ini atau
        Layanan akan diselesaikan secara eksklusif di pengadilan negara bagian atau federal yang berlokasi di Delaware,
        Amerika Serikat, dan Anda menyetujui yurisdiksi personal (personal jurisdiction) dari pengadilan tersebut.
      </p>

      <h2>15. Kontak</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
