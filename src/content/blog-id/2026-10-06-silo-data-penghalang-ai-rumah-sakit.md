---
title: "Sebelum Pakai AI, Benahi Dulu Data yang Terkotak-kotak"
description: "Survei Confluent: 83% pemimpin TI Indonesia sebut data terkotak-kotak jadi penghalang utama AI. Ini artinya bagi RS yang menilai proposal AI."
pubDate: 2026-10-06
category: "Kolom"
draft: false
series: assessing-ai-and-technology
---

Saat sebuah proposal AI masuk ke meja manajemen rumah sakit, perhatian biasanya langsung tertuju pada model AI-nya: seberapa canggih, seberapa akurat. Sebuah survei yang dirilis Confluent lewat *Data Streaming Report* justru menunjukkan bahwa penghalang terbesar perluasan AI di Indonesia bukan di situ, melainkan pada kondisi data itu sendiri ([detikINET, 4 Oktober 2026](https://inet.detik.com/business/d-8691949/ai-makin-marak-di-indonesia-tapi-83-perusahaan-masih-terganjal-silo-data)). Bagi rumah sakit, yang datanya tersebar di banyak sistem berbeda, temuan ini layak jadi pertimbangan sebelum menyetujui proposal apa pun.

## Apa yang ditemukan survei ini

Menurut laporan tersebut, 83% pemimpin teknologi informasi (TI) di Indonesia menyebut data yang terkotak-kotak di berbagai sistem masih menjadi tantangan utama dalam memperluas pemanfaatan AI. Selain itu, 82% pemimpin TI menghadapi setidaknya tiga kendala sekaligus saat mencoba memperluas AI. Akibat data yang terpisah-pisah di sistem pelanggan, keuangan, dan operasional, sebuah perwakilan Confluent menjelaskan bahwa data yang usang dulu mungkin hanya berakibat pada laporan yang terlambat — tetapi sekarang, masalah yang sama bisa memengaruhi setiap rekomendasi, prediksi, atau keputusan otomatis yang dihasilkan AI.

## Kenapa ini familiar bagi rumah sakit

Pola yang digambarkan survei ini mirip dengan yang biasa terjadi di rumah sakit: data rekam medis ada di satu sistem, hasil laboratorium di sistem lain, radiologi di PACS tersendiri, data klaim BPJS Kesehatan di sistem keuangan, dan sebagian lagi perlu disetorkan ke [SATUSEHAT](/id/glossary/#satusehat). Kalau sistem-sistem ini tidak saling terhubung dengan rapi, AI apa pun yang dipasang di atasnya — mulai dari alat bantu skrining sampai asisten administrasi — bekerja dengan data yang tidak lengkap atau tidak konsisten, persis seperti yang disebut survei tersebut.

## Yang bisa ditanyakan saat menilai proposal

Sebelum menilai fitur AI yang ditawarkan vendor, ada pertanyaan dasar yang lebih dulu layak diajukan:

- **Dari mana saja data yang akan dipakai AI ini diambil?** Minta vendor menjelaskan secara konkret sistem mana yang akan dihubungkan, bukan hanya jawaban umum seperti "terintegrasi dengan sistem RS".
- **Siapa yang memastikan data di sistem-sistem itu konsisten?** Kalau nomor rekam medis atau identitas pasien berbeda format antar-sistem, AI akan kesulitan menyatukan riwayat yang sama.
- **Apakah kebutuhan data ini sejalan dengan kerja integrasi yang sudah berjalan**, misalnya ke arah SATUSEHAT, atau justru menambah sistem terpisah baru yang memperparah masalah silo.

## Ringkasan

- Survei Confluent menemukan 83% pemimpin TI di Indonesia menyebut data terkotak-kotak sebagai penghalang utama perluasan AI, dan 82% menghadapi setidaknya tiga kendala sekaligus.
- Rumah sakit punya pola silo data yang serupa: rekam medis, laboratorium, radiologi, klaim BPJS, dan SATUSEHAT sering berada di sistem yang terpisah.
- Saat menilai proposal AI, tanyakan dulu sumber data yang dipakai, cara menjaga konsistensinya, dan apakah kebutuhan itu sejalan dengan integrasi data yang sudah berjalan — bukan menambah silo baru.

---

Konten di situs ini bersifat informasi umum untuk tujuan penelitian dan edukasi, dan bukan pengganti diagnosis atau saran medis untuk pasien tertentu.
