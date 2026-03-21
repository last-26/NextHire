"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, CheckCircle2, Pause } from "lucide-react";

interface AgentProgressProps {
  progress: number;
  isRunning: boolean;
}

export function AgentProgress({ progress, isRunning }: AgentProgressProps) {
  const isComplete = progress >= 100;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              isRunning && "bg-indigo-100",
              isComplete && "bg-green-100",
              !isRunning && !isComplete && "bg-gray-100"
            )}
          >
            {isRunning ? (
              <Activity className="h-4 w-4 text-indigo-600 animate-pulse" />
            ) : isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {isRunning
                ? "Agent Running"
                : isComplete
                  ? "Analysis Complete"
                  : "Ready to Analyze"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRunning
                ? "Processing your job application..."
                : isComplete
                  ? "All steps finished successfully"
                  : "Upload a CV and paste a job posting to start"}
            </p>
          </div>
        </div>

        {/* Percentage */}
        <div
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight",
            isRunning && "text-indigo-600",
            isComplete && "text-green-600",
            !isRunning && !isComplete && "text-gray-300"
          )}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress
          value={progress}
          className={cn(
            "h-2.5 bg-gray-100",
            "[&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out",
            "[&>div]:bg-gradient-to-r",
            isComplete
              ? "[&>div]:from-green-500 [&>div]:to-emerald-400"
              : "[&>div]:from-indigo-500 [&>div]:to-purple-500"
          )}
        />

        {/* Shimmer overlay when running */}
        {isRunning && (
          <div className="absolute inset-0 h-2.5 overflow-hidden rounded-full">
            <div
              className="h-full w-full animate-[shimmer_2s_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                transform: "translateX(-100%)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
