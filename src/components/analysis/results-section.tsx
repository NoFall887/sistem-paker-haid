import type { Ref } from "react";
import { ArrowLeft, Info, RotateCcw, TriangleAlert } from "lucide-react";

import { statusStyles } from "@/components/analysis/analysis-options";
import { NumberedSection } from "@/components/analysis/analysis-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatJakartaDateTime,
  type AnalysisResult,
  type FiqhStatus,
} from "@/lib/fiqh-engine";
import { cn } from "@/lib/utils";

export function ResultsSection({
  result,
  sectionRef,
  onEdit,
  onRestart,
}: {
  result: AnalysisResult;
  sectionRef: Ref<HTMLElement>;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const totalHours = result.timeline.reduce(
    (sum, segment) => sum + segment.hours,
    0,
  );
  const categoryClass =
    result.categoryTone === "ihtiyath"
      ? "bg-violet-100 text-violet-900"
      : result.categoryTone === "istihadhah"
        ? "bg-orange-100 text-orange-900"
        : "bg-rose-100 text-rose-900";

  return (
    <NumberedSection
      number={5}
      title="Hasil analisis berdasarkan data Anda"
      description="Baca kategori, batas waktu, dan panduan secara utuh. Tabel waktu menjadi acuan presisi utama."
      sectionRef={sectionRef}
    >
      <Card className="overflow-hidden border-primary/25 shadow-none">
        <CardHeader className="bg-secondary/45">
          <div>
            <Badge className={cn("mb-1 border-0", categoryClass)}>
              {result.category}
            </Badge>
          </div>
          <CardTitle className="text-base">Ringkasan analisis</CardTitle>
          <CardDescription className="max-w-3xl text-sm leading-snug text-foreground/75">
            {result.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <section aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="text-sm font-semibold">
              Peta garis waktu hukum
            </h2>
            <div
              className="mt-2 flex h-10 w-full overflow-hidden rounded-lg border bg-muted"
              role="img"
              aria-label="Garis waktu proporsional hasil analisis"
            >
              {result.timeline.map((segment, index) => {
                const percent = totalHours
                  ? (segment.hours / totalHours) * 100
                  : 0;
                return (
                  <div
                    key={`${segment.label}-${index}`}
                    className={cn(
                      "grid min-w-1 place-items-center overflow-hidden px-1 text-[10px] font-semibold",
                      statusStyles[segment.status],
                    )}
                    style={{ width: `${percent}%` }}
                    title={`${segment.label}: ${(segment.hours / 24).toFixed(1)} hari`}
                  >
                    <span className={cn(percent < 9 && "sr-only")}>
                      {segment.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(
                [
                  "HAID",
                  "NIFAS",
                  "ISTIHADHAH",
                  "SUCI",
                  "FASAD",
                  "IHTIYATH",
                ] as FiqhStatus[]
              ).map((status) => (
                <Badge
                  key={status}
                  className={cn("border-0", statusStyles[status])}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </section>
          <Separator />
          <section aria-labelledby="detail-heading">
            <h2 id="detail-heading" className="text-sm font-semibold">
              Rincian batas waktu
            </h2>
            <div className="mt-2 space-y-2 md:hidden">
              {result.rows.map((row, index) => (
                <ResultRowCard
                  key={`${row.start}-${index}`}
                  row={row}
                  index={index}
                />
              ))}
            </div>
            <div className="mt-2 hidden max-w-full overflow-x-auto rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Rentang waktu</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, index) => (
                    <TableRow key={`${row.start}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <p className="font-medium">{row.label}</p>
                        <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                          {formatJakartaDateTime(row.start)} —{" "}
                          {formatJakartaDateTime(row.end)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(row.durationHours / 24).toFixed(1)} hari
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {row.durationHours.toFixed(1)} jam
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn("border-0", statusStyles[row.status])}
                        >
                          {row.displayStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-48 text-sm">
                        {row.note}
                        <p className="mt-1 text-xs text-muted-foreground">{row.certainty} · {row.ruleIds.join(", ")}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
          {result.fastingWarnings.length > 0 && (
            <Alert className="border-amber-300 bg-amber-50 text-amber-950">
              <TriangleAlert />
              <AlertTitle>Peringatan hari haram berpuasa</AlertTitle>
              <AlertDescription>
                {result.fastingWarnings.join(", ")}. Peringatan kalender ini
                terpisah dari klasifikasi darah.
              </AlertDescription>
            </Alert>
          )}
          {(result.assumptions.length > 0 || result.expertWarnings.length > 0) && (
            <Alert className="border-amber-300 bg-amber-50 text-amber-950">
              <TriangleAlert />
              <AlertTitle>Asumsi dan verifikasi ahli</AlertTitle>
              <AlertDescription>{[...result.assumptions, ...result.expertWarnings].join(" ")}</AlertDescription>
            </Alert>
          )}
          <section aria-labelledby="habit-heading">
            <h2 id="habit-heading" className="text-sm font-semibold">
              Pembaruan kebiasaan
            </h2>
            <p className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-snug text-emerald-950">
              {result.habitUpdate}
            </p>
          </section>
          {result.worshipEvents.length > 0 && (
            <section aria-labelledby="events-heading">
              <h2 id="events-heading" className="text-sm font-semibold">Peristiwa mandi dan qadha</h2>
              <ul className="mt-2 space-y-1 rounded-lg border p-3 text-sm">
                {result.worshipEvents.map((event, index) => <li key={`${event.at}-${index}`}>{formatJakartaDateTime(event.at)} — {event.description} ({event.certainty})</li>)}
              </ul>
            </section>
          )}
          <section aria-labelledby="guidance-heading">
            <h2 id="guidance-heading" className="text-sm font-semibold">
              Panduan amaliah
            </h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <GuidanceCard title="Mandi wajib" text={result.guidance.bath} />
              <GuidanceCard
                title="Shalat lima waktu"
                text={result.guidance.prayer}
              />
              <GuidanceCard
                title="Puasa & qadha"
                text={result.guidance.fasting}
              />
              <GuidanceCard
                title="Hubungan suami-istri"
                text={result.guidance.intimacy}
              />
            </div>
          </section>
          <section aria-labelledby="source-heading">
            <h2 id="source-heading" className="text-sm font-semibold">
              Rujukan yang digunakan cabang analisis
            </h2>
            <div className="mt-2 rounded-lg border bg-secondary/20 p-3">
              <p className="text-sm font-semibold text-primary">
                {result.source.book}
              </p>
              <p
                dir="rtl"
                lang="ar"
                className="mt-2 text-right font-serif text-lg leading-relaxed text-foreground"
              >
                {result.source.arabic}
              </p>
              <p className="mt-2 border-t pt-2 text-sm italic leading-snug text-muted-foreground">
                {result.source.translation}
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
      <Alert className="mt-3">
        <Info />
        <AlertDescription>
          Gunakan hasil ini sebagai bahan pemahaman dan diskusi. Untuk kasus
          nyata, bawa kronologi lengkap kepada ahli fikih; untuk perdarahan
          berkepanjangan atau gejala mengkhawatirkan, hubungi tenaga medis.
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onEdit}>
          <ArrowLeft /> Ubah riwayat
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          <RotateCcw /> Mulai kasus baru
        </Button>
      </div>
    </NumberedSection>
  );
}

function ResultRowCard({
  row,
  index,
}: {
  row: AnalysisResult["rows"][number];
  index: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold">
          {index + 1}. {row.label}
        </p>
        <Badge className={cn("shrink-0 border-0", statusStyles[row.status])}>
          {row.displayStatus}
        </Badge>
      </div>
      <p className="mt-2 text-sm">
        {formatJakartaDateTime(row.start)}
        <br />
        sampai {formatJakartaDateTime(row.end)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {(row.durationHours / 24).toFixed(1)} hari ·{" "}
        {row.durationHours.toFixed(1)} jam
      </p>
      <p className="mt-1 border-t pt-1 text-sm">{row.note}</p>
      <p className="mt-1 text-xs text-muted-foreground">{row.certainty} · {row.ruleIds.join(", ")}</p>
    </div>
  );
}

function GuidanceCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">{text}</p>
    </div>
  );
}
