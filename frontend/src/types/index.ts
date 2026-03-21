// Application types
export interface Application {
  id: string;
  company_name: string;
  position_title: string;
  job_url: string | null;
  status: ApplicationStatus;
  priority: Priority;
  notes: string | null;
  match_score: number | null;
  analysis_id: string | null;
  cover_letter_id: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export type Priority = "low" | "medium" | "high";

// Analysis types
export interface JobAnalysis {
  id: string;
  job_title: string | null;
  company_name: string | null;
  job_description: string;
  job_url: string | null;
  parsed_job: ParsedJob | null;
  parsed_cv: ParsedCV | null;
  match_result: MatchResult | null;
  gap_analysis: GapAnalysis | null;
  overall_score: number | null;
  cv_filename: string | null;
  agent_run_id: string | null;
  created_at: string;
}

export interface ParsedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  requirements: string[];
  salary_range: string | null;
  summary: string;
}

export interface ParsedCV {
  name: string;
  email: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
  total_years_experience: number;
  summary: string;
}

export interface Experience {
  company: string;
  title: string;
  duration: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface MatchResult {
  semantic_score: number;
  keyword_match: {
    matched: string[];
    missing: string[];
    match_percentage: number;
  };
  algorithmic_score: number;
  llm_score: number | null;
  overall_score: number;
  llm_analysis: {
    llm_score: number;
    score_reasoning: string;
    overall_assessment: string;
    strengths: string[];
    weaknesses: string[];
    ats_tips: string[];
    experience_match: string;
    education_match: string;
    culture_fit_indicators: string[];
    transferable_skills: string[];
  };
}

export interface GapAnalysis {
  critical_gaps: CriticalGap[];
  experience_gaps: ExperienceGap[];
  quick_wins: string[];
  long_term_improvements: string[];
  cv_formatting_tips: string[];
}

export interface CriticalGap {
  skill: string;
  importance: "critical" | "high" | "medium";
  suggestion: string;
}

export interface ExperienceGap {
  area: string;
  current_level: string;
  required_level: string;
  suggestion: string;
}

// Cover Letter types
export interface CoverLetter {
  id: string;
  analysis_id: string | null;
  content: string;
  tone: string;
  version: number;
  is_edited: boolean;
  created_at: string;
}

// Agent types
export interface AgentRun {
  id: string;
  status: "running" | "completed" | "failed";
  steps: AgentStep[];
  total_tokens_used: number;
  total_cost_usd: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface AgentStep {
  step: string;
  status: "running" | "completed" | "failed";
  message?: string;
  duration_ms?: number;
  output_summary?: string;
}
