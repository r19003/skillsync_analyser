import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  KeyRound, Sparkles, AlertCircle, RefreshCw,
  FileText, ShieldCheck, CheckCircle2
} from 'lucide-react';

import KeywordKPICards from './keywords/KeywordKPICards';
import KeywordComparisonTable from './keywords/KeywordComparisonTable';
import KeywordDistributionCharts from './keywords/KeywordDistributionCharts';
import ResumeKeywordHighlighter from './keywords/ResumeKeywordHighlighter';
import MissingKeywordPrioritizer from './keywords/MissingKeywordPrioritizer';
import ActionVerbAndTitleCard from './keywords/ActionVerbAndTitleCard';
import ContextualBulletOptimizer from './keywords/ContextualBulletOptimizer';

import { recalculateKeywords, getKeywordEvidence } from '../../api/careerAnalyticsApi';

const ATSKeywordIntelligenceSection = ({
  analysisId,
  keywordAnalytics: initialKeywordAnalytics = {},
  resumeText = '',
  onAnalysisUpdated
}) => {
  const [keywordAnalytics, setKeywordAnalytics] = useState(initialKeywordAnalytics);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [inspectedKeywordData, setInspectedKeywordData] = useState(null);

  // Handle recalculate with new JD
  const handleRecalculate = async (newJdText) => {
    try {
      setIsRecalculating(true);
      const res = await recalculateKeywords(analysisId, { jobDescription: newJdText });
      if (res.data?.success) {
        setKeywordAnalytics(res.data.keywordAnalytics);
        toast.success(res.data.message || 'Keyword intelligence recalculated successfully');
        if (onAnalysisUpdated) onAnalysisUpdated();
      }
    } catch (err) {
      console.error('Failed to recalculate keywords:', err);
      toast.error(err.response?.data?.message || 'Failed to recalculate keyword intelligence');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle inspect single keyword
  const handleInspectKeyword = async (keywordName) => {
    try {
      const res = await getKeywordEvidence(analysisId, keywordName);
      if (res.data?.success) {
        setInspectedKeywordData(res.data);
      }
    } catch (err) {
      console.error('Failed to inspect keyword evidence:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Metrics */}
      <KeywordKPICards
        keywordAnalytics={keywordAnalytics}
        onRecalculate={handleRecalculate}
        isRecalculating={isRecalculating}
      />

      {/* 2. Visual Charts: Category & Section Distribution */}
      <KeywordDistributionCharts
        categoryBreakdown={keywordAnalytics.categoryBreakdown || []}
        sectionDistribution={keywordAnalytics.sectionDistribution || []}
        summaryKPIs={keywordAnalytics.summaryKPIs || {}}
      />

      {/* 3. Detailed Comparison Matrix Table */}
      <KeywordComparisonTable
        matchedKeywords={keywordAnalytics.matchedKeywords || []}
        onInspectKeyword={handleInspectKeyword}
      />

      {/* 4. Resume Keyword Highlighter & Evidence Explorer */}
      <ResumeKeywordHighlighter
        resumeText={resumeText}
        matchedKeywords={keywordAnalytics.matchedKeywords || []}
        overuseWarnings={keywordAnalytics.overuseWarnings || []}
      />

      {/* 5. Missing Keyword Prioritization & Ethical Actions */}
      <MissingKeywordPrioritizer
        missingPriorities={keywordAnalytics.missingPriorities || []}
      />

      {/* 6. Contextual Bullet Optimizer (Formula: Action + Tool + Task + Outcome + Metrics) */}
      <ContextualBulletOptimizer
        contextualBulletImprovements={keywordAnalytics.contextualBulletImprovements || []}
      />

      {/* 7. Action Verb Variety & Job Title Seniority Alignment */}
      <ActionVerbAndTitleCard
        actionVerbAnalytics={keywordAnalytics.actionVerbAnalytics || {}}
        jobTitleAlignment={keywordAnalytics.jobTitleAlignment || {}}
      />

      {/* Inspected Keyword Detail Modal */}
      {inspectedKeywordData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">{inspectedKeywordData.keyword} - Keyword Inspection</h3>
              <button onClick={() => setInspectedKeywordData(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="text-slate-300 font-semibold">Optimization Contribution: {inspectedKeywordData.optimizationContribution}</div>
              <div className="p-3 bg-slate-950 rounded-lg text-slate-300 italic">"{inspectedKeywordData.evidenceItem?.bestEvidence}"</div>
              <p className="text-slate-400">{inspectedKeywordData.scoreImpactExplanation}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setInspectedKeywordData(null)} className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSKeywordIntelligenceSection;
