import React, { useState, useRef } from 'react';
import type { PatientContext } from '../types';
import { MicrophoneIcon, ChevronDownIcon } from './icons';

interface SymptomInputProps {
  symptoms: string;
  setSymptoms: (symptoms: string) => void;
  patientContext: PatientContext;
  setPatientContext: (context: PatientContext) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const symptomExamples = [
  // ... (symptom examples remain the same)
];


const SymptomInput: React.FC<SymptomInputProps> = ({ symptoms, setSymptoms, patientContext, setPatientContext, onAnalyze, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleContextChange = (field: keyof PatientContext, value: string) => {
    setPatientContext({ ...patientContext, [field]: value });
  };
  
  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // FIX: Cast window to `any` to access non-standard SpeechRecognition APIs.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setSymptoms(symptoms + finalTranscript + interimTranscript);
    };

    recognition.start();
  };


  return (
    <div className="w-full bg-background-secondary p-6 rounded-xl shadow-lg border border-border-primary">
      <label htmlFor="symptoms" className="block text-lg font-semibold text-text-primary mb-2">
        Describe Your Symptoms
      </label>
      <p className="text-sm text-text-secondary mb-4">
        Be as detailed as possible. The more information you provide, the more accurate the analysis will be.
      </p>
      <div className="relative">
        <textarea
          id="symptoms"
          rows={6}
          className="w-full p-3 pr-12 border border-border-primary rounded-lg bg-background-primary text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-shadow"
          placeholder="e.g., 'Persistent headache for 3 days, sharp pain behind the right eye...'"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          disabled={isLoading}
        />
        <button
          onClick={handleVoiceInput}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          title="Use voice input"
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-left text-sm font-medium text-text-secondary hover:text-text-primary">
          <span>{isExpanded ? 'Hide' : 'Show'} Additional Context (Optional but Recommended)</span>
          <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-text-primary mb-1">Timeline & Progression</label>
              <input 
                type="text" 
                id="timeline" 
                value={patientContext.timeline}
                onChange={(e) => handleContextChange('timeline', e.target.value)}
                placeholder="e.g., 'Started 3 days ago, getting worse.'"
                className="w-full p-2 text-sm border border-border-primary rounded-lg bg-background-primary text-text-primary focus:ring-1 focus:ring-accent-primary"
                disabled={isLoading}
              />
            </div>
             <div>
              <label htmlFor="medications" className="block text-sm font-medium text-text-primary mb-1">Current Medications & Allergies</label>
              <input 
                type="text" 
                id="medications" 
                value={patientContext.medications}
                onChange={(e) => handleContextChange('medications', e.target.value)}
                placeholder="e.g., 'Ibuprofen for pain, allergic to penicillin.'"
                className="w-full p-2 text-sm border border-border-primary rounded-lg bg-background-primary text-text-primary focus:ring-1 focus:ring-accent-primary"
                disabled={isLoading}
              />
            </div>
             <div>
              <label htmlFor="lifestyle" className="block text-sm font-medium text-text-primary mb-1">Lifestyle Factors</label>
              <input 
                type="text" 
                id="lifestyle" 
                value={patientContext.lifestyle}
                onChange={(e) => handleContextChange('lifestyle', e.target.value)}
                placeholder="e.g., 'Recent travel to Southeast Asia, non-smoker.'"
                className="w-full p-2 text-sm border border-border-primary rounded-lg bg-background-primary text-text-primary focus:ring-1 focus:ring-accent-primary"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || symptoms.trim().length === 0}
        className="mt-6 w-full bg-accent-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze Symptoms'
        )}
      </button>
    </div>
  );
};

export default SymptomInput;