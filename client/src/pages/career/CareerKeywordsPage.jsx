import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerAnalyticsApi from '../../api/careerAnalyticsApi';
import KeywordKPICards from '../../components/career/keywords/KeywordKPICards';
import KeywordComparisonTable from '../../components/career/keywords/KeywordComparisonTable';
import ResumeKeywordHighlighter from '../../components/career/keywords/ResumeKeywordHighlighter';
import MissingKeywordPrioritizer from '../../components/career/keywords/MissingKeywordPrioritizer';
import ActionVerbAndTitleCard from '../../components/career/keywords/ActionVerbAndTitleCard';
import ContextualBulletOptimizer from '../../components/career/keywords/ContextualBulletOptimizer';
import toast from 'react-hot-toast';

const CareerKeywordsPage = () => {
  const { analysisId } = useParams();

  const [keywordAnalytics, setKeywordAnalytics] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeSection, setActiveSection] = useState('matrix'); // 'matrix' | 'highlighter' | 'prioritizer' | 'bullets'

  useEffect(() => {
    let isMounted = true;
    const fetchKeywords = async () => {
      try {
        const res = await careerAnalyticsApi.getKeywordAnalytics(analysisId);
        if (isMounted && res.data?.success) {
          setKeywordAnalytics(res.data.keywordAnalytics);
        }
        // Also fetch general analysis for resumeText
        const mainRes = await careerAnalyticsApi.getCareerAnalysis(analysisId);
        if (isMounted && mainRes.data?.success) {
          setResumeText(mainRes.data.analysis?.resumeSnapshot?.rawText || '');
        }
      } catch (err) {
        console.error('Fetch keyword analytics error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchKeywords();
    return () => { isMounted = false; };
  }, [analysisId]);

  const handleRecalculate = async (customJdText) => {
    setIsRecalculating(true);
    try {
      const res = await careerAnalyticsApi.recalculateKeywords(analysisId, customJdText);
      if (res.data?.success) {
        setKeywordAnalytics(res.data.keywordAnalytics);
        toast.success(`Keyword Optimization Score: ${res.data.keywordAnalytics?.optimizationScore}%`);
      }
    } catch (err) {
      toast.error('Failed to recalculate keywords.');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="ATS Keyword Intelligence" subtitle="Scanning vocabulary against target role qualifications...">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  return (
    <CareerWorkspaceLayout
      title="ATS Keyword Intelligence"
      subtitle="19-category taxonomy audit evaluating critical coverage, natural density, and section dispersion."
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <KeywordKPICards
          keywordAnalytics={keywordAnalytics}
          onRecalculate={handleRecalculate}
          isRecalculating={isRecalculating}
        />

        {/* Section View Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {[
            { id: 'matrix', label: 'Comparison Matrix' },
            { id: 'highlighter', label: 'Resume Tag Cloud & Evidence' },
            { id: 'prioritizer', label: 'Missing Keyword Priorities' },
            { id: 'bullets', label: 'Bullet Optimizer' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeSection === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab View */}
        {activeSection === 'matrix' && (
          <KeywordComparisonTable
            matchedKeywords={keywordAnalytics?.matchedKeywords || []}
            missingKeywords={keywordAnalytics?.missingKeywords || []}
            unsupportedKeywords={keywordAnalytics?.unsupportedKeywords || []}
          />
        )}

        {activeSection === 'highlighter' && (
          <ResumeKeywordHighlighter
            resumeText={resumeText}
            matchedKeywords={keywordAnalytics?.matchedKeywords || []}
            overuseWarnings={keywordAnalytics?.overuseWarnings || []}
          />
        )}

        {activeSection === 'prioritizer' && (
          <MissingKeywordPrioritizer
            missingPriorities={keywordAnalytics?.missingPriorities || {}}
          />
        )}

        {activeSection === 'bullets' && (
          <div className="space-y-6">
            <ContextualBulletOptimizer
              bulletImprovements={keywordAnalytics?.contextualBulletImprovements || []}
            />
            <ActionVerbAndTitleCard
              actionVerbAnalytics={keywordAnalytics?.actionVerbAnalytics || {}}
              jobTitleAlignment={keywordAnalytics?.jobTitleAlignment || {}}
            />
          </div>
        )}
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerKeywordsPage;
