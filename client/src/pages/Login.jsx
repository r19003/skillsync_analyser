import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Brain, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%', width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}
           className="responsive-auth-grid">
        {/* Left — Brand panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{ padding: '40px 32px' }}
          className="hidden md:block"
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '30px', padding: '6px 14px', marginBottom: '24px',
          }}>
            <Sparkles size={14} color="#818cf8" />
            <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>AI-Powered Resume Analysis</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: 'var(--color-text)' }}>
            Land Your <span style={{ background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Job</span> Faster
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Analyze your resume against any job description, get your ATS score, find skill gaps, and receive actionable recommendations — all in seconds.
          </p>
          {/* Feature pills */}
          {['ATS Score Analysis', 'Skill Gap Detection', 'Personalized Recommendations', 'Analysis History'].map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '10px', color: 'var(--color-muted)', fontSize: '0.9rem',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', flexShrink: 0 }} />
              {f}
            </motion.div>
          ))}
        </motion.div>

        {/* Right — Login form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '20px', padding: '40px 36px', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Brain size={24} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>
                Welcome Back
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem' }}>Sign in to your SkillSync account</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="jane@example.com"
                  icon={Mail}
                  value={form.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  icon={Lock}
                  value={form.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: '6px' }}>
                <Button type="submit" loading={loading} fullWidth size="lg">
                  Sign In <ArrowRight size={16} />
                </Button>
              </motion.div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 20px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .responsive-auth-grid { grid-template-columns: 1fr !important; }
          .hidden.md\\:block { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
