import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Zap, FileText, Target, BarChart2, BookOpen,
  CheckCircle, TrendingUp, Users, Award, Shield, GitCompare, Brain,
} from 'lucide-react';

/* ── Tiny reusable sub-components ───────────────────────────────────── */
const Badge = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 999,
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
  }}>
    {children}
  </span>
);

const StatCard = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</p>
    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, description, delay, accent = '#6366f1' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    style={{
      background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '32px', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', gap: 16,
      transition: 'border-color 0.2s',
    }}
    whileHover={{ borderColor: `${accent}55` }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: `${accent}20`, border: `1px solid ${accent}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
    <p style={{ color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' }}>{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '1rem', color: '#fff',
    }}>{number}</div>
    <div>
      <h4 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 6 }}>{title}</h4>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{description}</p>
    </div>
  </motion.div>
);

/* ── Main Landing Page ───────────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', height: 64,
        display: 'flex', alignItems: 'center', padding: '0 32px',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSync</span>
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          <a href="#features" style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Features</a>
          <a href="#how-it-works" style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>How It Works</a>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: '8px 16px', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
            Sign In
          </button>
          <motion.button onClick={() => navigate('/register')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
            Get Started <ArrowRight size={15} />
          </motion.button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, position: 'relative', textAlign: 'center', maxWidth: 1200, margin: '0 auto', padding: '140px 32px 100px' }}>
        {/* glow blobs */}
        <div style={{ position: 'absolute', top: 80, left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Badge><Zap size={13} /> AI-Powered · ATS Optimized · Free to Start</Badge>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
          Land Your Dream Job with
          <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Resume Intelligence
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Upload your resume, paste any job description, and get an instant ATS score, skill-gap analysis, personalized study plan, and AI-written feedback.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button onClick={() => navigate('/register')} whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 30px rgba(99,102,241,0.25)' }}>
            Analyze My Resume — Free <ArrowRight size={18} />
          </motion.button>
          <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', padding: '14px 32px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
            Sign In to Dashboard
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <StatCard value="10K+" label="Resumes Analyzed" />
          <StatCard value="94%" label="ATS Pass Rate" />
          <StatCard value="3x" label="More Interviews" />
          <StatCard value="50+" label="Skills Tracked" />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 56 }}>
          <Badge><Sparkles size={13} /> Everything You Need</Badge>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginTop: 16, marginBottom: 12, letterSpacing: '-0.02em' }}>
            A complete career optimization suite
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Every tool you need to go from frustrated applicant to confident interviewee.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <FeatureCard icon={<BarChart2 size={26} color="#818cf8" />} title="Instant ATS Score" description="Transparent ATS breakdown across 5 weighted categories — keyword match, skills overlap, formatting, section completeness, and relevance." delay={0.1} accent="#6366f1" />
          <FeatureCard icon={<Target size={26} color="#06b6d4" />} title="Skill Gap Analysis" description="Know exactly which required skills are missing and which keywords ATS systems are looking for — compared directly against the job description." delay={0.2} accent="#06b6d4" />
          <FeatureCard icon={<Brain size={26} color="#a78bfa" />} title="Grok AI Deep Report" description="Grok AI acts as your senior technical recruiter — critiquing every bullet, identifying weak impact statements, and producing specific professional recommendations." delay={0.3} accent="#a78bfa" />
          <FeatureCard icon={<BookOpen size={26} color="#34d399" />} title="Gemini Study Roadmap" description="Gemini AI generates a personalized week-by-week learning plan from your skill gaps — with specific resources, portfolio project ideas, and interview prep." delay={0.4} accent="#34d399" />
          <FeatureCard icon={<CheckCircle size={26} color="#f59e0b" />} title="Progress Tracker" description="Tick off tasks and milestones as you learn. An animated tracker measures real career progress and sync to the cloud instantly." delay={0.5} accent="#f59e0b" />
          <FeatureCard icon={<GitCompare size={26} color="#f87171" />} title="Multi-Resume Compare" description="Upload up to 3 resume versions and compare them side-by-side against a single JD — the engine ranks them and crowns the winner." delay={0.6} accent="#f87171" />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '64px 56px' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48 }}>
            <Badge><TrendingUp size={13} /> Simple Process</Badge>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginTop: 16, letterSpacing: '-0.02em' }}>
              Go from upload to offer-ready in minutes
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <StepCard number="1" title="Upload Your Resume" description="Drag & drop your PDF. Our parser extracts every section, skill, and keyword without any manual input from you." delay={0.1} />
            <StepCard number="2" title="Paste the Job Description" description="Copy any job posting and paste it into SkillSync. Our NLP engine identifies required skills, keywords, and responsibilities." delay={0.2} />
            <StepCard number="3" title="Get Dual AI Analysis" description="Grok AI critiques your resume like a senior recruiter. Gemini AI then generates a personalized study roadmap based on the gaps found." delay={0.3} />
            <StepCard number="4" title="Follow Your Roadmap" description="Auto-generated week-by-week plan assigns specific resources, projects, and interview prep topics. Tick off tasks to track real progress." delay={0.4} />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '60px 32px 100px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 720, margin: '0 auto', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 28, padding: '56px 48px' }}>
          <Award size={40} color="#818cf8" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Start optimizing your resume today</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>No credit card required. Get your first ATS report completely free and take control of your job search.</p>
          <motion.button onClick={() => navigate('/register')} whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started Free <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="#818cf8" />
          <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.875rem' }}>SkillSync AI</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} style={{ color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#94a3b8'} onMouseLeave={e => e.target.style.color = '#64748b'}>{l}</span>
          ))}
        </div>
        <span style={{ color: '#475569', fontSize: '0.8rem' }}>© {new Date().getFullYear()} SkillSync Inc.</span>
      </footer>

    </div>
  );
};

export default Landing;
