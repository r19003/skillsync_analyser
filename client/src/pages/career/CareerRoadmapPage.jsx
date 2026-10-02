import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, RefreshCw,
  ExternalLink, ChevronDown, ChevronUp, Lock, Unlock,
  Sliders, Star, BookOpen, AlertCircle
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import Button from '../../components/ui/Button';

const phaseColors = {
  Foundation: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  Practice: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Application: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  'Interview Prep': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Validation: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
};

const CareerRoadmapPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [replanningWeek, setReplanningWeek] = useState(null);
  const [replanHours, setReplanHours] = useState(10);
  const [isSubmittingReplan, setIsSubmittingReplan] = useState(false);
  const [activeTaskConfidence, setActiveTaskConfidence] = useState({});
  const [replacingTaskId, setReplacingTaskId] = useState(null);

  const fetchRoadmap = async () => {
    try {
      const res = await careerWorkspaceApi.getRoadmap(analysisId);
      if (res.data?.success && res.data.plan) {
        setPlan(res.data.plan);
        const curWeek = res.data.plan.currentWeekNumber || 1;
        setExpandedWeeks({ [curWeek]: true });
      }
    } catch (err) {
      console.error('Fetch roadmap error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await careerWorkspaceApi.getRoadmap(analysisId);
        if (isMounted && res.data?.success && res.data.plan) {
          setPlan(res.data.plan);
          const curWeek = res.data.plan.currentWeekNumber || 1;
          setExpandedWeeks({ [curWeek]: true });
        }
      } catch (err) {
        console.error('Fetch roadmap error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) load();
    return () => { isMounted = false; };
  }, [analysisId]);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const confidence = activeTaskConfidence[task._id] || task.confidenceAfter || 4;

    try {
      await careerWorkspaceApi.updateTask(analysisId, task._id, {
        status: newStatus,
        actualMinutesSpent: task.durationMinutes,
        confidenceAfter: confidence
      });
      fetchRoadmap();
    } catch (err) {
      console.error('Update task status error:', err);
    }
  };

  const handleConfidenceChange = async (task, rating) => {
    setActiveTaskConfidence(prev => ({ ...prev, [task._id]: rating }));
    try {
      await careerWorkspaceApi.updateTask(analysisId, task._id, {
        confidenceAfter: rating
      });
      fetchRoadmap();
    } catch (err) {
      console.error('Update confidence error:', err);
    }
  };

  const handleToggleLock = async (task) => {
    try {
      await careerWorkspaceApi.updateTask(analysisId, task._id, {
        locked: !task.locked
      });
      fetchRoadmap();
    } catch (err) {
      console.error('Lock task error:', err);
    }
  };

  const handleReplaceResource = async (taskId) => {
    setReplacingTaskId(taskId);
    try {
      await careerWorkspaceApi.replaceTaskResource(analysisId, taskId);
      fetchRoadmap();
    } catch (err) {
      console.error('Replace resource error:', err);
    } finally {
      setReplacingTaskId(null);
    }
  };

  const handleExecuteReplan = async () => {
    if (!replanningWeek) return;
    setIsSubmittingReplan(true);
    try {
      await careerWorkspaceApi.replanWeek(analysisId, {
        weekNumber: replanningWeek.weekNumber,
        hoursAvailable: replanHours,
      });
      setReplanningWeek(null);
      fetchRoadmap();
    } catch (err) {
      console.error('Replan week error:', err);
    } finally {
      setIsSubmittingReplan(false);
    }
  };

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Adaptive Roadmap" subtitle="Loading your sequenced learning milestones...">
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  if (!plan) {
    return (
      <CareerWorkspaceLayout title="Adaptive Roadmap" subtitle="No learning plan found.">
        <div className="text-center py-16 bg-[#111827] rounded-2xl border border-white/[0.08] shadow-md">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Roadmap</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Configure your available study hours, target dates, and learning style to generate your deterministic roadmap.
          </p>
          <Button onClick={() => navigate(`/career/${analysisId}/settings`)}>
            Configure Profile
          </Button>
        </div>
      </CareerWorkspaceLayout>
    );
  }

  const weeks = plan.weeks || [];
  const totalTasks = weeks.reduce((sum, w) => sum + (w.tasks?.length || 0), 0);
  const completedTasks = weeks.reduce((sum, w) => sum + (w.tasks?.filter(t => t.status === 'completed').length || 0), 0);
  const totalHours = plan.totalHours || (plan.weeklyHours * weeks.length) || 60;
  const completedHours = plan.totalHoursCompleted || 0;
  const progressPercent = totalHours > 0 ? Math.min(100, Math.round((completedHours / totalHours) * 100)) : 0;

  return (
    <CareerWorkspaceLayout
      title="Adaptive Career Roadmap"
      subtitle="Phase → Week → Daily Task execution roadmap sequenced deterministically by dependency DAG."
    >
      <div className="space-y-6">
        {/* 1. Metric / Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Target Pace</span>
            <div className="text-2xl font-bold text-white">{plan.weeklyHours || 10} <span className="text-sm font-normal text-slate-400">hrs/week</span></div>
            <div className="text-xs text-slate-400 mt-1">{weeks.length} Weeks Structured Track</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Task Completion</span>
            <div className="text-2xl font-bold text-indigo-400">{completedTasks} <span className="text-sm font-normal text-slate-400">/ {totalTasks} tasks</span></div>
            <div className="text-xs text-slate-400 mt-1">{totalTasks - completedTasks} remaining</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Study Hours</span>
            <div className="text-2xl font-bold text-emerald-400">{completedHours} <span className="text-sm font-normal text-slate-400">/ {totalHours} hrs</span></div>
            <div className="w-full bg-[#162033] h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Current Focus</span>
              <div className="text-base font-bold text-white">Week {plan.currentWeekNumber || 1}</div>
              <div className="text-xs text-indigo-400 mt-0.5 font-medium">{weeks[0]?.phase || 'Foundation'} Phase</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-white/[0.1] text-slate-200 hover:text-white"
              onClick={() => {
                const cur = weeks.find(w => w.weekNumber === (plan.currentWeekNumber || 1)) || weeks[0];
                setReplanningWeek(cur);
                setReplanHours(cur?.plannedHours || 10);
              }}
            >
              <Sliders className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Replan Week
            </Button>
          </div>
        </div>

        {/* 2. Hierarchical Roadmap Weeks */}
        <div className="space-y-4">
          {weeks.map((week) => {
            const isExpanded = !!expandedWeeks[week.weekNumber];
            const weekTasks = week.tasks || [];
            const weekDone = weekTasks.filter(t => t.status === 'completed').length;
            const weekProgress = weekTasks.length > 0 ? Math.round((weekDone / weekTasks.length) * 100) : 0;
            const phaseClass = phaseColors[week.phase] || 'border-white/[0.08] bg-white/[0.04] text-slate-400';

            return (
              <div
                key={week.weekNumber}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-indigo-500/50 bg-[#111827] shadow-xl shadow-indigo-500/5'
                    : 'border-white/[0.08] bg-[#111827]/80 hover:bg-[#111827]'
                }`}
              >
                {/* Week Header (Summary) */}
                <div
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleWeek(week.weekNumber)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#162033] border border-white/[0.08] shrink-0">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Wk</span>
                      <span className="text-lg font-bold text-white leading-none">{week.weekNumber}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${phaseClass}`}>
                          {week.phase || 'Phase'}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          {week.title || `Week ${week.weekNumber} Execution`}
                        </h3>
                        {weekDone === weekTasks.length && weekTasks.length > 0 && (
                          <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl leading-relaxed">
                        {week.objective || week.mainObjective || 'Sequenced learning activities and exercises.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        <span className="font-bold text-white">{weekDone}</span>/{weekTasks.length} tasks • {week.plannedHours || 10}h planned
                      </div>
                      <div className="w-24 bg-[#162033] h-2 rounded-full overflow-hidden mt-1.5 ml-auto">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${weekProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplanningWeek(week);
                          setReplanHours(week.plannedHours || 10);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#162033] hover:bg-[#1e2a42] border border-white/[0.08] transition-colors"
                        title="Surgically replan this week"
                      >
                        <Sliders className="w-4 h-4 text-indigo-400" />
                      </button>

                      <div className="p-1.5 rounded-xl text-slate-400 bg-[#162033] border border-white/[0.08]">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Daily Tasks List */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-white/[0.06]">
                    <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-slate-400">Daily Action Plan & Evidence Milestones</span>
                      <span>Outcome: <span className="text-slate-200 font-medium">{week.expectedOutcome || 'Key competency demonstration'}</span></span>
                    </div>

                    {weekTasks.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400 bg-[#162033]/40 rounded-xl">
                        No specific tasks scheduled for this week.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {weekTasks.map((task) => {
                          const isDone = task.status === 'completed';
                          const isReplacing = replacingTaskId === task._id;

                          return (
                            <div
                              key={task._id}
                              className={`p-4 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-[#162033]/40 border-white/[0.04] opacity-75'
                                  : 'bg-[#162033] border-white/[0.07] hover:border-white/[0.15] shadow-sm'
                              }`}
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                {/* Left side: Status checkbox + Title + Purpose */}
                                <div className="flex items-start gap-3.5">
                                  <button
                                    onClick={() => handleToggleTaskStatus(task)}
                                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors shrink-0"
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-slate-500" />
                                    )}
                                  </button>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                        Day {task.dayNumber || 1}
                                      </span>
                                      <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                                        {task.title}
                                      </h4>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111827] text-indigo-300 border border-indigo-500/20 font-medium">
                                        {task.skill}
                                      </span>
                                      {task.locked && (
                                        <span className="text-[10px] text-amber-400 flex items-center font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                          <Lock className="w-3 h-3 mr-0.5" /> Locked
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                      {task.whyThisMatters || task.description || 'Targeted drill to close identified readiness gap.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Right side: Resource link, Duration, and Controls */}
                                <div className="flex flex-wrap items-center gap-3 lg:justify-end pl-8 lg:pl-0">
                                  {/* Resource Info */}
                                  {task.resourceDetails && (
                                    <div className="flex items-center gap-2 bg-[#0a0f1e] px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs max-w-xs truncate">
                                      <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                      <a
                                        href={task.resourceDetails.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:underline truncate font-medium"
                                        title={task.resourceDetails.title}
                                      >
                                        {task.resourceDetails.title}
                                      </a>
                                      <span className="text-[10px] text-slate-400">
                                        ({task.resourceDetails.type})
                                      </span>
                                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                    </div>
                                  )}

                                  {/* Duration */}
                                  <div className="flex items-center text-xs text-slate-400 shrink-0 font-medium">
                                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    {task.durationMinutes || 45}m
                                  </div>

                                  {/* Confidence rating (if done) */}
                                  {isDone && (
                                    <div className="flex items-center gap-1 bg-[#0a0f1e] px-2.5 py-1 rounded-xl border border-white/[0.08]">
                                      <span className="text-[10px] text-slate-400 mr-1 font-medium">Confidence:</span>
                                      {[1, 2, 3, 4, 5].map((star) => {
                                        const currentRating = activeTaskConfidence[task._id] || task.confidenceAfter || 4;
                                        return (
                                          <button
                                            key={star}
                                            onClick={() => handleConfidenceChange(task, star)}
                                            className={`transition-colors ${
                                              star <= currentRating ? 'text-amber-400' : 'text-slate-600'
                                            }`}
                                          >
                                            <Star className="w-3 h-3 fill-current" />
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Resource replacement button */}
                                  <button
                                    onClick={() => handleReplaceResource(task._id)}
                                    disabled={isReplacing}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#0a0f1e] hover:bg-[#162033] border border-white/[0.06] transition-colors"
                                    title="Swap this recommended resource"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin text-indigo-400' : ''}`} />
                                  </button>

                                  {/* Lock/Unlock Toggle */}
                                  <button
                                    onClick={() => handleToggleLock(task)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#0a0f1e] hover:bg-[#162033] border border-white/[0.06] transition-colors"
                                    title={task.locked ? 'Unlock task (allow replanning)' : 'Lock task against changes'}
                                  >
                                    {task.locked ? (
                                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Unlock className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. Surgical Replanning Modal */}
        {replanningWeek && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-[#111827] border border-white/[0.1] rounded-2xl shadow-2xl p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Surgically Replan Week {replanningWeek.weekNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setReplanningWeek(null)}
                  className="text-slate-400 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Adjust available study hours or catch up on overdue items for this week.
                <span className="text-indigo-400 font-medium"> The rest of your roadmap and prior weeks will remain untouched.</span>
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Study Hours for Week {replanningWeek.weekNumber}:</span>
                    <span className="font-bold text-indigo-400">{replanHours} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="25"
                    step="1"
                    value={replanHours}
                    onChange={(e) => setReplanHours(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>3 hrs (Light)</span>
                    <span>10 hrs (Standard)</span>
                    <span>25 hrs (Intensive)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#162033] border border-white/[0.08] text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    Locked tasks will not be modified or moved. Only pending tasks will be dynamically re-allocated.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setReplanningWeek(null)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  onClick={handleExecuteReplan}
                  disabled={isSubmittingReplan}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <RefreshCw className={`w-4 h-4 ${isSubmittingReplan ? 'animate-spin' : ''}`} />
                  {isSubmittingReplan ? 'Replanning...' : 'Recalculate Week'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerRoadmapPage;
