"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  parse_job: "Parse Job Posting",
  parse_cv: "Parse CV",
  analyze_match: "Analyze Match",
  identify_gaps: "Identify Gaps",
  generate_cover_letter: "Generate Cover Letter",
  reflect: "Quality Check",
  compile_report: "Compile Report",
};

interface StepCardProps {
  name: string;
  status: string;
  message?: string;
  durationMs?: number;
  outputSummary?: string;
}

export function StepCard({ name, status, message, durationMs, outputSummary }: StepCardProps) {
  const label = STEP_LABELS[name] || name;

  const StatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/40" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        status === "running" && "border-blue-200 bg-blue-50",
        status === "completed" && "border-green-200 bg-green-50/50",
        status === "failed" && "border-red-200 bg-red-50/50",
        status === "pending" && "opacity-50"
      )}
    >
      <StatusIcon />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {(message || outputSummary) && (
          <p className="text-xs text-muted-foreground truncate">
            {outputSummary || message}
          </p>
        )}
      </div>
      {durationMs !== undefined && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {(durationMs / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  );
}
