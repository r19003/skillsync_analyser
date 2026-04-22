import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, User, Shield, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Target, Lightbulb, Zap, BarChart2, Award,
  ChevronDown, ChevronUp, BookOpen, Brain
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { generateDeepReport, getDeepReport } from '../api/deepReportApi';
import toast from 'react-hot-toast';

// ── Design tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary:   '#6366f1',
  secondary:  '#06b6d4',
  success:    '#10b981',
  warning:    '#f59e0b',
  danger:     '#ef4444',
  muted:      '#94a3b8',
};

// ── Reusable components ───────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle, color = COLORS.primary, badge }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>{title}</h2>
      {badge && <span style={{ padding: '3px 10px', background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color }}>{badge}</span>}
    </div>
    {subtitle && <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginLeft: 46 }}>{subtitle}</p>}
  </div>
);

const GlassCard = ({ children, style = {}, glow }) => (
  <div className="glass" style={{ padding: 28, marginBottom: 24, boxShadow: glow ? `0 0 30px ${glow}20` : 'none', borderColor: glow ? `${glow}30` : undefined, ...style }}>
    {children}
  </div>
);

const ScoreBar = ({ label, score, maxScore, color = COLORS.primary }) => {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{label}</span>
        <span style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 700 }}>{score}/{maxScore}</span>
      </div>
      <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
};

const Pill = ({ text, color = '#6366f1', bg }) => (
  <span style={{ padding: '4px 12px', background: bg || `${color}15`, border: `1px solid ${color}35`, borderRadius: 30, fontSize: '0.8rem', fontWeight: 500, color, display: 'inline-block' }}>
    {text}
  </span>
);

const ListItems = ({ items = [], icon: Icon, iconColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {Icon && <Icon size={16} color={iconColor} style={{ flexShrink: 0, marginTop: 3 }} />}
        <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: 1.65 }}>{item}</span>
      </div>
    ))}
  </div>
);

