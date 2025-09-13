
export interface Diagnosis {
  condition: string;
  uncertaintyScore: number;
  briefDescription: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface TestSuggestion {
  testName: string;
  rationale: string;
}

export interface SuggestedSpecialist {
  specialistName: string;
  rationale: string;
}

export interface CausalPathway {
  symptom: string;
  condition: string;
  explanation: string;
}

export interface SeverityAssessment {
  triageLevel: 'Urgent Care Needed' | 'Doctor Visit Recommended' | 'Self-care Manageable';
  reasoning: string;
}

export interface AnalysisResult {
  disclaimer: string;
  severityAssessment: SeverityAssessment;
  differentialDiagnosis: Diagnosis[];
  suggestedTests: TestSuggestion[];
  suggestedSpecialists: SuggestedSpecialist[];
  causalPathways: CausalPathway[];
  reasoning: {
    patientFriendly: string;
    professional: string;
  };
}

export interface PatientContext {
  timeline: string;
  medications: string;
  lifestyle: string;
}

export type ExplanationView = 'patient' | 'professional';

export interface SavedAnalysis {
  id: number; // Using timestamp as a unique ID
  symptoms: string;
  result: AnalysisResult;
  date: string;
}

// FIX: Add the User interface to be used for Google Sign-In user data.
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}