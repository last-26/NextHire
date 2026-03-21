"use client";

import { CheckCircle2, Circle, Loader2, XCircle, Clock } from "lucide-react";
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

const STEP_DESCRIPTIONS: Record<string, string> = {
  parse_job: "Extracting requirements and skills from the job posting",
  parse_cv: "Analyzing your CV for skills, experience, and qualifications",
  analyze_match: "Computing semantic similarity and keyword overlap",
  identify_gaps: "Finding missing skills and improvement opportunities",
  generate_cover_letter: "Crafting a personalized cover letter",
  reflect: "Evaluating output quality and coherence",
  compile_report: "Assembling the final analysis report",
};

interface StepCardProps {
  name: string;
  status: string;
  message?: string;
  durationMs?: number;
  outputSummary?: string;
  stepNumber?: number;
}

export function StepCard({
  name,
  status,
  message,
  durationMs,
  outputSummary,
  stepNumber,
}: StepCardProps) {
  const label = STEP_LABELS[name] || name;
  const description = STEP_DESCRIPTIONS[name] || "";

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-300",
        status === "running" &&
          "border-blue-200/80 bg-blue-50/60 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]",
        status === "completed" &&
          "border-l-[3px] border-l-green-500 border-t-transparent border-r-transparent border-b-transparent bg-white",
        status === "failed" &&
          "border-l-[3px] border-l-red-500 border-t-transparent border-r-transparent border-b-transparent bg-red-50/30",
        status === "pending" && "border-dashed border-gray-200 bg-gray-50/30 opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5 flex-shrink-0">
          {status === "completed" && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {status === "running" && (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          )}
          {status === "failed" && (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          {status === "pending" && (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {stepNumber && (
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  status === "completed" && "bg-green-100 text-green-700",
                  status === "running" && "bg-blue-100 text-blue-700",
                  status === "failed" && "bg-red-100 text-red-700",
                  status === "pending" && "bg-gray-100 text-gray-400"
                )}
              >
                {stepNumber}
              </span>
            )}
            <h4
              className={cn(
                "font-semibold text-sm",
                status === "pending" && "text-gray-400",
                status === "running" && "text-blue-700",
                status === "completed" && "text-gray-800",
                status === "failed" && "text-red-700"
              )}
            >
              {label}
            </h4>
          </div>

          <p
            className={cn(
              "text-xs mt-1 leading-relaxed",
              status === "pending"
                ? "text-gray-400"
                : "text-muted-foreground"
            )}
          >
            {outputSummary || message || description}
          </p>
        </div>

        {/* Duration badge */}
        {durationMs !== undefined && (
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 flex-shrink-0">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {(durationMs / 1000).toFixed(1)}s
            </span>
          </div>
        )}
      </div>

      {/* Running shimmer effect */}
      {status === "running" && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-100/40 to-transparent" />
        </div>
      )}
    </div>
  );
}
