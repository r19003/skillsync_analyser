import { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Compass, HelpCircle } from 'lucide-react';

const priorityColors = {
  Critical: '#ef4444',
  High:     '#f59e0b',
  Medium:   '#6366f1',
  Low:      '#22c55e'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#111827',
        border: `1px solid ${priorityColors[data.priorityLabel] || 'rgba(255,255,255,0.1)'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        color: '#f1f5f9',
        fontSize: '0.8rem',
        maxWidth: '260px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{data.skill}</strong>
          <span style={{
            padding: '2px 6px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
            background: `${priorityColors[data.priorityLabel]}25`, color: priorityColors[data.priorityLabel]
          }}>
            {data.priorityLabel}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
          <div>Evidence: <strong>{data.currentEvidenceScore}/100</strong></div>
          <div>Importance: <strong>{data.roleImportance}/100</strong></div>
          <div>Market Demand: <strong>{data.marketDemand}%</strong></div>
          <div>Priority Score: <strong>{data.priorityScore}/100</strong></div>
        </div>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.74rem', margin: 0, fontStyle: 'italic' }}>
          {data.explanation}
        </p>
      </div>
    );
  }
  return null;
};

const SkillPriorityScatter = ({ prioritizedSkills = [] }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState('all');

  const data = (prioritizedSkills || []).map(s => ({
    skill: s.skill,
    currentEvidenceScore: s.currentEvidenceScore ?? 0,
    roleImportance: s.roleImportance ?? 75,
    marketDemand: s.marketDemand ?? 75,
    priorityScore: s.priorityScore ?? 50,
    priorityLabel: s.priorityLabel || 'Medium',
    explanation: s.explanation || '',
    effort: s.estimatedEffort || '',
    fill: priorityColors[s.priorityLabel] || '#6366f1'
  }));

  const filteredData = data.filter(d => {
    if (selectedQuadrant === 'learn_now') return d.currentEvidenceScore < 50 && d.roleImportance >= 70;
    if (selectedQuadrant === 'strengthen') return d.currentEvidenceScore >= 50 && d.roleImportance < 70;
    if (selectedQuadrant === 'maintain') return d.currentEvidenceScore >= 50 && d.roleImportance >= 70;
    if (selectedQuadrant === 'optional') return d.currentEvidenceScore < 50 && d.roleImportance < 70;
    return true;
  });

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Skill-Priority & Strategic Learning Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Multi-factor quadrant analysis: X (Current Evidence) vs Y (Role Importance) | Bubble size = Market Demand
          </p>
        </div>

        {/* Quadrant Quick Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'learn_now', label: '🚨 Learn Now (Top-Left)' },
            { id: 'maintain', label: '✅ Maintain (Top-Right)' },
            { id: 'strengthen', label: '⚡ Strengthen' },
            { id: 'optional', label: '💡 Optional' }
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQuadrant(q.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: selectedQuadrant === q.id ? '#06b6d4' : 'rgba(255,255,255,0.04)',
                color: selectedQuadrant === q.id ? '#0a0f1e' : 'var(--color-muted)',
                fontWeight: 600,
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 360, position: 'relative' }}>
        {/* Quadrant background labels */}
        <div style={{ position: 'absolute', top: 35, left: 70, opacity: 0.25, fontWeight: 800, fontSize: '0.9rem', color: '#ef4444', pointerEvents: 'none' }}>
          🚨 LEARN NOW
        </div>
        <div style={{ position: 'absolute', top: 35, right: 40, opacity: 0.25, fontWeight: 800, fontSize: '0.9rem', color: '#22c55e', pointerEvents: 'none' }}>
          ✅ MAINTAIN
        </div>
        <div style={{ position: 'absolute', bottom: 50, left: 70, opacity: 0.2, fontWeight: 800, fontSize: '0.9rem', color: '#94a3b8', pointerEvents: 'none' }}>
          💡 OPTIONAL
        </div>
        <div style={{ position: 'absolute', bottom: 50, right: 40, opacity: 0.25, fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b', pointerEvents: 'none' }}>
          ⚡ STRENGTHEN
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <XAxis
              type="number"
              dataKey="currentEvidenceScore"
              name="Current Evidence"
              domain={[0, 100]}
              unit=""
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Current Resume Evidence / Proficiency (0-100)', position: 'insideBottom', offset: -10, fill: '#cbd5e1', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="roleImportance"
              name="Role Importance"
              domain={[0, 100]}
              unit=""
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Target Role Importance (0-100)', angle: -90, position: 'insideLeft', offset: 15, fill: '#cbd5e1', fontSize: 11 }}
            />
            <ZAxis
              type="number"
              dataKey="marketDemand"
              range={[60, 400]}
              name="Market Demand"
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Dividing reference lines creating the 4 quadrants */}
            <ReferenceLine x={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
            <ReferenceLine y={70} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
            <Scatter name="Skills" data={filteredData} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '14px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--color-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors.Critical }} /> Critical Priority (&ge;80)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors.High }} /> High Priority (65–79)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors.Medium }} /> Medium Priority (50–64)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors.Low }} /> Low Priority (&lt;50)
        </div>
      </div>
    </div>
  );
};

export default SkillPriorityScatter;
