import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input component
 * Supports: text, email, password (with show/hide toggle), textarea
 */
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  textarea = false,
  rows = 5,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    padding: Icon || isPassword ? '12px 44px 12px 44px' : '12px 16px',
    resize: textarea ? 'vertical' : 'none',
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ color: 'var(--color-muted)', fontSize: '0.83rem', fontWeight: 500, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {/* Leading Icon */}
        {Icon && (
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', display: 'flex' }}>
            <Icon size={16} />
          </div>
        )}

        {/* Input or Textarea */}
        {textarea ? (
          <textarea
            ref={ref}
            rows={rows}
            style={{ ...baseStyle, paddingLeft: Icon ? '44px' : '16px', paddingRight: '16px', paddingTop: '12px' }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={inputType}
            style={baseStyle}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            {...props}
          />
        )}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.78rem', marginTop: '2px' }}>{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
