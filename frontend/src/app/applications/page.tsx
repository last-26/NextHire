"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Board } from "@/components/kanban/Board";
import { applicationsApi } from "@/lib/api";
import type { Application, ApplicationStatus } from "@/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await applicationsApi.list();
      setApplications(response.data);
    } catch {
      // API not available yet
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await applicationsApi.update(id, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch {
      // Handle error
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track your job applications
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <Board applications={applications} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
