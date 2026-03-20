"use client";

import { Progress } from "@/components/ui/progress";

interface AgentProgressProps {
  progress: number;
  isRunning: boolean;
}

export function AgentProgress({ progress, isRunning }: AgentProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {isRunning ? "Agent running..." : progress >= 100 ? "Analysis complete" : "Ready"}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
