# Panduan Pengalaman Pengguna Optimal

Panduan ini mensimulasikan pengalaman saya sebagai pengguna baru, sejak menyiapkan data sampai memahami output program **Sistem Pakar Fikih Haid & Istihadhah Pro**.

Contoh ini mengikuti perilaku yang diterapkan oleh `SISTEM_PAKAR_FIQIH_HAID_MASTER.html`. Ini adalah panduan penggunaan dan pengujian perangkat lunak, bukan diagnosis medis atau fatwa.

## Gambaran skenario

Saya adalah wanita yang sudah pernah mengalami haid dan suci. Kebiasaan saya selama beberapa siklus terakhir adalah:

- haid selama 7 hari;
- suci selama sekitar 23 hari;
- haid biasanya mulai sekitar pukul 06.00;
- darah biasanya merah dan cair.

Pada kejadian kali ini, darah mulai keluar pada **1 Februari 2026 pukul 06.00** dan baru berhenti pada **22 Februari 2026 pukul 06.00**. Darah keluar terus selama 21 hari tanpa berhenti dan tidak berubah sifat: tetap merah dan cair.

Tujuan saya adalah mengetahui bagaimana program membagi 21 hari tersebut menjadi masa haid dan istihadhah.

---

## Tahap 1 — Menyiapkan data sebelum membuka program

Supaya tidak menebak-nebak saat mengisi formulir, saya menyiapkan catatan berikut:

| Data yang disiapkan | Catatan saya |
|---|---|
| Apakah pernah mengalami haid dan suci? | Ya |
| Durasi haid yang biasa terjadi | 7 hari |
| Durasi suci yang biasa terjadi | 23 hari |
| Waktu mulai kebiasaan | Sekitar pukul 06.00 |
| Waktu darah mulai keluar sekarang | 1 Februari 2026 pukul 06.00 |
| Waktu darah berhenti | 22 Februari 2026 pukul 06.00 |
| Apakah darah sempat berhenti? | Tidak |
| Apakah warna atau sifatnya berubah? | Tidak |
| Warna darah | Merah |
| Sifat darah | Cair |

Prinsip pencatatan yang saya gunakan:

- satu periode darah yang terus keluar dengan sifat sama dicatat sebagai satu baris;
- jika darah berhenti lalu keluar lagi, setiap periode keluar darah dicatat pada baris terpisah;
- jika warna atau sifat darah berubah tanpa jeda, setiap perubahan dicatat pada baris terpisah dengan waktu yang bersebelahan;
- saya mencatat jam yang sebenarnya, bukan hanya tanggal.

---

## Tahap 2 — Membuka program

Saya membuka file:

> `SISTEM_PAKAR_FIQIH_HAID_MASTER.html`

Ketika halaman terbuka, program otomatis memuat preset **5-KD Berantai (2026)**. Data ini hanya contoh bawaan, bukan data saya.

Saya dapat melanjutkan dengan salah satu dari dua jalur berikut:

1. **Jalur demo tercepat:** klik preset **Mu'tadah Ghayr Mumayyizah**. Program akan memuat persis data contoh 21 hari yang digunakan dalam panduan ini.
2. **Jalur pengisian manual:** hapus semua baris bawaan menggunakan tombol **×**, kemudian masukkan data saya sendiri.

Untuk memahami seluruh proses, langkah berikut menggunakan jalur pengisian manual.

---

## Tahap 3 — Memilih profil yang tepat

