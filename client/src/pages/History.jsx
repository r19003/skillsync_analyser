import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, FileText, Brain, Trash2, ChevronRight, AlertCircle, Upload, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { getMyAnalyses, deleteAnalysis } from '../api/analysisApi';

// ── Score badge ───────────────────────────────────────────────────────────────
const ScoreBadge = ({ score, label }) => {
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444';
  const bg    = score >= 70 ? 'rgba(34,197,94,0.1)' : score >= 45 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: bg, borderRadius: '10px', padding: '8px 14px', marginBottom: '3px' }}>
        <p style={{ fontSize: '1.15rem', fontWeight: 800, color }}>{score}</p>
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{label}</p>
    </div>
  );
};

// ── History card ──────────────────────────────────────────────────────────────
const HistoryCard = ({ analysis, onDelete, delay }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteAnalysis(analysis._id);
      toast.success('Analysis deleted.');
      onDelete(analysis._id);
    } catch {
      toast.error('Could not delete. Try again.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={() => navigate(`/analysis/${analysis._id}`)}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)', x: 2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '18px 20px', borderRadius: '14px', cursor: 'pointer',
        border: '1px solid var(--color-border)', background: 'var(--color-surface)',
        transition: 'all 0.2s', marginBottom: '10px',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Brain size={20} color="#818cf8" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {analysis.resumeId?.originalFileName || 'Resume Analysis'}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>
            {analysis.jobRole || 'Role not detected'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>·</span>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>
            {new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
        <ScoreBadge score={analysis.atsScore ?? 0} label="ATS" />
        <ScoreBadge score={analysis.matchPercentage ?? 0} label="Match%" />
      </div>

      {/* Delete + chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: confirmDelete ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${confirmDelete ? 'rgba(239,68,68,0.45)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '8px', padding: '7px 10px', color: '#ef4444', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 500,
          }}
        >
          <Trash2 size={13} />
          {confirmDelete ? 'Confirm?' : ''}
        </motion.button>
      </div>
      <ChevronRight size={16} color="var(--color-muted)" style={{ flexShrink: 0 }} />
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyAnalyses();
        setAnalyses(data.analyses || []);
      } catch {
        toast.error('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = (id) => setAnalyses(prev => prev.filter(a => a._id !== id));

  const filtered = analyses.filter(a =>
    !search ||
    a.resumeId?.originalFileName?.toLowerCase().includes(search.toLowerCase()) ||
    a.jobRole?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <PageContainer>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <HistoryIcon size={16} color="#818cf8" />
              <span style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>History</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>Analysis History</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{analyses.length} total {analyses.length === 1 ? 'analysis' : 'analyses'}</p>
          </div>
          <Button onClick={() => navigate('/upload')}><Upload size={15} /> New Analysis</Button>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
            <Loader text="Loading history..." />
          </div>
        ) : analyses.length === 0 ? (
          /* Empty state */
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--color-surface)', border: '1px dashed rgba(99,102,241,0.35)',
              borderRadius: '20px', padding: '72px 32px', textAlign: 'center',
            }}>
            <div style={{
              width: 72, height: 72, borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <AlertCircle size={32} color="#818cf8" />
            </div>
            <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>No analyses yet</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', maxWidth: 320, margin: '0 auto 24px' }}>
              Upload your resume and analyze it against a job description to see results here.
            </p>
            <Button onClick={() => navigate('/upload')}><Upload size={15} /> Run Your First Analysis</Button>
          </motion.div>
        ) : (
          <>
            {/* Search bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              style={{ position: 'relative', marginBottom: '20px', maxWidth: 380 }}>
              <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by filename or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 38px',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: '10px', color: 'var(--color-text)', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem', outline: 'none',
                }}
              />
            </motion.div>

            {/* List */}
            <AnimatePresence>
              {filtered.length === 0 ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ color: 'var(--color-muted)', textAlign: 'center', paddingTop: '40px', fontSize: '0.9rem' }}>
                  No results matching "{search}"
                </motion.p>
              ) : (
                filtered.map((a, i) => (
                  <HistoryCard key={a._id} analysis={a} onDelete={handleDelete} delay={i * 0.05} />
                ))
              )}
            </AnimatePresence>
          </>
        )}
      </PageContainer>
    </>
  );
};

export default History;
