"use client";

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
    <div className="space-y-6">
      <AgentProgress progress={progress} isRunning={isRunning} />

      {/* Vertical timeline */}
      <div className="relative pl-4">
        {/* Connecting line */}
        <div className="absolute left-[1.05rem] top-4 bottom-4 w-px bg-gradient-to-b from-indigo-300 via-purple-300 to-gray-200" />

        <div className="space-y-1">
          {AGENT_STEPS.map((stepName, index) => {
            const step = steps.find((s) => s.step === stepName);
            const status = step?.status || "pending";

            return (
              <div key={stepName} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-4 top-4 z-10 flex items-center justify-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ring-[3px] ring-white transition-all duration-300 ${
                      status === "completed"
                        ? "bg-green-500"
                        : status === "running"
                          ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                          : status === "failed"
                            ? "bg-red-500"
                            : "bg-gray-300"
                    }`}
                  />
                </div>

                <div className="ml-4">
                  <StepCard
                    name={stepName}
                    status={status}
                    message={step?.message}
                    durationMs={step?.duration_ms}
                    outputSummary={step?.output_summary}
                    stepNumber={index + 1}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
