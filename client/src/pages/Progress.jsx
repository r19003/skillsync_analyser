import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Activity, ArrowLeft, Flag,
  Trophy, AlertCircle, Layers, Clock, Target
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/ui/Loader';
import { getProgress, updateTaskStatus, updateMilestoneStatus } from '../api/progressApi';

/* ── helpers ──────────────────────────────────────────────────── */
const statusColor = {
  pending:     { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',  text: '#818cf8' },
  'in-progress':{ bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  completed:   { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#10b981' },
};

/* ── sub-components ───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div style={{
    flex: '1 1 140px', padding: '20px 24px', borderRadius: 16,
    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
    display: 'flex', flexDirection: 'column', gap: 8
  }}>
    <Icon size={20} color={accent} />
    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', letterSpacing: 0.5 }}>{label}</span>
  </div>
);

/* ── main component ───────────────────────────────────────────── */
const Progress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'milestones'

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const { data } = await getProgress(id);
        setProgress(data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setError(err.response?.data?.message || 'Failed to load progress tracker.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [id]);

  /* ── toggle task ──────────────────────────────────────────── */
  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setProgress(prev => {
      const updatedTasks = prev.tasks.map(t =>
        t._id === taskId ? { ...t, status: newStatus } : t
      );
      const comp = updatedTasks.filter(t => t.status === 'completed').length;
      const pct  = prev.totalTasks ? Math.round((comp / prev.totalTasks) * 100) : 0;
      return { ...prev, tasks: updatedTasks, completedTasks: comp, progressPercentage: pct };
    });
    try { await updateTaskStatus(taskId, newStatus); }
    catch (err) { console.error('Failed to update task status:', err); }
  };

  /* ── toggle milestone ─────────────────────────────────────── */
  const toggleMilestone = async (milestoneId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setProgress(prev => {
      const updatedMilestones = prev.milestones.map(m =>
        m._id === milestoneId ? { ...m, status: newStatus } : m
      );
      const comp = updatedMilestones.filter(m => m.status === 'completed').length;
      return { ...prev, milestones: updatedMilestones, completedMilestones: comp };
    });
    try { await updateMilestoneStatus(milestoneId, newStatus); }
    catch (err) { console.error('Failed to update milestone status:', err); }
  };

  /* ── loading ──────────────────────────────────────────────── */
  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Building your progress tracker..." />
      </div>
    </>
  );

  /* ── error ────────────────────────────────────────────────── */
  if (error) return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
          <AlertCircle size={56} color="#ef4444" style={{ marginBottom: 24 }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>
            Couldn't load progress
          </h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: 32, lineHeight: 1.6 }}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 28px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'
            }}
          >
            Go Back
          </button>
        </div>
      </PageContainer>
    </>
  );

  /* ── derived ──────────────────────────────────────────────── */
  const pct            = progress.progressPercentage ?? 0;
  const r              = 54;
  const circumference  = 2 * Math.PI * r;
  const dashoffset     = circumference - (circumference * pct) / 100;
  const milestonesPct  = progress.totalMilestones
    ? Math.round((progress.completedMilestones / progress.totalMilestones) * 100)
    : 0;

  const TABS = [
    { key: 'tasks',      label: 'Tasks',      count: progress.totalTasks },
    { key: 'milestones', label: 'Milestones', count: progress.totalMilestones },
  ];

  return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none', color: 'var(--color-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: 6, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Hero Card */}
          <div className="glass" style={{ padding: '40px 40px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            {/* Radial progress ring */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 188, height: 188, flexShrink: 0, margin: '0 auto' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: 188, height: 188 }}>
                <circle cx="94" cy="94" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  cx="94" cy="94" r={r}
                  stroke="url(#progressGrad)" strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 4, letterSpacing: 1 }}>COMPLETE</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: '1 1 260px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Activity color="#10b981" size={28} /> Progress Tracker
              </h1>
              {progress.targetRole && (
                <p style={{ color: '#818cf8', fontWeight: 600, marginBottom: 16, fontSize: '0.95rem' }}>
                  <Target size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {progress.targetRole}
                </p>
              )}
              <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 20 }}>
                You've completed <strong style={{ color: '#f1f5f9' }}>{progress.completedTasks}</strong> of{' '}
                <strong style={{ color: '#f1f5f9' }}>{progress.totalTasks}</strong> tasks and{' '}
                <strong style={{ color: '#f1f5f9' }}>{progress.completedMilestones}</strong> of{' '}
                <strong style={{ color: '#f1f5f9' }}>{progress.totalMilestones}</strong> milestones.
              </p>

              {/* Stat chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <StatCard icon={Layers}  label="TOTAL TASKS"       value={progress.totalTasks}       accent="#6366f1" />
                <StatCard icon={Flag}    label="MILESTONES"         value={progress.totalMilestones}  accent="#f59e0b" />
                <StatCard icon={Clock}   label="WEEKS"              value={progress.durationWeeks}    accent="#06b6d4" />
                <StatCard icon={Trophy}  label="MILESTONE %"        value={`${milestonesPct}%`}       accent="#10b981" />
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: activeTab === tab.key ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'var(--color-muted)',
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem',
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === tab.key ? '#fff' : 'var(--color-muted)'
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="glass"
                style={{ padding: 32 }}
              >
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24, color: 'var(--color-text)' }}>
                  Your Active Checklist
                </h2>
                {progress.tasks.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)', fontStyle: 'italic', textAlign: 'center', padding: 40 }}>
                    No tasks found. Generate a study plan first.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {progress.tasks.map(task => {
                      const isComp = task.status === 'completed';
                      const c = statusColor[task.status] || statusColor.pending;
                      return (
                        <motion.div
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          key={task._id}
                          onClick={() => toggleTask(task._id, task.status)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px',
                            borderRadius: 14, background: c.bg, border: `1px solid ${c.border}`,
                            cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none'
                          }}
                        >
                          <div style={{ color: c.text, flexShrink: 0, marginTop: 2 }}>
                            {isComp ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{
                              display: 'block', fontSize: '1rem', fontWeight: 600,
                              color: isComp ? 'rgba(16,185,129,0.6)' : 'var(--color-text)',
                              textDecoration: isComp ? 'line-through' : 'none',
                              transition: 'all 0.2s', marginBottom: 4,
                            }}>
                              {task.title}
                            </span>
                            {task.description && (
                              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                                {task.description}
                              </span>
                            )}
                            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                              {task.weekNumber && (
                                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                                  Week {task.weekNumber}
                                </span>
                              )}
                              {task.duration && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                                  ⏱ {task.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'milestones' && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="glass"
                style={{ padding: 32 }}
              >
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24, color: 'var(--color-text)' }}>
                  Milestones
                </h2>
                {progress.milestones.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)', fontStyle: 'italic', textAlign: 'center', padding: 40 }}>
                    No milestones defined yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {progress.milestones.map((ms, idx) => {
                      const isComp = ms.status === 'completed';
                      return (
                        <motion.div
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          key={ms._id}
                          onClick={() => toggleMilestone(ms._id, ms.status)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 20, padding: '22px 24px',
                            borderRadius: 16, cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s',
                            background: isComp ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.06)',
                            border: `1px solid ${isComp ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.2)'}`,
                          }}
                        >
                          {/* Step number */}
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isComp ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.15)',
                            color: isComp ? '#10b981' : '#f59e0b', fontWeight: 800, fontSize: '1rem'
                          }}>
                            {isComp ? <Trophy size={18} /> : idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{
                              display: 'block', fontSize: '1.05rem', fontWeight: 700,
                              color: isComp ? 'rgba(16,185,129,0.7)' : 'var(--color-text)',
                              textDecoration: isComp ? 'line-through' : 'none',
                              marginBottom: 6
                            }}>
                              {ms.title}
                            </span>
                            {ms.description && (
                              <span style={{ display: 'block', fontSize: '0.87rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                                {ms.description}
                              </span>
                            )}
                            {ms.targetWeek && (
                              <span style={{ display: 'block', fontSize: '0.77rem', color: isComp ? '#10b981' : '#f59e0b', fontWeight: 600, marginTop: 8 }}>
                                🎯 Target: Week {ms.targetWeek}
                              </span>
                            )}
                          </div>
                          <div style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                            background: isComp ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)',
                            color: isComp ? '#10b981' : '#f59e0b'
                          }}>
                            {isComp ? 'Done' : 'Pending'}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </PageContainer>
    </>
  );
};

export default Progress;
