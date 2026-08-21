# Contoh Skenario Pengujian Program

## Kasus: Darah terus keluar selama 21 hari

Contoh ini bersifat **fiktif** dan dibuat untuk menguji cara kerja program. Nama, tanggal, serta pengalamannya bukan data pasien nyata. Hasil program adalah simulasi perhitungan fikih berdasarkan aturan di dalam kode, bukan diagnosis medis atau fatwa.

## 1. Pengalaman wanita

Seorang wanita bernama **Nadia**, berusia 27 tahun, sudah beberapa tahun mengalami haid. Selama enam bulan terakhir, kebiasaannya relatif teratur:

- darah haid biasanya keluar selama **7 hari**;
- setelah itu ia mengalami masa suci sekitar **23 hari**;
- haid biasanya mulai sekitar pukul **06.00**;
- darah yang biasa terlihat berwarna merah dan cenderung cair.

Pada 1 Februari 2026 pukul 06.00, Nadia mulai melihat darah. Berbeda dari kebiasaannya, kali ini darah terus keluar tanpa berhenti sampai 22 Februari 2026 pukul 06.00. Total rentangnya adalah **21 hari**.

Selama 21 hari tersebut, warna dan sifat darah terlihat sama: merah dan cair. Nadia tidak menemukan perubahan yang jelas menjadi darah yang lebih hitam, lebih kental, atau lebih kuat. Seluruh kejadian dapat dicatat sebagai satu baris atau beberapa baris yang tepat bersambung; keduanya mewakili satu episode darah kontinu dan wajib menghasilkan keputusan yang sama.

### Ringkasan kronologi

| Peristiwa | Tanggal dan waktu |
|---|---|
| Darah mulai keluar | 1 Februari 2026, pukul 06.00 |
| Darah berhenti/mampet | 22 Februari 2026, pukul 06.00 |
| Total durasi | 21 hari atau 504 jam |
| Warna darah | Merah (Ahmar) |
| Sifat darah | Cair |

## 2. Cara mengisi formulir

Buka file HTML program, lalu isi bagian-bagiannya sebagai berikut.

### A. Profil status dan kebiasaan

| Kolom program | Nilai yang dipilih atau dimasukkan | Alasan |
|---|---|---|
| **Status Pengalaman Haid** | **Mu'tadah (Pernah Haid & Suci Sebelumnya)** | Nadia sudah pernah mengalami haid dan mempunyai kebiasaan yang diketahui. |
| **Adat Durasi Haid** | **7 hari** | Haid biasanya berlangsung selama tujuh hari. |
| **Adat Durasi Suci** | **23 hari** | Masa suci yang biasanya dialami adalah sekitar 23 hari. |
| **Titik Jam Mulai Kebiasaan** | **06.00** | Haid biasanya mulai sekitar pukul 06.00. |

### B. Log kronologis darah

Klik **Tambah Baris Darah** jika belum ada baris, kemudian masukkan satu baris berikut:

| Kolom program | Nilai |
|---|---|
| **Waktu Mulai Keluar — tanggal** | 01-02-2026 |
| **Waktu Mulai Keluar — jam** | 06.00 |
| **Waktu Mampet — tanggal** | 22-02-2026 |
| **Waktu Mampet — jam** | 06.00 |
| **Warna Darah** | Merah (Ahmar) |
| **Sifat** | Cair |

Sebagai pengujian invariansi, data yang sama juga boleh dipecah menjadi beberapa baris, misalnya 1–8 Februari dan 8–22 Februari dengan timestamp batas yang sama serta warna/sifat identik. Program akan menormalisasikannya kembali menjadi satu episode kontinu.

### C. Menjalankan analisis

Setelah semua kolom terisi, klik tombol:

> **EKSEKUSI ANALISIS FIKIH MASTER DEFINITIF**

## 3. Output yang seharusnya muncul

### Kategori utama

Program seharusnya menampilkan kategori:

> **MU'TADAH GHOIRU MUMAYYIZAH**

Kategori ini dipilih karena:

1. Nadia sudah mempunyai adat, sehingga profilnya adalah **Mu'tadah**.
2. Darah keluar lebih dari batas maksimal haid 15 hari.
3. Hanya ada satu jenis darah yang seragam, sehingga tidak terdapat pembeda darah kuat dan darah lemah yang sah.
4. Karena tidak ada tamyiz yang sah, program mengembalikan penentuan haid kepada adat Nadia, yaitu tujuh hari.

