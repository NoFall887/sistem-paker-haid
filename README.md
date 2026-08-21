# Sistem Pakar Fikih Haid dan Istihadhah

## React MVP

The mobile-first React application is in the repository root. It uses React,
TypeScript, Tailwind CSS, and shadcn/ui while keeping the calculation engine in
`src/lib/fiqh-engine.ts`.

```powershell
npm install
npm run dev
```

Verification commands:

```powershell
npm run lint
npm test
npm run build
```

The production form starts empty. Draft history is saved automatically in the
browser's local storage and can be copied as JSON or exported as UTF-8 text.

Sumber pengetahuan utama dan kanonis proyek ini adalah
[`SISTEM_PAKAR_FIQIH_HAID_MASTER.html`](./SISTEM_PAKAR_FIQIH_HAID_MASTER.html).

File Markdown lain di direktori ini merupakan glosarium dan skenario pendukung. Jika terdapat perbedaan isi, HTML kanonis menjadi acuan kecuali ada kebutuhan baru yang dinyatakan secara eksplisit.

## Peta pengetahuan proyek

- [`POHON_KEPUTUSAN_LOGIKA_SISTEM.md`](./POHON_KEPUTUSAN_LOGIKA_SISTEM.md) — peta hierarkis alur keputusan yang diterapkan oleh HTML kanonis.
- [`GLOSARIUM_ISTILAH_HAID_DAN_ISTIHADHAH.md`](./GLOSARIUM_ISTILAH_HAID_DAN_ISTIHADHAH.md) — definisi istilah yang digunakan program.
- [`PANDUAN_PENGALAMAN_PENGGUNA_OPTIMAL.md`](./PANDUAN_PENGALAMAN_PENGGUNA_OPTIMAL.md) — walkthrough pengguna dari persiapan data, pengisian formulir, hingga membaca output.
- [`CONTOH_SKENARIO_PENGUJIAN_PROGRAM.md`](./CONTOH_SKENARIO_PENGUJIAN_PROGRAM.md) dan [`CONTOH_SKENARIO_KEBIASAAN_HAID_TIDAK_TENTU.md`](./CONTOH_SKENARIO_KEBIASAAN_HAID_TIDAK_TENTU.md) — contoh penggunaan dan pengujian.

Pohon keputusan adalah peta turunan untuk memahami kode. Jika logika HTML berubah, pohon keputusan harus diperbarui setelah perubahan diterapkan pada sumber kanonis.

## Menjalankan pengujian regresi

Runner pengujian tidak membutuhkan pemasangan library. Dari direktori proyek,
jalankan server lokal bawaan Python:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Lalu buka `http://127.0.0.1:8765/TEST_REGRESI_LOGIKA.html`. Runner memuat HTML
kanonis, menjalankan kasus normalisasi, tamyiz, validasi input, serta smoke test
preset, kemudian menampilkan hasil **PASS/FAIL**.
