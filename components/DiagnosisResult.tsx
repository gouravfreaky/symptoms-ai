import React, { useState } from 'react';
import type { AnalysisResult, ExplanationView, Diagnosis, TestSuggestion, SuggestedSpecialist, CausalPathway } from '../types';
import {
  AlertTriangleIcon,
  StethoscopeIcon,
  BeakerIcon,
  SpecialistIcon,
  PathwaysIcon,
  BrainIcon,
  BookmarkIcon,
  PlusIcon,
  CheckIcon,
  ClipboardUserIcon,
  HomeHeartIcon,
  PrinterIcon
} from './icons';
import ChatComponent from './ChatComponent';

interface DiagnosisResultProps {
  result: AnalysisResult;
  symptoms: string;
  explanationView: ExplanationView;
  setExplanationView: (view: ExplanationView) => void;
  onSave: () => void;
  onClear: () => void;
  isSaved: boolean;
}

const severityColorMap = {
  High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const triageStyleMap = {
  'Urgent Care Needed': {
    Icon: AlertTriangleIcon,
    containerClasses: 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30',
    iconContainerClasses: 'bg-red-100 dark:bg-red-900/50',
    iconClasses: 'text-red-600 dark:text-red-400',
    titleClasses: 'text-red-900 dark:text-red-200 font-bold',
    textClasses: 'text-red-800 dark:text-red-300',
  },
  'Doctor Visit Recommended': {
    Icon: ClipboardUserIcon,
    containerClasses: 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-500/30',
    iconContainerClasses: 'bg-yellow-100 dark:bg-yellow-900/50',
    iconClasses: 'text-yellow-600 dark:text-yellow-400',
    titleClasses: 'text-yellow-900 dark:text-yellow-200 font-bold',
    textClasses: 'text-yellow-800 dark:text-yellow-300',
  },
  'Self-care Manageable': {
    Icon: HomeHeartIcon,
    containerClasses: 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30',
    iconContainerClasses: 'bg-blue-100 dark:bg-blue-900/50',
    iconClasses: 'text-blue-600 dark:text-blue-400',
    titleClasses: 'text-blue-900 dark:text-blue-200 font-bold',
    textClasses: 'text-blue-800 dark:text-blue-300',
  },
};

// Simple markdown link parser
const markdownToHtml = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const html = text
    .replace(linkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent-primary hover:underline">$1</a>')
    .replace(/\n/g, '<br />');
  return { __html: html };
};


const DiagnosisBarChart: React.FC<{ diagnoses: Diagnosis[]; hoveredCondition: string | null }> = ({ diagnoses, hoveredCondition }) => (
  <div className="space-y-3 mb-6 border-b border-border-primary pb-4">
    {diagnoses.map((diag) => (
      <div key={diag.condition} className={`flex items-center gap-3 text-sm p-1 -m-1 rounded-md transition-colors duration-300 ${hoveredCondition === diag.condition ? 'bg-accent-primary/10' : ''}`} title={`${diag.condition}: ${(diag.uncertaintyScore * 100).toFixed(0)}%`}>
        <div className="w-1/3 truncate font-medium text-text-secondary">
          {diag.condition}
        </div>
        <div className="w-2/3 flex items-center gap-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-accent-primary h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${diag.uncertaintyScore * 100}%` }}
            />
          </div>
          <span className="font-bold text-text-primary w-12 text-right">
            {(diag.uncertaintyScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    ))}
  </div>
);

const DiagnosisCard: React.FC<{ diagnosis: Diagnosis; isHighlighted: boolean; onHover: (condition: string | null) => void; }> = ({ diagnosis, isHighlighted, onHover }) => (
  <li 
    onMouseEnter={() => onHover(diagnosis.condition)}
    onMouseLeave={() => onHover(null)}
    className={`bg-background-primary p-4 rounded-lg border border-border-primary transition-all duration-300 ${isHighlighted ? 'ring-2 ring-accent-primary shadow-lg' : ''}`}>
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-md font-bold text-text-primary">{diagnosis.condition}</h4>
        <p className="text-xs text-text-secondary mt-1">{diagnosis.briefDescription}</p>
      </div>
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColorMap[diagnosis.severity]}`}>
        {diagnosis.severity}
      </div>
    </div>
  </li>
);

const InfoCard: React.FC<{ title: string; items: { primary: string; secondary: string }[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
  <div className="bg-background-secondary p-5 rounded-xl shadow-lg border border-border-primary printable-content">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-lg font-bold text-text-primary ml-3">{title}</h3>
    </div>
    <ul className="space-y-3 text-sm">
      {items.map((item, index) => (
        <li key={index} className="p-3 bg-background-primary rounded-md border border-border-primary">
          <p className="font-semibold text-text-primary">{item.primary}</p>
          <p className="text-text-secondary mt-1">{item.secondary}</p>
        </li>
      ))}
    </ul>
  </div>
);

const CausalPathwayCard: React.FC<{ 
  pathways: CausalPathway[];
  onHover: (pathway: CausalPathway | null) => void;
  hoveredPathway: CausalPathway | null;
  symptoms: string[];
  hoveredCondition: string | null;
}> = ({ pathways, onHover, hoveredPathway, symptoms, hoveredCondition }) => (
    <div className="bg-background-secondary p-5 rounded-xl shadow-lg border border-border-primary printable-content">
        <div className="flex items-center mb-4">
            <PathwaysIcon className="h-6 w-6 text-accent-primary" />
            <h3 className="text-lg font-bold text-text-primary ml-3">Symptom Pathways</h3>
        </div>
        <div className="space-y-4">
            {symptoms.map(symptom => {
                const relevantPathways = pathways.filter(p => p.symptom === symptom);
                if (relevantPathways.length === 0) return null;

                const isSymptomHighlighted = hoveredPathway?.symptom === symptom || relevantPathways.some(p => p.condition === hoveredCondition);

                return (
                    <div key={symptom}>
                        <h4 className={`font-semibold text-sm mb-2 px-2 py-1 rounded-md inline-block transition-colors duration-300 ${isSymptomHighlighted ? 'bg-accent-primary/10 text-accent-primary' : 'bg-slate-100 dark:bg-slate-700 text-text-primary'}`}>{symptom}</h4>
                        <ul className="space-y-2 pl-4 border-l-2 border-border-primary">
                            {relevantPathways.map((path, index) => {
                                const isPathwayHighlighted = (hoveredPathway?.symptom === path.symptom && hoveredPathway?.condition === path.condition) || path.condition === hoveredCondition;
                                return (
                                    <li 
                                        key={index}
                                        onMouseEnter={() => onHover(path)}
                                        onMouseLeave={() => onHover(null)}
                                        className={`p-2 rounded-md cursor-pointer transition-colors duration-300 ${isPathwayHighlighted ? 'bg-slate-200 dark:bg-slate-900/50' : ''}`}
                                    >
                                        <div className="flex items-center text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            <span className="font-semibold text-accent-primary">{path.condition}</span>
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1 pl-7">{path.explanation}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </div>
    </div>
);


const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ result, symptoms, explanationView, setExplanationView, onSave, onClear, isSaved }) => {
  const [hoveredPathway, setHoveredPathway] = useState<CausalPathway | null>(null);
  const [hoveredCondition, setHoveredCondition] = useState<string | null>(null);
  const [showPrintMessage, setShowPrintMessage] = useState(false);
  
  const uniqueSymptoms = Array.from(new Set(result.causalPathways?.map(p => p.symptom) ?? []));

  const handleExport = () => {
    setShowPrintMessage(true);
    window.print();
    setTimeout(() => setShowPrintMessage(false), 6000); // Hide message after 6 seconds
  };

  return (
    <div className="animate-fade-in space-y-8">
      
       <div className="bg-background-secondary p-4 rounded-xl shadow-lg border border-border-primary printable-content">
          <div className="print-only hidden mb-4 border-b border-border-primary pb-2">
              <h2 className="text-xl font-bold">Symptom AI Analysis Report</h2>
              <p className="text-sm">Date: {new Date().toLocaleString()}</p>
              <p className="text-sm font-medium mt-2"><strong>Symptoms Reported:</strong> {symptoms}</p>
          </div>
          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-500/30 p-4 rounded-xl shadow-sm flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
            </div>
            <div className="flex-1">
              <p className="font-bold text-yellow-900 dark:text-yellow-200">Important Disclaimer</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">{result.disclaimer}</p>
            </div>
          </div>
          
          {/* Severity Assessment */}
          {result.severityAssessment && (() => {
            const style = triageStyleMap[result.severityAssessment.triageLevel];
            if (!style) return null;
            const { Icon } = style;

            return (
              <div className={`p-4 rounded-xl shadow-sm flex items-start gap-4 mt-4 ${style.containerClasses}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.iconContainerClasses}`}>
                  <Icon className={`h-5 w-5 ${style.iconClasses}`} />
                </div>
                <div className="flex-1">
                  <p className={style.titleClasses}>{result.severityAssessment.triageLevel}</p>
                  <p className={`text-sm ${style.textClasses}`}>{result.severityAssessment.reasoning}</p>
                </div>
              </div>
            );
          })()}
        </div>

      {/* Action Buttons */}
       <div className="flex flex-col sm:flex-row gap-4 no-print">
          <button
              onClick={onSave}
              disabled={isSaved}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                isSaved
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-not-allowed'
                  : 'bg-slate-200 dark:bg-slate-700 text-text-primary hover:bg-slate-300 dark:hover:bg-slate-600 focus:ring-slate-500'
              }`}
            >
              {isSaved ? <><CheckIcon className="h-5 w-5" />Saved</> : <><BookmarkIcon className="h-5 w-5" />Save Analysis</>}
          </button>
          <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-text-primary font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
            >
              <PrinterIcon className="h-5 w-5" />
              Export
          </button>
          <button
              onClick={onClear}
              className="flex-1 flex items-center justify-center gap-2 bg-accent-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              New Analysis
          </button>
      </div>
      
      {showPrintMessage && (
        <div className="no-print -mt-4 text-center text-sm text-text-secondary p-3 bg-slate-100 dark:bg-slate-700 rounded-xl transition-all animate-fade-in">
          <p>Preparing report for printing...</p>
          <p className="text-xs mt-1">If the print dialog doesn't appear, this feature may be restricted in the preview. It will work correctly in a standalone browser window.</p>
        </div>
      )}


      {/* Differential Diagnosis */}
      <div className="bg-background-secondary p-5 rounded-xl shadow-lg border border-border-primary printable-content">
        <div className="flex items-center mb-4">
          <StethoscopeIcon className="h-6 w-6 text-accent-primary"/>
          <h3 className="text-lg font-bold text-text-primary ml-3">Differential Diagnosis</h3>
        </div>
        <DiagnosisBarChart diagnoses={result.differentialDiagnosis} hoveredCondition={hoveredCondition} />
        <ul className="space-y-3">
          {result.differentialDiagnosis.map(diag => 
            <DiagnosisCard 
              key={diag.condition} 
              diagnosis={diag} 
              isHighlighted={hoveredPathway?.condition === diag.condition || hoveredCondition === diag.condition}
              onHover={setHoveredCondition}
            />
          )}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {result.suggestedTests?.length > 0 && (
            <InfoCard 
                title="Suggested Tests"
                icon={<BeakerIcon className="h-6 w-6 text-accent-primary" />}
                items={result.suggestedTests.map(t => ({ primary: t.testName, secondary: t.rationale }))}
            />
        )}
        {result.suggestedSpecialists?.length > 0 && (
             <InfoCard 
                title="Suggested Specialists"
                icon={<SpecialistIcon className="h-6 w-6 text-accent-primary" />}
                items={result.suggestedSpecialists.map(s => ({ primary: s.specialistName, secondary: s.rationale }))}
            />
        )}
      </div>

       {result.causalPathways?.length > 0 && (
            <CausalPathwayCard 
                pathways={result.causalPathways} 
                onHover={setHoveredPathway}
                hoveredPathway={hoveredPathway}
                symptoms={uniqueSymptoms}
                hoveredCondition={hoveredCondition}
            />
        )}

      <div className="bg-background-secondary p-5 rounded-xl shadow-lg border border-border-primary printable-content">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BrainIcon className="h-6 w-6 text-accent-primary" />
            <h3 className="text-lg font-bold text-text-primary ml-3">AI Reasoning</h3>
          </div>
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-700 rounded-lg no-print">
            <button 
              onClick={() => setExplanationView('patient')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${explanationView === 'patient' ? 'bg-background-secondary text-accent-primary shadow' : 'text-text-secondary'}`}
            >
              Patient
            </button>
            <button 
              onClick={() => setExplanationView('professional')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${explanationView === 'professional' ? 'bg-background-secondary text-accent-primary shadow' : 'text-text-secondary'}`}
            >
              Professional
            </button>
          </div>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-background-primary rounded-md border border-border-primary">
           <p dangerouslySetInnerHTML={markdownToHtml(explanationView === 'patient' ? result.reasoning.patientFriendly : result.reasoning.professional)} />
        </div>
      </div>
      
      <div className="no-print">
        <ChatComponent analysisResult={result} symptoms={symptoms} />
      </div>
    </div>
  );
};

export default DiagnosisResult;