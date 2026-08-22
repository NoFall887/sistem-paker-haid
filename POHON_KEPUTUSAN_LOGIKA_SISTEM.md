# Pohon Keputusan Logika Sistem

Dokumen ini adalah peta pengetahuan turunan dari DOCX kodifikasi terkoreksi dan
[`SISTEM_PAKAR_FIQIH_HAID_MASTER.html`](./SISTEM_PAKAR_FIQIH_HAID_MASTER.html).
Diagram menggambarkan urutan eksekusi kode, bukan verifikasi independen atas
kebenaran fikihnya. Kedua sumber kanonik harus tetap selaras; keputusan eksplisit
pengguna mengikuti aturan daur pertama Mubtada'ah Mumayyizah dalam DOCX.

## 1. Pohon routing utama

```mermaid
flowchart TD
    A["Input profil dan log darah"] --> B["Abaikan baris dengan kedua tanggal kosong"]
    B --> C{"Baris lain lengkap,<br/>tanggal valid, dan akhir > awal?"}
    C -- "Tidak" --> STOPV["Hentikan analisis dan tampilkan<br/>kesalahan beserta nomor baris"]
    C -- "Ya" --> D["Hitung durasi; simpan sifat fisik<br/>tanpa memaksakan tamyiz"]
    D --> E0["Urutkan segmen berdasarkan waktu mulai"]
    E0 --> E1{"Ada overlap?"}
    E1 -- "Ya" --> STOPV
    E1 -- "Tidak" --> E2["Gabungkan segmen adjacent<br/>dengan warna dan sifat identik"]
    E2 --> E3["Kelompokkan episode kontinu;<br/>setiap gap positif memulai episode baru"]

    E3 --> E{"Ada minimal satu segmen valid?"}
    E -- "Tidak" --> STOP["Hentikan analisis dan tampilkan peringatan"]
    E -- "Ya" --> F["Tentukan awal, akhir, dan total rentang"]

    F --> G{"Status wanita?"}
    G -- "Mutahayyirah Muthlaqah" --> S1["Subtree A: aturan status khusus"]
    G -- "Dzakirah lil-Waqt" --> S1
    G -- "Dzakirah lil-Qadr" --> S1
    G -- "Mubtada'ah atau Mu'tadah" --> H["Subtree B: evaluasi tamyiz"]

    H --> I{"Tamyiz sah?"}
    I -- "Ya" --> I1["Klasifikasi berdasarkan darah kuat dan lemah"]
    I1 --> OUT["Subtree D: pascaproses hasil"]

    I -- "Tidak" --> J{"Tepat satu episode kontinu dan<br/>durasi episode >15 hari?"}
    J -- "Tidak" --> S3["Subtree C: engine multi-segmen"]

    J -- "Ya" --> K{"Status wanita?"}
    K -- "Mubtada'ah" --> K1["24 jam pertama = Haid"]
    K1 --> K2["Sisanya = Istihadhah"]
    K2 --> OUT

    K -- "Mu'tadah" --> K3["Durasi sesuai adat = Haid"]
    K3 --> K4["Kelebihan adat = Istihadhah"]
    K4 --> OUT

    S1 --> OUT
    S3 --> OUT
```

## 2. Subtree A — status khusus dan kehilangan ingatan

```mermaid
flowchart TD
    A{"Status khusus?"}

    A -- "Mutahayyirah Muthlaqah" --> M1["Lupa waktu dan kadar adat"]
    M1 --> M2["Seluruh rentang darah = Ihtiyath"]
    M2 --> M3["Tidak ada Haid Sah yang ditambahkan"]
    M3 --> M4["Mandi setiap hendak salat fardu<br/>dan larangan jima selama darah mengalir"]

    A -- "Dzakirah lil-Waqt" --> W1["Ingat waktu mulai tetapi lupa kadar"]
    W1 --> W2["Buat batas awal +24 jam"]
    W2 --> W3["24 jam pertama = Yakin Haid"]
    W3 --> W4{"Rentang melewati 24 jam?"}
    W4 -- "Ya" --> W5["Setelah 24 jam sampai batas 15 hari = Ihtiyath"]
    W4 -- "Tidak" --> W8["Selesai"]
    W5 --> W6{"Rentang melewati 15 hari?"}
    W6 -- "Ya" --> W7["Setelah 15 hari = Suci / Istihadhah"]
    W6 -- "Tidak" --> W8
    W7 --> W8

    A -- "Dzakirah lil-Qadr" --> Q1["Ingat kadar adat tetapi lupa waktu mulai"]
    Q1 --> Q2["Seluruh rentang = Ihtiyath"]
    Q2 --> Q3["Kadar adat hanya dipakai dalam<br/>ringkasan dan panduan qadha"]
    Q3 --> Q4["Kadar adat tidak membagi timeline"]
```

