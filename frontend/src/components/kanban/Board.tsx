"use client";

import { useState } from "react";
import { Column } from "./Column";
import type { Application, ApplicationStatus } from "@/types";

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
];

interface BoardProps {
  applications: Application[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

export function Board({ applications, onStatusChange }: BoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          title={column.label}
          status={column.id}
          applications={applications.filter((app) => app.status === column.id)}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
