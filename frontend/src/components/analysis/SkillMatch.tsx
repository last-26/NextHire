"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface SkillMatchProps {
  matched: string[];
  missing: string[];
}

export function SkillMatch({ matched, missing }: SkillMatchProps) {
  return (
    <div className="space-y-6">
      {/* Matched Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Matched Skills
          </h4>
          <span className="ml-auto text-xs font-medium tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            {matched.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {matched.length > 0 ? (
            matched.map((skill) => (
              <Badge
                key={skill}
                variant="success"
                className="gap-1.5 pl-1.5 pr-2.5 py-1 text-xs font-medium border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" />
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-xs italic text-muted-foreground/60">
              No matching skills detected
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed" />

      {/* Missing Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Missing Skills
          </h4>
          <span className="ml-auto text-xs font-medium tabular-nums text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
            {missing.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {missing.length > 0 ? (
            missing.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="gap-1.5 pl-1.5 pr-2.5 py-1 text-xs font-medium border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <XCircle className="h-3 w-3" />
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-xs italic text-muted-foreground/60">
              No missing skills -- great match!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
