import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const EligibilityWarningsBanner = ({ eligibilityWarnings = [] }) => {
  if (!eligibilityWarnings || eligibilityWarnings.length === 0) return null;

  const hasWarnings = eligibilityWarnings.some(w => w.status === 'warning' || w.status === 'fail');

  return (
    <div style={{
      background: hasWarnings ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.06)',
      border: `1px solid ${hasWarnings ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`,
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        {hasWarnings ? <AlertTriangle size={18} color="#f59e0b" /> : <CheckCircle size={18} color="#22c55e" />}
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: hasWarnings ? '#f59e0b' : '#22c55e', margin: 0 }}>
          Hard Eligibility & Prerequisites Verification
        </h4>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginLeft: 'auto' }}>
          *Tracked separately from weighted scoring metrics
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        {eligibilityWarnings.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: item.status === 'pass' ? '#22c55e' : '#f59e0b',
              marginTop: '4px', flexShrink: 0
            }} />
            <div>
              <strong style={{ color: item.status === 'pass' ? '#e2e8f0' : '#fef08a' }}>
                {item.criteria}:
              </strong>{' '}
              <span style={{ color: '#cbd5e1' }}>{item.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EligibilityWarningsBanner;
