import { useState, useMemo } from 'react';
import { FileSearch, Search, CheckCircle, ShieldAlert, Sparkles, Filter } from 'lucide-react';

const evidenceBadgeStyles = {
  quantified: { label: 'Quantified Metric (100)', bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  experience: { label: 'Work Experience (85)',   bg: 'rgba(6,182,212,0.15)', text: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
  project:    { label: 'Project Portfolio (65)', bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  mentioned:  { label: 'Keyword Listed (30)',    bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  none:       { label: 'No Evidence (0)',        bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' }
};

const TraceableEvidenceViewer = ({ detectedSkills = [] }) => {
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return detectedSkills.filter(s => {
      const matchSearch = s.canonicalSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.exactSentence && s.exactSentence.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchLevel = filterLevel === 'all' || s.evidenceLevel === filterLevel;
      return matchSearch && matchLevel;
    });
  }, [detectedSkills, filterLevel, searchTerm]);

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSearch size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Traceable Resume Evidence Ledger
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Deterministic extraction verifying exact sentences extracted directly from your resume PDF
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all" style={{ background: '#111827' }}>All Evidence Levels</option>
            <option value="quantified" style={{ background: '#111827' }}>Quantified Only</option>
            <option value="experience" style={{ background: '#111827' }}>Work Experience</option>
            <option value="project" style={{ background: '#111827' }}>Projects</option>
            <option value="mentioned" style={{ background: '#111827' }}>Mentioned Only</option>
            <option value="none" style={{ background: '#111827' }}>Unsubstantiated</option>
          </select>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--color-muted)' }}>
            No skills matched the current search and filter parameters.
          </div>
        ) : (
          filtered.map(item => {
            const badge = evidenceBadgeStyles[item.evidenceLevel] || evidenceBadgeStyles.none;

            return (
              <div
                key={item.canonicalSkill}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
                        {item.canonicalSkill}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                        Section: {item.section} · Category: {item.category}
                      </span>
                    </div>

                    <span style={{
                      padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                      background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  {item.exactSentence ? (
                    <div style={{
                      background: 'rgba(0,0,0,0.25)',
                      borderLeft: `3px solid ${badge.text}`,
                      padding: '8px 10px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      lineHeight: 1.45,
                      fontFamily: 'monospace',
                      marginBottom: '10px'
                    }}>
                      "{item.exactSentence}"
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(239,68,68,0.06)',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#ef4444',
                      fontStyle: 'italic',
                      marginBottom: '10px'
                    }}>
                      ⚠️ No sentence or keyword found in resume text.
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                  {item.evidenceLevel === 'quantified' && (
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>
                      ✓ High-credibility proof: measurable outcome verified by ATS scanner.
                    </span>
                  )}
                  {item.evidenceLevel === 'experience' && (
                    <span>💡 Recommendation: Add specific numbers (% improvement or volume) to reach quantified mastery.</span>
                  )}
                  {item.evidenceLevel === 'project' && (
                    <span>💡 Recommendation: Link GitHub repo or live deployed URL to elevate recruiter confidence.</span>
                  )}
                  {item.evidenceLevel === 'mentioned' && (
                    <span style={{ color: '#f59e0b' }}>⚠️ Warning: Merely listed in skills section. Add a project bullet demonstrating usage.</span>
                  )}
                  {item.evidenceLevel === 'none' && (
                    <span style={{ color: '#ef4444' }}>🚨 Missing completely. Prioritize building an end-to-end portfolio artifact.</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TraceableEvidenceViewer;
