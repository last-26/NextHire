"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cpu, Zap, Brain, Info, Settings2,
  CheckCircle2, XCircle, Loader2, Wifi, Clock,
  Trash2, AlertTriangle, Database,
} from "lucide-react";
import { settingsApi } from "@/lib/api";

interface SettingsConfig {
  provider: string;
  region: string;
  fast_model: string;
  power_model: string;
  aws_configured: boolean;
}

interface ConnectionResult {
  status: string;
  model: string;
  latency_ms?: number;
  response?: string;
  error?: string;
}

interface ConnectionResults {
  fast_model: ConnectionResult;
  power_model: ConnectionResult;
}

interface DbStats {
  analyses: number;
  applications: number;
  cover_letters: number;
  agent_runs: number;
}

const PROVIDER_DISPLAY: Record<string, { name: string; color: string; icon: string }> = {
  bedrock: { name: "AWS Bedrock", color: "#FF9900", icon: "A" },
  anthropic: { name: "Anthropic", color: "#D4A27F", icon: "C" },
  openai: { name: "OpenAI", color: "#10A37F", icon: "O" },
  gemini: { name: "Google Gemini", color: "#4285F4", icon: "G" },
  ollama: { name: "Ollama (Local)", color: "#1A1A1A", icon: "L" },
};

function extractModelName(modelId: string): string {
  // "eu.anthropic.claude-haiku-4-5-20251001-v1:0" -> "Claude Haiku 4.5"
  if (modelId.includes("haiku")) return "Claude Haiku 4.5";
  if (modelId.includes("sonnet")) return "Claude Sonnet 4";
  if (modelId.includes("opus")) return "Claude Opus 4";
  return modelId;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SettingsConfig | null>(null);
  const [connection, setConnection] = useState<ConnectionResults | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    Promise.all([
      settingsApi.get().then((res) => setConfig(res.data)),
      settingsApi.dbStats().then((res) => setDbStats(res.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setConnection(null);
    try {
      const res = await settingsApi.testConnection();
      setConnection(res.data);
    } catch {
      setConnection(null);
    } finally {
      setTesting(false);
    }
  };

  const provider = config ? PROVIDER_DISPLAY[config.provider] || PROVIDER_DISPLAY.bedrock : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg shadow-gray-300/50">
            <Settings2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Settings</span>
          </h1>
        </div>
        <p className="text-muted-foreground ml-[3.25rem]">
          Configure your NextHire AI providers and view system status
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* LLM Provider */}
        <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-indigo-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-indigo-100">
                <Cpu className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">LLM Provider</CardTitle>
                <CardDescription className="text-xs">
                  Active AI provider for analysis pipeline
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3.5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${provider?.color}15` }}
                >
                  <span className="text-sm font-bold" style={{ color: provider?.color }}>
                    {provider?.icon}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800">{provider?.name}</span>
                  <p className="text-xs text-muted-foreground">
                    Region: {config?.region || "—"}
                  </p>
                </div>
              </div>
              <Badge className={
                config?.aws_configured
                  ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
              }>
                {config?.aws_configured ? "Configured" : "No Credentials"}
              </Badge>
            </div>

            {/* Test Connection Button */}
            <button
              onClick={testConnection}
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5
                text-sm font-medium text-indigo-600
                transition-all duration-200
                hover:bg-indigo-50 hover:border-indigo-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Test Connection
                </>
              )}
            </button>

            {/* Connection Results */}
            {connection && (
              <div className="space-y-2 animate-slide-up">
                {(["fast_model", "power_model"] as const).map((key) => {
                  const result = connection[key];
                  const isOk = result.status === "connected";
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between rounded-lg p-3 ${
                        isOk ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isOk ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {key === "fast_model" ? "Fast Model" : "Power Model"}
                        </span>
                      </div>
                      {isOk && result.latency_ms !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono text-muted-foreground">
                            {result.latency_ms}ms
                          </span>
                        </div>
                      ) : !isOk ? (
                        <span className="text-xs text-red-600 max-w-[200px] truncate">
                          {result.error}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-amber-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-amber-100">
                <Brain className="h-4 w-4 text-amber-600" />
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
                  <span className="text-sm font-semibold text-gray-800">
                    {config ? extractModelName(config.fast_model) : "—"}
                  </span>
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
                  <span className="text-sm font-semibold text-gray-800">
                    {config ? extractModelName(config.power_model) : "—"}
                  </span>
                  <p className="text-xs text-muted-foreground">Reasoning and generation tasks</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-medium">Power</Badge>
            </div>

            {/* Model IDs (collapsible detail) */}
            <details className="group">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                Show model IDs
              </summary>
              <div className="mt-2 space-y-1.5 pl-2">
                <div className="flex gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">Fast:</span>
                  <code className="font-mono text-gray-600 break-all">{config?.fast_model}</code>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">Power:</span>
                  <code className="font-mono text-gray-600 break-all">{config?.power_model}</code>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                <Info className="h-4 w-4 text-gray-500" />
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
                  <Badge variant="outline" className="text-xs font-normal">Next.js 14</Badge>
                  <Badge variant="outline" className="text-xs font-normal">FastAPI</Badge>
                  <Badge variant="outline" className="text-xs font-normal">LangGraph</Badge>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Agent Engine</span>
                <span className="font-medium text-gray-800">LangGraph State Machine</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pipeline Steps</span>
                <span className="font-medium text-gray-800">7 nodes (parse → analyze → generate → reflect)</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Danger Zone */}
        <Card className="overflow-hidden border-0 ring-1 ring-red-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border-b border-red-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-red-200">
                <Database className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Database</CardTitle>
                <CardDescription className="text-xs">
                  View data counts and manage stored data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {/* DB Stats */}
            {dbStats && (
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Analyses", dbStats.analyses],
                  ["Applications", dbStats.applications],
                  ["Cover Letters", dbStats.cover_letters],
                  ["Agent Runs", dbStats.agent_runs],
                ] as const).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-bold tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reset Button */}
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5
                  text-sm font-medium text-red-600
                  transition-all duration-200
                  hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </button>
            ) : (
              <div className="space-y-3 rounded-lg border border-red-300 bg-red-50 p-4 animate-slide-up">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">
                    This will permanently delete all analyses, applications, cover letters,
                    and agent runs. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setResetting(true);
                      try {
                        await settingsApi.resetDb();
                        const res = await settingsApi.dbStats();
                        setDbStats(res.data);
                      } catch {
                        // ignore
                      } finally {
                        setResetting(false);
                        setConfirmReset(false);
                      }
                    }}
                    disabled={resetting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2
                      text-sm font-medium text-white
                      transition-all duration-200
                      hover:bg-red-700
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {resetting ? "Clearing..." : "Yes, delete everything"}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2
                      text-sm font-medium text-gray-700
                      transition-all duration-200
                      hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
