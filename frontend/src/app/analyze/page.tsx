"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Link, Loader2, Sparkles, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentStream } from "@/components/agent/AgentStream";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import { streamAnalysis } from "@/lib/sse";
import type { AgentStep, JobAnalysis } from "@/types";

const AGENT_STEPS = [
  "parse_job",
  "parse_cv",
  "analyze_match",
  "identify_gaps",
  "generate_cover_letter",
  "reflect",
  "compile_report",
];

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      abortRef.current?.abort();
    };
  }, [stopTimer]);

  const handleAnalyze = () => {
    if (!jobDescription || !cvFile) return;

    setIsRunning(true);
    setError(null);
    setSteps([]);
    setAnalysis(null);
    setElapsedTime(0);

    // Start elapsed timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Mark the first step as running immediately
    setSteps([{ step: AGENT_STEPS[0], status: "running", message: "Starting pipeline..." }]);

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("cv_file", cvFile);
    if (jobUrl) formData.append("job_url", jobUrl);

    abortRef.current = streamAnalysis(formData, {
      onStep: (event) => {
        setSteps((prev) => {
          // Mark the completed step
          const updated = prev.map((s) =>
            s.step === event.step
              ? { ...s, status: "completed" as const, duration_ms: event.duration_ms, output_summary: event.output_summary }
              : s
          );

          // Find the next step and mark it as running
          const completedIdx = AGENT_STEPS.indexOf(event.step);
          const nextStep = AGENT_STEPS[completedIdx + 1];
          if (nextStep && !updated.find((s) => s.step === nextStep)) {
            updated.push({ step: nextStep, status: "running", message: `Processing ${nextStep}...` });
          }

          return updated;
        });
      },

      onComplete: (data) => {
        stopTimer();
        // Ensure all steps show as completed
        setSteps((prev) =>
          AGENT_STEPS.map((stepName) => {
            const existing = prev.find((s) => s.step === stepName);
            return existing
              ? { ...existing, status: "completed" as const }
              : { step: stepName, status: "completed" as const };
          })
        );
        setAnalysis(data.analysis);
        setIsRunning(false);
      },

      onError: (errorMsg) => {
        stopTimer();
        setError(errorMsg);
        setSteps((prev) =>
          prev.map((s) => (s.status === "running" ? { ...s, status: "failed" as const } : s))
        );
        setIsRunning(false);
      },
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc"))) {
      setCvFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatElapsed = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const canRun = jobDescription.trim().length > 0 && cvFile !== null && !isRunning;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Analyze</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Upload your CV and paste a job description to get AI-powered compatibility analysis,
          gap detection, and a personalized cover letter.
        </p>
      </div>

      {/* Two-Column Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Job Description */}
        <Card className="card-hover border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <FileText className="h-4 w-4 text-indigo-500" />
              </div>
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job URL Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Link className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <input
                type="url"
                placeholder="Job posting URL (optional)"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full rounded-lg border border-border/80 bg-background py-2.5 pl-10 pr-4 text-sm
                  placeholder:text-muted-foreground/50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              />
            </div>

            {/* Job Description Textarea */}
            <textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full min-h-[380px] rounded-lg border border-border/80 bg-background p-4 text-sm
                leading-relaxed resize-y
                placeholder:text-muted-foreground/50
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />

            {/* Character count hint */}
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground/60">
                {jobDescription.length > 0
                  ? `${jobDescription.length.toLocaleString()} characters`
                  : "Paste the job posting text above"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: CV Upload + Run Button */}
        <div className="space-y-6">
          <Card className="card-hover border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                  <Upload className="h-4 w-4 text-indigo-500" />
                </div>
                Your CV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative group cursor-pointer rounded-xl border-2 border-dashed p-10
                  transition-all duration-300 ease-in-out
                  ${isDragOver
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 scale-[1.01]"
                    : cvFile
                      ? "border-indigo-500/40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
                      : "border-border/80 hover:border-indigo-500/40 hover:bg-gradient-to-br hover:from-indigo-500/5 hover:to-purple-500/5"
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  {cvFile ? (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/15 mb-4">
                        <FileText className="h-7 w-7 text-indigo-500" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">{cvFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatFileSize(cvFile.size)}
                      </p>
                      <p className="text-xs text-indigo-500/70 mt-3 group-hover:text-indigo-500 transition-colors">
                        Click or drop to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <div className={`
                        flex h-14 w-14 items-center justify-center rounded-full mb-4
                        transition-all duration-300
                        ${isDragOver
                          ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                          : "bg-muted/60 group-hover:bg-gradient-to-br group-hover:from-indigo-500/10 group-hover:to-purple-500/10"
                        }
                      `}>
                        <Upload className={`
                          h-7 w-7 transition-colors duration-300
                          ${isDragOver
                            ? "text-indigo-500"
                            : "text-muted-foreground/60 group-hover:text-indigo-500/70"
                          }
                        `} />
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        Drop your CV here, or{" "}
                        <span className="text-indigo-500">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5">
                        Supports PDF, DOCX, and DOC (max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Run Analysis Button */}
          <button
            onClick={handleAnalyze}
            disabled={!canRun}
            className={`
              w-full relative flex items-center justify-center gap-2.5 rounded-xl px-6 py-4
              text-base font-semibold text-white
              transition-all duration-300 ease-in-out
              ${canRun
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]"
                : isRunning
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600/40 to-purple-600/40 opacity-50 cursor-not-allowed"
              }
            `}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Run Analysis
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/30 bg-destructive/5 shadow-sm animate-slide-up">
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <span className="text-destructive text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                    <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Agent Pipeline Section — always mounted, hidden when inactive */}
      <div
        key="agent-pipeline"
        className={`transition-all duration-500 ${
          isRunning || steps.length > 0
            ? "opacity-100"
            : "hidden"
        }`}
      >
        <Card
          className={`
            shadow-sm transition-all duration-500
            ${isRunning
              ? "border-indigo-500/30 shadow-[0_0_20px_-6px_hsl(245,58%,51%,0.15)]"
              : "border-border/60"
            }
          `}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300
                  ${isRunning
                    ? "bg-gradient-to-br from-indigo-500/15 to-purple-500/15 animate-pulse-gentle"
                    : "bg-green-100"
                  }
                `}>
                  <Sparkles className={`h-4 w-4 transition-colors duration-300 ${isRunning ? "text-indigo-500" : "text-green-600"}`} />
                </div>
                <span>Agent Pipeline</span>
                {isRunning ? (
                  <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Live
                  </span>
                ) : steps.length > 0 && steps.every((s) => s.status === "completed") ? (
                  <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                    Complete
                  </span>
                ) : null}
              </div>
              {(isRunning || elapsedTime > 0) && (
                <span className="text-sm font-mono text-muted-foreground tabular-nums">
                  {formatElapsed(elapsedTime)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AgentStream steps={steps} isRunning={isRunning} />
          </CardContent>
        </Card>
      </div>

      {/* Analysis Report — always mounted, hidden when no data */}
      <div
        key="analysis-report"
        className={analysis ? "opacity-100" : "hidden"}
      >
        {analysis && <AnalysisReport analysis={analysis} />}
      </div>
    </div>
  );
}
