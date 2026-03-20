"use client";

import { useState } from "react";
import { StepCard } from "./StepCard";
import { AgentProgress } from "./AgentProgress";
import type { AgentStep } from "@/types";

const AGENT_STEPS = [
  "parse_job",
  "parse_cv",
  "analyze_match",
  "identify_gaps",
  "generate_cover_letter",
  "reflect",
  "compile_report",
];

interface AgentStreamProps {
  steps: AgentStep[];
  isRunning: boolean;
}

export function AgentStream({ steps, isRunning }: AgentStreamProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / AGENT_STEPS.length) * 100;

  return (
    <div className="space-y-4">
      <AgentProgress progress={progress} isRunning={isRunning} />

      <div className="space-y-2">
        {AGENT_STEPS.map((stepName) => {
          const step = steps.find((s) => s.step === stepName);
          return (
            <StepCard
              key={stepName}
              name={stepName}
              status={step?.status || "pending"}
              message={step?.message}
              durationMs={step?.duration_ms}
              outputSummary={step?.output_summary}
            />
          );
        })}
      </div>
    </div>
  );
}
