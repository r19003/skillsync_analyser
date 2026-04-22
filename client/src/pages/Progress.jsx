import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Activity, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/ui/Loader';
import { getProgress, updateTaskStatus } from '../api/progressApi';

const Progress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await getProgress(id);
        setProgress(data);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };
    fetchProgress();
  }, [id]);

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    // Optimistic UI toggle
    setProgress(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t._id === taskId) return { ...t, status: newStatus };
        return t;
      });
      const comp = updatedTasks.filter(t => t.status === 'completed').length;
      return { ...prev, tasks: updatedTasks, completedTasks: comp, progressPercentage: Math.round((comp / prev.totalTasks) * 100) };
    });

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (!progress) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Loading progress tracker..." />
      </div>
    </>
  );

  const strokeDasharray = 339.292; // 2 * pi * 54
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progress.progressPercentage) / 100;

  return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="glass" style={{ padding: '48px 40px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            {/* Progress Ring */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 192, height: 192, margin: '0 auto' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: 192, height: 192 }}>
                <circle cx="96" cy="96" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                <motion.circle 
                  initial={{ strokeDashoffset: strokeDasharray }} 
                  animate={{ strokeDashoffset }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  cx="96" cy="96" r="54" stroke="#10b981" strokeWidth="12" fill="transparent" 
                  strokeDasharray={strokeDasharray} 
                  strokeLinecap="round" 
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{progress.progressPercentage}%</span>
                 <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4, letterSpacing: 1 }}>COMPLETED</span>
              </div>
            </div>

            <div style={{ flex: '1 1 300px' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text)' }}>
                <Activity color="#10b981" size={32} /> Task Tracker
              </h1>
              <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', marginBottom: 8 }}>
                You have completed <strong style={{ color: '#f1f5f9' }}>{progress.completedTasks}</strong> out of <strong style={{ color: '#f1f5f9' }}>{progress.totalTasks}</strong> core tasks.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Keep up the momentum to heavily optimize your ATS clearance odds! Every completed learning task makes you a more competitive applicant.
              </p>
            </div>
          </div>

          <div className="glass" style={{ padding: 40 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 32, color: 'var(--color-text)' }}>Your Active Checklist</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {progress.tasks.map(task => {
                const isComp = task.status === 'completed';
                return (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={task._id} 
                    onClick={() => toggleTask(task._id, task.status)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderRadius: 16,
                      background: isComp ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.2)',
                      border: '1px solid',
                      borderColor: isComp ? 'rgba(16,185,129,0.2)' : 'var(--color-border)',
                      cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none'
                    }}
                  >
                    <div style={{ color: isComp ? '#10b981' : 'var(--color-muted)', transition: 'color 0.2s' }}>
                      {isComp ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <span style={{ 
                      fontSize: '1.1rem', fontWeight: 500,
                      color: isComp ? 'rgba(16,185,129,0.6)' : 'var(--color-text)',
                      textDecoration: isComp ? 'line-through' : 'none',
                      transition: 'all 0.2s'
                    }}>
                      {task.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </PageContainer>
    </>
  );
};

export default Progress;
