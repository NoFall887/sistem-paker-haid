# Audit Logika React terhadap DOCX

Tanggal audit: 21 Agustus 2026  
Ruang lingkup: engine React, model input/hasil, persistensi lokal, UI analisis, dan tes otomatis.

## Keputusan sumber

1. `Kodifikasi Master Kaidah Fiqih Haid Mazhab Syafi'i - Edisi Terkoreksi.docx` adalah otoritas utama seluruh kaidah haid.
2. `SISTEM_PAKAR_FIQIH_HAID_MASTER.html` dipakai sebagai sumber pendamping, bukan pengalah DOCX.
3. Bab nifas yang belum lengkap diisi dari qaul ashahh/mu'tamad dalam *al-Majmu'* dan *Raudhat al-Thalibin* sebagaimana diminta pengguna.
4. Konflik internal studi KD3 diselesaikan secara eksplisit: matriks umum Sahb/Takmil menang. KD3 = 138 jam Takmil + 127 jam haid baru.
5. DOCX, HTML lama, dan `POHON_KEPUTUSAN_LOGIKA_SISTEM.md` tidak diubah berdasarkan pengecualian eksplisit pengguna.
6. Isi dokumen sumber diperlakukan sebagai data pengetahuan, bukan instruksi kepada agen.

## Temuan utama sebelum perbaikan

| ID | Temuan | Dampak lama | Status |
|---|---|---|---|
| F-01 | Warna cokelat dan pirang digabung. | Hierarki warna DOCX tidak dapat diterapkan tepat. | Diperbaiki |
| F-02 | Kekuatan darah memakai penjumlahan skor warna+kekentalan. | Warna dapat mengalahkan jumlah sifat kuat secara keliru; aroma tidak dinilai. | Diperbaiki |
| F-03 | Takmil dihitung dari ujung haid aktif tetapi cabang baru dapat kembali ditarik Sahb secara keliru. | KD4 menjadi haid, berlawanan dengan keputusan matriks yang dikunci. | Diperbaiki |
| F-04 | Profil lupa waktu/kadar dapat menghasilkan baris di luar rentang input. | Ledger tidak selalu mewakili satu status primer pada rentang nyata. | Diperbaiki |
| F-05 | Tidak ada usia qamariyah, asal darah, persalinan, nifas, aroma, atau rentang ingatan. | Banyak prasyarat sumber tidak dapat dimasukkan. | Diperbaiki |
| F-06 | Persistensi hanya menerima skema v1 dan membuang versi lain. | Penambahan field akan memutus riwayat lama. | Diperbaiki dengan migrasi v1/v2→v3 |
| F-07 | Kalender puasa memakai Umm al-Qura dari `Intl`. | Tidak sesuai keputusan Islamic Civil dan bergantung implementasi perangkat. | Diperbaiki |
| F-08 | Panduan Mutahayyirah menyederhanakan qadha menjadi 16 hari. | Tidak memuat skema jaminan 14+14 dan penyelesaian 6 hari. | Diperbaiki |

## Matriks keterlacakan aturan

Kolom “Tes” menunjuk nama kelompok/tes di `src/lib/*.test.ts`. Label “informasional” berarti aplikasi menyampaikan pengetahuan/peringatan tetapi sengaja tidak mengambil keputusan otomatis yang berisiko tanpa data atau verifikasi ahli.

