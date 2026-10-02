import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertTriangle, Eye, Info,
  Sparkles, Layers, ShieldAlert, X
} from 'lucide-react';

const ResumeKeywordHighlighter = ({
  resumeText = '',
  matchedKeywords = [],
  overuseWarnings = []
}) => {
  const [selectedKeywordDetail, setSelectedKeywordDetail] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, exact, alias, semantic, unsupported, overused

  // Identify overused keywords set
  const overusedSet = useMemo(() => {
    return new Set(overuseWarnings.map(w => (w.keyword || '').toLowerCase()));
  }, [overuseWarnings]);

  // Render clickable keyword badge
  const renderBadge = (kw) => {
    const isOverused = overusedSet.has(kw.canonicalKeyword.toLowerCase());
    let colorClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20';

    if (isOverused) {
      colorClass = 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20';
    } else if (kw.matchType === 'alias') {
      colorClass = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20';
    } else if (kw.matchType === 'semantic') {
      colorClass = 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20';
    } else if (kw.matchType === 'unsupported') {
      colorClass = 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20';
    }

    return (
      <button
        key={kw.canonicalKeyword}
        onClick={() => setSelectedKeywordDetail(kw)}
        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${colorClass}`}
      >
        <span>{kw.canonicalKeyword}</span>
        <span className="text-[10px] opacity-75 font-mono">({kw.resumeFrequency}x)</span>
      </button>
    );
  };

  const filteredBadges = useMemo(() => {
    return matchedKeywords.filter(kw => {
      if (kw.matchType === 'missing') return false;
      const isOverused = overusedSet.has(kw.canonicalKeyword.toLowerCase());
      if (activeFilter === 'overused') return isOverused;
      if (activeFilter !== 'ALL' && kw.matchType !== activeFilter) return false;
      return true;
    });
  }, [matchedKeywords, activeFilter, overusedSet]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Resume Keyword Highlighter & Evidence Explorer</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any detected keyword tag to inspect its exact sentence trace, placement, and score contribution.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Exact
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Alias
          </span>
          <span className="flex items-center gap-1 text-violet-400">
            <span className="w-2 h-2 rounded-full bg-violet-400" /> Semantic
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Unsupported
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Overused
          </span>
        </div>
      </div>

      {/* Filter Badges */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
        {[
          { id: 'ALL', label: 'All Detected' },
          { id: 'exact', label: 'Exact Matches' },
          { id: 'alias', label: 'Aliases' },
          { id: 'semantic', label: 'Semantic Evidence' },
          { id: 'unsupported', label: 'Unsupported' },
          { id: 'overused', label: 'Overused Warnings' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Clickable Keyword Tag Cloud */}
      <div className="flex flex-wrap gap-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl min-h-[90px] items-center">
        {filteredBadges.length > 0 ? (
          filteredBadges.map(kw => renderBadge(kw))
        ) : (
          <div className="text-xs text-slate-500 py-3 w-full text-center">
            No keywords found matching the selected filter.
          </div>
        )}
      </div>

      {/* Extracted Resume Text Viewer (Clean read-only representation) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Parsed Resume Text Preview</span>
          <span>Read-only text inspection</span>
        </div>
        <div className="max-h-56 overflow-y-auto p-4 bg-slate-950/90 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-primary-500/30">
          {resumeText || 'No extracted resume text available.'}
        </div>
      </div>

      {/* Detailed Keyword Evidence Drawer/Modal */}
      <AnimatePresence>
        {selectedKeywordDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-white">
                    {selectedKeywordDetail.canonicalKeyword}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full uppercase border ${
                    selectedKeywordDetail.matchType === 'exact'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedKeywordDetail.matchType === 'alias'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : selectedKeywordDetail.matchType === 'semantic'
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                          : selectedKeywordDetail.matchType === 'unsupported'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {selectedKeywordDetail.matchType} Match
                  </span>
                </div>
                <button
                  onClick={() => setSelectedKeywordDetail(null)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Occurrences</div>
                  <div className="text-base font-bold text-white mt-0.5">{selectedKeywordDetail.resumeFrequency}x</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Importance</div>
                  <div className="text-base font-bold text-primary-400 mt-0.5">{selectedKeywordDetail.importance}/100</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Placement</div>
                  <div className="text-xs font-semibold text-white mt-1 truncate">{selectedKeywordDetail.placementDisplay}</div>
                </div>
              </div>

              {/* Strongest Evidence Sentence */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-300">Strongest Supporting Resume Sentence</div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 italic leading-relaxed">
                  "{selectedKeywordDetail.bestEvidence}"
                </div>
              </div>

              {/* Classification Rationale & Score Impact */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1.5">
                <div className="font-semibold text-primary-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>How This Affects Your Optimization Score</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedKeywordDetail.isCritical
                    ? 'Evaluated as a Critical Mandatory Qualification contributing to the 35% Critical Coverage weight.'
                    : 'Evaluated as a Supporting / Preferred Qualification contributing to the 15% Supporting Coverage weight.'}
                  {' '}{selectedKeywordDetail.recommendation}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedKeywordDetail(null)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeKeywordHighlighter;
