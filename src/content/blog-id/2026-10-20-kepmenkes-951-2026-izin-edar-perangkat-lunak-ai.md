---
title: "Kepmenkes 951/2026: Izin Edar Perangkat Lunak Medis dan AI"
description: "Kemenkes menetapkan pedoman izin edar alat kesehatan berbasis perangkat lunak, termasuk AI, pada 7 September 2026. Apa yang perlu dicek RS?"
pubDate: 2026-10-20
category: "Kabar"
draft: false
series: assessing-ai-and-technology
---

Pada 7 September 2026, Menteri Kesehatan menetapkan Keputusan Menteri Kesehatan Nomor HK.01.07/MENKES/951/2026 tentang Pedoman Izin Edar Alat Kesehatan Berbasis Perangkat Lunak. Keputusan ini berlaku sejak tanggal ditetapkan, dan teks lengkapnya dapat dibaca di [JDIH Kemenkes](https://jdih.kemkes.go.id/documents/keputusan-menteri-kesehatan-republik-indonesia-nomor-hk0107menkes9512026). Pedoman ini menjawab pertanyaan "apakah perangkat lunak AI termasuk alat kesehatan yang perlu izin edar?" dengan teks resmi yang bisa dibaca langsung. Catatan ini merangkum isinya dari sisi rumah sakit sebagai pembeli.

## Apa yang dicakup

Diktum KEDUA menyebut tiga kelompok: *software as a medical device* (SaMD), *software in a medical device* (SiMD), dan alat kesehatan dengan aplikasi kecerdasan buatan (AI). SaMD adalah perangkat lunak yang dapat berdiri sendiri dan dipakai untuk tujuan medis. SiMD adalah perangkat lunak yang tertanam di dalam alat kesehatan, misalnya di mesin MRI atau ventilator.

Batas yang penting bagi bagian administrasi ada di Bab II. AI dan *machine learning* hanya tergolong alat kesehatan jika punya tujuan medis. Pedoman menyatakan bahwa penggunaan AI untuk fungsi non-medis, termasuk pengelolaan data administratif, penyimpanan data, atau fungsi operasional yang tidak memengaruhi fungsi alat kesehatan, tidak termasuk definisi alat kesehatan. Untuk AI generatif, jika keluarannya dimaksudkan untuk diagnosis, pemantauan kondisi medis, penentuan terapi, atau perawatan pasien, fungsinya dianggap bertujuan medis. Salah satu contoh dalam pedoman adalah menyusun ringkasan otomatis data fisiologis pasien untuk dokumentasi klinis, jika keluarannya dimaksudkan untuk proses klinis.

## Yang diminta dari pemilik izin edar

Pedoman ini ditujukan sebagai acuan bagi pemerintah, pelaku usaha alat kesehatan, dan pemangku kepentingan lain (Diktum KETIGA). Ia tidak langsung membebani rumah sakit, tetapi menunjukkan apa yang seharusnya sudah disiapkan vendor:

- **Dokumen AI (Tabel 3.1):** deskripsi data input, sumber dan ukuran dataset, pemisahan data pelatihan, validasi, dan pengujian, serta evaluasi kinerja pada dataset pengujian yang independen dengan metrik seperti akurasi atau AUC. Keterbatasan sistem harus dikomunikasikan dalam penandaan atau petunjuk penggunaan.
- **AI yang terus belajar:** pelaku usaha wajib menunjukkan mekanisme pengendalian agar perubahan model tidak memengaruhi keamanan, kinerja, dan tujuan penggunaan, termasuk cara kembali ke versi sebelumnya.
- **Model generatif atau LLM:** dokumen pendaftaran harus memuat pengendalian keluaran, mitigasi halusinasi, pembatasan penggunaan, serta cara menilai konsistensi dan akurasi informasi medis.
- **Validasi klinis lokal:** untuk produk impor tertentu, yaitu yang dilatih ulang dengan data populasi Indonesia dan/atau memakai AI berisiko sedang hingga tinggi untuk diagnosis, skrining, atau keputusan klinis. Pelaksanaannya dapat dilakukan di rumah sakit, perguruan tinggi, atau laboratorium terakreditasi, dan hasilnya wajib disampaikan paling lama satu tahun sejak izin edar terbit. Selama validasi, produk boleh dipakai terbatas jika tidak membahayakan pasien.
- **Perubahan:** modifikasi algoritma yang berdampak pada fungsi diagnostik, pembaruan versi yang mengubah akurasi atau sensitivitas, penambahan atau penghapusan alarm, dan perubahan platform yang berpotensi memengaruhi kinerja memerlukan izin edar baru. Versi perangkat lunak harus dicantumkan pada label atau antarmuka.
- **Pengawasan dan data:** inspeksi lapangan rutin dilakukan satu tahun sekali, disertai laporan keluhan, kejadian tidak diinginkan, dan pemantauan kerentanan siber. Pemilik izin edar juga berkomitmen agar keluaran perangkat lunak dapat diintegrasikan dengan SATUSEHAT, menerapkan minimisasi data, dan memiliki kebijakan pelaporan insiden kebocoran data pribadi.

## Pertanyaan untuk vendor

Ini saran kami, bukan aturan:

1. Apakah produk ini, menurut pedoman tersebut, termasuk alat kesehatan? Minta pernyataan tujuan penggunaan secara tertulis.
2. Berapa nomor izin edar dan versi yang terdaftar, dan apakah versi yang dipasang di RS sama dengan yang terdaftar?
3. Bagaimana status validasi klinis lokal, tenggatnya, dan apakah RS diminta menjadi lokasi validasi?
4. Bagaimana setiap pembaruan diklasifikasikan, dan bagaimana RS diberi tahu?
5. Untuk fitur generatif, mana dokumen pengendalian halusinasinya?
6. Bagaimana integrasi dengan SATUSEHAT, retensi dan penghapusan data, serta pelaporan insiden?

## Batas pembacaan

Dokumen ini adalah pedoman izin edar, bukan aturan yang mengatur cara RS memakai perangkat lunak. Pedoman juga menyatakan produk inovasi digital yang diajukan untuk izin edar harus sudah mencapai Tingkat Kesiapan Teknologi 9, yaitu terbukti berfungsi di lingkungan operasional sebenarnya. Pengecualian AI administratif dari definisi alat kesehatan tidak berarti bebas aturan, karena aturan pelindungan data pribadi tetap berlaku ([UU Nomor 27 Tahun 2022](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022); lihat juga [artikel kami](/id/blog/2026-09-18-risiko-foto-ai-data-pribadi-spesifik/)). Penilaian atas produk tertentu tetap perlu merujuk pada teks resmi dan penjelasan Kemenkes.

## Rangkuman

- Kepmenkes HK.01.07/MENKES/951/2026 (7 September 2026) memberi pedoman izin edar untuk SaMD, SiMD, dan alat kesehatan dengan AI.
- AI untuk fungsi non-medis seperti pengelolaan data administratif tidak termasuk definisi alat kesehatan. AI generatif yang keluarannya dipakai dalam proses klinis dapat berfungsi medis.
- Vendor diminta menyerahkan dokumen dataset dan kinerja, kendali perubahan, dan untuk produk impor tertentu, validasi klinis lokal dalam satu tahun sejak izin edar.
- RS dapat memakai pedoman ini sebagai dasar daftar pertanyaan saat menilai tawaran perangkat lunak AI.

**Sumber**
- [JDIH Kemenkes, Keputusan Menteri Kesehatan Nomor HK.01.07/MENKES/951/2026](https://jdih.kemkes.go.id/documents/keputusan-menteri-kesehatan-republik-indonesia-nomor-hk0107menkes9512026)
- [JDIH Kemkomdigi, UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022)

---

Konten di situs ini bersifat informasi umum untuk tujuan penelitian dan edukasi, dan bukan pengganti diagnosis atau saran medis untuk pasien tertentu.
