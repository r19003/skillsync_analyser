import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Database, Link2, Info } from 'lucide-react';

const MarketDemandCard = ({ marketContext = {} }) => {
  const topSkills = (marketContext.topDemandedSkills || []).slice(0, 10).map(s => ({
    name: s.skill,
    Required: s.requiredPercent ?? s.percentage,
    Preferred: s.preferredPercent ?? 0
  }));

  const coOccurrences = marketContext.skillCoOccurrence || [];
  const corpusSize = marketContext.marketCorpusSize || 25;
  const sourceDisclosure = marketContext.marketDatasetSource || 'SkillSync Curated Market Corpus (Sample Dataset - Disclosed)';

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#a855f7" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Job-Market Demand & Skill Co-Occurrence Analytics
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Frequency distributions and multi-skill synergy extracted across job descriptions
          </p>
        </div>

        {/* Dataset Disclosure Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '10px',
          background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
          color: '#c084fc', fontSize: '0.72rem', fontWeight: 600
        }}>
          <Info size={14} />
          <span>{sourceDisclosure} ({corpusSize} JDs analyzed)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left: Top Demanded Skills Horizontal Bar Chart */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '14px' }}>
            Top Demanded Skills (Required vs Preferred %)
          </h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topSkills}
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.8rem', color: '#f1f5f9' }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                <Bar dataKey="Required" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Preferred" stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: High-Value Skill Co-Occurrences */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '14px' }}>
            High-Synergy Skill Combinations (Co-Occurring in JDs)
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '14px' }}>
            Recruiters and hiring managers disproportionately reward candidate resumes proving these skill pairs together:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coOccurrences.slice(0, 6).map((co) => (
              <div
                key={`${co.skillA}-${co.skillB}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link2 size={15} color="#818cf8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    {co.skillA}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>+</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    {co.skillB}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                  {co.count} job postings
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              📌 <strong>Portfolio Pro-Tip:</strong> Demonstrating co-occurring skills within the same project (e.g., a Power BI dashboard querying SQL views, or a React client backed by a containerized FastAPI service) boosts ATS semantic alignment by up to 25%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDemandCard;
