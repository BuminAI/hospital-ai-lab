---
title: "Email Phishing Kini Mengincar Asisten AI: Catatan untuk RS"
description: "Barracuda melaporkan email yang menyisipkan instruksi tersembunyi untuk asisten AI. Apa yang perlu dicek bagian keuangan, SDM, dan IT rumah sakit."
pubDate: 2026-10-20
category: "Alat AI"
draft: false
series: assessing-ai-and-technology
---

Makin banyak staf memakai asisten kecerdasan artifisial (AI) untuk merangkum kotak masuk email. Pada Oktober 2026, peneliti Barracuda melaporkan email phishing yang tidak hanya membujuk manusia, tetapi juga menyisipkan instruksi tersembunyi untuk asisten AI yang membacanya. Malwarebytes mengulas temuan itu pada 12 Oktober. Berikut isi laporannya, batasnya, dan artinya bagi bagian keuangan, SDM, dan IT rumah sakit.

## Apa yang dilaporkan

Analis ancaman Barracuda, Guruprasad Kenja, menjelaskan bahwa satu email phishing bisa menyasar dua pihak sekaligus ([Barracuda, diperbarui 6 Oktober 2026](https://blog.barracuda.com/2026/10/07/email-attacks-target-both-humans-ai-assistants)).

- **Untuk manusia:** email tampak seperti surat internal dan membawa lampiran yang dilindungi kata sandi, dengan kata sandinya ditulis di badan email. Barracuda menyebut ini celah bagi kontrol keamanan email yang lazim.
- **Untuk asisten AI:** ada lapisan tersembunyi yang bisa membuat ringkasan menyebut email itu sah atau mendesak. Instruksinya juga bisa menimpa arahan sebelumnya dan meminta asisten memunculkan tindakan mendesak palsu, termasuk permintaan transfer dana.
- **Cara menyembunyikan:** komentar di kode HTML, teks yang dibuat tak terlihat lewat CSS, blok data berenkode Base64, dan karakter Unicode berlebar nol.

Salah satu contohnya adalah email faktur. Teks tersembunyi meminta AI penyusun ringkasan menambahkan "tindakan prioritas" palsu berupa perubahan rincian pembayaran vendor. Malwarebytes menilai ini bisa membuat permintaan penipuan tampak seperti rekomendasi si asisten sendiri ([Malwarebytes, 12 Oktober 2026](https://www.malwarebytes.com/blog/ai/2026/10/phishing-emails-are-baiting-your-ai-assistant)). Teknik ini disebut *indirect prompt injection*, yaitu instruksi yang ditanam di bahan yang dibaca model, seperti situs web atau berkas ([OWASP, LLM01:2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)).

## Batas temuan ini

Laporan Barracuda tidak memuat angka jumlah email atau kampanye, tidak menyebut periode kejadian, tidak menyebut produk AI yang terdampak, dan tidak melaporkan seberapa efektif pertahanan yang disarankan. Contoh lain di laporan itu, seperti penyaringan CV dan bot layanan pelanggan, tidak dipastikan pernah terlihat di dunia nyata. Malwarebytes menambahkan bahwa apakah teks tersembunyi sampai ke model bergantung pada cara tiap alat mengekstrak email. Jadi laporan ini tidak menunjukkan seberapa sering serangan semacam ini terjadi, melainkan teknik yang patut diantisipasi. Barracuda sendiri menyatakan tidak ada satu kontrol yang menghentikan semua variasinya.

## Mengapa relevan bagi rumah sakit

- **Keuangan dan pengadaan:** permintaan ganti rekening vendor adalah contoh yang dipakai laporan ini. Ringkasan AI tidak boleh menjadi dasar mengubah data pembayaran.
- **SDM:** Barracuda memberi contoh teks tersembunyi di CV yang menyuruh AI memberi nilai 10 dari 10. Bagian rekrutmen yang memakai AI untuk menyaring lamaran, misalnya tenaga perawat, perlu tahu risiko ini.
- **Data pasien:** data dan informasi kesehatan termasuk data pribadi yang bersifat spesifik (Pasal 4 ayat 2 huruf a UU 27/2022), dan pengendali data wajib mencegah data diakses secara tidak sah (Pasal 39 ayat 1) ([JDIH Kemkomdigi](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022)). Jika asisten AI diberi izin luas atas kotak masuk yang berisi data pasien, tanggung jawab itu tetap ada di rumah sakit. Ini pembacaan kami, bukan penafsiran resmi. Soal data pribadi dan AI, lihat juga [artikel kami tentang foto dan AI](/id/blog/2026-09-18-risiko-foto-ai-data-pribadi-spesifik/).

## Kontrol yang disarankan sumber

Barracuda, Malwarebytes, dan OWASP menyarankan hal yang mirip:

- **Batasi izin asisten** sebatas yang dibutuhkan. Peringkas email tidak perlu wewenang luas.
- **Wajibkan persetujuan manusia** untuk tindakan berdampak tinggi seperti pembayaran dan perubahan data vendor. Persetujuan harus memeriksa permintaan aslinya, bukan menerima rekomendasi asisten.
- **Verifikasi perubahan pembayaran lewat saluran terpisah** yang sudah dikenal, bukan lewat kontak yang tertera di email mencurigakan.
- **Anggap ringkasan bukan verifikasi.** Buka email asli sebelum bertindak.
- **Untuk tim IT:** bersihkan elemen tersembunyi sebelum konten sampai ke model, deteksi kalimat yang berusaha menimpa instruksi, batasi akses lewat sandbox, validasi keluaran sebelum memicu tindakan, dan catat percobaan yang berulang.

Usulan kami, bukan standar resmi: tulis satu halaman aturan tentang siapa yang boleh menghubungkan asisten AI ke kotak masuk, dan tunda untuk kotak masuk keuangan, pengadaan, dan SDM sampai IT memeriksanya.

## Rangkuman

- Barracuda melaporkan email phishing yang menyasar manusia dan asisten AI sekaligus, dengan instruksi tersembunyi di kode HTML, CSS, Base64, atau karakter berlebar nol.
- Laporannya tidak memuat angka, periode, atau uji efektivitas pertahanan, sehingga seberapa sering serangan ini terjadi belum diketahui.
- Contoh yang paling relevan bagi rumah sakit adalah perubahan rincian pembayaran vendor lewat ringkasan AI.
- Batasi izin asisten, wajibkan persetujuan manusia untuk pembayaran, dan verifikasi perubahan lewat saluran terpisah.

**Sumber**
- [Barracuda, Threat Spotlight: Email attacks target both humans and AI in the same message](https://blog.barracuda.com/2026/10/07/email-attacks-target-both-humans-ai-assistants)
- [Malwarebytes, Phishing emails are baiting your AI assistant (12 Oktober 2026)](https://www.malwarebytes.com/blog/ai/2026/10/phishing-emails-are-baiting-your-ai-assistant)
- [OWASP, LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [JDIH Kemkomdigi, UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022)
- [Liputan6, Asisten AI Bisa Kena Tipu Email Phishing (19 Oktober 2026)](https://www.liputan6.com/tekno/read/8316423/asisten-ai-bisa-kena-tipu-email-phishing-bukan-cuma-manusia)

---

Konten di situs ini bersifat informasi umum untuk tujuan penelitian dan edukasi, dan bukan pengganti diagnosis atau saran medis untuk pasien tertentu.
