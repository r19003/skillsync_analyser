import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Target, FileText, ChevronRight, Award } from 'lucide-react';
import { updateRoadmapTask } from '../../api/careerAnalyticsApi';
import toast from 'react-hot-toast';

const RoadmapProgressTracker = ({ analysisId, weeklyPlan = [], onTaskToggled }) => {
  const [tasks, setTasks] = useState(weeklyPlan);
  const [updatingId, setUpdatingId] = useState(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggle = async (taskId, currentStatus) => {
    setUpdatingId(taskId);
    try {
      const newStatus = !currentStatus;
      const { data } = await updateRoadmapTask(analysisId, taskId, newStatus);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, completed: newStatus } : t));
      toast.success(newStatus ? 'Task completed! Progress updated.' : 'Task marked pending');
      if (onTaskToggled) onTaskToggled(data);
    } catch (err) {
      toast.error('Failed to update task status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#22c55e" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Personalized Week-by-Week Learning Roadmap
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Actionable developmental curriculum addressing prioritized gap competencies with explicit deliverables
          </p>
        </div>

        {/* Progress Pill & Bar */}
        <div style={{ minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-muted)' }}>Curriculum Progress</span>
            <span style={{ fontWeight: 700, color: '#22c55e' }}>{completedTasks}/{totalTasks} ({completionPct}%)</span>
          </div>
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #22c55e)', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Week Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {tasks.map(item => {
          const isDone = item.completed;
          return (
            <div
              key={item.taskId}
              style={{
                background: isDone ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                border: isDone ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'all 0.2s'
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(item.taskId, item.completed)}
                disabled={updatingId === item.taskId}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginTop: '2px',
                  color: isDone ? '#22c55e' : 'var(--color-muted)'
                }}
              >
                {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                      background: 'rgba(99,102,241,0.15)', color: '#818cf8'
                    }}>
                      Week {item.weekNumber}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: isDone ? 'rgba(241,245,249,0.6)' : 'var(--color-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {item.theme}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                    +{item.expectedReadinessContribution} pts Readiness
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.45 }}>
                  <strong>Objective:</strong> {item.learningObjective}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', fontSize: '0.78rem', color: 'var(--color-text)' }}>
                  <div>📝 <strong>Suggested Task:</strong> {item.task}</div>
                  <div style={{ marginTop: '4px' }}>📦 <strong>Deliverable:</strong> {item.deliverable}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem', color: 'var(--color-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} color="#818cf8" />
                    <span>Portfolio Proof: {item.evidenceToProduce}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    <span>{item.estimatedTime}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapProgressTracker;
