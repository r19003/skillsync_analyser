import { useState } from 'react';
import {
  AlertTriangle, ShieldCheck, ArrowRight, Lightbulb,
  FileCheck2, Compass, Layers, CheckCircle2
} from 'lucide-react';

const MissingKeywordPrioritizer = ({ missingPriorities = [] }) => {
  const [filterPriority, setFilterPriority] = useState('ALL'); // ALL, critical, high, optional, transferable

  const filtered = missingPriorities.filter(item => {
    if (filterPriority === 'critical') return item.priority === 'critical';
    if (filterPriority === 'high') return item.priority === 'high';
    if (filterPriority === 'optional') return item.priority === 'optional';
    if (filterPriority === 'transferable') return Boolean(item.candidateAlternative);
    return true;
  });

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Critical Gap</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">High Value</span>;
      case 'optional':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">Optional</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Missing Keyword Prioritization</h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {missingPriorities.length} Missing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ethical, prioritized action items. Build authentic deliverables before claiming missing qualifications.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'ALL', label: 'All Gaps' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High Value' },
            { id: 'transferable', label: 'Transferable' },
            { id: 'optional', label: 'Optional' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterPriority(tab.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterPriority === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Missing Keyword Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((item, idx) => (
          <div
            key={item.keyword + idx}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
              item.priority === 'critical'
                ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60'
                : item.candidateAlternative
                  ? 'bg-purple-950/20 border-purple-900/40 hover:border-purple-700/60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>{item.keyword}</span>
                    {getPriorityBadge(item.priority)}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.category} • Importance: {item.importance}/100</div>
                </div>

                {item.candidateAlternative && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Alt: {item.candidateAlternative}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.reason}
              </p>

              {item.candidateAlternative && (
                <div className="p-2.5 bg-purple-900/20 border border-purple-800/40 rounded-lg text-xs text-purple-200 flex items-start gap-2">
                  <Compass className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-purple-300">Transferable Bridge: </span>
                    You already have demonstrated experience in {item.candidateAlternative}. Emphasize this capability during recruiter screenings while working on {item.keyword}.
                  </div>
                </div>
              )}
            </div>

            {/* Evidence To Create Box */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-primary-400 uppercase tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Evidence You Should Create</span>
              </div>
              <p className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 italic">
                {item.evidenceToCreate}
              </p>
              <p className="text-[11px] text-slate-500">
                ⚠️ <span className="italic">Ethical Notice: Never append keywords directly to your resume without demonstrable code or case study proof.</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-xs text-slate-500">
          No missing keywords in this priority tier.
        </div>
      )}
    </div>
  );
};

export default MissingKeywordPrioritizer;
