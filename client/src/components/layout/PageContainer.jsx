import { motion } from 'framer-motion';

/**
 * PageContainer
 * Wraps all authenticated page content.
 * - Adds top padding to clear the fixed navbar
 * - Animates page entry (fade + slide up)
 * - Constrains max width for readability on large screens
 */
const PageContainer = ({ children, title = '', subtitle = '' }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        minHeight: '100vh',
        paddingTop: '88px',   // clears 64px navbar + extra breathing room
        paddingBottom: '48px',
        paddingLeft: '24px',
        paddingRight: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: '32px' }}>
          {title && (
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </motion.main>
  );
};

export default PageContainer;