## 3. Subtree B — validasi tamyiz

```mermaid
flowchart TD
    A{"Pengguna dapat mengamati<br/>sifat darah?"}
    A -- "Tidak" --> X0["Tamyiz tidak dinilai;<br/>catat asumsi"]
    A -- "Ya" --> A1{"Warna, kekentalan, dan aroma<br/>setiap darah alami diketahui?"}
    A1 -- "Tidak" --> X0
    A1 -- "Ya" --> B["Bandingkan jumlah sifat kuat dahulu:<br/>kental dan beraroma"]
    B --> B1["Jika jumlah setara, bandingkan warna:<br/>hitam > merah > pirang > kuning > keruh/cokelat"]
    B1 --> B2["Jika benar-benar setara,<br/>darah terdahulu dimenangkan"]
    B2 --> C1{"Tepat satu episode kontinu?"}
    C1 -- "Tidak" --> X["Tamyiz tidak sah"]
    C1 -- "Ya" --> E{"Darah sesudah segmen pertama<br/>ada yang lebih kuat?"}
    E -- "Ya" --> X
    E -- "Tidak" --> F{"Ditemukan transisi dari darah pertama<br/>ke darah lebih lemah/berbeda?"}

    F -- "Tidak" --> X
    F -- "Ya" --> G{"Setelah transisi, darah lebih kuat<br/>atau signature pertama muncul kembali?"}

    G -- "Ya" --> X
    G -- "Tidak" --> H["Ambil blok awal sampai transisi<br/>sebagai darah kuat"]

    H --> I["Hitung durasi blok kuat dan blok lemah<br/>dari batas waktu kontinu"]
    I --> J{"Darah kuat ≥24 jam<br/>dan ≤360 jam?"}

    J -- "Tidak" --> X
    J -- "Ya" --> K{"Darah lemah ≥360 jam?"}

    K -- "Tidak" --> X
    K -- "Ya" --> Y["Tamyiz sah"]

    Y --> Y1["Satu blok kuat agregat = Haid"]
    Y --> Y2["Satu blok lemah agregat = Istihadhah"]
    Y1 --> Y3["Tamyiz didahulukan atas adat"]
    Y2 --> Y3
    Y3 --> Z{"Mubtada'ah?"}
    Z -- "Bukan / Mu'tadah" --> Z1["Mandi saat darah kuat<br/>beralih menjadi lemah"]
    Z -- "Ya, daur berikutnya" --> Z1
    Z -- "Ya, daur pertama" --> Z2["Tetap menahan diri sampai<br/>darah tembus 15 hari"]
    Z2 --> Z3["Masuk hari ke-16: mandi dan qadha<br/>shalat yang ditinggalkan selama darah lemah"]

    X0 --> X1["Gunakan rute Ghairu Mumayyizah/adat<br/>tanpa menghapus sifat yang tersimpan"]
```

## 4. Subtree C — engine multi-segmen, Sahb, dan Takmilah