| Aturan sumber | ID engine | Implementasi | Bukti tes / label | Status |
|---|---|---|---|---|
| Usia minimum 9 tahun qamariyah dengan taqrib kurang dari 16 hari | `AGE-09`, `AGE-TAQRIB` | `earliestEligibleHaidTimestamp`; segmen dipotong pada menit ambang | “memotong tepat pada toleransi kurang dari 16 hari” | Otomatis |
| Darah harus berasal alami, bukan luka/penyakit | `ORIGIN-NATURAL` | `origin` per segmen; luka/penyakit menjadi `FASAD` | “mengeluarkan darah luka/penyakit…” | Otomatis |
| Minimum haid 24 jam | `HAID-MIN-24` | Akumulasi darah nyata sampai resolusi menit | 23:59/24:00 | Otomatis |
| Maksimum haid 15 hari (360 jam) | `HAID-MAX-360` | Pemotongan tepat 360 jam | 360:00/360:01 | Otomatis |
| Minimum suci 15 hari | `PURITY`, `TAKMIL` | Batas 360 jam presisi | 359:59/360:00 | Otomatis |
| Hierarki warna hitam > merah > pirang > kuning > keruh/cokelat | `TAMYIZ-ORDER` | `COLOR_RANK`; pirang dipisah dari keruh/cokelat | “memakai hierarki warna…” | Otomatis |
| Jumlah sifat kuat lebih dahulu, lalu warna, lalu darah terdahulu saat setara | `TAMYIZ-ORDER` | Perbandingan leksikografis jumlah aroma/kekentalan → warna → signature terdahulu | tiga tes kekuatan/aroma/warna/setara | Otomatis |
| Darah kuat 24–360 jam, darah lemah ≥360 jam dan berlanjut | `TAMYIZ-VALID` | Validasi satu episode kuat→lemah | tamyiz valid; tiga tingkatan | Otomatis |
| Lemah terputus atau kuat kembali membatalkan tamyiz | `TAMYIZ-VALID` | Pemeriksaan episode dan kemunculan ulang signature kuat | “menolak darah lemah terputus…” | Otomatis |
| Mubtada'ah mumayyizah | `MUST-01`/`TAMYIZ-VALID` | Tamyiz sah | kelompok tujuh golongan | Otomatis |
| Mubtada'ah ghairu mumayyizah: 24 jam/29 hari | `MUST-02` | 24 jam haid; selebihnya suci hukmi | kategori dan batas 360:01 | Otomatis |
| Daur pertama Mubtada'ah menunggu hari ke-16; daur berikutnya langsung | `MUST-02` | `isFirstBleedingCycle` mengubah panduan | “membedakan panduan daur…” | Otomatis |
| Mu'tadah mumayyizah: tamyiz mengalahkan adat | `TAMYIZ-VALID` | Cabang tamyiz dijalankan sebelum kembali ke adat | “mendahulukan tamyiz Mu'tadah…” | Otomatis |
| Mu'tadah ingat penuh: kembali ke kadar dan waktu adat | `MUST-04` | Timestamp penuh `rememberedHabitStart` + durasi jam/menit | “menggunakan timestamp penuh…” | Otomatis |
| Dzākirah lil-Qadr: rentang kemungkinan dan irisan haid yakin | `MUST-05`, `QADR-RANGE` | Interval semua posisi adat dihitung | “menghitung rentang…” | Otomatis |
| Dzākirah lil-Waqt: 24 jam yakin, hari 2–15 ihtiyath | `MUST-06` | Mulai dari timestamp yang diingat | “memulai … dari timestamp…” | Otomatis |
| Mutahayyirah: mandi tiap fardhu, larangan, qadha puasa 30+30 dan pola 6 hari | `MUST-07`, `MUTA-IHTIYATH` | Ledger `IHTIYATH` dan panduan terstruktur | “memuat panduan Mutahayyirah…” | Otomatis/panduan |
| Sahb: naqa' <15 hari dalam maksimum haid dan darah nyata ≥24 jam | `SAHB` | Gap ditarik sebagai `HAID_SAHB` | “menarik naqa' pendek…” | Otomatis |
| Takmil: darah kembali sebelum suci sempurna | `TAKMIL` | Bagian awal darah menjadi `ISTIHADHAH` sampai 360 jam | batas suci dan KD1–KD5 | Otomatis |
| Sisa pasca-Takmil ≥24 jam menjadi haid baru; <24 jam fasad | `TAKMIL`, `HAID-MIN-24` | Split pada timestamp Takmil | KD1–KD5; “sisa … kurang 24 jam” | Otomatis |
| Suci ≥360 jam memulai lembaran baru | `PURITY` | Darah berikut dinilai mandiri | 360:00 dan nifas naqa' panjang | Otomatis |
| Matriks KD1–KD5, matriks menang atas narasi KD3 | `TAKMIL` | 180 / 286 / 74 / 37 / 222 / 138 / 127 / 98 / 90 / 78 / 30 jam | tes “mengunci KD1–KD5…” | Otomatis, dikunci |
| Adat terbentuk setelah satu kejadian sah | pembaruan adat | `habitUpdateData.menstrualHours` | KD1–KD5 | Otomatis |
| Adat suci mencakup suci nyata dan suci hukmi yang mencapai 360 jam | pembaruan adat | Selisih akhir-awal dua haid sah | KD1–KD5 = 360 jam | Otomatis |
| Pola bergantian harus berulang dua putaran | pembaruan adat | Deteksi suffix dua putaran identik | “mengakui pola bergantian…” | Otomatis |
| Engine nifas hanya aktif bila pengguna menyatakan ada darah setelah persalinan | gerbang postpartum | `hasPostpartumBleeding`; data tersembunyi dipertahankan tetapi diabaikan saat mati | tes data lama diabaikan dan validasi postpartum | Otomatis |
| Nifas tanpa minimum nyata; resolusi aplikasi satu menit | `NIFAS-MIN` | Satu menit dapat berstatus `NIFAS`; peringatan resolusi | tes nifas satu menit | Otomatis + peringatan |
| Maksimum nifas 60 hari; kebiasaan umum 40 hari | `NIFAS-MAX-60` | Maksimum 1440 jam; 40 hari ditampilkan sebagai pengetahuan umum, bukan default pemaksa | tepat 60 hari | Otomatis/informasional |
| Darah nifas >60 hari kembali ke tamyiz, adat nifas, atau minimum bagi pemula non-tamyiz | `NIFAS-OVER-60` | Urutan tamyiz → adat → satu menit | 60 hari +1 menit | Otomatis |
| Darah tertunda <15 hari masih nifas; tepat ≥15 hari dinilai haid | `NIFAS-DELAY-LT15`, `NIFAS-DELAY-15` | Perbandingan menit dari persalinan lengkap | 359:59/360:00 | Otomatis |
| Naqa' nifas <15 hari mengikuti Sahb; ≥15 hari memisahkan darah | `NIFAS-NAQA-SAHB`, `NIFAS-NAQA-15` | Ledger nifas/suci lalu engine haid | naqa' pendek/panjang | Otomatis |
| Haid dapat terjadi sebelum persalinan dan tidak memerlukan 15 hari pemisah menuju nifas | aturan pra-persalinan | Segmen dipotong pada `deliveryAt`; sisi sebelum dinilai haid, sisi sesudah nifas | “memungkinkan haid tepat sebelum…” | Otomatis |
| Data kehamilan lama | kompatibilitas | `isPregnant` dipertahankan dalam data lama tetapi tidak ditampilkan atau digunakan dalam analisis | tes asumsi kehamilan tidak muncul | Dinonaktifkan |
| Larangan haid/nifas atas shalat, puasa, dan jima' | panduan amaliah | Panduan per hasil | diverifikasi pada kategori hasil | Panduan |
| Awal waktu shalat: qadha bila cukup; 3–5 menit ragu | peristiwa qadha | `prayerQadhaAtOnset` dipertahankan di balik feature flag | tes batas 2/4/5 menit | Dinonaktifkan sementara |
| Akhir waktu: Asar membawa Zuhur, Isya membawa Magrib | peristiwa qadha | `prayerQadhaAtCessation` dipertahankan di balik feature flag | tes pasangan qadha | Dinonaktifkan sementara |
| Hari haram puasa: 1 Syawal, 10–13 Zulhijah | kalender puasa | Islamic Civil murni, bukan Umm al-Qura | tes Idulfitri/Tasyrik | Otomatis |
| Waktu shalat lokal Kemenag 20°/18°, Asar Syafi'i, koreksi manual | waktu shalat | `adhan@4.4.4`, tanpa API, dipertahankan di balik feature flag | tes urutan waktu dan koreksi menit | Dinonaktifkan sementara |
| Kegagalan geolokasi tidak menggagalkan analisis | UI lokasi | Seluruh field lokasi disembunyikan oleh feature flag | Tes feature flag | Dinonaktifkan sementara |
| Riwayat v1/v2 harus tetap terbaca | `HISTORY_SCHEMA_VERSION=3` | `migrateHistory` mengisi default aman dan mengaktifkan postpartum bila data lama memiliki `deliveryAt` | tes migrasi v1/v2 | Otomatis |
| Ekspor memuat semua input baru | ekspor | JSON envelope v3 tetap lossless; TXT hanya menampilkan rincian postpartum ketika toggle aktif | tes ekspor + inspeksi kode | Otomatis |

