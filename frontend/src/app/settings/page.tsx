"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Brain, Info, Settings2, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg shadow-gray-300/50">
            <Settings2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
        <p className="text-muted-foreground ml-[3.25rem]">
          Configure your NextHire preferences and AI providers
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* LLM Provider */}
        <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-indigo-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-indigo-100">
                <Cpu className="h-4.5 w-4.5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">LLM Provider</CardTitle>
                <CardDescription className="text-xs">
                  Configure which AI provider to use for analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FF9900]/10">
                  <span className="text-sm font-bold text-[#FF9900]">A</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800">AWS Bedrock</span>
                  <p className="text-xs text-muted-foreground">Active provider</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                Connected
              </Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Additional providers (Anthropic, OpenAI, Gemini, Ollama) coming soon</span>
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-amber-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-amber-100">
                <Brain className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Model Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Multi-model routing for cost optimization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            {/* Fast model */}
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800">Claude Haiku 4.5</span>
                  <p className="text-xs text-muted-foreground">Parsing and extraction tasks</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-medium">Fast</Badge>
            </div>

            {/* Power model */}
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50">
                  <Brain className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800">Claude Sonnet</span>
                  <p className="text-xs text-muted-foreground">Reasoning and generation tasks</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-medium">Power</Badge>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                <Info className="h-4.5 w-4.5 text-gray-500" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">About NextHire</CardTitle>
                <CardDescription className="text-xs">
                  Application version and stack information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono font-semibold text-gray-800">v0.1.0</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stack</span>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-xs font-normal">Next.js</Badge>
                  <Badge variant="outline" className="text-xs font-normal">FastAPI</Badge>
                  <Badge variant="outline" className="text-xs font-normal">LangGraph</Badge>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Agent Engine</span>
                <span className="font-medium text-gray-800">LangGraph State Machine</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
