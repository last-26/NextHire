"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Target,
  Mail,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreCard } from "@/components/analysis/ScoreCard";
import { dashboardApi } from "@/lib/api";
import type { JobAnalysis } from "@/types";

interface DashboardStats {
  analyses_count: number;
  applications_count: number;
  cover_letters_count: number;
  cvs_parsed_count: number;
  avg_score: number;
}

const statCards = [
  {
    label: "Analyses Run",
    key: "analyses_count" as const,
    icon: Target,
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    label: "Applications",
    key: "applications_count" as const,
    icon: Briefcase,
    gradient: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    label: "Cover Letters",
    key: "cover_letters_count" as const,
    icon: Mail,
    gradient: "from-violet-500 to-violet-600",
    lightBg: "bg-violet-50",
    textColor: "text-violet-700",
  },
  {
    label: "CVs Parsed",
    key: "cvs_parsed_count" as const,
    icon: FileText,
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    textColor: "text-amber-700",
  },
];

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%] animate-shimmer ${className ?? ""}`}
    />
  );
}

function getScoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "destructive";
}

function getScoreBgClass(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<JobAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, analysesRes] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.recentAnalyses(5),
        ]);
        setStats(statsRes.data);
        setRecentAnalyses(analysesRes.data);
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasData = !loading && recentAnalyses.length > 0;
  const isEmpty = !loading && recentAnalyses.length === 0;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[0.95rem]">
            Track your job applications and analysis insights at a glance.
          </p>
        </div>
        <Link href="/analyze">
          <Button size="lg" className="gap-2 shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card
            key={stat.label}
            className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  {loading ? (
                    <ShimmerBlock className="h-9 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold tracking-tight">
                      {stats?.[stat.key] ?? 0}
                    </p>
                  )}
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
            {/* Decorative bottom gradient bar */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />
          </Card>
        ))}
      </div>

      {/* Main Content: Score + Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average ATS Score */}
        <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Average ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pb-6 pt-2">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <ShimmerBlock className="h-32 w-32 rounded-full" />
                <ShimmerBlock className="h-4 w-20" />
              </div>
            ) : (
              <>
                <ScoreCard
                  score={stats?.avg_score ?? 0}
                  label="Avg. Score"
                />
                {(stats?.avg_score ?? 0) > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground text-center max-w-[200px]">
                    Based on {stats?.analyses_count ?? 0} analysis{(stats?.analyses_count ?? 0) !== 1 ? "es" : ""}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card className="lg:col-span-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Recent Analyses</CardTitle>
            {hasData && (
              <Link
                href="/analyze"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border"
                  >
                    <div className="space-y-2 flex-1">
                      <ShimmerBlock className="h-4 w-48" />
                      <ShimmerBlock className="h-3 w-32" />
                    </div>
                    <ShimmerBlock className="h-6 w-14 rounded-full ml-4" />
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {recentAnalyses.map((analysis, i) => (
                  <AnalysisRow key={analysis.id} analysis={analysis} index={i} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalysisRow({
  analysis,
  index,
}: {
  analysis: JobAnalysis;
  index: number;
}) {
  const score = Math.round(analysis.overall_score ?? 0);
  const scoreBg = getScoreBgClass(score);
  const matchedCount = analysis.match_result?.keyword_match?.matched?.length;

  return (
    <div
      className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-transparent bg-muted/30 hover:bg-muted/60 hover:border-border transition-all duration-200 cursor-default"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
          {analysis.job_title || "Untitled Position"}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground truncate">
            {analysis.company_name || "Unknown Company"}
          </span>
          <span className="text-muted-foreground/40 text-xs">|</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(analysis.created_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {matchedCount != null && matchedCount > 0 && (
          <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
            <Target className="h-3 w-3" />
            {matchedCount} matched
          </span>
        )}
        <Badge className={`${scoreBg} font-bold tabular-nums min-w-[3rem] justify-center`} variant="secondary">
          {score}%
        </Badge>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/[0.02] to-violet-500/[0.02] p-8">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-2xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/25 mb-4">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold">Run your first analysis</h3>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
          Upload your CV and paste a job description to get an ATS compatibility
          score, gap analysis, and a personalized cover letter.
        </p>
        <Link href="/analyze" className="mt-5">
          <Button className="gap-2 shadow-md shadow-primary/20">
            <Target className="h-4 w-4" />
            Start Analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
