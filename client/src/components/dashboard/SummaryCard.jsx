import { motion } from 'framer-motion';

/**
 * SummaryCard — animated stat card for the dashboard.
 * Props: title, value, subtitle, icon, color, delay
 */
const SummaryCard = ({ title, value, subtitle, icon: Icon, color = '#6366f1', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}22` }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            {title}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, marginBottom: '6px' }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>{subtitle}</p>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
