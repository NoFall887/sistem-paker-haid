import type { Ref } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const glossary = [
  [
    "Haid",
    "Darah yang memenuhi ketentuan waktu dan keadaan haid dalam aturan yang diterapkan aplikasi.",
  ],
  [
    "Istihadhah",
    "Darah di luar hukum haid; dalam ibadah diperlakukan sebagai hadas yang berkelanjutan.",
  ],
  [
    "'Ādah",
    "Kebiasaan durasi atau waktu haid dan suci yang telah diketahui sebelumnya.",
  ],
  [
    "Tamyiz",
    "Pembedaan darah kuat dan lemah berdasarkan warna serta sifat, dengan syarat pola dan durasi tertentu.",
  ],
  [
    "Qaul as-Sahb",
    "Masa bersih di sela darah yang masih berada dalam rentang haid ditarik menjadi bagian haid.",
  ],
  [
    "Takmil",
    "Penyempurnaan masa suci minimal 15 hari sebelum darah berikutnya dapat menjadi haid baru.",
  ],
  [
    "Fasad",
    "Darah yang akumulasinya belum mencapai batas minimal 24 jam dalam jendela yang dinilai.",
  ],
  [
    "Ihtiyath",
    "Sikap kehati-hatian ketika status waktu tidak dapat dipastikan sepenuhnya.",
  ],
];

export function EducationView({
  headingRef,
  onBack,
}: {
  headingRef: Ref<HTMLHeadingElement>;
  onBack: () => void;
}) {
  return (
    <section aria-labelledby="step-heading">
      <SectionHeading
        ref={headingRef}
        eyebrow="Panduan belajar"
        title="Contoh & glosarium"
        description="Contoh berikut hanya untuk memahami cara pencatatan. Contoh tidak dapat dimuat ke riwayat pribadi Anda."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contoh pencatatan</CardTitle>
            <CardDescription>
              Kasus fiktif, bukan data pengguna.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-snug">
            <div className="rounded-lg bg-secondary/35 p-3">
              <p className="font-semibold">Darah kontinu 21 hari</p>
              <p className="mt-1 text-muted-foreground">
                Mu'tadah dengan adat haid 7 hari mencatat satu segmen dari 1
                Februari 2026 pukul 06.00 sampai 22 Februari 2026 pukul 06.00,
                merah dan cair.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/35 p-3">
              <p className="font-semibold">Perubahan sifat tanpa jeda</p>
              <p className="mt-1 text-muted-foreground">
                Darah hitam kental lima hari yang langsung berubah menjadi merah
                cair dicatat sebagai dua segmen dengan waktu batas yang sama.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/35 p-3">
              <p className="font-semibold">Darah sempat berhenti</p>
              <p className="mt-1 text-muted-foreground">
                Jika darah berhenti satu hari lalu keluar kembali, catat dua
                segmen dengan jeda satu hari. Jangan membuat segmen “suci”.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Glosarium singkat</CardTitle>
            <CardDescription>
              Istilah yang sering muncul dalam analisis.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {glossary.map(([term, definition]) => (
              <div key={term} className="py-2 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold">{term}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                  {definition}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Button variant="outline" className="mt-4" onClick={onBack}>
        <ArrowLeft /> Kembali ke aplikasi
      </Button>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  ref,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ref?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="mb-4 max-w-3xl">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h1
        ref={ref}
        id="step-heading"
        tabIndex={-1}
        className="text-xl font-bold tracking-tight outline-none"
      >
        {title}
      </h1>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
