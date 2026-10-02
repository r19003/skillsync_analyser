import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ArrowUpDown, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, AlertTriangle, ExternalLink, Info, Layers
} from 'lucide-react';

const KeywordComparisonTable = ({ matchedKeywords = [], onInspectKeyword }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMatchType, setSelectedMatchType] = useState('ALL');
  const [selectedTab, setSelectedTab] = useState('all'); // all, critical, matched, missing, related, unsupported, overused
  const [sortField, setSortField] = useState('importance');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedKeyword, setExpandedKeyword] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(matchedKeywords.map(k => k.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [matchedKeywords]);

  // Tab filtering logic
  const filteredList = useMemo(() => {
    return matchedKeywords.filter(item => {
      // 1. Tab filter
      if (selectedTab === 'critical' && !item.isCritical && item.requirementType !== 'required') return false;
      if (selectedTab === 'matched' && item.matchType === 'missing') return false;
      if (selectedTab === 'missing' && item.matchType !== 'missing') return false;
      if (selectedTab === 'related' && !item.transferableAlternative) return false;
      if (selectedTab === 'unsupported' && item.matchType !== 'unsupported') return false;
      if (selectedTab === 'overused' && (item.resumeFrequency < 5 || item.matchType === 'missing')) return false;

      // 2. Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

      // 3. Match type filter
      if (selectedMatchType !== 'ALL' && item.matchType !== selectedMatchType) return false;

      // 4. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inName = (item.canonicalKeyword || '').toLowerCase().includes(q);
        const inCat = (item.category || '').toLowerCase().includes(q);
        const inEv = (item.bestEvidence || '').toLowerCase().includes(q);
        const inRec = (item.recommendation || '').toLowerCase().includes(q);
        if (!inName && !inCat && !inEv && !inRec) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [matchedKeywords, selectedTab, selectedCategory, selectedMatchType, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getMatchTypeBadge = (type) => {
    switch (type) {
      case 'exact':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Exact</span>;
      case 'alias':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Alias</span>;
      case 'semantic':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/30">Semantic</span>;
      case 'unsupported':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">Unsupported</span>;
      case 'missing':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">Missing</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
      {/* Title & Quick Filter Tabs */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Keyword Comparison Matrix</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent comparison of target role & JD keywords against detected resume evidence and placement.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'all', label: `All (${matchedKeywords.length})` },
            { id: 'critical', label: 'Critical' },
            { id: 'matched', label: 'Matched' },
            { id: 'missing', label: 'Missing' },
            { id: 'related', label: 'Related' },
            { id: 'unsupported', label: 'Unsupported' },
            { id: 'overused', label: 'Overused' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Dropdowns Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, recommendations..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedMatchType}
            onChange={(e) => setSelectedMatchType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Match Types</option>
            <option value="exact">Exact Matches</option>
            <option value="alias">Alias Matches</option>
            <option value="semantic">Semantic Evidence</option>
            <option value="unsupported">Unsupported Claims</option>
            <option value="missing">Missing Keywords</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/80 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('canonicalKeyword')}>
                <div className="flex items-center gap-1">Keyword <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
              </th>
              <th className="py-2.5 px-2 text-center cursor-pointer hover:text-white" onClick={() => handleSort('importance')}>
                <div className="flex items-center justify-center gap-1">Importance <ArrowUpDown className="w-3 h-3 opacity-60" /></div>
              </th>
              <th className="py-2.5 px-2 text-center">JD Status</th>
              <th className="py-2.5 px-2 text-center">Match Type</th>
              <th className="py-2.5 px-2 text-center">Freq</th>
              <th className="py-2.5 px-3">Placement</th>
              <th className="py-2.5 px-3">Actionable Recommendation</th>
              <th className="py-2.5 px-2 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredList.map((item, idx) => {
              const isExpanded = expandedKeyword === item.canonicalKeyword;
              return (
                <tr
                  key={item.canonicalKeyword + idx}
                  className={`hover:bg-slate-800/40 transition-colors ${item.isCritical ? 'bg-slate-900/40' : ''}`}
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{item.canonicalKeyword}</span>
                      {item.isCritical && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Critical requirement" />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.category}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-medium">
                    <span className={item.importance >= 85 ? 'text-primary-400' : 'text-slate-400'}>
                      {item.importance}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      item.requirementType === 'required'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.requirementType}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">{getMatchTypeBadge(item.matchType)}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-300">{item.resumeFrequency}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.placementDisplay}</td>
                  <td className="py-2.5 px-3 max-w-xs text-slate-300 text-[11px] truncate" title={item.recommendation}>
                    {item.recommendation}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => onInspectKeyword ? onInspectKeyword(item.canonicalKeyword) : setExpandedKeyword(isExpanded ? null : item.canonicalKeyword)}
                      className="p-1 text-slate-400 hover:text-primary-400 transition-colors"
                      title="Inspect evidence details"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="block md:hidden space-y-2.5">
        {filteredList.map((item, idx) => (
          <div
            key={'mob_' + item.canonicalKeyword + idx}
            className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>{item.canonicalKeyword}</span>
                {getMatchTypeBadge(item.matchType)}
              </div>
              <span className="text-[11px] font-mono text-primary-400 font-medium">
                {item.importance} pts
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{item.category}</span>
              <span>Placement: {item.placementDisplay}</span>
            </div>

            {item.bestEvidence && item.bestEvidence !== 'No direct evidence identified in resume text.' && (
              <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80 italic">
                "{item.bestEvidence}"
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">Action:</span> {item.recommendation}
            </p>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-8 text-xs text-slate-500">
          No keywords match your selected filter criteria.
        </div>
      )}
    </div>
  );
};

export default KeywordComparisonTable;
