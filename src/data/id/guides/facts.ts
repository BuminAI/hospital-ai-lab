// Fakta kunci yang dapat dikutip — data untuk /id/fakta/ dan /id/llms-full.txt (2026-10-31)
//
// Setiap butir = satu pertanyaan, satu jawaban pendek, pasal dasar, dan sumber primer. Semuanya sudah dibuka dan dibaca
// dari naskah resmi (lihat milestones.ts / catatan HANDOFF). Jangan menambah butir dari berita atau dugaan; jangan
// menulis angka atau tenggat yang tidak ada di naskah. Bila peraturan berubah, baca ulang naskahnya dan ubah CHECKED.
import { SRC } from './milestones';

export const FACTS_CHECKED = '31 Oktober 2026';

export type FactTopic = 'Rekam medis elektronik' | 'Lokasi dan penyimpanan data' | 'Data pribadi pasien' | 'AI dan alat kesehatan' | 'SATUSEHAT' | 'Hak pasien';

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Dasar hukum singkat, mis. "Permenkes 24/2022 Pasal 45" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── Rekam medis elektronik ───────────────────────────────
  { id: 'rme-wajib-sejak', topic: 'Rekam medis elektronik', q: 'Sejak kapan fasilitas pelayanan kesehatan wajib menyelenggarakan rekam medis elektronik?', a: 'Seluruh fasilitas pelayanan kesehatan harus menyelenggarakan RME sesuai Permenkes 24/2022 paling lambat 31 Desember 2023.', basis: 'Permenkes 24/2022 Pasal 45', src: 'permenkes24' },
  { id: 'rme-masa-simpan', topic: 'Rekam medis elektronik', q: 'Berapa lama data rekam medis elektronik disimpan?', a: 'Paling singkat 25 tahun sejak tanggal kunjungan terakhir pasien. Setelah itu data dapat dikecualikan dari pemusnahan bila masih akan dipakai.', basis: 'Permenkes 24/2022 Pasal 39', src: 'permenkes24' },
  { id: 'rme-registrasi', topic: 'Rekam medis elektronik', q: 'Apakah sistem elektronik RME harus diregistrasikan?', a: 'Ya. Fasilitas penyelenggara RME atau penyelenggara sistem elektronik wajib meregistrasi sistem yang dipakai di Kemenkes, dengan dokumen yang paling sedikit memuat nama sistem, dokumentasi, fitur, lokasi penyimpanan data, variabel dan metadata, serta daftar fasilitas pengguna.', basis: 'Permenkes 24/2022 Pasal 12', src: 'permenkes24' },
  { id: 'rme-interoperabilitas', topic: 'Rekam medis elektronik', q: 'Apakah RME harus terhubung dengan platform data kesehatan Kemenkes?', a: 'Ya. RME yang disimpan fasilitas harus terhubung atau terinteroperabilitas dengan platform layanan interoperabilitas dan integrasi data kesehatan yang dikelola Kemenkes.', basis: 'Permenkes 24/2022 Pasal 21', src: 'permenkes24' },
  { id: 'rme-backup', topic: 'Rekam medis elektronik', q: 'Apa syarat cadangan data (backup) RME?', a: 'Fasilitas yang menyimpan RME secara digital wajib memiliki cadangan data. Cadangan diletakkan di tempat berbeda dari lokasi fasilitas, dilakukan periodik, dan tertuang dalam SOP.', basis: 'Permenkes 24/2022 Pasal 20 ayat 4–5', src: 'permenkes24' },
  { id: 'rme-vendor-penyimpanan', topic: 'Rekam medis elektronik', q: 'Apa syarat bila penyimpanan RME dikerjasamakan dengan penyelenggara sistem elektronik?', a: 'Bila sumber daya terbatas, kerja sama boleh dilakukan dengan penyelenggara yang punya fasilitas penyimpanan di dalam negeri dan mendapat rekomendasi unit data dan informasi Kemenkes. Penyelenggara dilarang membuka, mengambil, memanipulasi, merusak, atau memanfaatkan data; larangan itu dituangkan dalam pakta integritas atau NDA, dan fasilitas harus memperoleh akses tidak terbatas ke data.', basis: 'Permenkes 24/2022 Pasal 22', src: 'permenkes24' },
  { id: 'rme-hak-akses', topic: 'Rekam medis elektronik', q: 'Siapa yang memberikan hak akses RME dan apa jenisnya?', a: 'Pimpinan fasilitas memberikan hak akses kepada tenaga kesehatan atau tenaga lain. Haknya terdiri atas penginputan data, perbaikan data, dan melihat data, dan menjadi bagian dari SOP penyelenggaraan RME.', basis: 'Permenkes 24/2022 Pasal 30', src: 'permenkes24' },

  // ── Lokasi dan penyimpanan data ───────────────────────────
  { id: 'data-lokasi-pusat-data', topic: 'Lokasi dan penyimpanan data', q: 'Di mana data kesehatan harus disimpan?', a: 'Pangkalan data kesehatan berupa pusat data di dalam wilayah Indonesia, dengan cadangan data. Bila memakai jasa pihak lain, harus dilaksanakan di dalam wilayah Indonesia, berdasarkan perjanjian yang memuat paling sedikit kerahasiaan, tingkat layanan, dan target tingkat layanan.', basis: 'PP 28/2024 Pasal 966', src: 'pp28' },
  { id: 'data-pemrosesan-indonesia', topic: 'Lokasi dan penyimpanan data', q: 'Apakah pemrosesan data dan informasi kesehatan harus di Indonesia?', a: 'Penyelenggara sistem informasi kesehatan wajib memproses data dan informasi kesehatan di wilayah Indonesia. Pemrosesan di luar wilayah dapat dilakukan sesuai peraturan perundang-undangan.', basis: 'UU 17/2023 Pasal 346 ayat 6–7', src: 'uuKesehatan' },
  { id: 'data-transfer-luar-negeri', topic: 'Lokasi dan penyimpanan data', q: 'Bolehkah data kesehatan ditransfer ke luar wilayah Indonesia?', a: 'Dapat ditransfer ke luar wilayah Indonesia untuk tujuan yang spesifik dan terbatas dengan izin dari Pemerintah Pusat.', basis: 'UU 17/2023 Pasal 349 ayat 7', src: 'uuKesehatan' },

  // ── Data pribadi pasien ───────────────────────────────────
  { id: 'pdp-data-spesifik', topic: 'Data pribadi pasien', q: 'Apakah data kesehatan termasuk data pribadi yang bersifat spesifik?', a: 'Ya. UU PDP menyebut data dan informasi kesehatan, data biometrik, data genetika, catatan kejahatan, data anak, dan data keuangan pribadi sebagai data pribadi yang bersifat spesifik.', basis: 'UU 27/2022 Pasal 4', src: 'uuPdp' },
  { id: 'pdp-dasar-pemrosesan', topic: 'Data pribadi pasien', q: 'Apa saja dasar pemrosesan data pribadi?', a: 'Persetujuan eksplisit untuk tujuan tertentu; pemenuhan perjanjian; pemenuhan kewajiban hukum pengendali data; pelindungan kepentingan vital; pelaksanaan tugas kepentingan umum atau pelayanan publik; dan pemenuhan kepentingan yang sah lainnya.', basis: 'UU 27/2022 Pasal 20', src: 'uuPdp' },
  { id: 'pdp-kebocoran-3x24', topic: 'Data pribadi pasien', q: 'Dalam berapa lama kebocoran data pribadi harus diberitahukan?', a: 'Pengendali data wajib menyampaikan pemberitahuan tertulis paling lambat 3 x 24 jam kepada subjek data dan lembaga.', basis: 'UU 27/2022 Pasal 46 ayat 1', src: 'uuPdp' },
  { id: 'pdp-isi-pemberitahuan', topic: 'Data pribadi pasien', q: 'Apa isi minimal pemberitahuan kegagalan pelindungan data pribadi?', a: 'Data pribadi yang terungkap; kapan dan bagaimana data terungkap; dan upaya penanganan serta pemulihan oleh pengendali data. Dalam hal tertentu pengendali data juga wajib memberi tahu masyarakat.', basis: 'UU 27/2022 Pasal 46 ayat 2–3', src: 'uuPdp' },
  { id: 'pdp-3x24-hak', topic: 'Data pribadi pasien', q: 'Berapa lama pengendali data harus memenuhi permintaan akses, perbaikan, atau penarikan persetujuan?', a: 'Akses diberikan paling lambat 3 x 24 jam sejak permintaan diterima (Pasal 32); pembaruan atau perbaikan data paling lambat 3 x 24 jam (Pasal 30); penghentian pemrosesan paling lambat 3 x 24 jam sejak penarikan persetujuan diterima (Pasal 40).', basis: 'UU 27/2022 Pasal 30, 32, 40', src: 'uuPdp' },
  { id: 'pdp-transfer-luar-negeri', topic: 'Data pribadi pasien', q: 'Apa syarat mentransfer data pribadi ke luar wilayah Indonesia menurut UU PDP?', a: 'Pengendali wajib memastikan negara penerima memiliki tingkat pelindungan setara atau lebih tinggi; bila tidak, harus ada pelindungan yang memadai dan mengikat; bila keduanya tidak terpenuhi, diperlukan persetujuan subjek data.', basis: 'UU 27/2022 Pasal 56', src: 'uuPdp' },
  { id: 'pdp-sanksi', topic: 'Data pribadi pasien', q: 'Apa jenis sanksi administratif UU PDP?', a: 'Peringatan tertulis; penghentian sementara kegiatan pemrosesan; penghapusan atau pemusnahan data pribadi; dan/atau denda administratif.', basis: 'UU 27/2022 Pasal 57', src: 'uuPdp' },
  { id: 'pdp-masa-penyesuaian', topic: 'Data pribadi pasien', q: 'Kapan masa penyesuaian UU PDP berakhir?', a: 'Pasal 74 memberi waktu paling lama 2 tahun sejak diundangkan. UU diundangkan 17 Oktober 2022, sehingga masa penyesuaian berakhir 17 Oktober 2024.', basis: 'UU 27/2022 Pasal 74', src: 'uuPdp' },

  // ── AI dan alat kesehatan ─────────────────────────────────
  { id: 'alkes-ai-medis', topic: 'AI dan alat kesehatan', q: 'Kapan AI termasuk alat kesehatan?', a: 'AI dan machine learning hanya termasuk kategori alat kesehatan apabila memiliki tujuan medis yang dimaksudkan.', basis: 'Kepmenkes 951/2026 Bab II (bagian AI)', src: 'kepmenkes951' },
  { id: 'alkes-ai-administratif', topic: 'AI dan alat kesehatan', q: 'Apakah AI untuk administrasi rumah sakit termasuk alat kesehatan?', a: 'Tidak, bila fungsinya non-medis, termasuk pengelolaan data administratif, penyimpanan data, atau fungsi operasional yang tidak memengaruhi fungsi alat kesehatan. Aturan pelindungan data pribadi tetap berlaku.', basis: 'Kepmenkes 951/2026 Bab II (bagian AI)', src: 'kepmenkes951' },
  { id: 'alkes-samd-simd', topic: 'AI dan alat kesehatan', q: 'Apa beda SaMD dan SiMD?', a: 'SaMD adalah alat kesehatan berbasis perangkat lunak yang dapat berdiri sendiri dan dipakai untuk satu atau lebih tujuan medis. SiMD adalah perangkat lunak yang tertanam dan menjadi bagian dari alat kesehatan untuk mengontrol kinerja atau memberi fungsi tertentu.', basis: 'Kepmenkes 951/2026 Bab I dan II', src: 'kepmenkes951' },
  { id: 'alkes-validasi-lokal', topic: 'AI dan alat kesehatan', q: 'Kapan produk perangkat lunak impor perlu validasi klinis lokal?', a: 'Untuk produk impor tertentu: yang dikembangkan lebih lanjut atau dilatih ulang dengan data yang merepresentasikan populasi Indonesia, dan/atau yang memakai AI berisiko sedang hingga tinggi untuk diagnosis, skrining, atau keputusan klinis. Hasilnya wajib disampaikan paling lama 1 tahun sejak izin edar terbit.', basis: 'Kepmenkes 951/2026 (dokumen hasil pengujian)', src: 'kepmenkes951' },
  { id: 'alkes-dokumen-ai', topic: 'AI dan alat kesehatan', q: 'Dokumen apa yang diminta untuk pendaftaran alat kesehatan dengan AI?', a: 'Informasi desain, pengembangan, validasi, dan pengendalian sistem AI (Tabel 3.1), termasuk dataset input dan evaluasi kinerja pada dataset pengujian yang independen dari dataset pelatihan, dengan metrik seperti akurasi, confusion matrix, atau AUC. Untuk model generatif atau LLM ditambah pengendalian keluaran, mitigasi halusinasi, dan pembatasan penggunaan.', basis: 'Kepmenkes 951/2026 Tabel 3.1', src: 'kepmenkes951' },
  { id: 'alkes-tkt', topic: 'AI dan alat kesehatan', q: 'Seberapa matang produk inovasi digital kesehatan yang diajukan izin edar?', a: 'Produk inovasi digital kesehatan yang diajukan sebagai alat kesehatan wajib telah mencapai Tingkat Kesiapan Teknologi (TKT) 9, yaitu terbukti berfungsi di lingkungan operasional sebenarnya.', basis: 'Kepmenkes 951/2026', src: 'kepmenkes951' },

  // ── SATUSEHAT ─────────────────────────────────────────────
  { id: 'satusehat-integrasi', topic: 'SATUSEHAT', q: 'Apakah sistem informasi kesehatan harus terhubung ke sistem nasional?', a: 'Penyelenggara sistem informasi kesehatan, termasuk fasilitas pelayanan kesehatan, wajib mengintegrasikan sistemnya dengan Sistem Informasi Kesehatan Nasional.', basis: 'UU 17/2023 Pasal 345 ayat 3', src: 'uuKesehatan' },
  { id: 'satusehat-rme-peluncuran', topic: 'SATUSEHAT', q: 'Kapan SATUSEHAT RME diluncurkan?', a: 'Kemenkes meluncurkan SATUSEHAT RME pada 1 September 2026 untuk menghubungkan rekam medis pasien lintas fasilitas pelayanan kesehatan secara nasional.', basis: 'Siaran pers Kemenkes, 1 September 2026', src: 'satusehatRme' },

  // ── Hak pasien ────────────────────────────────────────────
  { id: 'hak-pasien-akses-rm', topic: 'Hak pasien', q: 'Apakah pasien berhak mengakses isi rekam medisnya?', a: 'Ya. Pasien berhak mendapatkan akses terhadap informasi yang terdapat di dalam rekam medis. Isi rekam medis adalah milik pasien dan disampaikan kepada pasien.', basis: 'UU 17/2023 Pasal 276 huruf e; Permenkes 24/2022 Pasal 26 ayat 1–2', src: 'uuKesehatan' },
  { id: 'hak-pasien-keluarga', topic: 'Hak pasien', q: 'Kapan rekam medis boleh disampaikan kepada keluarga atau pihak lain?', a: 'Kepada keluarga terdekat bila pasien berusia di bawah 18 tahun dan/atau dalam keadaan darurat; kepada pihak lain setelah mendapat persetujuan pasien.', basis: 'Permenkes 24/2022 Pasal 26 ayat 3–5', src: 'permenkes24' },
  { id: 'hak-pasien-keputusan-otomatis', topic: 'Hak pasien', q: 'Apakah pasien dapat menolak keputusan yang hanya berdasarkan pemrosesan otomatis?', a: 'Subjek data berhak mengajukan keberatan atas tindakan pengambilan keputusan yang hanya didasarkan pada pemrosesan otomatis, termasuk pemrofilan, yang menimbulkan akibat hukum atau berdampak signifikan. Ketentuan lebih lanjut diatur dalam peraturan pemerintah yang naskahnya belum kami temukan.', basis: 'UU 27/2022 Pasal 10 ayat 1', src: 'uuPdp' },
];

export const FACT_TOPICS: FactTopic[] = ['Rekam medis elektronik', 'Lokasi dan penyimpanan data', 'Data pribadi pasien', 'AI dan alat kesehatan', 'SATUSEHAT', 'Hak pasien'];
