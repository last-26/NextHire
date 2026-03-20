const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AgentStreamEvent {
  step: string;
  status: string;
  message?: string;
  duration_ms?: number;
  output?: Record<string, unknown>;
}

export function createAgentStream(
  runId: string,
  onEvent: (event: AgentStreamEvent) => void,
  onComplete: () => void,
  onError: (error: Event) => void
): EventSource {
  const url = `${API_BASE_URL}/agent/stream/${runId}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "complete") {
        onComplete();
        eventSource.close();
      } else {
        onEvent(data);
      }
    } catch {
      // Ignore parse errors
    }
  };

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  return eventSource;
}
