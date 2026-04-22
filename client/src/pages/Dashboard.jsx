import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BarChart2, History, Upload, Sparkles, ArrowRight, TrendingUp, Target, AlertCircle, CheckCircle, Brain, GitCompare } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentAnalysisCard from '../components/dashboard/RecentAnalysisCard';
import ScoreChart from '../components/dashboard/ScoreChart';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import useAuth from '../hooks/useAuth';
import { getMyAnalyses } from '../api/analysisApi';
import { getMyResumes } from '../api/resumeApi';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysisRes, resumeRes] = await Promise.all([getMyAnalyses(), getMyResumes()]);
        setAnalyses(analysisRes.data.analyses || []);
        setResumeCount(resumeRes.data.resumes?.length || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgATS = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.atsScore || 0), 0) / analyses.length)
    : 0;
  const avgMatch = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.matchPercentage || 0), 0) / analyses.length)
    : 0;
  const bestATS = analyses.length ? Math.max(...analyses.map(a => a.atsScore || 0)) : 0;
  const latest = analyses[0] || null;

  return (
    <>
      <Navbar />
      <PageContainer>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <Loader text="Loading your dashboard..." />
          </div>
        ) : (
          <>
            {/* ── Welcome Header ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={16} color="#818cf8" />
                  <span style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Dashboard
                  </span>
                </div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>
                  Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
                </h1>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                  Here's an overview of your resume performance
                </p>
              </div>
              <Button onClick={() => navigate('/upload')} size="md">
                <Upload size={15} /> Upload Resume
              </Button>
            </motion.div>

            {/* ── Summary Cards ──────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <SummaryCard title="Resumes Uploaded" value={resumeCount} subtitle="Total PDFs on file"         icon={FileText}   color="#6366f1" delay={0.05} />
              <SummaryCard title="Analyses Run"     value={analyses.length} subtitle="Total analyses done"    icon={BarChart2}  color="#06b6d4" delay={0.10} />
              <SummaryCard title="Avg ATS Score"    value={avgATS || '—'}  subtitle="Across all analyses"    icon={TrendingUp} color="#f59e0b" delay={0.15} />
              <SummaryCard title="Best ATS Score"   value={bestATS || '—'} subtitle="Your highest score yet" icon={Target}     color="#22c55e" delay={0.20} />
            </div>

            {/* ── Main Content ───────────────────────────────── */}
            {analyses.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                style={{
                  background: 'var(--color-surface)', border: '1px dashed rgba(99,102,241,0.35)',
                  borderRadius: '20px', padding: '60px 32px', textAlign: 'center',
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <AlertCircle size={32} color="#818cf8" />
                </div>
                <h3 style={{ color: 'var(--color-text)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                  No analyses yet
                </h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', maxWidth: 340, margin: '0 auto 24px' }}>
                  Upload your resume and paste a job description to get your first ATS score and skill-gap analysis.
                </p>
                <Button onClick={() => navigate('/upload')}>
                  <Upload size={15} /> Start Your First Analysis <ArrowRight size={15} />
                </Button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
                {/* Recent Analyses list */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 700 }}>Recent Analyses</h2>
                    <button
                      onClick={() => navigate('/history')}
                      style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      View all <ArrowRight size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analyses.slice(0, 5).map((a, i) => (
                      <RecentAnalysisCard key={a._id} analysis={a} delay={0.1 + i * 0.06} />
                    ))}
                  </div>
                </div>

                {/* Right panel — chart + latest stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Score chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: '16px', padding: '24px', textAlign: 'center',
                    }}
                  >
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                      Latest Result
                    </p>
                    <ScoreChart atsScore={latest?.atsScore || 0} matchPercentage={latest?.matchPercentage || 0} />
                  </motion.div>

                  {/* Quick stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: '16px', padding: '20px',
                    }}
                  >
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                      Your Averages
                    </p>
                    {[
                      { label: 'Avg ATS Score', value: avgATS, color: '#6366f1', max: 100 },
                      { label: 'Avg Match %',   value: avgMatch, color: '#06b6d4', max: 100 },
                    ].map(({ label, value, color, max }) => (
                      <div key={label} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>{label}</span>
                          <span style={{ color: 'var(--color-text)', fontSize: '0.8rem', fontWeight: 700 }}>{value}</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / max) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: color, borderRadius: 99 }}
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  {latest && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Latest Action Plan</p>
                      <Button onClick={() => navigate(`/deep-report/${latest._id}`)} fullWidth variant="primary">
                        <Brain size={15} /> Deep AI Report
                      </Button>
                      <Button onClick={() => navigate(`/report/${latest._id}`)} fullWidth variant="secondary">
                        <FileText size={15} /> Quick Report
                      </Button>
                      <Button onClick={() => navigate(`/study-plan/${latest._id}`)} fullWidth variant="secondary">
                        <Target size={15} /> Study Plan
                      </Button>
                      <Button onClick={() => navigate(`/progress/${latest._id}`)} fullWidth variant="secondary">
                        <CheckCircle size={15} /> Progress Tracker
                      </Button>
                      <Button onClick={() => navigate('/compare')} fullWidth variant="ghost">
                        <GitCompare size={15} /> Compare Resumes
                      </Button>
                    </motion.div>
                  )}

                  {/* New analysis CTA */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                    <Button onClick={() => navigate('/upload')} fullWidth>
                      <Upload size={15} /> New Analysis
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}
          </>
        )}
      </PageContainer>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
