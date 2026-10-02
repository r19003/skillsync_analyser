import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, FileText, Briefcase, Sparkles, AlertCircle,
  Clock, ArrowRight, RefreshCw, ChevronRight, Layers, BarChart2, CheckCircle2,
  KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

import ExecutiveKPICards from '../components/career/ExecutiveKPICards';
import EligibilityWarningsBanner from '../components/career/EligibilityWarningsBanner';
import SkillCategoryRadar from '../components/career/SkillCategoryRadar';
import SkillPriorityScatter from '../components/career/SkillPriorityScatter';
import SkillGapTable from '../components/career/SkillGapTable';
import MarketDemandCard from '../components/career/MarketDemandCard';
import TraceableEvidenceViewer from '../components/career/TraceableEvidenceViewer';
import WhatIfSimulator from '../components/career/WhatIfSimulator';
import RoadmapProgressTracker from '../components/career/RoadmapProgressTracker';
import ATSKeywordIntelligenceSection from '../components/career/ATSKeywordIntelligenceSection';

import { getMyResumes } from '../api/resumeApi';
import {
  analyzeCareerReadiness,
  getCareerAnalysisById,
  getCareerAnalysisHistory
} from '../api/careerAnalyticsApi';

const CareerAnalytics = () => {
  const { id: paramAnalysisId } = useParams();
  const navigate = useNavigate();

  // Selection form states
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Entry-Level Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);

  // Data & loading states
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState('career');

  const fetchAnalysisData = async (id) => {
    try {
      const res = await getCareerAnalysisById(id);
      if (res.data?.analysis) {
        setAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.error('Failed to reload analysis:', err);
    }
  };

  // Load initial resumes, roles, and current analysis if ID in URL
  useEffect(() => {
    const init = async () => {
      try {
        const [resumesRes, historyRes] = await Promise.all([
          getMyResumes(),
          getCareerAnalysisHistory().catch(() => ({ data: { analyses: [] } }))
        ]);

        const userResumes = resumesRes.data.resumes || [];
        setResumes(userResumes);
        if (userResumes.length > 0 && !selectedResumeId) {
          setSelectedResumeId(userResumes[0]._id);
        }

        const hist = historyRes.data.analyses || [];
        setHistoryList(hist);

        if (paramAnalysisId) {
          const analysisRes = await getCareerAnalysisById(paramAnalysisId);
          setAnalysis(analysisRes.data.analysis);
          setSelectedResumeId(analysisRes.data.analysis.resumeId?._id || analysisRes.data.analysis.resumeId);
          setTargetRole(analysisRes.data.analysis.targetRole);
        } else if (hist.length > 0) {
          // Default to most recent analysis if no ID provided in URL
          const recentRes = await getCareerAnalysisById(hist[0]._id);
          setAnalysis(recentRes.data.analysis);
        }
      } catch (err) {
        console.error('Failed to initialize career analytics:', err);
      } finally {
        setInitialFetching(false);
      }
    };
    init();
  }, [paramAnalysisId]);

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!selectedResumeId) {
      toast.error('Please select or upload a resume first.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await analyzeCareerReadiness({
        resumeId: selectedResumeId,
        targetRole,
        jobDescription,
        durationWeeks
      });

      setAnalysis(data.analysis);
      toast.success('Career intelligence analysis complete!');
      navigate(`/career/${data.analysis._id}/overview`);

      // Refresh history list
      const hist = await getCareerAnalysisHistory();
      setHistoryList(hist.data.analyses || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Career analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '80px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <Brain size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                    Career Intelligence & Skill-Gap Analytics
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>
                    MSBA Career Intelligence Platform · Transparent deterministic scoring & evidence verification
                  </p>
                </div>
              </div>
            </div>

            {/* History toggle button */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Clock size={15} />
                <span>History ({historyList.length})</span>
              </button>
            </div>
          </div>

          {/* Past Analyses Drawer (if opened) */}
          {showHistory && (
            <div className="glass" style={{ padding: '20px', borderRadius: '14px', marginBottom: '24px', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Revisit Historical Career Analyses</h4>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>✕</button>
              </div>

              {historyList.length === 0 ? (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem', margin: 0 }}>No past analyses found. Run your first analysis below.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {historyList.map(h => (
                    <div
                      key={h._id}
                      onClick={() => {
                        navigate(`/career-analytics/${h._id}`);
                        setShowHistory(false);
                      }}
                      style={{
                        padding: '12px 14px', borderRadius: '10px',
                        background: analysis?._id === h._id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                        border: analysis?._id === h._id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: '#f1f5f9', display: 'block' }}>{h.targetRole}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                        {new Date(h.createdAt).toLocaleDateString()} · Score: {h.overallCareerReadiness?.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 1: Role and Resume Selection Form */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
            <form onSubmit={handleRunAnalysis}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>

                {/* 1. Resume Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '6px' }}>
                    1. SELECT CANDIDATE RESUME
                  </label>
                  {resumes.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: '#ef4444' }}>
                      No resumes found. <Link to="/upload" style={{ color: '#818cf8' }}>Upload a resume PDF first</Link>.
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={e => setSelectedResumeId(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--color-text)', fontSize: '0.85rem', outline: 'none'
                      }}
                    >
                      {resumes.map(r => (
                        <option key={r._id} value={r._id} style={{ background: '#111827' }}>
                          {r.originalFileName} ({new Date(r.uploadedAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Target Role Track */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '6px' }}>
                    2. TARGET CAREER TRACK
                  </label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--color-text)', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="Entry-Level Software Engineer" style={{ background: '#111827' }}>
                      Entry-Level Software Engineer (with DSA, CS & Systems)
                    </option>
                    <option value="Entry-Level Business Analyst" style={{ background: '#111827' }}>
                      Entry-Level Business Analyst (with Data, Requirements & Agile)
                    </option>
                  </select>
                </div>

                {/* 3. Curriculum Duration */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '6px' }}>
                    3. ROADMAP HORIZON
                  </label>
                  <select
                    value={durationWeeks}
                    onChange={e => setDurationWeeks(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--color-text)', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value={4} style={{ background: '#111827' }}>4-Week Intensive Sprint</option>
                    <option value={6} style={{ background: '#111827' }}>6-Week Balanced Roadmap</option>
                    <option value={8} style={{ background: '#111827' }}>8-Week Comprehensive Masterplan</option>
                  </select>
                </div>
              </div>

              {/* 4. Optional Specific Job Description */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                    4. SPECIFIC JOB DESCRIPTION (OPTIONAL)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {jobDescription.length > 0 ? `${jobDescription.length} chars (Analyzes as "JD Match")` : 'Leave empty for Standardized Role Profile ("Role Fit")'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste specific employer Job Description here (optional). If omitted, SkillSync will analyze against the canonical Role Profile baseline..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--color-text)', fontSize: '0.82rem', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || resumes.length === 0}
                  variant="primary"
                >
                  <Sparkles size={16} />
                  <span>Execute Career Intelligence Scan</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Analytics Results View */}
          {initialFetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader text="Loading Career Intelligence Platform..." />
            </div>
          ) : !analysis ? (
            <div className="glass" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
              <Brain size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>No Analysis Selected</h3>
              <p style={{ color: 'var(--color-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.85rem' }}>
                Select a candidate resume and target track above, then click Execute Career Intelligence Scan to generate the multi-pillar analytical report.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dashboard Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDashboardTab('career')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeDashboardTab === 'career'
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    <span>Career Intelligence & Roadmap</span>
                  </button>

                  <button
                    onClick={() => setActiveDashboardTab('keywords')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeDashboardTab === 'keywords'
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>ATS Keyword Intelligence</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {analysis.keywordAnalytics?.optimizationScore !== undefined ? `${analysis.keywordAnalytics.optimizationScore}/100` : 'Scan'}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveDashboardTab('all')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeDashboardTab === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Full Unified Report</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 px-2 hidden sm:block">
                  Target: <span className="text-white font-medium">{analysis.targetRole}</span>
                </div>
              </div>

              {/* View 1: Career Intelligence & Roadmap */}
              {(activeDashboardTab === 'career' || activeDashboardTab === 'all') && (
                <div className="space-y-6">
                  {/* Executive Summary Section */}
                  <ExecutiveKPICards analysis={analysis} />

                  {/* Hard Eligibility Warnings */}
                  <EligibilityWarningsBanner eligibilityWarnings={analysis.eligibilityWarnings} />

                  {/* Category Matrix & Priority Scatter */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
                    <SkillCategoryRadar
                      categoryReadiness={analysis.categoryReadiness}
                      roleTrack={analysis.roleTrack}
                    />
                    <SkillPriorityScatter
                      prioritizedSkills={analysis.prioritizedSkills}
                    />
                  </div>

                  {/* What-If Simulation Engine */}
                  <WhatIfSimulator
                    analysisId={analysis._id}
                    prioritizedSkills={analysis.prioritizedSkills}
                    onSimulationSuccess={(sim) => {
                      setAnalysis(prev => ({
                        ...prev,
                        simulations: [...(prev.simulations || []), sim]
                      }));
                    }}
                  />

                  {/* Detailed Skill Gap Table */}
                  <SkillGapTable
                    prioritizedSkills={analysis.prioritizedSkills}
                  />

                  {/* Job-Market Demand Insights */}
                  <MarketDemandCard
                    marketContext={analysis.marketContext}
                    roleTrack={analysis.roleTrack}
                  />

                  {/* Traceable Resume Evidence Ledger */}
                  <TraceableEvidenceViewer
                    detectedSkills={analysis.detectedSkills}
                  />

                  {/* Personalized Week-by-Week Learning Roadmap */}
                  <RoadmapProgressTracker
                    analysisId={analysis._id}
                    weeklyPlan={analysis.weeklyPlan}
                  />
                </div>
              )}

              {/* View 2: ATS Keyword Intelligence */}
              {(activeDashboardTab === 'keywords' || activeDashboardTab === 'all') && (
                <div className="pt-2">
                  <ATSKeywordIntelligenceSection
                    analysisId={analysis._id}
                    keywordAnalytics={analysis.keywordAnalytics || {}}
                    resumeText={analysis.resumeId?.extractedText || ''}
                    onAnalysisUpdated={() => fetchAnalysisData(analysis._id)}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </PageContainer>
    </>
  );
};

export default CareerAnalytics;