Pada panel **Profil Status Wanita & Kebiasaan ('Ādah)**, saya memilih:

> **Mu'tadah (Pernah Haid & Suci Sebelumnya)**

Saya memilih Mu'tadah karena saya sudah pernah mengalami haid dan suci serta mengetahui kebiasaan sebelumnya.

Kemudian saya mengisi:

| Kolom | Nilai |
|---|---:|
| Adat Durasi Haid | 7 hari |
| Adat Durasi Suci | 23 hari |
| Titik Jam Mulai Kebiasaan | 06.00 |

### Cara cepat memilih profil

| Keadaan pengguna | Pilihan program |
|---|---|
| Sudah pernah haid dan mengetahui adat | **Mu'tadah** |
| Baru pertama kali keluar darah setelah balig | **Mubtada'ah** |
| Lupa jumlah hari dan waktu adat | **Mutahayyirah Muthlaqah** |
| Ingat jumlah hari, tetapi lupa waktu mulai | **Dzākirah lil-Qadr Faqath** |
| Ingat waktu mulai, tetapi lupa jumlah hari | **Dzākirah lil-Waqt Faqath** |

Jika keadaan saya tidak cocok dengan salah satu pilihan tersebut, saya tidak memaksakan pilihan hanya agar program menghasilkan jawaban. Saya mencatat keterbatasannya dan meminta bantuan ahli yang kompeten.

---

## Tahap 4 — Mengisi log darah

Setelah semua baris preset dihapus, saya menekan tombol:

> **+ Tambah Baris Darah**

Saya mengisi satu baris berikut:

| Kolom | Nilai yang dimasukkan |
|---|---|
| Waktu Mulai Keluar — tanggal | 01-02-2026 |
| Waktu Mulai Keluar — jam | 06.00 |
| Waktu Mampet — tanggal | 22-02-2026 |
| Waktu Mampet — jam | 06.00 |
| Warna Darah | Merah (Ahmar) |
| Sifat | Cair |

Saya hanya memakai satu baris karena darah tidak berhenti dan sifatnya tidak berubah sepanjang periode tersebut.

### Pemeriksaan sebelum menjalankan analisis

Saya memastikan:

- tanggal dan jam awal serta akhir terisi lengkap;
- waktu akhir benar-benar setelah waktu awal;
- tidak ada dua baris yang waktunya tumpang-tindih;
- tidak ada sisa baris preset yang ikut terbaca;
- satu perubahan warna atau sifat dicatat sebagai segmen tersendiri;
- periode yang sama tidak dicatat dua kali.

Program mengabaikan baris yang kedua tanggalnya kosong. Namun, jika hanya salah satu tanggal yang terisi, program akan meminta saya melengkapinya.

---

## Tahap 5 — Menjalankan analisis

Saya menekan tombol:

> **EKSEKUSI ANALISIS FIKIH MASTER DEFINITIF**

Jika data valid, halaman menggulir otomatis ke panel hasil. Jika muncul pesan kesalahan, saya tidak mengubah kategori secara acak; saya memperbaiki baris dan nomor input yang disebutkan oleh program, lalu menjalankan analisis kembali.

---

## Tahap 6 — Output yang saya peroleh

### 1. Kategori utama

Badge hasil menampilkan:

> **MU'TADAH GHOIRU MUMAYYIZAH**

Program memilih kategori ini karena:

- saya sudah mempunyai adat, sehingga termasuk Mu'tadah;
- darah keluar dalam satu episode kontinu selama 21 hari, melebihi 15 hari;
- seluruh darah memiliki warna dan sifat yang sama;
- tidak ada pola darah kuat lalu darah lemah yang memenuhi syarat tamyiz;
- karena tidak ada tamyiz sah, program mengembalikan penentuan haid kepada adat tujuh hari.

### 2. Ringkasan eksekutif

Inti ringkasan program adalah:

> Darah mengalir selama 21 hari, yaitu lebih dari 15 hari, tanpa pembeda yang sah. Tujuh hari pertama ditetapkan sebagai haid sesuai adat, sedangkan sisanya ditetapkan sebagai istihadhah.

### 3. Peta garis waktu

Saya melihat dua bagian utama:

- **merah:** tujuh hari haid;
- **jingga:** 14 hari istihadhah.

Garis waktu membantu saya melihat proporsi hasil, tetapi waktu presisi tetap saya baca pada tabel rincian.

### 4. Tabel rincian segmen

| No. | Rentang waktu | Durasi | Status | Catatan |
|---:|---|---:|---|---|
| 1 | 1 Februari 2026 pukul 06.00 sampai 8 Februari 2026 pukul 06.00 | 7 hari | **Haid** | Kembali ke durasi adat |
| 2 | 8 Februari 2026 pukul 06.00 sampai 22 Februari 2026 pukul 06.00 | 14 hari | **Istihadhah** | Kelebihan dari adat |

Ringkasan hasil yang saya catat:

```text
Kategori       : MU'TADAH GHOIRU MUMAYYIZAH
Total rentang  : 21 hari
Haid           : 7 hari pertama
Istihadhah     : 14 hari berikutnya
```

### 5. Peringatan kalender

Program memeriksa apakah tanggal pada hasil bertepatan dengan:

- 1 Syawal;
- 10 Zulhijah;
- 11, 12, atau 13 Zulhijah.

Jika ditemukan, program menampilkan peringatan hari yang haram untuk berpuasa. Saya membaca peringatan ini terpisah dari status haid atau istihadhah. Tidak munculnya peringatan bukan berarti seluruh keputusan puasa otomatis selesai; saya tetap membaca bagian panduan puasa.

### 6. Pembaruan adat

Program mengambil haid sah terakhir dan menampilkan adat haid baru sekitar:

> **7,0 hari**

Program juga menyatakan bahwa adat suci baru dihitung setelah masa suci minimal 15 hari terpenuhi. Saya menyimpan hasil ini sebagai catatan keluaran program, bukan langsung mengganti seluruh riwayat pribadi tanpa verifikasi.

### 7. Panduan amaliah

Program menampilkan empat kartu panduan:

#### Mandi wajib

> Wajib mandi besar setelah tuntasnya hari ke-7.

Dalam kronologi contoh, titik tersebut adalah **8 Februari 2026 pukul 06.00**.

#### Salat lima waktu

> Salat tidak dilaksanakan selama tujuh hari pertama. Setelahnya, pada masa istihadhah, salat tetap dilaksanakan dan program mengarahkan berwudu setiap masuk waktu salat.

#### Puasa Ramadan dan qadha

> Puasa wajib yang bertepatan dengan tujuh hari haid perlu diqadha. Puasa setelahnya, pada masa istihadhah, dihukumi sah oleh program.

#### Hubungan suami-istri

> Program menyatakan hubungan suami-istri halal pada masa istihadhah setelah mandi besar dari haid.

### 8. Nash kitab

Pada bagian terakhir, program menampilkan kutipan **Tuhfat al-Muhtaj** yang dipakai oleh program untuk menjelaskan bahwa Mu'tadah Ghairu Mumayyizah dikembalikan kepada adatnya, dan kelebihan darah dihukumi istihadhah.

Saya memperlakukan bagian ini sebagai rujukan yang ditampilkan aplikasi. Untuk keputusan nyata, saya tetap meminta ahli fikih memeriksa konteks, penerapan, dan kesesuaian kasus saya.

---

## Tahap 7 — Urutan optimal membaca hasil

Agar tidak hanya terpaku pada nama kategori, saya membaca hasil dalam urutan berikut:

1. **Kategori utama** — mengetahui cabang keputusan yang dipilih program.
2. **Ringkasan eksekutif** — memahami alasan umum pembagian darah.
3. **Tabel rincian** — mencatat batas tanggal dan jam secara presisi.
4. **Peta garis waktu** — memeriksa gambaran visual keseluruhan.
5. **Peringatan kalender** — melihat larangan puasa pada hari tertentu.
6. **Pembaruan adat** — mencatat kemungkinan adat baru.
7. **Panduan amaliah** — membaca mandi, salat, puasa, dan hubungan suami-istri satu per satu.
8. **Nash kitab** — melihat rujukan yang dipakai program.
9. **Verifikasi manusia** — membawa kronologi dan hasil kepada ahli fikih jika akan diterapkan pada keadaan nyata.

---

## Tahap 8 — Kapan saya harus membuat beberapa baris?

Saya menambah baris setiap kali darah berhenti atau ciri fisiknya berubah. Contoh:

| Kejadian | Cara mencatat |
|---|---|
| Merah cair keluar tiga hari, lalu langsung menjadi hitam kental | Dua baris yang waktunya bersebelahan |
| Darah keluar dua hari, berhenti satu hari, lalu keluar lagi | Dua baris dengan jeda satu hari |
| Darah terus keluar tujuh hari dengan sifat sama | Satu baris |
| Dua catatan identik tepat bersebelahan | Boleh dua baris, tetapi program akan menggabungkannya saat normalisasi |

Baris tidak boleh overlap. Jika baris kedua dimulai sebelum baris pertama selesai, program menghentikan analisis dan menampilkan kesalahan.

---

## Tahap 9 — Checklist pengalaman berhasil

Saya menganggap penggunaan program berhasil jika:

- [ ] preset bawaan sudah diganti atau dihapus;
- [ ] profil pengalaman haid dipilih berdasarkan keadaan sebenarnya;
- [ ] adat diisi dari catatan, bukan tebakan;
- [ ] setiap waktu mulai dan mampet dilengkapi tanggal serta jam;
- [ ] perubahan warna, sifat, atau jeda dicatat pada baris terpisah;
- [ ] tidak ada rentang yang overlap;
- [ ] output menampilkan kategori dan ringkasan;
- [ ] total durasi pada tabel sesuai dengan catatan saya;
- [ ] saya membaca seluruh panduan, bukan hanya warna timeline;
- [ ] hasil penting disimpan untuk diverifikasi kepada ahli.

---

## Catatan tentang batas program

- Program adalah sistem klasifikasi fikih, bukan alat diagnosis penyebab perdarahan.
- Nilai **Titik Jam Mulai Kebiasaan** tersedia pada formulir, tetapi perhitungan waktu utama dalam kode saat ini menggunakan waktu mulai pada log darah.
- Nilai adat suci tetap sebaiknya diisi dengan benar, meskipun tidak semua cabang keputusan memakai nilai itu untuk membagi timeline.
- Profil “kebiasaan berubah-ubah tetapi seluruh riwayat masih diingat” belum tersedia sebagai pilihan khusus.
- Perdarahan selama 21 hari perlu dikonsultasikan kepada tenaga medis, terutama jika disertai nyeri berat, lemas, pusing, atau gejala tidak biasa.
- Keputusan ibadah nyata sebaiknya diverifikasi kepada ahli fikih yang kompeten dengan membawa kronologi lengkap.

