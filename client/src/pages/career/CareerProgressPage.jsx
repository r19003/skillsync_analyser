import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Award, CheckCircle2, Clock, Calendar,
  BarChart2, Activity, ArrowRight, ShieldCheck, Sparkles,
  Zap, AlertCircle
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import Button from '../../components/ui/Button';

const CareerProgressPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      try {
        const res = await careerWorkspaceApi.getProgress(analysisId);
        if (isMounted && res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Fetch progress error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchProgress();
    return () => { isMounted = false; };
  }, [analysisId]);

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Progress & Trajectory" subtitle="Aggregating activity events and mastery gains...">
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  const plannedHours = data?.plannedHours || 60;
  const completedHours = data?.completedHours || 0;
  const completedTasks = data?.completedTasksCount || 0;
  const pendingTasks = data?.pendingTasksCount || 0;
  const totalTasks = completedTasks + pendingTasks || 1;
  const hoursPercent = Math.min(100, Math.round((completedHours / Math.max(1, plannedHours)) * 100));
  const tasksPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  const masteryProgress = data?.masteryProgress || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <CareerWorkspaceLayout
      title="Progress & Trajectory Analytics"
      subtitle="Transparent accounting of completed hours, skill mastery gains, and dynamic completion forecasts."
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Study Time */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours Invested</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {completedHours} <span className="text-sm font-normal text-slate-400">/ {plannedHours} hrs</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${hoursPercent}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {hoursPercent}% of targeted curriculum completed
            </div>
          </div>

          {/* Card 2: Tasks Finished */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Drills</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {completedTasks} <span className="text-sm font-normal text-slate-400">/ {totalTasks} tasks</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${tasksPercent}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {pendingTasks} remaining in current roadmap
            </div>
          </div>

          {/* Card 3: Calibrated Mastery */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills Assessed</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {masteryProgress.filter(m => m.isAssessed).length} <span className="text-sm font-normal text-slate-400">/ {masteryProgress.length} skills</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {masteryProgress.filter(m => m.isAssessed).length > 0 ? 'Verified via diagnostic quizzes' : 'Pending diagnostic assessment'}
            </div>
          </div>

          {/* Card 4: Trajectory Forecast */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pace & Forecast</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base font-bold text-white">
              {completedHours > 0 ? 'On Track' : 'Starting Up'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated completion in {Math.max(1, Math.ceil((plannedHours - completedHours) / 10))} weeks at 10h/wk.
            </p>
          </div>
        </div>

        {/* Skill Mastery Progression Grid */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Calibrated Skill Mastery Gains</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Combines resume evidence, assessment scores, and completed drills into normalized mastery.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/career/${analysisId}/assessments`)}
            >
              Take Assessment
            </Button>
          </div>

          {masteryProgress.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No skill mastery records initialized yet. Complete personal onboarding to calculate baseline.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masteryProgress.map((item) => {
                const target = item.targetMastery || 85;
                const score = item.masteryScore || 0;
                const barColor = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-indigo-500' : 'bg-amber-500';

                return (
                  <div
                    key={item.skill}
                    className="p-4 rounded-xl bg-[#162033]/60 border border-white/[0.08] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">{item.skill}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            item.isAssessed ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400 border border-white/[0.06]'
                          }`}>
                            {item.isAssessed ? 'Diagnostic Verified' : 'Resume Proxy'}
                          </span>
                          <span className="text-sm font-bold text-white">{score}%</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(100, score)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/[0.06]">
                      <span>Target: {target}%</span>
                      <span>Gap: {Math.max(0, target - score)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Stream */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Activity & Evidence Ledger</h3>
            <span className="text-xs text-slate-400 font-mono">Last 10 Actions</span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No logged learning events yet. Check off a task in your roadmap or complete a diagnostic quiz to see your ledger update.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((event, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#162033]/40 border border-white/[0.06] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white capitalize">
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                      {event.skill && (
                        <span className="text-slate-400 ml-2">
                          • {event.skill}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerProgressPage;
