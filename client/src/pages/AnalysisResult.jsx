import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, TrendingUp,
  Award, ChevronLeft, FileText, Briefcase, Upload, History, Sparkles,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import ScoreChart from '../components/dashboard/ScoreChart';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { getAnalysisById } from '../api/analysisApi';

// ── Score Ring (big circular indicator) ──────────────────────────────────────
const ScoreRing = ({ score, label, color, size = 120 }) => {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ fill: 'var(--color-text)', fontSize: size * 0.18, fontWeight: 800, transform: `rotate(90deg)`, transformOrigin: 'center' }}>
          {score}
        </text>
      </svg>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{label}</p>
    </div>
  );
};

// ── Skill pills ───────────────────────────────────────────────────────────────
const SkillPill = ({ skill, type }) => {
  const colors = {
    matched: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
    missing: { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  text: '#ef4444' },
    extra:   { bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.25)',  text: '#06b6d4' },
  };
  const c = colors[type];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 12px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 500,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {type === 'matched' && <CheckCircle size={11} />}
      {type === 'missing' && <XCircle size={11} />}
      {skill}
    </span>
  );
};

// ── Score breakdown row ───────────────────────────────────────────────────────
const BreakdownRow = ({ label, score, max, detail, delay }) => {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ color: 'var(--color-text)', fontSize: '0.86rem', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color }}>{score}<span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>/{max}</span></span>
      </div>
      <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '5px' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: delay + 0.1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 99 }}
        />
      </div>
      {detail && <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>{detail}</p>}
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AnalysisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getAnalysisById(id);
        setAnalysis(data.analysis);
      } catch (err) {
        setError('Could not load this analysis. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <Loader text="Loading analysis results..." />
      </div>
    </>
  );

  if (error || !analysis) return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', fontWeight: 600 }}>{error || 'Analysis not found.'}</p>
          <div style={{ marginTop: '20px' }}><Button onClick={() => navigate('/history')}>← Back to History</Button></div>
        </div>
      </PageContainer>
    </>
  );

  const { atsScore, matchPercentage, matchedSkills = [], missingSkills = [], extraSkills = [],
    strengths = [], weaknesses = [], recommendations = [], scoreBreakdown = {}, jobRole,
    resumeId, createdAt } = analysis;

  const atsColor = atsScore >= 70 ? '#22c55e' : atsScore >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <Navbar />
      <PageContainer>
        {/* Back + title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '28px' }}>
          <button onClick={() => navigate('/history')}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <ChevronLeft size={16} /> Back to History
          </button>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>Analysis Result</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {jobRole && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-muted)', fontSize: '0.83rem' }}>
                <Briefcase size={13} /> {jobRole}
              </span>
            )}
            {resumeId?.originalFileName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-muted)', fontSize: '0.83rem' }}>
                <FileText size={13} /> {resumeId.originalFileName}
              </span>
            )}
            <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </motion.div>

        {/* ── Hero Score Row ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '20px', padding: '32px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px',
          }}>
          <ScoreRing score={atsScore} label="ATS Score" color={atsColor} size={130} />
          <ScoreRing score={matchPercentage} label="Job Match %" color="#6366f1" size={130} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>Skills Matched</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>{matchedSkills.length}</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>of {matchedSkills.length + missingSkills.length} required</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>Missing Skills</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{missingSkills.length}</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>skills to add</p>
          </div>
        </motion.div>

        {/* ── Two-column grid ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Matched Skills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={17} color="#22c55e" />
              <h3 style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>Matched Skills</h3>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>{matchedSkills.length} found</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {matchedSkills.length > 0
                ? matchedSkills.map(s => <SkillPill key={s} skill={s} type="matched" />)
                : <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>No matched skills detected.</p>}
            </div>
          </motion.div>

          {/* Missing Skills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <XCircle size={17} color="#ef4444" />
              <h3 style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>Missing Skills</h3>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>{missingSkills.length} to add</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {missingSkills.length > 0
                ? missingSkills.map(s => <SkillPill key={s} skill={s} type="missing" />)
                : <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>No missing skills — great fit! ✅</p>}
            </div>
          </motion.div>
        </div>

        {/* ── Score Breakdown ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Target size={17} color="#818cf8" />
            <h3 style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>Score Breakdown</h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-muted)' }}>Total: {atsScore}/100</span>
          </div>
          {scoreBreakdown.keywordMatch       && <BreakdownRow label="Keyword Match"        score={scoreBreakdown.keywordMatch.score}        max={40} detail={scoreBreakdown.keywordMatch.detail}        delay={0.22} />}
          {scoreBreakdown.skillsOverlap      && <BreakdownRow label="Skills Overlap"       score={scoreBreakdown.skillsOverlap.score}       max={20} detail={scoreBreakdown.skillsOverlap.detail}       delay={0.26} />}
          {scoreBreakdown.sectionCompleteness&& <BreakdownRow label="Section Completeness" score={scoreBreakdown.sectionCompleteness.score} max={20} detail={scoreBreakdown.sectionCompleteness.detail} delay={0.30} />}
          {scoreBreakdown.formatting         && <BreakdownRow label="Formatting & Structure"score={scoreBreakdown.formatting.score}         max={10} detail={scoreBreakdown.formatting.detail}         delay={0.34} />}
          {scoreBreakdown.experienceRelevance&& <BreakdownRow label="Experience Relevance" score={scoreBreakdown.experienceRelevance.score} max={10} detail={scoreBreakdown.experienceRelevance.detail} delay={0.38} />}
        </motion.div>

        {/* ── Strengths, Weaknesses, Recommendations ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {/* Strengths */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Award size={17} color="#22c55e" />
              <h3 style={{ color: '#22c55e', fontSize: '0.95rem', fontWeight: 700 }}>Strengths</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {strengths.length > 0 ? strengths.map((s, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', color: 'var(--color-text)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  <CheckCircle size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} /> {s}
                </li>
              )) : <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>—</p>}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <XCircle size={17} color="#ef4444" />
              <h3 style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 700 }}>Weaknesses</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {weaknesses.length > 0 ? weaknesses.map((w, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', color: 'var(--color-text)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} /> {w}
                </li>
              )) : <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>—</p>}
            </ul>
          </motion.div>

          {/* Recommendations */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Lightbulb size={17} color="#818cf8" />
              <h3 style={{ color: '#818cf8', fontSize: '0.95rem', fontWeight: 700 }}>Recommendations</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recommendations.length > 0 ? recommendations.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', color: 'var(--color-text)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  <TrendingUp size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} /> {r}
                </li>
              )) : <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>—</p>}
            </ul>
          </motion.div>
        </div>

        {/* Extra skills */}
        {extraSkills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TrendingUp size={17} color="#06b6d4" />
              <h3 style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>Your Bonus Skills <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '0.82rem' }}>(not in JD, but impressive)</span></h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {extraSkills.map(s => <SkillPill key={s} skill={s} type="extra" />)}
            </div>
          </motion.div>
        )}

        {/* ── Additional Action CTEs (Phase 3 Maps) ───────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
          <h3 style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Take Action on Your Results</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate(`/deep-report/${id}`)} variant="primary"><Sparkles size={15} /> Deep AI Report</Button>
            <Button onClick={() => navigate(`/report/${id}`)} variant="secondary"><FileText size={15} /> Quick Report</Button>
            <Button onClick={() => navigate(`/study-plan/${id}`)} variant="secondary"><Target size={15} /> Study Plan</Button>
            <Button onClick={() => navigate(`/progress/${id}`)} variant="ghost"><CheckCircle size={15} /> Progress</Button>
          </div>
        </motion.div>

        {/* Global CTA */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <Button onClick={() => navigate('/upload')} variant="primary"><Upload size={15} /> New Analysis</Button>
          <Button onClick={() => navigate('/history')} variant="secondary"><History size={15} /> View History</Button>
        </div>
      </PageContainer>
    </>
  );
};

export default AnalysisResult;
