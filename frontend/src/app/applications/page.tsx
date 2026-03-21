"use client";

import { useEffect, useState } from "react";
import { Plus, Briefcase, LayoutGrid } from "lucide-react";
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
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Applications
            </h1>
          </div>
          <p className="text-muted-foreground ml-[3.25rem]">
            Track and manage your job applications across every stage
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-200/50 transition-all hover:shadow-indigo-300/50 gap-2">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-muted-foreground">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 mb-6">
            <Briefcase className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No applications yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Start tracking your job applications by adding your first one.
            Run an analysis to automatically create an application entry.
          </p>
          <Button
            variant="outline"
            className="gap-2 border-dashed border-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Application
          </Button>
        </div>
      ) : (
        <Board applications={applications} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
