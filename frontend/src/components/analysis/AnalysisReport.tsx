"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreCard } from "./ScoreCard";
import { SkillMatch } from "./SkillMatch";
import { GapAnalysis } from "./GapAnalysis";
import type { JobAnalysis } from "@/types";

interface AnalysisReportProps {
  analysis: JobAnalysis;
}

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  const matchResult = analysis.match_result;
  const gapAnalysis = analysis.gap_analysis;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ATS Compatibility</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreCard score={analysis.overall_score || 0} />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Skill Match</CardTitle>
        </CardHeader>
        <CardContent>
          {matchResult ? (
            <SkillMatch
              matched={matchResult.keyword_match.matched}
              missing={matchResult.keyword_match.missing}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No match data available</p>
          )}
        </CardContent>
      </Card>

      {/* Assessment */}
      {matchResult?.llm_analysis && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{matchResult.llm_analysis.overall_assessment}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {matchResult.llm_analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700">+ {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Weaknesses</h4>
                <ul className="space-y-1">
                  {matchResult.llm_analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-red-700">- {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gap Analysis */}
      {gapAnalysis && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <GapAnalysis data={gapAnalysis} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
