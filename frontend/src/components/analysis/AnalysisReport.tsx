"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Download,
  Loader2,
} from "lucide-react";
import { ScoreCard } from "./ScoreCard";
import { SkillMatch } from "./SkillMatch";
import { GapAnalysis } from "./GapAnalysis";
import { analysisApi } from "@/lib/api";
import type { JobAnalysis } from "@/types";

interface AnalysisReportProps {
  analysis: JobAnalysis;
}

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  const matchResult = analysis.match_result;
  const gapAnalysis = analysis.gap_analysis;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await analysisApi.exportPdf(analysis.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NextHire_${analysis.company_name || "Report"}_${analysis.job_title || "Analysis"}.pdf`.replace(/\s+/g, "_");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — user can retry
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header with Download */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          <span className="gradient-text">Analysis Report</span>
        </h2>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2
            text-sm font-medium text-indigo-600
            transition-all duration-200
            hover:bg-indigo-50 hover:border-indigo-300
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export PDF
        </button>
      </div>

      {/* Top row: Score + Skill Match */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Compatibility Score */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Gradient border top accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
          <CardHeader className="pt-7">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-muted-foreground" />
              ATS Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-8">
            <ScoreCard score={analysis.overall_score || 0} />
            {matchResult && (
              <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-base font-bold text-foreground">
                    {Math.round(matchResult.semantic_score)}%
                  </span>
                  <span>Semantic</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-base font-bold text-foreground">
                    {Math.round(matchResult.keyword_match.match_percentage)}%
                  </span>
                  <span>Keyword</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Match */}
        <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Skill Match</CardTitle>
              {matchResult && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal tabular-nums"
                >
                  {matchResult.keyword_match.matched.length} /{" "}
                  {matchResult.keyword_match.matched.length +
                    matchResult.keyword_match.missing.length}{" "}
                  skills matched
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {matchResult ? (
              <SkillMatch
                matched={matchResult.keyword_match.matched}
                missing={matchResult.keyword_match.missing}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No match data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assessment Section */}
      {matchResult?.llm_analysis && (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-base">Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Assessment */}
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-sm leading-relaxed text-foreground">
                {matchResult.llm_analysis.overall_assessment}
              </p>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Strengths
                  </h4>
                  <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {matchResult.llm_analysis.strengths.length}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {matchResult.llm_analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50/30 dark:bg-red-950/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
                    Weaknesses
                  </h4>
                  <span className="ml-auto text-xs font-medium text-red-600 dark:text-red-400">
                    {matchResult.llm_analysis.weaknesses.length}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {matchResult.llm_analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      <span className="text-sm leading-relaxed text-red-900 dark:text-red-200">
                        {w}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ATS Tips */}
            {matchResult.llm_analysis.ats_tips &&
              matchResult.llm_analysis.ats_tips.length > 0 && (
                <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      ATS Optimization Tips
                    </h4>
                  </div>
                  <ul className="space-y-2.5">
                    {matchResult.llm_analysis.ats_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Gap Analysis */}
      {gapAnalysis && (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GapAnalysis data={gapAnalysis} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
