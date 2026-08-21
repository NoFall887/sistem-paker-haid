# Contoh Skenario: Kebiasaan Haid Tidak Tentu

## Kasus: Mengetahui waktu mulai, tetapi durasi kebiasaan tidak pasti

Contoh ini menggunakan kronologi darah yang sama dengan skenario sebelumnya, tetapi kebiasaan durasi haid wanita tidak tetap. Contoh bersifat fiktif dan dibuat untuk menguji perilaku program, bukan untuk diagnosis medis atau penetapan fatwa.

## 1. Pengalaman wanita

Nadia berusia 27 tahun dan sudah pernah mengalami haid. Namun, selama beberapa bulan terakhir durasi haidnya berubah-ubah:

- satu bulan berlangsung 5 hari;
- bulan berikutnya berlangsung 8 hari;
- bulan berikutnya berlangsung 6 hari;
- pada bulan lain berlangsung 9 hari.

Karena perubahan tersebut, Nadia tidak dapat menetapkan satu angka sebagai kebiasaan durasi haidnya. Ia mengetahui bahwa darah pada kejadian sekarang mulai keluar pada **1 Februari 2026 pukul 06.00**, tetapi ia tidak mengetahui berapa hari yang dapat dijadikan kadar kebiasaan haid.

Darah terus keluar sampai **22 Februari 2026 pukul 06.00**, sehingga total rentangnya adalah **21 hari**. Sepanjang rentang itu darah terlihat merah dan cair tanpa perbedaan yang jelas.

## 2. Kategori program yang paling mendekati

Untuk keadaan “ingat waktu mulai tetapi tidak mengetahui jumlah hari”, pilihan yang tersedia dalam program adalah:

> **Dzākirah lil-Waqt Faqath — ingat tanggal mulai, lupa jumlah hari**

Pilihan ini berbeda dari **Mu'tadah Ghairu Mumayyizah**. Mu'tadah Ghairu Mumayyizah membutuhkan satu nilai adat haid yang diketahui, misalnya tujuh hari. Pada skenario ini, nilai tersebut tidak dapat ditentukan.

## 3. Cara mengisi formulir

### A. Profil status wanita

| Kolom program | Nilai yang dimasukkan | Keterangan |
|---|---|---|
| **Status Pengalaman Haid** | **Dzākirah lil-Waqt Faqath** | Nadia mengetahui kapan darah dimulai, tetapi tidak mengetahui kadar kebiasaan haid. |
| **Adat Durasi Haid** | Tidak diisi/tidak ditampilkan | Kolom ini disembunyikan program untuk kategori Dzākirah lil-Waqt. |
| **Adat Durasi Suci** | **23 hari** | Dapat diisi berdasarkan perkiraan masa suci sebelumnya. Nilai ini tidak mengubah pembagian khusus Dzākirah lil-Waqt dalam kode saat ini. |
| **Titik Jam Mulai Kebiasaan** | **06.00** | Jam yang diketahui sebagai waktu mulai. Perhitungan kode saat ini tetap memakai waktu mulai pada baris log darah. |

### B. Log kronologis darah

Masukkan satu baris darah:

| Kolom program | Nilai |
|---|---|
| **Waktu Mulai Keluar — tanggal** | 01-02-2026 |
| **Waktu Mulai Keluar — jam** | 06.00 |
| **Waktu Mampet — tanggal** | 22-02-2026 |
| **Waktu Mampet — jam** | 06.00 |
| **Warna Darah** | Merah (Ahmar) |
| **Sifat** | Cair |

Setelah itu, klik:

> **EKSEKUSI ANALISIS FIKIH MASTER DEFINITIF**

## 4. Output yang seharusnya muncul

### Kategori utama

Program seharusnya menampilkan:

> **DZĀKIRAH LIL-WAQT FAQATH**

### Pembagian status

Program tidak memakai angka adat tertentu. Sebagai gantinya, program membagi 21 hari tersebut berdasarkan batas 24 jam dan 15 hari:

