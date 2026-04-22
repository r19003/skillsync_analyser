import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * ScoreChart — radial/circular gauge chart showing ATS score.
 * Uses Recharts RadialBarChart for a clean circular indicator.
 */
const ScoreChart = ({ atsScore = 0, matchPercentage = 0 }) => {
  const data = [
    { name: 'Match %', value: matchPercentage, fill: '#06b6d4' },
    { name: 'ATS Score', value: atsScore, fill: '#6366f1' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="50%" outerRadius="90%"
            data={data}
            startAngle={90} endAngle={-270}
            barSize={12}
          >
            <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" />
            <Tooltip
              contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.8rem', color: '#f1f5f9' }}
              formatter={(val, name) => [`${val}`, name]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{atsScore}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '2px' }}>ATS Score</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.fill }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreChart;
