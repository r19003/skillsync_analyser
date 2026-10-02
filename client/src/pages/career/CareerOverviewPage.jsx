import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Award, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, Clock, Target, Calendar, Activity, BookOpen, Layers
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import Button from '../../components/ui/Button';

const CareerOverviewPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOverview = async () => {
      try {
        const res = await careerWorkspaceApi.getOverview(analysisId);
        if (isMounted && res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Fetch overview error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchOverview();
    return () => { isMounted = false; };
  }, [analysisId]);

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Executive Overview" subtitle="Loading your calibrated career intelligence...">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  const kpis = data?.kpis || {};
  const nextAction = data?.nextBestAction;
  const topGaps = data?.topThreePriorityGaps || [];
  const currentWeek = data?.currentWeek;
  const recentImprovements = data?.recentImprovements || [];

  return (
    <CareerWorkspaceLayout
      title="Where You Stand Today"
      subtitle={`Synthesized baseline across deterministic ATS structure, ${data?.targetRole || 'role'} fit, and skill mastery.`}
    >
      <div className="space-y-6">
        {/* 1. Four Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Role/JD Fit */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">{kpis.roleFit?.label || 'Role Fit'}</span>
              <Target className="w-4 h-4 text-primary-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">{kpis.roleFit?.score ?? 0}%</span>
              <span className="text-xs text-primary-300 font-medium">{kpis.roleFit?.status}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Weighted alignment of required hard skills, qualifications, and domain scope.
            </p>
          </div>

          {/* Card 2: ATS Readiness */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">ATS Readiness</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">{kpis.atsReadiness?.score ?? 0}%</span>
              <span className="text-xs text-emerald-400 font-medium">{kpis.atsReadiness?.status}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              5-signal structural scan evaluating parseability, section headers, and metrics.
            </p>
          </div>

          {/* Card 3: Skill Mastery */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Skill Mastery</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">{kpis.skillMastery?.score ?? 0}%</span>
              <span className="text-xs text-cyan-400 font-medium">{kpis.skillMastery?.status}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Average proficiency across prioritized role competencies.
            </p>
          </div>

          {/* Card 4: Interview Readiness (CTA if unassessed) */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Interview Readiness</span>
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            {kpis.interviewReadiness?.isAssessed ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white tracking-tight">{kpis.interviewReadiness.score}%</span>
                  <span className="text-xs text-violet-400 font-medium">Assessed</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Calibrated via diagnostic problem solving and conceptual quizzes.
                </p>
              </>
            ) : (
              <div className="space-y-2 pt-0.5">
                <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Not yet assessed</span>
                </div>
                <button
                  onClick={() => navigate(`/career/${analysisId}/assessments`)}
                  className="w-full text-center px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 border border-primary-500/40 rounded-xl text-xs font-semibold transition-all"
                >
                  Take 10-min Diagnostic →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Middle Row: Next Best Action & Current Learning Week */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Best Action Card (Spans 2 columns) */}
          {nextAction && (
            <div className="lg:col-span-2 p-6 bg-gradient-to-br from-primary-950/40 via-slate-900 to-slate-900 border border-primary-500/30 rounded-2xl relative overflow-hidden space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-primary-500/20 text-primary-300 border border-primary-500/40 rounded-full text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Your Next Best Action</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">• Estimated: {nextAction.estimatedTime}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{nextAction.action}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                  {nextAction.reason}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => navigate(nextAction.targetUrl)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <span>Start Activity Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => navigate(`/career/${analysisId}/skills`)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-colors font-medium"
                >
                  Explore All Skill Gaps
                </button>
              </div>
            </div>
          )}

          {/* Current Learning Week Summary */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-400">Current Week</span>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full font-mono text-[10px]">
                Week {currentWeek?.weekNumber || 1} • {currentWeek?.phase || 'Foundation'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{currentWeek?.title || 'Foundations Mastery'}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {currentWeek?.mainObjective || 'Complete daily targeted practice to advance mastery.'}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Planned Hours:</span>
                <span className="text-white font-semibold">{currentWeek?.plannedHours || 10} hrs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tasks Completed:</span>
                <span className="text-emerald-400 font-semibold">{currentWeek?.completedTaskCount || 0} / {currentWeek?.taskCount || 5}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/career/${analysisId}/roadmap`)}
              className="w-full mt-2 py-2 text-center text-xs font-semibold text-primary-300 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/80"
            >
              Open Active Roadmap →
            </button>
          </div>
        </div>

        {/* 3. Bottom Row: Top 3 Priority Gaps & Recent Improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Priority Gaps (Spans 2 columns) */}
          <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Top 3 Priority Skill Gaps</h3>
                <p className="text-xs text-slate-400 mt-0.5">High-impact skills with the greatest return on hiring readiness.</p>
              </div>
              <button
                onClick={() => navigate(`/career/${analysisId}/skills`)}
                className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                View all skill gaps →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topGaps.slice(0, 3).map((gap) => (
                <div
                  key={gap.skill}
                  className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{gap.skill}</span>
                    <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono">
                      {gap.masteryScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {gap.whyItMatters}
                  </p>
                  <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>~{gap.estimatedLearningHours} hrs to target</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Improvement Ledger */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Improvements</h3>
            </div>

            {recentImprovements.length > 0 ? (
              <div className="space-y-2.5">
                {recentImprovements.map((imp, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs space-y-1">
                    <div className="text-slate-200 font-medium">{imp.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{imp.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <p>Complete your first roadmap task or assessment to begin tracking historical gains.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerOverviewPage;