| Segmen hasil | Rentang waktu | Durasi | Status program |
|---|---|---:|---|
| Hari pertama | 1 Februari 2026 pukul 06.00 sampai 2 Februari 2026 pukul 06.00 | 24 jam | **Haid** atau yakin haid |
| Hari ke-2 sampai batas hari ke-15 | 2 Februari 2026 pukul 06.00 sampai 16 Februari 2026 pukul 06.00 | 14 hari | **Ihtiyath** atau masa ragu |
| Setelah batas 15 hari | 16 Februari 2026 pukul 06.00 sampai 22 Februari 2026 pukul 06.00 | 6 hari | **Suci / Istihadhah** |

Total pemeriksaan:

```text
Kategori          : DZĀKIRAH LIL-WAQT FAQATH
Total rentang     : 21 hari
Yakin haid        : 1 hari pertama
Ihtiyath          : 14 hari berikutnya
Suci/istihadhah   : 6 hari terakhir
```

## 5. Panduan ibadah yang dikeluarkan program

### Mandi wajib

Program mengarahkan mandi setelah 24 jam pertama. Selama masa ihtiyath, yaitu dari hari ke-2 sampai batas hari ke-15, program mengarahkan mandi setiap hendak melaksanakan salat fardhu.

### Salat lima waktu

- Salat tidak dilaksanakan pada 24 jam pertama karena masa tersebut ditetapkan sebagai yakin haid.
- Mulai hari ke-2, salat kembali wajib dilaksanakan setelah melakukan tata cara bersuci yang diarahkan program.

### Puasa

- Program menyatakan puasa sah setelah melewati batas hari ke-15.
- Puasa yang dilakukan pada hari ke-2 sampai hari ke-15 diarahkan untuk diqadha sebagai bentuk ihtiyath.

### Hubungan suami-istri

Program menyatakan hubungan suami-istri dilarang dari hari pertama sampai batas hari ke-15.

## 6. Hal yang perlu diperhatikan pada hasil

Karena program memasukkan 24 jam pertama ke dalam daftar haid sah, bagian **Pembaruan Adat** dapat menampilkan adat haid baru sekitar **1 hari**. Ini adalah akibat langsung dari logika kode, bukan berarti satu hari otomatis menjadi kebiasaan nyata wanita dalam setiap keadaan.

Program juga tidak membaca nilai kolom **Titik Jam Mulai Kebiasaan** untuk melakukan perhitungan khusus. Titik awal yang benar-benar digunakan oleh analisis adalah waktu mulai pada baris pertama log darah.

## 7. Jika “tidak tentu” bukan berarti lupa

Istilah “durasi tidak tetap” dan “lupa durasi” tidak selalu sama:

- **Lupa durasi:** sebelumnya mempunyai adat, tetapi tidak dapat mengingat jumlah harinya.
- **Durasi berubah-ubah:** masih mengingat kejadian setiap bulan, tetapi memang tidak mempunyai satu pola durasi yang stabil.

Program saat ini tidak menyediakan pilihan profil khusus untuk “adat berubah-ubah tetapi seluruh riwayat masih diingat”. Memilih **Dzākirah lil-Waqt Faqath** adalah pendekatan pengujian yang paling dekat, tetapi belum tentu merupakan representasi fikih yang tepat untuk semua kasus haid tidak teratur.

Jika Nadia juga tidak mengetahui atau tidak mengingat waktu mulai kebiasaannya, pilihan program yang lebih dekat adalah **Mutahayyirah Muthlaqah**. Dalam pilihan tersebut, seluruh rentang 21 hari akan diberi status **Ihtiyath**, bukan dibagi menjadi satu hari haid, 14 hari ihtiyath, dan enam hari suci/istihadhah.

## 8. Catatan keselamatan

Perdarahan terus-menerus selama 21 hari perlu dikonsultasikan kepada tenaga medis. Untuk keputusan ibadah nyata, hasil program perlu diverifikasi kepada ahli fikih yang memahami rincian bab haid dan istihadhah.