### Ringkasan keputusan

Program akan membagi rentang 21 hari menjadi dua bagian:

| Segmen hasil | Rentang waktu | Durasi | Status fikih | Dasar yang dipakai program |
|---|---|---:|---|---|
| Segmen 1 | 1 Februari 2026 pukul 06.00 sampai 8 Februari 2026 pukul 06.00 | 7 hari | **Haid** | Sesuai adat haid Nadia |
| Segmen 2 | 8 Februari 2026 pukul 06.00 sampai 22 Februari 2026 pukul 06.00 | 14 hari | **Istihadhah** | Kelebihan darah setelah durasi adat |

Dengan kata lain, meskipun darah secara fisik keluar selama 21 hari, program tidak menetapkan seluruh 21 hari sebagai haid. Program menetapkan tujuh hari pertama sebagai haid dan 14 hari berikutnya sebagai istihadhah.

## 4. Panduan ibadah yang dihasilkan

Berdasarkan kode program, panduan yang tampil seharusnya kurang lebih sebagai berikut.

### Mandi wajib

Nadia diarahkan untuk mandi wajib setelah selesai durasi adat haidnya, yaitu setelah tujuh hari, pada **8 Februari 2026 pukul 06.00**.

### Salat lima waktu

- Selama tujuh hari pertama, program menetapkan status haid sehingga salat tidak dilaksanakan.
- Mulai 8 Februari 2026 pukul 06.00, statusnya menjadi istihadhah. Nadia diarahkan untuk kembali mengerjakan salat dan berwudu setiap masuk waktu salat sesuai petunjuk program.

### Puasa Ramadan dan qadha

- Puasa yang bertepatan dengan tujuh hari pertama dihukumi tidak sah karena statusnya haid dan perlu diqadha jika merupakan puasa wajib.
- Puasa pada 14 hari berikutnya dihukumi sah oleh program karena statusnya istihadhah, dengan menjalankan ketentuan bersuci.

Tanggal contoh berada pada Februari 2026 dan tidak dimaksudkan sebagai simulasi bulan Ramadan. Bagian ini hanya menunjukkan jenis panduan yang dikeluarkan program.

### Hubungan suami-istri

Menurut keluaran program, hubungan suami-istri dapat dilakukan pada masa istihadhah setelah mandi besar dari haid.

## 5. Tampilan tambahan yang diperkirakan muncul

Program juga akan:

- menggambar garis waktu berwarna merah untuk tujuh hari haid;
- menggambar garis waktu berwarna jingga untuk 14 hari istihadhah;
- menampilkan dua baris pada tabel rincian segmen;
- menampilkan pembaruan adat haid berdasarkan haid sah terakhir, yaitu sekitar tujuh hari;
- tidak menampilkan peringatan hari haram puasa untuk rentang tanggal contoh ini, selama hasil kalender pada perangkat sesuai dengan pemeriksaan program.

## 6. Hasil pengujian yang dianggap berhasil

Pengujian berhasil apabila hasil utamanya cocok dengan nilai berikut:

```text
Kategori       : MU'TADAH GHOIRU MUMAYYIZAH
Total darah    : 21 hari
Haid           : 7 hari pertama
Istihadhah     : 14 hari berikutnya
Jumlah segmen  : 2 segmen hukum
```

Jika program menghasilkan kategori atau pembagian waktu yang berbeda, periksa kembali hal-hal berikut:

- profil harus dipilih sebagai **Mu'tadah**;
- adat haid harus diisi **7 hari**;
- seluruh baris darah harus membentuk **satu episode kontinu** tanpa gap atau overlap;
- waktu akhir harus tepat 21 hari setelah waktu awal;
- warna dan sifat darah harus sama dalam seluruh segmen;
- waktu akhir harus lebih besar daripada waktu awal.

Hasil juga dianggap gagal jika satu baris dan beberapa baris adjacent yang
mewakili episode identik menghasilkan kategori, pembagian haid/istihadhah,
panduan ibadah, atau pembaruan adat yang berbeda.

## 7. Catatan penting

Contoh ini menjelaskan perilaku kode untuk keperluan pengujian perangkat lunak. Perdarahan selama 21 hari merupakan kondisi yang layak dikonsultasikan kepada tenaga medis. Untuk penerapan hukum ibadah pada keadaan nyata, hasil program juga perlu diverifikasi kepada ahli fikih yang kompeten.
