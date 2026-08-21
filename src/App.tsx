import { useEffect, useMemo, useRef, useState } from "react";
import { Info } from "lucide-react";

import { EducationView } from "@/components/analysis/education-view";
import { HabitSection } from "@/components/analysis/habit-section";
import { profiles } from "@/components/analysis/analysis-options";
import { ProfileSection } from "@/components/analysis/profile-section";
import { ResultsSection } from "@/components/analysis/results-section";
import { ReviewSection } from "@/components/analysis/review-section";
import { TimelineSection } from "@/components/analysis/timeline-section";
import { AppHeader } from "@/components/app-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  analyzeCase,
  createEmptySegment,
  emptyCase,
  type AnalysisResult,
  type BloodSegmentInput,
  type CaseInput,
  type ValidationIssue,
} from "@/lib/fiqh-engine";
import {
  clearHistory,
  copyHistoryJson,
  downloadHistoryText,
  loadHistory,
  saveHistory,
} from "@/lib/history";

type View = "form" | "education";

function initialCase() {
  try {
    return loadHistory() ?? emptyCase();
  } catch {
    return emptyCase();
  }
}

function scrollTo(target: { current: HTMLElement | null }) {
  window.requestAnimationFrame(() => {
    target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    target.current?.focus({ preventScroll: true });
  });
}

export default function App() {
  const [view, setView] = useState<View>("form");
  const [caseInput, setCaseInput] = useState<CaseInput>(initialCase);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [actionMessage, setActionMessage] = useState("");
  const skipNextSave = useRef(false);
  const profileRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const validationRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const educationHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      try {
        saveHistory(caseInput);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [caseInput]);

  useEffect(() => {
    if (result) scrollTo(resultRef);
  }, [result]);

  const selectedProfile = profiles.find(
    (profile) => profile.value === caseInput.userStatus,
  );
  const orderedSegments = useMemo(
    () =>
      caseInput.segments
        .filter((segment) => segment.start && segment.end)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [caseInput.segments],
  );

  const updateCase = (patch: Partial<CaseInput>) => {
    setCaseInput((current) => ({ ...current, ...patch }));
    setSaveState("saving");
    setIssues([]);
    setResult(null);
  };
  const updateSegment = <K extends keyof BloodSegmentInput>(
    id: string,
    field: K,
    value: BloodSegmentInput[K],
  ) => {
    updateCase({
      segments: caseInput.segments.map((segment) =>
        segment.id === id ? { ...segment, [field]: value } : segment,
      ),
    });
  };
  const addSegment = () =>
    updateCase({ segments: [...caseInput.segments, createEmptySegment()] });
  const removeSegment = (id: string) =>
    updateCase({
      segments: caseInput.segments.filter((segment) => segment.id !== id),
    });
  const runAnalysis = () => {
    const analysis = analyzeCase(caseInput);
    setIssues(analysis.issues);
    if (analysis.result) {
      setResult(analysis.result);
    } else {
      setResult(null);
      window.requestAnimationFrame(() => {
        validationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        validationRef.current?.focus({ preventScroll: true });
      });
    }
  };
  const copyJson = async () => {
    try {
      await copyHistoryJson(caseInput);
      setActionMessage("JSON riwayat berhasil disalin.");
    } catch {
      setActionMessage(
        "JSON tidak dapat disalin. Periksa izin clipboard browser.",
      );
    }
  };
  const exportText = () => {
    try {
      downloadHistoryText(caseInput);
      setActionMessage("File teks riwayat berhasil dibuat.");
    } catch {
      setActionMessage("File teks tidak dapat dibuat oleh browser ini.");
    }
  };
  const resetHistory = () => {
    skipNextSave.current = true;
    clearHistory();
    setCaseInput(emptyCase());
    setIssues([]);
    setResult(null);
    setView("form");
    setSaveState("saved");
    setActionMessage("Riwayat lokal telah dikosongkan.");
    scrollTo(profileRef);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        onHome={() => {
          setView("form");
          scrollTo(profileRef);
        }}
        onEducation={() => setView("education")}
      />

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-5">
        {actionMessage && (
          <Alert className="mb-3 border-primary/25 bg-secondary/60">
            <Info />
            <AlertDescription>{actionMessage}</AlertDescription>
          </Alert>
        )}
        {view === "form" ? (
          <div className="space-y-4">
            <div className="max-w-3xl">
              <h1 className="text-xl font-bold tracking-tight">
                Analisis riwayat darah
              </h1>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                Lengkapi bagian berikut secara berurutan. Ringkasan akan
                diperbarui langsung sebelum analisis dijalankan.
              </p>
            </div>
            <ProfileSection
              sectionRef={profileRef}
              value={caseInput.userStatus}
              onSelect={(userStatus) => updateCase({ userStatus })}
            />
            <HabitSection
              input={caseInput}
              profile={selectedProfile?.title}
              onUpdate={updateCase}
            />
            <TimelineSection
              sectionRef={timelineRef}
              input={caseInput}
              issues={issues}
              saveState={saveState}
              onUpdateSegment={updateSegment}
              onAddSegment={addSegment}
              onRemoveSegment={removeSegment}
              onCopyJson={copyJson}
              onExportText={exportText}
              onClear={resetHistory}
            />
            <ReviewSection
              input={caseInput}
              profile={selectedProfile?.title ?? "Belum dipilih"}
              segments={orderedSegments}
              issues={issues}
              validationRef={validationRef}
              onAnalyze={runAnalysis}
            />
            {result && (
              <ResultsSection
                result={result}
                sectionRef={resultRef}
                onEdit={() => scrollTo(timelineRef)}
                onRestart={resetHistory}
              />
            )}
          </div>
        ) : (
          <EducationView
            headingRef={educationHeadingRef}
            onBack={() => setView("form")}
          />
        )}
      </main>
    </div>
  );
}
