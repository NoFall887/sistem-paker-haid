import type { Ref } from "react";
import {
  ClipboardCopy,
  Download,
  Droplets,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { colors, consistencies, odors, origins } from "@/components/analysis/analysis-options";
import { NumberedSection } from "@/components/analysis/analysis-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  BloodColor,
  BloodConsistency,
  BloodOdor,
  BloodOrigin,
  BloodSegmentInput,
  CaseInput,
  ValidationIssue,
} from "@/lib/fiqh-engine";
import { cn } from "@/lib/utils";

export function TimelineSection({
  sectionRef,
  input,
  issues,
  saveState,
  onUpdateSegment,
  onAddSegment,
  onRemoveSegment,
  onCopyJson,
  onExportText,
  onClear,
}: {
  sectionRef: Ref<HTMLElement>;
  input: CaseInput;
  issues: ValidationIssue[];
  saveState: "saved" | "saving" | "error";
  onUpdateSegment: <K extends keyof BloodSegmentInput>(
    id: string,
    field: K,
    value: BloodSegmentInput[K],
  ) => void;
  onAddSegment: () => void;
  onRemoveSegment: (id: string) => void;
  onCopyJson: () => void;
  onExportText: () => void;
  onClear: () => void;
}) {
  return (
    <NumberedSection
      number={3}
      title="Masukkan riwayat darah"
      description="Buat segmen baru setiap kali darah berhenti atau warna dan sifatnya berubah. Semua waktu memakai Asia/Jakarta."
      sectionRef={sectionRef}
    >
      <Alert className="mb-3 border-primary/20 bg-card">
        <Save />
        <AlertTitle>
          {saveState === "saving"
            ? "Menyimpan…"
            : saveState === "error"
              ? "Penyimpanan lokal gagal"
              : "Tersimpan otomatis di browser ini"}
        </AlertTitle>
        <AlertDescription>
          Data tidak dikirim ke server. Pada perangkat bersama, kosongkan
          riwayat setelah selesai.
        </AlertDescription>
      </Alert>
      <div className="overflow-hidden rounded-lg border bg-card">
        {!!input.segments.length && (
          <div className="hidden grid-cols-[2rem_minmax(10rem,1.2fr)_minmax(10rem,1.2fr)_minmax(7rem,.8fr)_minmax(6rem,.65fr)_minmax(7rem,.8fr)_minmax(8rem,.85fr)_4rem] items-center gap-2 border-b bg-muted/60 px-2 py-1.5 text-xs font-medium text-muted-foreground xl:grid">
            <span>No.</span>
            <span>Mulai keluar</span>
            <span>Berhenti / mampet</span>
            <span>Warna</span>
            <span>Sifat</span>
            <span>Aroma</span>
            <span>Asal</span>
            <span className="text-right">Aksi</span>
          </div>
        )}
        <div className="divide-y">
          {input.segments.map((segment, index) => (
            <BloodSegmentRow
              key={segment.id}
              segment={segment}
              index={index}
              issue={
                issues.find((issue) => issue.segmentId === segment.id)?.message
              }
              onUpdate={onUpdateSegment}
              onRemove={() => onRemoveSegment(segment.id)}
            />
          ))}
        </div>
        {!input.segments.length && (
          <div className="m-2 rounded-md border border-dashed py-5 text-center">
            <Droplets className="mx-auto mb-2 size-7 text-primary/60" />
            <p className="text-sm font-medium">Belum ada riwayat darah</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mulai dengan satu periode darah yang Anda catat.
            </p>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className="mt-3 w-full border-primary/30 text-primary sm:w-auto"
        onClick={onAddSegment}
      >
        <Plus /> Tambah segmen darah
      </Button>
      <div className="mt-4 grid gap-2 rounded-lg border bg-card p-3 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Kelola riwayat lokal</p>
          <p className="text-xs text-muted-foreground">
            Salin sebagai JSON, unduh teks, atau kosongkan data browser.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" onClick={onCopyJson}>
            <ClipboardCopy /> Salin JSON
          </Button>
          <Button variant="outline" onClick={onExportText}>
            <Download /> Ekspor TXT
          </Button>
          <ClearHistoryDialog onClear={onClear} />
        </div>
      </div>
    </NumberedSection>
  );
}

function BloodSegmentRow({
  segment,
  index,
  issue,
  onUpdate,
  onRemove,
}: {
  segment: BloodSegmentInput;
  index: number;
  issue?: string;
  onUpdate: <K extends keyof BloodSegmentInput>(
    id: string,
    field: K,
    value: BloodSegmentInput[K],
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div
      aria-invalid={Boolean(issue)}
      className={cn(
        "grid grid-cols-2 gap-2 p-2 xl:grid-cols-[2rem_minmax(10rem,1.2fr)_minmax(10rem,1.2fr)_minmax(7rem,.8fr)_minmax(6rem,.65fr)_minmax(7rem,.8fr)_minmax(8rem,.85fr)_4rem] xl:items-end",
        issue && "bg-destructive/5",
      )}
    >
      <div className="flex min-h-9 items-center xl:col-start-1 xl:row-start-1 xl:p-1 xl:justify-center">
        <span className="xl:text-xs text-sm font-semibold xl:hidden">
          Segmen {index + 1}
        </span>
        <span className="hidden text-sm font-medium xl:inline">
          {index + 1}
        </span>
      </div>
      <div className="flex min-h-9 items-center justify-end gap-1 xl:col-start-8 xl:row-start-1">
        {issue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label={`Kesalahan segmen ${index + 1}: ${issue}`}
              >
                <TriangleAlert />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{issue}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={`Hapus segmen ${index + 1}`}
              onClick={onRemove}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hapus segmen {index + 1}</TooltipContent>
        </Tooltip>
      </div>
      <div className="min-w-0 space-y-1 xl:col-start-2 xl:row-start-1 xl:space-y-0">
        <Label className="text-xs xl:sr-only" htmlFor={`${segment.id}-start`}>
          Mulai keluar
        </Label>
        <Input
          id={`${segment.id}-start`}
          type="datetime-local"
          value={segment.start}
          aria-invalid={Boolean(issue)}
          onChange={(event) =>
            onUpdate(segment.id, "start", event.target.value)
          }
        />
      </div>
      <div className="min-w-0 space-y-1 xl:col-start-3 xl:row-start-1 xl:space-y-0">
        <Label className="text-xs xl:sr-only" htmlFor={`${segment.id}-end`}>
          Berhenti / mampet
        </Label>
        <Input
          id={`${segment.id}-end`}
          type="datetime-local"
          value={segment.end}
          aria-invalid={Boolean(issue)}
          onChange={(event) => onUpdate(segment.id, "end", event.target.value)}
        />
      </div>
      <div className="min-w-0 space-y-1 xl:col-start-4 xl:row-start-1 xl:space-y-0">
        <Label className="text-xs xl:sr-only" htmlFor={`${segment.id}-color`}>
          Warna darah
        </Label>
        <Select
          value={segment.color}
          onValueChange={(value) =>
            onUpdate(segment.id, "color", value as BloodColor)
          }
        >
          <SelectTrigger id={`${segment.id}-color`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {colors.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0 space-y-1 xl:col-start-5 xl:row-start-1 xl:space-y-0">
        <Label
          className="text-xs xl:sr-only"
          htmlFor={`${segment.id}-consistency`}
        >
          Sifat darah
        </Label>
        <Select
          value={segment.consistency}
          onValueChange={(value) =>
            onUpdate(segment.id, "consistency", value as BloodConsistency)
          }
        >
          <SelectTrigger id={`${segment.id}-consistency`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {consistencies.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0 space-y-1 xl:col-start-6 xl:row-start-1 xl:space-y-0">
        <Label className="text-xs xl:sr-only" htmlFor={`${segment.id}-odor`}>Aroma</Label>
        <Select value={segment.odor ?? "TIDAK_BERAROMA"} onValueChange={(value) => onUpdate(segment.id, "odor", value as BloodOdor)}>
          <SelectTrigger id={`${segment.id}-odor`} className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{odors.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="min-w-0 space-y-1 xl:col-start-7 xl:row-start-1 xl:space-y-0">
        <Label className="text-xs xl:sr-only" htmlFor={`${segment.id}-origin`}>Asal darah</Label>
        <Select value={segment.origin ?? "ALAMI"} onValueChange={(value) => onUpdate(segment.id, "origin", value as BloodOrigin)}>
          <SelectTrigger id={`${segment.id}-origin`} className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{origins.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ClearHistoryDialog({ onClear }: { onClear: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="col-span-2 text-destructive sm:col-span-1"
        >
          <Trash2 /> Kosongkan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kosongkan seluruh riwayat?</DialogTitle>
          <DialogDescription>
            Profil, kebiasaan, dan semua segmen darah akan dihapus dari browser
            ini. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onClear}>
              Ya, kosongkan
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
