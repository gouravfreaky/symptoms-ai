import type { AnalysisResult, PatientContext } from '../types';

const FIREWORKS_API_KEY = import.meta.env.VITE_API_KEY;
const FIREWORKS_MODEL = 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';
const API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

const getJsonSchemaDescription = (): string => {
  return `
  You MUST respond with ONLY a valid JSON object that conforms to the following TypeScript interfaces. Do not include any text, explanation, or markdown formatting before or after the JSON object.

  interface Diagnosis {
    condition: string;
    uncertaintyScore: number; // 0.0 to 1.0
    briefDescription: string;
    severity: 'High' | 'Medium' | 'Low';
  }

  interface TestSuggestion {
    testName: string;
    rationale: string;
  }

  interface SuggestedSpecialist {
    specialistName: string;
    rationale: string;
  }

  interface CausalPathway {
    symptom: string;
    condition: string;
    explanation: string;
  }

  interface SeverityAssessment {
    triageLevel: 'Urgent Care Needed' | 'Doctor Visit Recommended' | 'Self-care Manageable';
    reasoning: string;
  }

  interface AnalysisResult {
    disclaimer: string;
    severityAssessment: SeverityAssessment;
    differentialDiagnosis: Diagnosis[];
    suggestedTests: TestSuggestion[];
    suggestedSpecialists: SuggestedSpecialist[];
    causalPathways: CausalPathway[];
    reasoning: {
      patientFriendly: string; // Must include markdown links
      professional: string; // Must include markdown links
    };
  }
  `;
}

export const getDiagnosis = async (symptoms: string, context: PatientContext, language: string): Promise<AnalysisResult> => {
  const systemInstruction = `You are an advanced medical diagnostic AI assistant. Your purpose is to analyze patient symptoms and provide a comprehensive analysis in the specified language.
  
  Instructions:
  1.  **Language**: The entire response, including all fields in the JSON output, must be in **${language}**.
  2.  **Analysis**: Analyze the patient's symptoms in conjunction with their provided context.
  3.  **Severity Assessment**: Provide a 'triageLevel' ('Urgent Care Needed', 'Doctor Visit Recommended', or 'Self-care Manageable') and reasoning.
  4.  **Differential Diagnosis**: List potential diagnoses, each with an 'uncertaintyScore' (0.0 to 1.0) and a 'severity' ('High', 'Medium', 'Low').
  5.  **Causal Pathways**: For each diagnosis, identify 1-3 key input symptoms that support it and create a 'causalPathways' object linking them.
  6.  **Knowledge Integration**: In the 'reasoning' fields ('patientFriendly' and 'professional'), embed markdown links for key medical conditions and tests to a reputable source (e.g., Mayo Clinic, Wikipedia). Example: \`[Term](URL)\`.
  7.  **Disclaimer**: ALWAYS include a clear disclaimer that you are not a real doctor and the user must consult a healthcare professional.
  8.  **JSON Format**: Your entire output must be a single, valid JSON object conforming to the schema provided below. Do not output anything else.
  
  ${getJsonSchemaDescription()}
  `;
  
  const userPrompt = `
    Please provide a full diagnostic analysis based on the following patient information.

    **Language for Response:** ${language}

    **Primary Symptoms:** 
    "${symptoms}"

    **Symptom Timeline & Progression:**
    ${context.timeline || "Not provided."}

    **Current Medications & Allergies:**
    ${context.medications || "Not provided."}

    **Lifestyle Factors (e.g., recent travel, smoking):**
    ${context.lifestyle || "Not provided."}
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: FIREWORKS_MODEL,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Fireworks API Error:", errorBody);
        throw new Error(`Failed to get diagnosis from AI. Status: ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data.choices[0].message.content;

    if (!jsonText) {
      throw new Error("Received an empty response from the AI.");
    }

    const result = JSON.parse(jsonText);
    
    if (result.differentialDiagnosis && Array.isArray(result.differentialDiagnosis)) {
      result.differentialDiagnosis.sort((a, b) => b.uncertaintyScore - a.uncertaintyScore);
    }
    
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Fireworks AI API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get diagnosis from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching the diagnosis.");
  }
};