```mermaid
flowchart TD
    START["Mulai engine kronologi"] --> INIT["haidAktif = null<br/>takmilEndLimit = null"]
    INIT --> A["Ambil segmen berikutnya"]

    A --> B{"Ada Haid aktif?"}

    B -- "Tidak" --> C{"Ada jeda dari segmen sebelumnya?"}
    C -- "Ya" --> C1["Catat jeda sebagai Suci Sela"]
    C -- "Tidak" --> D
    C1 --> D{"Akumulasi darah sejak awal segmen<br/>dalam jendela 15 hari ≥24 jam?"}

    D -- "Ya" --> D1["Mulai Haid baru<br/>haidAktif = segmen sekarang"]
    D -- "Tidak" --> D2["Segmen = Darah Fasad"]
    D1 --> NEXT
    D2 --> NEXT

    B -- "Ya" --> E["Hitung jeda sejak akhir segmen sebelumnya"]
    E --> F{"Jeda ≥15 hari?"}

    F -- "Ya" --> F1["Jeda = Suci Sempurna"]
    F1 --> F2["Putuskan siklus sebelumnya"]
    F2 --> F3{"Akumulasi darah berikut<br/>dalam 15 hari ≥24 jam?"}
    F3 -- "Ya" --> F4["Mulai Haid baru"]
    F3 -- "Tidak" --> F5["Segmen = Darah Fasad<br/>haidAktif = null"]
    F4 --> NEXT
    F5 --> NEXT

    F -- "Tidak" --> G["Hitung rentang dari awal Haid aktif<br/>sampai akhir darah sekarang"]
    G --> H{"Rentang ≤15 hari?"}

    H -- "Ya" --> H1["Qaul as-Sahb;<br/>catat masa bersih hanya jika >0 jam"]
    H1 --> H2["Jeda bersih ditarik menjadi Haid"]
    H2 --> H3["Darah sekarang = lanjutan Haid aktif"]
    H3 --> H4["Perbarui akhir Haid aktif"]
    H4 --> NEXT

    H -- "Tidak" --> I["Batas Takmilah =<br/>akhir darah Haid aktif +15 hari;<br/>jangan buat suci sela 0 jam"]
    I --> I1["Jeda bersih = Suci Sela / masa Takmil"]

    I1 --> J{"Darah sekarang berakhir<br/>sebelum atau tepat batas Takmilah?"}
    J -- "Ya" --> J1["Seluruh segmen = Istihadhah Takmil"]
    J1 --> NEXT

    J -- "Tidak" --> K{"Darah mulai sebelum batas<br/>dan berakhir setelah batas?"}
    K -- "Ya" --> K1["Pisahkan segmen pada batas Takmilah"]
    K1 --> K2["Bagian sebelum batas = Istihadhah"]
    K2 --> K3{"Sisa setelah batas + darah berikutnya<br/>dalam jendela 15 hari ≥24 jam?"}
    K3 -- "Ya" --> K4["Sisa = awal Haid baru"]
    K3 -- "Tidak" --> K5["Sisa = Darah Fasad<br/>haidAktif = null"]
    K4 --> NEXT
    K5 --> NEXT

    K -- "Tidak: darah mulai setelah batas" --> L{"Akumulasi darah sejak segmen ini<br/>dalam jendela 15 hari ≥24 jam?"}
    L -- "Ya" --> L1["Mulai Haid baru"]
    L -- "Tidak" --> L2["Segmen = Darah Fasad<br/>haidAktif = null"]
    L1 --> NEXT
    L2 --> NEXT

    NEXT{"Masih ada segmen?"}
    NEXT -- "Ya" --> A
    NEXT -- "Tidak" --> END["Finalisasi seluruh timeline"]
```

## 5. Subtree D — pascaproses dan keluaran

```mermaid
flowchart TD
    A["Hasil klasifikasi selesai"] --> B["Bangun timeline visual"]
    B --> C["Bangun tabel rincian segmen"]

    C --> D["Untuk setiap baris hasil,<br/>periksa tanggal satu per satu"]
    D --> E{"Tanggal termasuk hari haram puasa?"}

    E -- "1 Syawal" --> E1["Tandai Idulfitri"]
    E -- "10 Zulhijah" --> E2["Tandai Iduladha"]
    E -- "11–13 Zulhijah" --> E3["Tandai Hari Tasyrik"]
    E -- "Tidak" --> F

    E1 --> F["Tambahkan peringatan pada hasil"]
    E2 --> F
    E3 --> F

    F --> G{"Ada Haid Sah?"}
    G -- "Tidak" --> G1["Tidak ada pembaruan adat"]
    G -- "Ya" --> G2["Ambil Haid Sah terakhir"]
    G2 --> G3["Adat haid baru =<br/>akhir − awal Haid terakhir"]
    G3 --> G4["Adat suci baru disebut akan dihitung<br/>setelah minimal 15 hari suci"]

    G1 --> H
    G4 --> H["Isi panduan amaliah"]
    H --> H1["Mandi wajib"]
    H --> H2["Salat"]
    H --> H3["Puasa dan qadha"]
    H --> H4["Hubungan suami-istri"]

    H1 --> I["Tampilkan kutipan kitab"]
    H2 --> I
    H3 --> I
    H4 --> I

    I --> J["Tampilkan hasil dan gulir ke panel hasil"]
```

## Status dokumen

- **Peran:** peta pengetahuan untuk memahami dan menavigasi logika program.
- **Otoritas:** turunan; bukan pengganti HTML kanonis.
- **Pemeliharaan:** perbarui setelah alur kontrol atau aturan klasifikasi pada HTML berubah.
