import type { ReactNode, Ref } from "react";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ValidationIssue } from "@/lib/fiqh-engine";

export function NumberedSection({
  number,
  title,
  description,
  sectionRef,
  children,
}: {
  number: number;
  title: string;
  description: string;
  sectionRef?: Ref<HTMLElement>;
  children: ReactNode;
}) {
  const titleId = `section-${number}-title`;
  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="scroll-mt-4 outline-none"
    >
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Badge className="grid size-7 shrink-0 place-items-center rounded-full p-0 text-xs">
              {number}
            </Badge>
            <div>
              <CardTitle id={titleId} className="text-base">
                {title}
              </CardTitle>
              <CardDescription className="mt-1 text-xs leading-snug">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function IssueList({ issues }: { issues: ValidationIssue[] }) {
  if (!issues.length) return null;
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>Periksa kembali data berikut</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-4">
          {issues.map((issue, index) => (
            <li key={`${issue.message}-${index}`}>{issue.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
