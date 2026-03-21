"use client";

import { useEffect, useState } from "react";
import { FileText, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoverLetterCard } from "@/components/cover-letter/CoverLetterCard";
import { CoverLetterEditor } from "@/components/cover-letter/CoverLetterEditor";
import { coverLettersApi } from "@/lib/api";
import type { CoverLetter } from "@/types";
import { cn } from "@/lib/utils";

export default function CoverLettersPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [selected, setSelected] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoverLetters();
  }, []);

  const loadCoverLetters = async () => {
    try {
      const response = await coverLettersApi.list();
      setCoverLetters(response.data);
    } catch {
      // API not available yet
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-200/50">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
            Cover Letters
          </h1>
        </div>
        <p className="text-muted-foreground ml-[3.25rem]">
          View, edit, and refine your AI-generated cover letters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: Cover letter list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Library
            </h2>
            {coverLetters.length > 0 && (
              <span className="text-xs font-medium text-muted-foreground bg-gray-100 rounded-full px-2.5 py-0.5">
                {coverLetters.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border border-dashed bg-gray-50/50 animate-pulse"
                />
              ))}
            </div>
          ) : coverLetters.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 mx-auto mb-4">
                  <FileText className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600">No cover letters yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                  Run an analysis to generate your first AI-powered cover letter
                </p>
              </CardContent>
            </Card>
          ) : (
            coverLetters.map((cl) => (
              <div
                key={cl.id}
                className={cn(
                  "cursor-pointer rounded-xl transition-all duration-200",
                  selected?.id === cl.id
                    ? "ring-2 ring-violet-500 ring-offset-2"
                    : "hover:shadow-md"
                )}
                onClick={() => setSelected(cl)}
              >
                <CoverLetterCard
                  coverLetter={cl}
                  onClick={() => setSelected(cl)}
                />
              </div>
            ))
          )}
        </div>

        {/* Right panel: Editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="border-b bg-gray-50/50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-violet-500" />
                    <CardTitle className="text-lg font-semibold">
                      Cover Letter Editor
                    </CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Version {selected.version}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CoverLetterEditor initialContent={selected.content} />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-50 mb-4">
                  <PenLine className="h-8 w-8 text-violet-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">
                  Select a cover letter
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Choose a cover letter from the library to view and edit it in the editor
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
