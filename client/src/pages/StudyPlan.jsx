import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Target, ArrowLeft } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/ui/Loader';
import { generateStudyPlan } from '../api/studyPlanApi';

const StudyPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await generateStudyPlan(id);
        setPlan(data);
      } catch (err) {
        console.error("Failed to fetch plan:", err);
      }
    };
    fetchPlan();
  }, [id]);

  if (!plan) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Building your personalized roadmap..." />
      </div>
    </>
  );

  const radarData = [
    { subject: 'High Priority', count: plan.prioritySkills?.high?.length || 0, fullMark: 10 },
    { subject: 'Medium Priority', count: plan.prioritySkills?.medium?.length || 0, fullMark: 10 },
    { subject: 'Low Priority', count: plan.prioritySkills?.low?.length || 0, fullMark: 10 },
  ];

  const barData = [1, 2, 3, 4].map(week => ({
    name: `Week ${week}`,
    tasks: plan.tasks?.filter(t => t.weekNumber === week).length || 0
  }));

  return (
    <>
      <Navbar />
      <PageContainer>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text)' }}>
            <Target color="#06b6d4" />
            {plan.durationWeeks}-Week Study Plan
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
            Targeting: <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>{plan.targetRole}</span>
          </p>
        </header>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40 }}>
          <div className="glass" style={{ padding: 24, height: 320, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Skill Prioritization</h3>
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="count" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                  <RechartsTooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass" style={{ padding: 24, height: 320, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Curriculum Density</h3>
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Skills row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#ef4444' }}>High Priority Gaps</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {plan.prioritySkills?.high?.map((s,i) => <span key={i} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#ef4444', fontSize: '0.85rem' }}>{s}</span>)}
            </div>
          </div>
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#f59e0b' }}>Medium Priority Gaps</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {plan.prioritySkills?.medium?.map((s,i) => <span key={i} style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, color: '#f59e0b', fontSize: '0.85rem' }}>{s}</span>)}
            </div>
          </div>
        </div>

        {/* Week by Week */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[1, 2, 3, 4].map((week) => (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: week * 0.1 }} key={week} className="glass" style={{ padding: 32 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                <Calendar color="#818cf8" /> Week {week}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {plan.tasks?.filter(t => t.weekNumber === week).map(task => (
                  <div key={task._id} style={{ padding: 20, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: 8 }}>{task.title}</h4>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{task.description}</p>
                  </div>
                ))}
                {plan.tasks?.filter(t => t.weekNumber === week).length === 0 && (
                  <p style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>No tasks assigned for this week.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </>
  );
};

export default StudyPlan;
