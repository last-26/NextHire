"use client";

import { useState, useRef } from "react";
import { Upload, Link, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentStream } from "@/components/agent/AgentStream";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import { analysisApi } from "@/lib/api";
import type { AgentStep, JobAnalysis } from "@/types";

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!jobDescription || !cvFile) return;

    setIsRunning(true);
    setError(null);
    setSteps([]);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("cv_file", cvFile);
    if (jobUrl) formData.append("job_url", jobUrl);

    try {
      const response = await analysisApi.analyze(formData);
      setAnalysis(response.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyze</h1>
        <p className="text-muted-foreground mt-1">
          Upload your CV and paste a job description to get AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                placeholder="Job posting URL (optional)"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="flex-1 text-sm rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full min-h-[300px] rounded-md border bg-background p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your CV</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              {cvFile ? (
                <div>
                  <p className="font-medium text-sm">{cvFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(cvFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-sm">Click to upload CV</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or DOCX (max 10MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            <Button
              onClick={handleAnalyze}
              disabled={!jobDescription || !cvFile || isRunning}
              className="w-full mt-4"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>

            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Stream */}
      {(isRunning || steps.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agent Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentStream steps={steps} isRunning={isRunning} />
          </CardContent>
        </Card>
      )}

      {/* Analysis Report */}
      {analysis && <AnalysisReport analysis={analysis} />}
    </div>
  );
}
