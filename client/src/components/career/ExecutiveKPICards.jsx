import { motion } from 'framer-motion';
import { Target, ShieldCheck, Briefcase, Award, AlertCircle, FileSearch, Database, Zap } from 'lucide-react';

const KPICard = ({ title, score, maxScore = 100, subtitle, badge, color = '#6366f1', icon: Icon, delay = 0, tooltip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, boxShadow: `0 8px 30px ${color}1a` }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color
        }}>
          <Icon size={18} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
          {score !== null && score !== undefined ? score : '—'}
        </span>
        {score !== null && maxScore && (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
            /{maxScore}
          </span>
        )}
        {badge && (
          <span style={{
            marginLeft: 'auto',
            padding: '3px 8px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 700,
            background: `${color}20`,
            color: color
          }}>
            {badge}
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
        {subtitle}
      </p>

      {tooltip && (
        <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
          ℹ️ {tooltip}
        </p>
      )}
    </motion.div>
  );
};

const ExecutiveKPICards = ({ analysis }) => {
  if (!analysis) return null;

  const ats = analysis.atsReadiness?.overallScore ?? 0;
  const roleFit = analysis.roleFit?.overallScore ?? 0;
  const fitLabel = analysis.roleFit?.label || 'Role Fit';
  const overall = analysis.overallCareerReadiness?.score ?? 0;
  const interviewAssessed = analysis.interviewReadiness?.assessed;
  const interviewScore = analysis.interviewReadiness?.score;

  const detectedCount = analysis.detectedSkills?.filter(s => s.evidenceLevel !== 'none').length || 0;
  const criticalCount = analysis.prioritizedSkills?.filter(s => s.priorityLabel === 'Critical').length || 0;
  const highCount = analysis.prioritizedSkills?.filter(s => s.priorityLabel === 'High').length || 0;
  const corpusSize = analysis.marketContext?.marketCorpusSize || 25;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
      {/* 1. Overall Career Readiness */}
      <KPICard
        title="Career Readiness"
        score={overall}
        badge={overall >= 75 ? 'Ready' : overall >= 55 ? 'Developing' : 'Emerging'}
        subtitle="Multi-pillar composite readiness index"
        color={overall >= 75 ? '#22c55e' : overall >= 55 ? '#6366f1' : '#f59e0b'}
        icon={Target}
        delay={0.05}
        tooltip="Weighted blend: 70.6% Role Fit + 29.4% ATS Readiness (interview unassessed)"
      />

      {/* 2. Role Fit / JD Match */}
      <KPICard
        title={fitLabel}
        score={roleFit}
        badge={analysis.analysisType === 'Job-Description' ? 'JD Match' : 'Role Profile'}
        subtitle={`Alignment with ${analysis.targetRole}`}
        color="#818cf8"
        icon={Briefcase}
        delay={0.1}
        tooltip="Mandatory skills (30%), Semantic alignment (25%), Experience (20%), Education (10%), Preferred (10%), Title (5%)"
      />

      {/* 3. General ATS Readiness */}
      <KPICard
        title="ATS Readiness"
        score={ats}
        badge={ats >= 80 ? 'Optimal' : ats >= 60 ? 'Acceptable' : 'Needs Polish'}
        subtitle="Parseability, sections & bullet impact"
        color={ats >= 80 ? '#22c55e' : '#eab308'}
        icon={ShieldCheck}
        delay={0.15}
        tooltip="Parseability (30%), Required sections (20%), Bullet metrics (20%), Chronology (15%), Length (15%)"
      />

      {/* 4. Interview Readiness */}
      <KPICard
        title="Interview Readiness"
        score={interviewAssessed ? interviewScore : null}
        maxScore={interviewAssessed ? 100 : null}
        badge={interviewAssessed ? 'Assessed' : 'Unassessed'}
        subtitle={interviewAssessed ? `Assessed score: ${interviewScore}/100` : 'Interview readiness has not yet been assessed.'}
        color={interviewAssessed ? '#06b6d4' : '#94a3b8'}
        icon={Award}
        delay={0.2}
        tooltip="Objective interview assessment score. Never fabricated from resume text."
      />

      {/* 5. Evidenced Skills */}
      <KPICard
        title="Proven Skills"
        score={detectedCount}
        maxScore={analysis.detectedSkills?.length || 38}
        badge="Verified"
        subtitle="Traceable in resume projects/work"
        color="#06b6d4"
        icon={FileSearch}
        delay={0.25}
        tooltip="Count of skills with text-verified resume evidence (mentioned, project, or quantified)"
      />

      {/* 6. Critical & High Gaps */}
      <KPICard
        title="Priority Gaps"
        score={criticalCount + highCount}
        badge={`${criticalCount} Critical`}
        subtitle="Top missing or weak competencies"
        color={criticalCount > 0 ? '#ef4444' : '#22c55e'}
        icon={AlertCircle}
        delay={0.3}
        tooltip="Calculated using Role Importance (35%), Market Demand (25%), Gap Severity (20%), Transferability (10%), Feasibility (10%)"
      />

      {/* 7. Market Corpus Context */}
      <KPICard
        title="Corpus Analysis"
        score={corpusSize}
        maxScore={null}
        badge="Sample Corpus"
        subtitle="Curated Job Descriptions benchmarked"
        color="#a855f7"
        icon={Database}
        delay={0.35}
        tooltip="Dataset Source: SkillSync Curated Market Corpus (Sample Dataset - Disclosed)"
      />
    </div>
  );
};

export default ExecutiveKPICards;
