// Peta waktu digital kesehatan & AI — data bersama /id/dx-roadmap/ dan /id/calendar/ (2026-10-31)
//
// ⚠️ Setiap fakta di sini berasal dari sumber primer yang tercantum di SRC dan ditulis setelah naskahnya benar-benar dibuka:
//    JDIH Kemenkes (PDF resmi peraturan), JDIH Komdigi (UU PDP), siaran pers Kemenkes.
//    Tidak ada tenggat "yang akan datang" di sini karena belum ada yang terverifikasi dari sumber resmi. Jangan menambah tanggal
//    atau kewajiban berdasarkan dugaan; bila menambah, baca ulang naskah primer dan perbarui CHECKED.
export const CHECKED = '31 Oktober 2026';

export const SRC = {
  permenkes24: {
    label: 'JDIH Kemenkes — Permenkes 24/2022 tentang Rekam Medis',
    url: 'https://jdih.kemkes.go.id/documents/peraturan-menteri-kesehatan-nomor-24-tahun-2022',
  },
  uuPdp: {
    label: 'JDIH Komdigi — UU 27/2022 tentang Pelindungan Data Pribadi',
    url: 'https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022',
  },
  uuKesehatan: {
    label: 'JDIH Kemenkes — UU 17/2023 tentang Kesehatan',
    url: 'https://jdih.kemkes.go.id/documents/undang-undang-nomor-17-tahun-2023',
  },
  pp28: {
    label: 'JDIH Kemenkes — PP 28/2024 (pelaksanaan UU 17/2023)',
    url: 'https://jdih.kemkes.go.id/documents/peraturan-pemerintah-nomor-28-tahun-2024',
  },
  kepmenkes951: {
    label: 'JDIH Kemenkes — Kepmenkes HK.01.07/MENKES/951/2026 tentang Pedoman Izin Edar Alat Kesehatan Berbasis Perangkat Lunak',
    url: 'https://jdih.kemkes.go.id/documents/keputusan-menteri-kesehatan-republik-indonesia-nomor-hk0107menkes9512026',
  },
  satusehatRme: {
    label: 'Kemenkes — SATUSEHAT RME, rekam medis pasien terintegrasi secara nasional (1 September 2026)',
    url: 'https://www.kemkes.go.id/id/kemenkes-luncurkan-satusehat-rme-rekam-medis-pasien-terintegrasi-secara-nasional',
  },
  satusehatAward: {
    label: 'Kemenkes — SATUSEHAT meraih penghargaan nasional dan global',
    url: 'https://www.kemkes.go.id/eng/kemenkes-ri-raih-penghargaan-nasional-dan-global-sekaligus-untuk-satusehat',
  },
  aiGovernance: {
    label: 'Kemenkes — pemanfaatan AI kesehatan harus diiringi tata kelola ketat dan etika yang kuat',
    url: 'https://www.kemkes.go.id/id/kemenkes-tekankan-pemanfaatan-ai-kesehatan-harus-diiringi-tata-kelola-ketat-dan-etika-yang-kuat',
  },
} as const;

export type ThemeKey = 'rme' | 'data' | 'privacy' | 'device' | 'sik';

export const THEMES: Record<ThemeKey, string> = {
  rme: 'Rekam medis',
  data: 'Interoperabilitas',
  privacy: 'Data pribadi',
  device: 'Alat kesehatan',
  sik: 'Sistem informasi kesehatan',
};

export type Milestone = {
  /** Waktu yang ditampilkan di layar */
  when: string;
  /** Untuk pengurutan (YYYY-MM) */
  sort: string;
  status: 'done' | 'ahead';
  theme: ThemeKey;
  title: string;
  body: string;
  src: keyof typeof SRC;
  /** Item yang bersumber dari berita (bukan dokumen resmi) diberi tanda "Berita" di layar */
  report?: boolean;
};

