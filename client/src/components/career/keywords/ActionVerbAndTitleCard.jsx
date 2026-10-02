import { useState } from 'react';
import {
  Flame, CheckCircle2, AlertTriangle, ArrowRight,
  Briefcase, Award, Zap, TrendingUp, Sparkles
} from 'lucide-react';

const ActionVerbAndTitleCard = ({
  actionVerbAnalytics = {},
  jobTitleAlignment = {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState('verbs'); // 'verbs' | 'title'

  const weakPhrases = actionVerbAnalytics.weakPhrasesDetected || [];
  const strongVerbs = actionVerbAnalytics.strongVerbsList || [];
  const verbScore = actionVerbAnalytics.actionVerbScore || 50;
  const varietyAssessment = actionVerbAnalytics.varietyAssessment || '';

  const titleScore = jobTitleAlignment.titleScore || 75;
  const isCompatible = jobTitleAlignment.isSeniorityCompatible !== false;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Action-Verb & Job-Title Intelligence</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic evaluation of narrative impact verbs and target seniority alignment.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('verbs')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-all ${
              activeSubTab === 'verbs' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Action Verbs ({verbScore}/100)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('title')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-all ${
              activeSubTab === 'title' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Title Alignment ({titleScore}/100)</span>
          </button>
        </div>
      </div>

      {/* 1. Action Verb View */}
      {activeSubTab === 'verbs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Verb Variety Score</span>
              <div className="text-2xl font-bold text-white mt-1">{verbScore}<span className="text-xs text-slate-500 font-normal">/100</span></div>
              <div className="text-[11px] text-slate-400 mt-0.5">{varietyAssessment}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Strong Verbs Used</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {actionVerbAnalytics.uniqueStrongVerbsUsed || 0}
                <span className="text-xs text-slate-500 font-normal"> distinct</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {actionVerbAnalytics.totalStrongVerbsUsed || 0} total occurrences
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Passive Phrases Detected</span>
              <div className={`text-2xl font-bold mt-1 ${weakPhrases.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {weakPhrases.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {weakPhrases.length === 0 ? 'No passive filler detected' : 'Replace with action verbs'}
              </div>
            </div>
          </div>

          {/* Weak Phrase Warnings & Recommendations */}
          {weakPhrases.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Passive Phrasing to Upgrade</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {weakPhrases.map((weak, i) => (
                  <div key={i} className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">"{weak.phrase}"</span>
                      <span className="text-[10px] bg-rose-900/40 text-rose-200 px-1.5 py-0.5 rounded font-mono">
                        {weak.count}x detected
                      </span>
                    </div>
                    {weak.exampleSentence && (
                      <p className="text-[11px] text-slate-400 italic truncate" title={weak.exampleSentence}>
                        "...{weak.exampleSentence.slice(0, 80)}..."
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span>Replace with:</span>
                      <span className="font-semibold text-white">{weak.replacementSuggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Great job! No weak or passive phrases like "worked on" or "responsible for" were found.</span>
            </div>
          )}

          {/* Strong Verbs Tag Cloud */}
          {strongVerbs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Strong Ownership Verbs Detected</span>
              <div className="flex flex-wrap gap-1.5">
                {strongVerbs.map(({ verb, count }) => (
                  <span
                    key={verb}
                    className="px-2 py-0.5 text-xs font-mono rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                  >
                    <span>{verb}</span>
                    <span className="text-[10px] text-primary-400 font-bold">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Job Title Alignment View */}
      {activeSubTab === 'title' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Target Role Title</span>
                <h4 className="text-base font-bold text-white mt-0.5">{jobTitleAlignment.targetRoleTitle || 'Software Engineer'}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Title Match Score</span>
                <div className="text-2xl font-bold text-primary-400 mt-0.5">{titleScore}/100</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {jobTitleAlignment.explanation}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="text-slate-400">
                <span className="font-semibold text-white">Extracted Experience Titles: </span>
                {jobTitleAlignment.extractedTitles && jobTitleAlignment.extractedTitles.length > 0
                  ? jobTitleAlignment.extractedTitles.join(', ')
                  : 'Entry-level / Project background (No formal titles)'}
              </div>

              <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${
                isCompatible
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {isCompatible ? 'Seniority Compatible' : 'Seniority Review Needed'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionVerbAndTitleCard;
