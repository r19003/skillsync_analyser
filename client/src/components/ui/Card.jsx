import { motion } from 'framer-motion';

/**
 * Card component — glassmorphism dark card with optional hover lift.
 * Used throughout the app for content containers.
 */
const Card = ({ children, className = '', hover = false, style = {}, onClick }) => {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.2)' } : {}}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
