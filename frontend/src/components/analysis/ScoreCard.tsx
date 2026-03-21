"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ScoreCardProps {
  score: number;
  label?: string;
}

export function ScoreCard({ score, label = "ATS Score" }: ScoreCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = mounted
    ? circumference - (clampedScore / 100) * circumference
    : circumference;

  const getGradientId = (s: number) => {
    if (s >= 80) return "gradient-green";
    if (s >= 60) return "gradient-amber";
    return "gradient-red";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getGlowColor = (s: number) => {
    if (s >= 80) return "drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]";
    if (s >= 60) return "drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]";
    return "drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg
          className={cn(
            "h-full w-full -rotate-90 transition-[filter] duration-1000",
            mounted && getGlowColor(clampedScore)
          )}
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            className="stroke-muted/20"
          />

          {/* Score arc with gradient */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={`url(#${getGradientId(clampedScore)})`}
            className="transition-[stroke-dashoffset] duration-[1.4s] ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-4xl font-extrabold tracking-tight transition-colors duration-700",
              getTextColor(clampedScore)
            )}
          >
            {Math.round(clampedScore)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            / 100
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-muted-foreground tracking-wide">
        {label}
      </p>
    </div>
  );
}
