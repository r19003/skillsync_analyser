import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Target, ArrowLeft, Sparkles, CheckCircle2, Circle,
  Trophy, Code, Mic, ChevronDown, ChevronUp, Zap, Award
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { getStudyPlanById, updateAdvTaskStatus, updateMilestoneStatus } from '../api/deepReportApi';
import toast from 'react-hot-toast';

const WEEK_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

const AdvStudyPlan = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getStudyPlanById(planId);
        if (data.success && data.studyPlan) {
          setPlan(data.studyPlan);
        } else {
          toast.error('Study plan not found');
        }
      } catch (err) {
        toast.error('Could not load study plan');
        console.error('[AdvStudyPlan] fetch error:', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId]);

  const toggleTask = async (weekIdx, taskId) => {
    const week = plan.weeklyPlan[weekIdx];
    const task = week.tasks.find(t => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic update
    setPlan(prev => {
      const newPlan = JSON.parse(JSON.stringify(prev));
      const t = newPlan.weeklyPlan[weekIdx].tasks.find(t => t._id === taskId);
      if (t) t.status = newStatus;
      const all = newPlan.weeklyPlan.flatMap(w => w.tasks);
      const done = all.filter(t => t.status === 'completed').length;
      newPlan.progressPercentage = Math.round((done / all.length) * 100);
      return newPlan;
    });

    try {
      await updateAdvTaskStatus(taskId, newStatus, plan._id);
    } catch {
      toast.error('Failed to save progress');
    }
  };

  const toggleMilestone = async (milestoneId) => {
    const ms = plan.milestones?.find(m => m._id === milestoneId);
    if (!ms) return;
    const newStatus = ms.status === 'completed' ? 'pending' : 'completed';

    setPlan(prev => {
      const newPlan = JSON.parse(JSON.stringify(prev));
      const m = newPlan.milestones.find(m => m._id === milestoneId);
      if (m) m.status = newStatus;
      return newPlan;
    });

    try {
      await updateMilestoneStatus(milestoneId, newStatus, plan._id);
    } catch {
      toast.error('Failed to save milestone');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Loading your AI study plan..." />
      </div>
    </>
  );

  if (!plan) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <BookOpen size={48} color="#6366f1" />
        <p style={{ color: '#94a3b8' }}>No study plan found. Generate a Deep AI Report first.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </>
  );

  // Build chart data
  const priorityData = [
    { subject: 'High', count: plan.highPrioritySkills?.length || 0, color: '#ef4444' },
    { subject: 'Medium', count: plan.mediumPrioritySkills?.length || 0, color: '#f59e0b' },
    { subject: 'Low', count: plan.lowPrioritySkills?.length || 0, color: '#10b981' },
  ];

  const weekBarData = (plan.weeklyPlan || []).map((w, i) => ({
    name: `Week ${w.weekNumber}`,
    tasks: w.tasks?.length || 0,
    completed: w.tasks?.filter(t => t.status === 'completed').length || 0,
    color: WEEK_COLORS[i % WEEK_COLORS.length]
  }));

  const allTasks = (plan.weeklyPlan || []).flatMap(w => w.tasks || []);
  const completedCount = allTasks.filter(t => t.status === 'completed').length;
  const pctDone = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
  const strokeCirc = 339.292;
  const strokeOff  = strokeCirc - (strokeCirc * pctDone) / 100;

  return (
    <>
      <Navbar />
      <PageContainer>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 20, color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, marginBottom: 16 }}>
            <Sparkles size={14} /> Gemini AI Generated
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            {plan.durationWeeks}-Week Study Roadmap
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Target: <strong style={{ color: '#f1f5f9' }}>{plan.targetRole || 'Your Target Role'}</strong>
            {plan.userGoal && <> · Goal: <em>{plan.userGoal}</em></>}
          </p>
        </div>

        {/* Progress + Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 24, marginBottom: 40, alignItems: 'start' }}>
          {/* Progress ring */}
          <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg style={{ transform: 'rotate(-90deg)', width: 140, height: 140 }}>
                <circle cx="70" cy="70" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                <motion.circle initial={{ strokeDashoffset: strokeCirc }} animate={{ strokeDashoffset: strokeOff }} transition={{ duration: 1, ease: 'easeOut' }}
                  cx="70" cy="70" r="54" stroke="#06b6d4" strokeWidth="10" fill="transparent"
                  strokeDasharray={strokeCirc} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f1f5f9' }}>{pctDone}%</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: 1 }}>DONE</span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>{completedCount} / {allTasks.length} tasks</p>
          </div>

          {/* Radar */}
          <div className="glass" style={{ padding: 24, height: 220 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Skill Priority Distribution</p>
            <ResponsiveContainer width="100%" height="85%">
              <RadarChart outerRadius="70%" data={priorityData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Skills" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div className="glass" style={{ padding: 24, height: 220 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Weekly Task Load</p>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={weekBarData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]} name="Total">
                  {weekBarData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
                <Bar dataKey="completed" fill="rgba(16,185,129,0.6)" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gap Summary */}
        {plan.currentGapSummary && (
          <div className="glass" style={{ padding: 24, marginBottom: 28, borderLeft: '4px solid #6366f1' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Gap Analysis Summary</p>
            <p style={{ color: '#94a3b8', lineHeight: 1.65 }}>{plan.currentGapSummary}</p>
          </div>
        )}

        {/* Priority Skills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'High Priority', items: plan.highPrioritySkills,   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Medium Priority', items: plan.mediumPrioritySkills, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Low Priority', items: plan.lowPrioritySkills,    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          ].map(({ label, items, color, bg }) => items?.length > 0 && (
            <div key={label} className="glass" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, color, fontSize: '0.9rem', marginBottom: 12 }}>{label}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {items.map(s => <span key={s} style={{ padding: '3px 10px', fontSize: '0.78rem', background: bg, color, border: `1px solid ${color}30`, borderRadius: 20 }}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Week tabs + content */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {plan.weeklyPlan?.map((w, i) => (
              <button key={i} onClick={() => setActiveWeek(i)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid', borderColor: activeWeek === i ? WEEK_COLORS[i] : 'var(--color-border)', background: activeWeek === i ? `${WEEK_COLORS[i]}15` : 'transparent', color: activeWeek === i ? WEEK_COLORS[i] : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                Week {w.weekNumber}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {plan.weeklyPlan?.map((week, wi) => wi === activeWeek && (
              <motion.div key={wi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="glass" style={{ padding: 32, borderTop: `3px solid ${WEEK_COLORS[wi % WEEK_COLORS.length]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Calendar color={WEEK_COLORS[wi % WEEK_COLORS.length]} /> Week {week.weekNumber}: {week.theme}
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{week.weeklyGoal}</p>
                    </div>
                    {week.deliverable && (
                      <div style={{ padding: '10px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Deliverable</p>
                        <p style={{ color: '#f1f5f9', fontSize: '0.88rem', fontWeight: 600 }}>{week.deliverable}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {week.tasks?.map(task => {
                      const done = task.status === 'completed';
                      const typeColors = { learning: '#6366f1', project: '#10b981', practice: '#f59e0b', revision: '#06b6d4', 'interview-prep': '#a78bfa' };
                      return (
                        <motion.div key={task._id} whileHover={{ scale: 1.005 }}
                          style={{ padding: 20, borderRadius: 14, border: '1px solid', borderColor: done ? 'rgba(16,185,129,0.25)' : 'var(--color-border)', background: done ? 'rgba(16,185,129,0.05)' : 'rgba(0,0,0,0.15)', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', gap: 14, cursor: 'pointer' }} onClick={() => toggleTask(wi, task._id)}>
                            <div style={{ color: done ? '#10b981' : '#94a3b8', marginTop: 2, flexShrink: 0 }}>
                              {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: done ? '#6ee7b7' : '#f1f5f9', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</span>
                                <span style={{ padding: '2px 8px', background: `${typeColors[task.type] || '#6366f1'}20`, color: typeColors[task.type] || '#6366f1', border: `1px solid ${typeColors[task.type] || '#6366f1'}30`, borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>{task.type}</span>
                                {task.duration && <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>⏱ {task.duration}</span>}
                              </div>
                              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 8 }}>{task.description}</p>
                              {task.resources?.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {task.resources.map((r, ri) => <span key={ri} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: 4 }}>📚 {r}</span>)}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Projects */}
        {plan.projects?.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Code size={20} color="#10b981" />
              <h2 style={{ fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Portfolio Project Ideas</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {plan.projects.map((p, i) => (
                <div key={i} className="glass" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent:  'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{p.name}</h3>
                    <span style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>{p.difficulty}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 12 }}>{p.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {p.skills?.map(s => <span key={s} style={{ padding: '2px 8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: 4, fontSize: '0.75rem' }}>{s}</span>)}
                  </div>
                  {p.estimatedTime && <p style={{ color: '#64748b', fontSize: '0.78rem' }}>⏱ {p.estimatedTime}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interview Prep */}
        {plan.interviewPrep?.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Mic size={20} color="#a78bfa" />
              <h2 style={{ fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Interview Preparation</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plan.interviewPrep.map((ip, i) => (
                <div key={i} className="glass" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>{ip.topic}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>{ip.description}</p>
                  {ip.sampleQuestions?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ip.sampleQuestions.map((q, qi) => (
                        <div key={qi} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ color: '#a78bfa', fontWeight: 700 }}>Q{qi + 1}.</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        {plan.milestones?.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Trophy size={20} color="#f59e0b" />
              <h2 style={{ fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Milestone Tracker</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {plan.milestones.map((ms) => {
                const done = ms.status === 'completed';
                return (
                  <motion.div key={ms._id} whileHover={{ scale: 1.02 }} onClick={() => toggleMilestone(ms._id)}
                    className="glass" style={{ padding: 24, cursor: 'pointer', borderColor: done ? 'rgba(16,185,129,0.35)' : undefined, background: done ? 'rgba(16,185,129,0.06)' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ color: done ? '#10b981' : '#94a3b8', marginTop: 2 }}>
                        {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: done ? '#10b981' : '#f1f5f9', marginBottom: 4, textDecoration: done ? 'line-through' : 'none' }}>{ms.title}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 8 }}>{ms.description}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target: Week {ms.targetWeek}</span>
                          {ms.completionCriteria && <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>· {ms.completionCriteria}</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
};

export default AdvStudyPlan;
