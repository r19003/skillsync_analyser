import { motion } from 'framer-motion';

/**
 * Button component
 * Variants: primary | secondary | danger | ghost
 * Sizes:    sm | md | lg
 */
const variants = {
  primary: {
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.3)',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  ghost: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)',
  },
};

const sizes = {
  sm: { padding: '8px 16px', fontSize: '0.8rem' },
  md: { padding: '11px 24px', fontSize: '0.9rem' },
  lg: { padding: '14px 32px', fontSize: '1rem' },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02, brightness: 1.1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      style={{
        ...variants[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : 'auto',
        borderRadius: '10px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        letterSpacing: '0.01em',
      }}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 50 50" style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
          <circle cx="25" cy="25" r="18" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="60 30" strokeLinecap="round"/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
