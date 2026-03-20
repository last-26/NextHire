"use client";

import { ApplicationCard } from "./ApplicationCard";
import type { Application, ApplicationStatus } from "@/types";

interface ColumnProps {
  title: string;
  status: ApplicationStatus;
  applications: Application[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

export function Column({ title, status, applications, onStatusChange }: ColumnProps) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {applications.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[200px] rounded-lg bg-muted/50 p-2">
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No applications
          </p>
        )}
      </div>
    </div>
  );
}
