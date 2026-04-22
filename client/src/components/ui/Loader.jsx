import { motion } from 'framer-motion';

/**
 * Loader component
 * fullPage={true}  → centered over the entire viewport
 * fullPage={false} → inline spinner
 */
const Loader = ({ fullPage = false, size = 40, text = '' }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 40"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {text && <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default Loader;
