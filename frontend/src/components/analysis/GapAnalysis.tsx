"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, Zap, TrendingUp } from "lucide-react";
import type { GapAnalysis as GapAnalysisType } from "@/types";

interface GapAnalysisProps {
  data: GapAnalysisType;
}

export function GapAnalysis({ data }: GapAnalysisProps) {
  const importanceBadgeVariant = (importance: string) => {
    switch (importance) {
      case "critical":
        return "destructive";
      case "high":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      {/* Critical Gaps */}
      {data.critical_gaps.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Critical Gaps</h4>
            <span className="text-xs text-muted-foreground">
              ({data.critical_gaps.length})
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.critical_gaps.map((gap, i) => (
              <div
                key={i}
                className="group relative rounded-xl border border-l-4 border-l-red-400 dark:border-l-red-500 bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-l-red-500 dark:hover:border-l-red-400"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-foreground">
                    {gap.skill}
                  </span>
                  <Badge
                    variant={importanceBadgeVariant(gap.importance) as "destructive" | "warning" | "secondary"}
                    className="shrink-0 text-[10px] uppercase tracking-wider"
                  >
                    {gap.importance}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {gap.suggestion}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Gaps */}
      {data.experience_gaps.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Experience Gaps</h4>
            <span className="text-xs text-muted-foreground">
              ({data.experience_gaps.length})
            </span>
          </div>
          <div className="rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 bg-muted/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Area</span>
              <span>Current Level</span>
              <span>Required Level</span>
            </div>
            {/* Rows */}
            {data.experience_gaps.map((gap, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr] gap-4 items-center px-4 py-3 border-t transition-colors hover:bg-muted/30"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {gap.area}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-200 dark:ring-orange-800">
                    {gap.current_level}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-800">
                    {gap.required_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Wins */}
      {data.quick_wins.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Quick Wins</h4>
            <span className="text-xs text-muted-foreground">
              ({data.quick_wins.length})
            </span>
          </div>
          <ol className="space-y-2.5">
            {data.quick_wins.map((win, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground pt-0.5">
                  {win}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Long-term Improvements */}
      {data.long_term_improvements.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Long-term Improvements</h4>
            <span className="text-xs text-muted-foreground">
              ({data.long_term_improvements.length})
            </span>
          </div>
          <ol className="space-y-2.5">
            {data.long_term_improvements.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground pt-0.5">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CV Formatting Tips */}
      {data.cv_formatting_tips && data.cv_formatting_tips.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Lightbulb className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h4 className="text-sm font-bold text-foreground">CV Formatting Tips</h4>
          </div>
          <ul className="space-y-2">
            {data.cv_formatting_tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
