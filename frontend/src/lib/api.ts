import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300000, // 5 min — agent pipeline can take 1-2 min
});

// Applications
export const applicationsApi = {
  list: () => api.get("/applications"),
  get: (id: string) => api.get(`/applications/${id}`),
  create: (data: Record<string, unknown>) => api.post("/applications", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
};

// Analysis
export const analysisApi = {
  analyze: (formData: FormData) =>
    api.post("/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  reviewCv: (formData: FormData) =>
    api.post("/cv-review", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Cover Letters
export const coverLettersApi = {
  list: () => api.get("/cover-letters"),
  get: (id: string) => api.get(`/cover-letters/${id}`),
  create: (data: Record<string, unknown>) => api.post("/cover-letters", data),
};

// Agent
export const agentApi = {
  getRun: (runId: string) => api.get(`/agent/runs/${runId}`),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
  recentAnalyses: (limit = 10) => api.get(`/dashboard/recent-analyses?limit=${limit}`),
};
