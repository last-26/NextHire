"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your NextHire preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">LLM Provider</CardTitle>
            <CardDescription>
              Configure which AI provider to use for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm">Current Provider:</span>
              <Badge>AWS Bedrock</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Additional providers (Anthropic, OpenAI, Gemini, Ollama) coming soon.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Configuration</CardTitle>
            <CardDescription>
              Multi-model routing for cost optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Fast Model (parsing)</span>
              <Badge variant="secondary">Claude Haiku 4.5</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Power Model (reasoning)</span>
              <Badge variant="secondary">Claude Sonnet</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Version:</span> 0.1.0</p>
              <p><span className="text-muted-foreground">Stack:</span> Next.js + FastAPI + LangGraph</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
