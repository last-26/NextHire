"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoverLetterCard } from "@/components/cover-letter/CoverLetterCard";
import { CoverLetterEditor } from "@/components/cover-letter/CoverLetterEditor";
import { coverLettersApi } from "@/lib/api";
import type { CoverLetter } from "@/types";

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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cover Letters</h1>
        <p className="text-muted-foreground mt-1">
          View and edit your generated cover letters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : coverLetters.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No cover letters yet.</p>
                <p className="text-sm mt-1">Run an analysis to generate one.</p>
              </CardContent>
            </Card>
          ) : (
            coverLetters.map((cl) => (
              <CoverLetterCard
                key={cl.id}
                coverLetter={cl}
                onClick={() => setSelected(cl)}
              />
            ))
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cover Letter Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <CoverLetterEditor initialContent={selected.content} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Select a cover letter to edit
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
