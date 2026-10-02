import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, CheckCircle2, AlertTriangle, ShieldAlert,
  Sparkles, RefreshCw, FileText, Target, HelpCircle, Layers
} from 'lucide-react';
import Button from '../../ui/Button';

const KeywordKPICards = ({ keywordAnalytics = {}, onRecalculate, isRecalculating }) => {
  const [showRecalcModal, setShowRecalcModal] = useState(false);
  const [customJd, setCustomJd] = useState('');

  const kpis = keywordAnalytics.summaryKPIs || {};
  const score = keywordAnalytics.optimizationScore || 0;
  const mode = keywordAnalytics.mode || 'Role Keyword Analysis';
  const breakdown = keywordAnalytics.breakdown || {};

  const handleRecalculateSubmit = (e) => {
    e.preventDefault();
    if (onRecalculate) {
      onRecalculate(customJd);
      setShowRecalcModal(false);
    }
  };

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-400 from-emerald-500/20 to-emerald-950/40 border-emerald-500/30';
    if (val >= 65) return 'text-cyan-400 from-cyan-500/20 to-cyan-950/40 border-cyan-500/30';
    if (val >= 50) return 'text-amber-400 from-amber-500/20 to-amber-950/40 border-amber-500/30';
    return 'text-rose-400 from-rose-500/20 to-rose-950/40 border-rose-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Header bar with Mode and Recalculate button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">ATS Keyword Intelligence</h3>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                mode === 'JD Keyword Analysis'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
              }`}>
                {mode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {mode === 'JD Keyword Analysis'
                ? 'Target keywords extracted directly from user-supplied Job Description requirements.'
                : 'Target keywords benchmarked against standardized industry role profile qualifications.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRecalcModal(true)}
          disabled={isRecalculating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-primary-400' : ''}`} />
          <span>{mode === 'JD Keyword Analysis' ? 'Update JD / Re-scan' : 'Paste Specific JD'}</span>
        </button>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Keyword Optimization Score */}
        <div className={`p-4 rounded-xl border bg-gradient-to-b ${getScoreColor(score)} flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Optimization</span>
            <Sparkles className="w-4 h-4 opacity-70" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold tracking-tight">{score}<span className="text-sm font-normal opacity-70">/100</span></div>
            <div className="text-[11px] opacity-80 mt-0.5">Deterministic ATS index</div>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-current rounded-full" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
        </div>

        {/* 2. Critical Keywords Matched */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Critical Matched</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white">
              {kpis.criticalMatchedCount || 0}
              <span className="text-sm font-normal text-slate-400"> / {kpis.criticalTotalCount || 0}</span>
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-0.5">
              {breakdown.criticalCoverage?.score || 0} / 35 pts (35% weight)
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${kpis.criticalTotalCount ? (kpis.criticalMatchedCount / kpis.criticalTotalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* 3. Critical Keywords Missing */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Critical Missing</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-rose-400">{kpis.criticalMissingCount || 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Blocking core gaps</div>
          </div>
          <div className="text-[11px] text-slate-500">Requires prioritised action</div>
        </div>

        {/* 4. Supporting Keywords Matched */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Supporting Matched</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white">
              {kpis.supportingMatchedCount || 0}
              <span className="text-sm font-normal text-slate-400"> / {kpis.supportingTotalCount || 0}</span>
            </div>
            <div className="text-[11px] text-cyan-400/90 mt-0.5">
              {breakdown.supportingCoverage?.score || 0} / 15 pts (15% weight)
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${kpis.supportingTotalCount ? (kpis.supportingMatchedCount / kpis.supportingTotalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* 5. Unsupported Skill Claims */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Unsupported Skills</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-amber-400">{kpis.unsupportedCount || 0}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">In skills list only</div>
          </div>
          <div className="text-[11px] text-amber-400/80">Lacks narrative proof</div>
        </div>

        {/* 6. Possible Keyword Stuffing Warnings */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Overuse Alerts</span>
            <ShieldAlert className={`w-4 h-4 ${kpis.overuseWarningsCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-2">
            <div className={`text-2xl font-bold ${kpis.overuseWarningsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {kpis.overuseWarningsCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Repetition flags</div>
          </div>
          <div className="text-[11px] text-slate-500">
            {kpis.overuseWarningsCount === 0 ? 'Clean natural usage' : 'Review frequency'}
          </div>
        </div>
      </div>

      {/* Recalculate Modal */}
      <AnimatePresence>
        {showRecalcModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary-400" />
                  <h3 className="text-base font-semibold text-white">Compare with Specific Job Description</h3>
                </div>
                <button
                  onClick={() => setShowRecalcModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Paste the full text of a target job posting below. SkillSync will extract requirements,
                distinguish mandatory vs preferred qualifications, and compute your tailored Keyword Optimization Score.
              </p>

              <form onSubmit={handleRecalculateSubmit} className="space-y-3">
                <textarea
                  rows={8}
                  value={customJd}
                  onChange={(e) => setCustomJd(e.target.value)}
                  placeholder="Paste Job Description text here (e.g. Responsibilities, Required Qualifications, Skills)..."
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono resize-none"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRecalcModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isRecalculating || customJd.trim().length < 20}
                  >
                    {isRecalculating ? 'Analyzing...' : 'Run JD Keyword Analysis'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KeywordKPICards;
