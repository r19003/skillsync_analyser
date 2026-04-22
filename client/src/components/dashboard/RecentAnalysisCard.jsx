import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, TrendingUp } from 'lucide-react';

/**
 * RecentAnalysisCard — shows one item from analysis history.
 * Clickable → navigates to full analysis result.
 */
const RecentAnalysisCard = ({ analysis, delay = 0 }) => {
  const navigate = useNavigate();

  const atsScore = analysis.atsScore ?? 0;
  const matchPct = analysis.matchPercentage ?? 0;

  // Color based on ATS score
  const scoreColor = atsScore >= 70 ? '#22c55e' : atsScore >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
      onClick={() => navigate(`/analysis/${analysis._id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 16px', borderRadius: '12px',
        border: '1px solid var(--color-border)',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
        background: 'rgba(99,102,241,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FileText size={18} color="#818cf8" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {analysis.resumeId?.originalFileName || 'Resume Analysis'}
        </p>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.775rem' }}>
          {analysis.jobRole || 'Role not detected'} · {new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: '2px' }}>ATS</p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: scoreColor }}>{atsScore}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: '2px' }}>Match</p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8' }}>{matchPct}%</p>
        </div>
        <ChevronRight size={16} color="var(--color-muted)" />
      </div>
    </motion.div>
  );
};

export default RecentAnalysisCard;