export const MILESTONES: Milestone[] = [
  {
    when: '31 Agustus 2022',
    sort: '2022-08',
    status: 'done',
    theme: 'rme',
    title: 'Permenkes 24/2022 tentang Rekam Medis ditetapkan',
    body:
      'Mencabut Permenkes 269/2008. Mengatur penyelenggaraan rekam medis elektronik (RME): registrasi sistem elektronik di Kemenkes (Pasal 12), penyimpanan dan cadangan data (Pasal 20), keterhubungan dengan platform data kesehatan Kemenkes (Pasal 21), kerja sama dengan penyelenggara sistem elektronik (Pasal 22), dan penyimpanan paling singkat 25 tahun sejak kunjungan terakhir (Pasal 39).',
    src: 'permenkes24',
  },
  {
    when: '17 Oktober 2022',
    sort: '2022-10',
    status: 'done',
    theme: 'privacy',
    title: 'UU 27/2022 tentang Pelindungan Data Pribadi diundangkan',
    body:
      'Data dan informasi kesehatan termasuk data pribadi yang bersifat spesifik (Pasal 4). Pasal 74 memberi masa penyesuaian paling lama 2 tahun sejak diundangkan, jadi masa penyesuaian berakhir pada 17 Oktober 2024.',
    src: 'uuPdp',
  },
  {
    when: '8 Agustus 2023',
    sort: '2023-08',
    status: 'done',
    theme: 'sik',
    title: 'UU 17/2023 tentang Kesehatan ditetapkan',
    body:
      'Penyelenggara sistem informasi kesehatan, termasuk fasilitas pelayanan kesehatan, wajib mengintegrasikan sistemnya dengan Sistem Informasi Kesehatan Nasional (Pasal 345 ayat 3) dan wajib memproses data kesehatan di wilayah Indonesia (Pasal 346 ayat 6). Hak pasien atas akses ke rekam medis ada di Pasal 276 huruf e.',
    src: 'uuKesehatan',
  },
  {
    when: '31 Desember 2023',
    sort: '2023-12',
    status: 'done',
    theme: 'rme',
    title: 'Batas waktu seluruh fasilitas pelayanan kesehatan menyelenggarakan RME',
    body: 'Pasal 45 Permenkes 24/2022: seluruh fasilitas pelayanan kesehatan harus menyelenggarakan RME paling lambat 31 Desember 2023.',
    src: 'permenkes24',
  },
  {
    when: '26 Juli 2024',
    sort: '2024-07',
    status: 'done',
    theme: 'sik',
    title: 'PP 28/2024 ditetapkan',
    body:
      'Pasal 966: data kesehatan disimpan di pusat data di dalam wilayah Indonesia, wajib ada cadangan data, dan boleh memakai jasa pihak lain bila di dalam negeri, ada perjanjian kerja sama yang memuat kerahasiaan dan tingkat layanan, serta data tetap dimiliki dan dikendalikan penyelenggara.',
    src: 'pp28',
  },
  {
    when: '1 September 2026',
    sort: '2026-09',
    status: 'done',
    theme: 'data',
    title: 'Kemenkes meluncurkan SATUSEHAT RME',
    body: 'Rekam medis pasien terhubung lintas fasilitas pelayanan kesehatan secara nasional, menurut siaran pers Kemenkes.',
    src: 'satusehatRme',
  },
  {
    when: '7 September 2026',
    sort: '2026-09',
    status: 'done',
    theme: 'device',
    title: 'Kepmenkes 951/2026 tentang izin edar alat kesehatan berbasis perangkat lunak',
    body:
      'Mencakup software sebagai alat kesehatan (SaMD), software di dalam alat kesehatan (SiMD), dan aplikasi kecerdasan buatan. AI dan machine learning hanya masuk kategori alat kesehatan bila bertujuan medis; penggunaan untuk fungsi non-medis seperti pengelolaan data administratif tidak termasuk definisi alat kesehatan. Alat kesehatan berbasis perangkat lunak impor tertentu perlu validasi klinis lokal di Indonesia.',
    src: 'kepmenkes951',
  },
];