const ExpandPanel = ({ title, children, defaultOpen = false, accent = COLORS.primary }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: open ? `${accent}10` : 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit' }}>
        {title}
        {open ? <ChevronUp size={16} color={COLORS.muted} /> : <ChevronDown size={16} color={COLORS.muted} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--color-border)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FitBadge = ({ fit }) => {
  const map = { strong: { color: '#10b981', label: '🟢 Strong Fit' }, moderate: { color: '#f59e0b', label: '🟡 Moderate Fit' }, weak: { color: '#ef4444', label: '🔴 Weak Fit' } };
  const m = map[fit] || map.weak;
  return <span style={{ padding: '6px 16px', background: `${m.color}20`, border: `1px solid ${m.color}40`, borderRadius: 20, fontSize: '0.9rem', fontWeight: 700, color: m.color }}>{m.label}</span>;
};

// ── Main DeepReport Page ──────────────────────────────────────────────────────
const DeepReport = () => {
  const { id } = useParams(); // analysisId
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport]       = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [userGoal, setUserGoal]   = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const tryFetch = async () => {
      try {
        const { data } = await getDeepReport(id);
        if (data.success) {
          setReport(data.report);
          setStudyPlan(data.studyPlan);
        }
      } catch {
        setShowInput(true); // no existing report → show generate form
      } finally {
        setLoading(false);
      }
    };
    tryFetch();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      toast.loading('Grok + Gemini AI analyzing your resume...', { id: 'gen' });
      const { data } = await generateDeepReport(id, { targetRole, userGoal });
      setReport(data.report);
      setStudyPlan(data.studyPlan);
      setShowInput(false);
      toast.success('Deep AI Report generated!', { id: 'gen' });

      const flags = [];
      if (data.meta?.grokUsed)     flags.push('Grok AI');
      if (data.meta?.geminiUsed)   flags.push('Gemini AI');
      if (data.meta?.fallbackUsed) toast('Fallback mode used — add API keys for full AI power.', { icon: '⚠️' });
      else if (flags.length) toast.success(`Powered by: ${flags.join(' + ')}`, { icon: '🤖' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed', { id: 'gen' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Loading deep analysis..." />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <PageContainer>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Analysis
        </button>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: 16 }}>
            <Brain size={14} /> Grok AI + Gemini AI
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Deep Analysis Report
          </h1>
          <p style={{ color: COLORS.muted, fontSize: '1rem', maxWidth: 600 }}>
            A recruiter-grade critique powered by Grok for deep resume analysis and Gemini for your personalized learning roadmap.
          </p>
        </div>

        {/* ── Generate Form (when no report yet) ────────────────────────────── */}
        {showInput && !report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 36, maxWidth: 640, marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 8, fontSize: '1.3rem' }}>Generate Your AI Report</h2>
            <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: '0.9rem' }}>
              Optionally add context so the AI gives you role-specific, goal-oriented analysis.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Target Role <span style={{ color: '#475569' }}>(optional)</span></label>
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Data Analyst, Frontend Developer" 
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.95rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Your Goal <span style={{ color: '#475569' }}>(optional)</span></label>
                <input value={userGoal} onChange={e => setUserGoal(e.target.value)}
                  placeholder="e.g. Get shortlisted for a data analyst role in 3 months"
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.95rem' }} />
              </div>
              <Button onClick={handleGenerate} loading={generating} size="lg">
                <Sparkles size={16} /> Generate Full AI Report
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Report Sections ──────────────────────────────────────────────── */}
        {report && (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>

            {/* AI source badge + regenerate */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {report.grokUsed   && <Pill text="⚡ Grok AI Analysis"  color="#a78bfa" />}
                {report.geminiUsed && <Pill text="🌟 Gemini Study Plan" color="#06b6d4" />}
                {report.fallbackUsed && <Pill text="⚠️ Fallback Mode" color="#f59e0b" />}
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setReport(null); setShowInput(true); }}>
                Regenerate
              </Button>
            </div>

            {/* ── SECTION 1: Candidate Profile ─────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <GlassCard glow={COLORS.primary}>
                <SectionHeader icon={User} title="Candidate Profile" subtitle="Executive summary of your current positioning" color={COLORS.primary} badge="Section 1" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {[
                    { label: 'Professional Overview', value: report.candidateProfile?.professionalSummary },
                    { label: 'Level Assessment', value: report.candidateProfile?.currentLevelAssessment },
                    { label: 'Target Role Fit', value: report.candidateProfile?.likelyTargetFit },
                  ].map(({ label, value }) => value && (
                    <div key={label} style={{ padding: 18, background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.12)' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</p>
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* ── SECTION 2: ATS Review ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard glow={COLORS.secondary}>
                <SectionHeader icon={Shield} title="ATS & Resume Quality" color={COLORS.secondary} badge="Section 2" />
                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
                  {/* Score ring */}
                  <div style={{ textAlign: 'center', padding: 16, background: `${COLORS.secondary}08`, borderRadius: 16, border: `1px solid ${COLORS.secondary}20` }}>
                    <p style={{ fontSize: '3.5rem', fontWeight: 900, background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {report.atsReview?.compatibilityScore ?? report.atsScore ?? 0}
                    </p>
                    <p style={{ color: COLORS.muted, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>ATS Score</p>
                    {report.scoreBreakdown && (
                      <div style={{ marginTop: 20, textAlign: 'left' }}>
                        {[
                          { k: 'keywordMatch',        l: 'Keyword Match' },
                          { k: 'skillsOverlap',       l: 'Skills Overlap' },
                          { k: 'sectionCompleteness', l: 'Sections' },
                          { k: 'formatting',          l: 'Formatting' },
                          { k: 'experienceRelevance', l: 'Experience' },
                        ].map(({ k, l }) => report.scoreBreakdown[k] && (
                          <ScoreBar key={k} label={l} score={report.scoreBreakdown[k].score} maxScore={report.scoreBreakdown[k].maxScore} color={COLORS.secondary} />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Observations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'Keyword Coverage',      value: report.atsReview?.keywordCoverage },
                      { label: 'Formatting',            value: report.atsReview?.formattingObservations },
                      { label: 'Section Completeness',  value: report.atsReview?.sectionCompleteness },
                      { label: 'Readability for ATS',   value: report.atsReview?.readabilityObservations },
                    ].map(({ label, value }) => value && (
                      <div key={label} style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: 10, borderLeft: `3px solid ${COLORS.secondary}` }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.secondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* ── SECTION 3+4: Strengths & Weaknesses ──────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24, marginBottom: 24 }}>
                <GlassCard style={{ marginBottom: 0 }}>
                  <SectionHeader icon={CheckCircle} title="Resume Strengths" color={COLORS.success} badge="Section 3" />
                  <ListItems items={report.strengths} icon={CheckCircle} iconColor={COLORS.success} />
                </GlassCard>
                <GlassCard style={{ marginBottom: 0 }}>
                  <SectionHeader icon={XCircle} title="Resume Weaknesses" color={COLORS.danger} badge="Section 4" />
                  <ListItems items={report.weaknesses} icon={XCircle} iconColor={COLORS.danger} />
                </GlassCard>
              </div>
            </motion.div>

            {/* ── SECTION 5: JD Comparison ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard glow={COLORS.warning}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                  <SectionHeader icon={BarChart2} title="Resume vs Job Description" color={COLORS.warning} badge="Section 5" subtitle="Detailed skills, keywords, and experience comparison against the JD" />
                  {report.jdComparison?.fitCategory && <FitBadge fit={report.jdComparison.fitCategory} />}
                </div>

                {/* Match score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, padding: 20, background: 'rgba(245,158,11,0.06)', borderRadius: 14, border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: COLORS.warning }}>{report.jdComparison?.overallMatchPercentage ?? 0}%</p>
                    <p style={{ color: COLORS.muted, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Match</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${report.jdComparison?.overallMatchPercentage ?? 0}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${COLORS.danger}, ${COLORS.warning}, ${COLORS.success})` }} />
                    </div>
                    <p style={{ color: COLORS.muted, fontSize: '0.85rem', marginTop: 8 }}>{report.jdComparison?.relevantExperienceMatch}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div style={{ padding: 16, background: 'rgba(16,185,129,0.06)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.success, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      ✅ Matched Skills ({report.jdComparison?.matchedSkills?.length || 0})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {report.jdComparison?.matchedSkills?.map(s => <Pill key={s} text={s} color={COLORS.success} />)}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: 'rgba(239,68,68,0.06)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.danger, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      ❌ Missing Skills ({report.jdComparison?.missingSkills?.length || 0})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {report.jdComparison?.missingSkills?.map(s => <Pill key={s} text={s} color={COLORS.danger} />)}
                    </div>
                  </div>
                </div>

                {report.jdComparison?.priorityGaps?.length > 0 && (
                  <div style={{ padding: 16, background: 'rgba(239,68,68,0.04)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.danger, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🚨 Priority Gaps</p>
                    <ListItems items={report.jdComparison.priorityGaps} icon={AlertTriangle} iconColor={COLORS.danger} />
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* ── SECTION 6: Recommendations ───────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <GlassCard>
                <SectionHeader icon={Lightbulb} title="Detailed Recommendations" color="#a78bfa" badge="Section 6" subtitle="Specific, actionable changes to improve your resume immediately" />
                {report.recommendations && (
                  <>
                    <ExpandPanel title="🔥 Improve First (Highest Impact)" defaultOpen accent="#a78bfa">
                      <ListItems items={report.recommendations.improveFirst} icon={Zap} iconColor="#a78bfa" />
                    </ExpandPanel>
                    <ExpandPanel title="✏️ Sections to Rewrite" accent={COLORS.warning}>
                      <ListItems items={report.recommendations.rewrite} icon={AlertTriangle} iconColor={COLORS.warning} />
                    </ExpandPanel>
                    <ExpandPanel title="➕ Content to Add" accent={COLORS.success}>
                      <ListItems items={report.recommendations.toAdd} icon={CheckCircle} iconColor={COLORS.success} />
                    </ExpandPanel>
                    <ExpandPanel title="➖ Content to Remove" accent={COLORS.danger}>
                      <ListItems items={report.recommendations.toRemove} icon={XCircle} iconColor={COLORS.danger} />
                    </ExpandPanel>
                    <ExpandPanel title="🔧 Section Optimizations" accent={COLORS.secondary}>
                      <ListItems items={report.recommendations.sectionOptimizations} />
                    </ExpandPanel>
                    <ExpandPanel title="🤖 ATS & Readability" accent={COLORS.secondary}>
                      <ListItems items={report.recommendations.atsAndReadability} />
                    </ExpandPanel>
                  </>
                )}
              </GlassCard>
            </motion.div>

            {/* ── SECTION 8: Action Plan ───────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard glow={COLORS.success}>
                <SectionHeader icon={Target} title="Action Plan" color={COLORS.success} badge="Section 8" subtitle="Exactly what to do now, this week, and this month" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {[
                    { label: '⚡ Today',  items: report.actionPlan?.today,     border: COLORS.danger },
                    { label: '📅 This Week', items: report.actionPlan?.thisWeek, border: COLORS.warning },
                    { label: '📆 This Month', items: report.actionPlan?.thisMonth, border: COLORS.primary },
                  ].map(({ label, items, border }) => items?.length > 0 && (
                    <div key={label} style={{ padding: 18, background: 'rgba(0,0,0,0.15)', borderRadius: 12, borderTop: `3px solid ${border}` }}>
                      <p style={{ fontWeight: 700, marginBottom: 14, color: 'var(--color-text)', fontSize: '0.9rem' }}>{label}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {items.map((it, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10 }}>
                            <span style={{ color: border, fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{i + 1}.</span>
                            <span style={{ color: COLORS.muted, fontSize: '0.85rem', lineHeight: 1.55 }}>{it}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {report.actionPlan?.topThreeHighImpactActions?.length > 0 && (
                  <div style={{ marginTop: 20, padding: 20, background: 'rgba(16,185,129,0.07)', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.success, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>🏆 Top 3 Highest-Impact Actions</p>
                    {report.actionPlan.topThreeHighImpactActions.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.6 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* ── SECTION 10: Final Evaluation ─────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <GlassCard style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.06))', border: '1px solid rgba(99,102,241,0.25)' }}>
                <SectionHeader icon={Award} title="Final Evaluation" color={COLORS.primary} badge="Section 10" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <p style={{ fontSize: '2.8rem', fontWeight: 900, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {report.finalEvaluation?.confidenceScore ?? 0}%
                    </p>
                    <p style={{ color: COLORS.muted, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Confidence Score</p>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Job Readiness</p>
                    <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '1.05rem' }}>{report.finalEvaluation?.jobReadinessLevel}</p>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>After Study Plan</p>
                    <p style={{ color: COLORS.success, fontWeight: 700, fontSize: '1.05rem' }}>{report.finalEvaluation?.estimatedReadinessAfterPlan}</p>
                  </div>
                </div>
                {report.finalEvaluation?.motivationalAdvice && (
                  <div style={{ padding: 20, background: 'rgba(99,102,241,0.06)', borderRadius: 14, borderLeft: `4px solid ${COLORS.primary}` }}>
                    <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, fontSize: '0.95rem', fontStyle: 'italic' }}>
                      "{report.finalEvaluation.motivationalAdvice}"
                    </p>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* ── CTA to Study Plan ────────────────────────────────────────── */}
            {studyPlan && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center', padding: '32px 0 20px' }}>
                <p style={{ color: COLORS.muted, marginBottom: 16 }}>Your personalized study roadmap has been generated by Gemini AI.</p>
                <Button onClick={() => navigate(`/adv-study-plan/${studyPlan._id}`)} size="lg">
                  <BookOpen size={18} /> View My AI Study Plan <Sparkles size={14} />
                </Button>
              </motion.div>
            )}

          </div>
        )}
      </PageContainer>
    </>
  );
};

export default DeepReport;
