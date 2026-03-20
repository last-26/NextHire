"use client";

import { AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GapAnalysis as GapAnalysisType } from "@/types";

interface GapAnalysisProps {
  data: GapAnalysisType;
}

export function GapAnalysis({ data }: GapAnalysisProps) {
  return (
    <div className="space-y-6">
      {data.critical_gaps.length > 0 && (
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Critical Gaps
          </h4>
          <div className="space-y-2">
            {data.critical_gaps.map((gap, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{gap.skill}</span>
                  <Badge
                    variant={
                      gap.importance === "critical"
                        ? "destructive"
                        : gap.importance === "high"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {gap.importance}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{gap.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.quick_wins.length > 0 && (
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-500" />
            Quick Wins
          </h4>
          <ul className="space-y-1">
            {data.quick_wins.map((win, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">-</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.long_term_improvements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            Long-term Improvements
          </h4>
          <ul className="space-y-1">
            {data.long_term_improvements.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">-</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
