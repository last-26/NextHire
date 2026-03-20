"use client";

import { Badge } from "@/components/ui/badge";
import type { Application } from "@/types";

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const priorityColors: Record<string, "default" | "warning" | "destructive"> = {
    low: "default",
    medium: "warning",
    high: "destructive",
  };

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{application.position_title}</p>
          <p className="text-xs text-muted-foreground truncate">{application.company_name}</p>
        </div>
        <Badge variant={priorityColors[application.priority] || "default"} className="text-[10px]">
          {application.priority}
        </Badge>
      </div>

      {application.match_score !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${application.match_score}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {Math.round(application.match_score)}%
          </span>
        </div>
      )}
    </div>
  );
}
