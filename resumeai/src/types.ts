export interface JDSummary {
  jobTitle: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  atsKeywords: string[];
}

export interface Suggestion {
  id: string;
  section: string;
  type: 'replace' | 'insert' | 'delete';
  original_text: string;
  suggested_text: string;
  reason: string;
  ats_impact: 'high' | 'medium' | 'low';
}

export interface OptimizationResult {
  ats_score_before: number;
  ats_score_after: number;
  latex_original: string;
  suggestions: Suggestion[];
}