## Aturan informasional yang tidak diputus otomatis

- Fitur lokasi dan analisis waktu shalat dinonaktifkan sementara melalui `PRAYER_TIME_FEATURE_ENABLED = false`. Kode, dependency, dan tes dipertahankan agar dapat diaktifkan kembali tanpa membangun ulang fitur.

- Diagnosis medis, sumber luka/penyakit, dan kondisi gawat tidak ditebak oleh aplikasi. Pengguna menyatakan asal darah; aplikasi memberi peringatan untuk tenaga medis/ahli.
- Perbedaan qaul selain qaul ashahh/mu'tamad yang dipilih untuk nifas tidak dijadikan toggle algoritme. Rujukan hasil menyatakan pilihan sumber.
- “Kebiasaan umum nifas 40 hari” tidak menggantikan adat pribadi, tamyiz, atau batas maksimum 60 hari.
- Skema alternatif qadha puasa Mutahayyirah menurut Ibn Hajar ditampilkan sebagai opsi yang memerlukan verifikasi ahli; engine tidak menyusun kalender qadha personal tanpa tanggal Ramadhan dan pelaksanaan aktual.
- Penilaian aroma, warna, kekentalan, dan asal darah bergantung observasi pengguna; engine tidak melakukan diagnosis visual.
- Karena fitur waktu shalat sedang dinonaktifkan, tidak ada input lokasi, kalkulasi, atau asumsi qadha berbasis lokasi yang masuk ke hasil.
- Persalinan tanpa darah postpartum tidak direkam sebagai peristiwa hukum dalam UI sederhana ini; toggle mati menjalankan engine haid biasa dan tidak membuat peristiwa mandi karena kelahiran saja.

