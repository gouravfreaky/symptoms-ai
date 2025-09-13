import React, { useState, useCallback, useEffect } from 'react';
import SymptomInput from './components/SymptomInput';
import DiagnosisResult from './components/DiagnosisResult';
import LoadingIndicator from './components/LoadingIndicator';
import { StethoscopeIcon, TrashIcon, AlertTriangleIcon, SunIcon, MoonIcon, GlobeIcon, LogoutIcon } from './components/icons';
import { getDiagnosis } from './services/fireworksService';
import type { AnalysisResult, ExplanationView, SavedAnalysis, PatientContext, User } from './types';

const languages = {
  "en": "English",
  "es": "Español",
  "fr": "Français",
  "de": "Deutsch",
  "it": "Italiano",
  "pt": "Português",
  "ja": "日本語",
  "ko": "한국어",
  "zh": "中文"
};

interface MainAppProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, isDarkMode, onThemeToggle }) => {
  const [symptoms, setSymptoms] = useState<string>('');
  const [patientContext, setPatientContext] = useState<PatientContext>({ timeline: '', medications: '', lifestyle: '' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationView, setExplanationView] = useState<ExplanationView>('patient');
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isCurrentAnalysisSaved, setIsCurrentAnalysisSaved] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('en');
  
  const STORAGE_KEY = `symptomAnalysesHistory_${user.id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedAnalyses(JSON.parse(saved));
      } else {
        setSavedAnalyses([]); // Clear analyses if user changes
      }
    } catch (e) {
      console.error("Failed to load saved analyses.", e);
      setSavedAnalyses([]);
    }
  }, [user.id, STORAGE_KEY]);

  const handleAnalyze = useCallback(async () => {
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setIsCurrentAnalysisSaved(false);

    try {
      const result = await getDiagnosis(symptoms, patientContext, languages[language]);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [symptoms, patientContext, language]);

  const handleSaveAnalysis = useCallback(() => {
    if (!analysisResult || !symptoms || isCurrentAnalysisSaved) return;

    const newAnalysis: SavedAnalysis = { id: Date.now(), symptoms, result: analysisResult, date: new Date().toISOString() };
    setSavedAnalyses(prev => {
      const updatedAnalyses = [newAnalysis, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
      return updatedAnalyses;
    });
    setIsCurrentAnalysisSaved(true);
  }, [analysisResult, symptoms, isCurrentAnalysisSaved, STORAGE_KEY]);

  const handleLoadAnalysis = useCallback((analysis: SavedAnalysis) => {
    setSymptoms(analysis.symptoms);
    setAnalysisResult(analysis.result);
    setError(null);
    setIsCurrentAnalysisSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteAnalysis = useCallback((id: number) => {
    setSavedAnalyses(prev => {
      const updatedAnalyses = prev.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
      return updatedAnalyses;
    });
  }, [STORAGE_KEY]);
  
  const handleClearAnalysis = useCallback(() => {
    setSymptoms('');
    setPatientContext({ timeline: '', medications: '', lifestyle: '' });
    setAnalysisResult(null);
    setError(null);
    setIsCurrentAnalysisSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);


  return (
    <div className="min-h-screen bg-background-primary text-text-primary font-sans">
      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        <header className="pt-8 mb-8 no-print">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <StethoscopeIcon className="h-10 w-10 text-accent-primary" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary ml-3">
                    Symptom AI
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm rounded-full text-text-secondary bg-slate-200 dark:bg-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            aria-label="Select language"
                        >
                            {Object.entries(languages).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                        <GlobeIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    </div>
                    <button
                        onClick={onThemeToggle}
                        className="p-2 rounded-full text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-2 border-l border-border-primary pl-4">
                        <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-text-primary">{user.name}</span>
                            <button onClick={onLogout} className="text-xs text-text-secondary hover:underline flex items-center gap-1">
                                <LogoutIcon className="h-3 w-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-md text-text-secondary text-center">
                An AI-powered tool to assist in forming a differential diagnosis.
            </p>
        </header>
        
        <div className="no-print">
            <SymptomInput 
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              patientContext={patientContext}
              setPatientContext={setPatientContext}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
        </div>

        {savedAnalyses.length > 0 && !analysisResult && (
          <div className="mt-8 animate-fade-in no-print">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Analysis History</h2>
            <div className="bg-background-secondary p-4 rounded-xl shadow-lg border border-border-primary">
              <ul className="divide-y divide-border-primary">
                {savedAnalyses.map((analysis) => (
                  <li key={analysis.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate" title={analysis.symptoms}>
                        {analysis.symptoms}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(analysis.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoadAnalysis(analysis)}
                        className="px-3 py-1 text-xs font-semibold text-accent-primary bg-accent-primary/10 rounded-full hover:bg-accent-primary/20 transition-colors"
                      >
                        Load
                      </button>
                       <button
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        aria-label="Delete analysis"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8">
          {isLoading && <div className="no-print"><LoadingIndicator /></div>}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 p-4 rounded-xl shadow-sm flex items-start gap-4 no-print" role="alert">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <AlertTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-900 dark:text-red-200">Error</p>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="printable-area">
              <DiagnosisResult 
                result={analysisResult} 
                symptoms={symptoms}
                explanationView={explanationView} 
                setExplanationView={setExplanationView}
                onSave={handleSaveAnalysis}
                onClear={handleClearAnalysis}
                isSaved={isCurrentAnalysisSaved}
              />
            </div>
          )}
        </div>
        
        <footer className="text-center mt-12 text-xs text-text-secondary/80 no-print">
          <p>
            <strong>Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default MainApp;