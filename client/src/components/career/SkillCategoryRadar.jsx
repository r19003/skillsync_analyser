import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
import { Layers, BarChart2, Table as TableIcon } from 'lucide-react';

const SkillCategoryRadar = ({ categoryReadiness = [], roleTrack = 'Software Engineer' }) => {
  const [viewMode, setViewMode] = useState('radar'); // 'radar' | 'bar' | 'table'

  const data = (categoryReadiness || []).map(cat => ({
    category: cat.category,
    score: cat.score || 0,
    coverage: Math.round((cat.coverageRatio || 0) * 100),
    matched: cat.matchedSkillCount || 0,
    total: cat.requiredSkillCount || 0
  }));

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Domain & Category Competency Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Readiness and skill coverage across canonical {roleTrack} disciplines
          </p>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setViewMode('radar')}
            style={{
              padding: '6px 12px', borderRadius: '7px', border: 'none',
              background: viewMode === 'radar' ? '#6366f1' : 'transparent',
              color: viewMode === 'radar' ? '#fff' : 'var(--color-muted)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            Radar
          </button>
          <button
            onClick={() => setViewMode('bar')}
            style={{
              padding: '6px 12px', borderRadius: '7px', border: 'none',
              background: viewMode === 'bar' ? '#6366f1' : 'transparent',
              color: viewMode === 'bar' ? '#fff' : 'var(--color-muted)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <BarChart2 size={13} /> Bar
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px', borderRadius: '7px', border: 'none',
              background: viewMode === 'table' ? '#6366f1' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--color-muted)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <TableIcon size={13} /> Table
          </button>
        </div>
      </div>

      {/* Chart Views */}
      {viewMode === 'radar' && (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                stroke="rgba(255,255,255,0.1)"
              />
              <Radar
                name="Proficiency Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.4}
              />
              <Radar
                name="Coverage %"
                dataKey="coverage"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.8rem', color: '#f1f5f9' }}
                formatter={(val, name) => [`${val}%`, name]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === 'bar' && (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <XAxis dataKey="category" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.8rem', color: '#f1f5f9' }}
                formatter={(val, name) => [`${val}%`, name]}
              />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} name="Proficiency Score" />
              <Bar dataKey="coverage" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Skill Coverage %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-muted)' }}>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>Proficiency Score</th>
                <th style={{ padding: '10px 14px' }}>Skill Coverage</th>
                <th style={{ padding: '10px 14px' }}>Skills Verified</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.category} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {row.category}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: row.score >= 70 ? '#22c55e' : row.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {row.score}/100
                      </span>
                      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${row.score}%`, height: '100%', background: row.score >= 70 ? '#22c55e' : row.score >= 40 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{row.coverage}%</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-muted)' }}>
                    {row.matched} of {row.total} skills
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700,
                      background: row.coverage >= 70 ? 'rgba(34,197,94,0.15)' : row.coverage >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: row.coverage >= 70 ? '#22c55e' : row.coverage >= 40 ? '#f59e0b' : '#ef4444'
                    }}>
                      {row.coverage >= 70 ? 'Strong' : row.coverage >= 40 ? 'Developing' : 'Critical Gap'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SkillCategoryRadar;
