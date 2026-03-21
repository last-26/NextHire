import type { JobAnalysis } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AgentStreamEvent {
  step: string;
  status: string;
  message?: string;
  duration_ms?: number;
  output_summary?: string;
}

export interface StreamCompleteEvent {
  analysis: JobAnalysis;
  total_duration_ms: number;
}

export interface StreamCallbacks {
  onStep: (event: AgentStreamEvent) => void;
  onComplete: (data: StreamCompleteEvent) => void;
  onError: (error: string) => void;
}

/**
 * POST FormData to /analyze/stream and consume the SSE response.
 * Returns an AbortController so the caller can cancel the stream.
 */
export function streamAnalysis(
  formData: FormData,
  callbacks: StreamCallbacks,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze/stream`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        let detail = `Server error (${response.status})`;
        try {
          detail = JSON.parse(text).detail || detail;
        } catch {
          // use default
        }
        callbacks.onError(detail);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError("No response body");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";
      let currentData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines from buffer
        const lastNewline = buffer.lastIndexOf("\n");
        if (lastNewline === -1) continue; // no complete lines yet

        const complete = buffer.slice(0, lastNewline + 1);
        buffer = buffer.slice(lastNewline + 1);

        const lines = complete.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();

          // SSE comment (e.g., ": ping - ...")
          if (trimmed.startsWith(":")) continue;

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
          } else if (trimmed.startsWith("data:")) {
            currentData = trimmed.slice(5).trim();
          } else if (trimmed === "" && currentData) {
            // Empty line = end of SSE message block
            try {
              const parsed = JSON.parse(currentData);

              if (currentEvent === "step") {
                callbacks.onStep(parsed as AgentStreamEvent);
              } else if (currentEvent === "complete") {
                callbacks.onComplete(parsed as StreamCompleteEvent);
              } else if (currentEvent === "error") {
                callbacks.onError(parsed.detail || "Pipeline error");
              }
            } catch {
              // Ignore parse errors
            }
            currentEvent = "";
            currentData = "";
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // User cancelled
      }
      callbacks.onError(
        err instanceof Error ? err.message : "Connection failed"
      );
    }
  })();

  return controller;
}