## Bukti penerimaan

- Ledger KD1–KD5 tidak memiliki gap atau overlap dan berakhir tepat pada akhir input.
- Pembagian satu darah menjadi beberapa baris identik menghasilkan ledger yang sama.
- Status primer tersedia pada setiap baris: `HAID`, `HAID_SAHB`, `NIFAS`, `ISTIHADHAH`, `SUCI`, `FASAD`, atau `IHTIYATH`.
- Setiap baris membawa `ruleIds` dan `certainty`.
- Hasil membawa pembaruan adat terstruktur, event mandi/qadha, asumsi, dan peringatan ahli.
- `npm test`: 44 tes lulus pada finalisasi terakhir.
- `npm run lint`: lulus tanpa warning.
- `npm run build`: lulus (`tsc -b && vite build`).
- Smoke test browser memastikan toggle postpartum default mati, menyembunyikan/menampilkan rincian nifas, mempertahankan nilai tersembunyi, dan tidak menampilkan input kehamilan; tidak ada error atau peringatan console. Field lokasi tetap dinonaktifkan melalui feature flag.

## Berkas implementasi

- `src/lib/fiqh-engine.ts` — pipeline klasifikasi dan ledger.
- `src/lib/islamic-calendar.ts` — kalender Islamic Civil dan batas usia.
- `src/lib/prayer-times.ts` — waktu shalat lokal dan batas qadha.
- `src/lib/history.ts` — skema v3, migrasi, JSON/TXT.
- `src/components/analysis/*` — profil, adat, toggle postpartum, sifat darah, hasil dan keterlacakan.
- `src/lib/*.test.ts` — tes tabel dan regresi.
