import { useState, useEffect, useMemo, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target, Filter, LayoutGrid, Table as TableIcon,
  ChevronDown, ChevronUp, Search, Clock, ArrowRight,
  CheckCircle2, AlertTriangle, ShieldAlert, Sparkles
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import Button from '../../components/ui/Button';

const CareerSkillGapsPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('critical'); // 'critical', 'strengthen', 'proven', 'optional', 'all'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedSkill, setExpandedSkill] = useState(null);

  // Pagination for detailed table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;
    const fetchGaps = async () => {
      try {
        const res = await careerWorkspaceApi.getSkillGaps(analysisId);
        if (isMounted && res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Fetch skill gaps error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchGaps();
    return () => { isMounted = false; };
  }, [analysisId]);

  const criticalGaps = data?.criticalGaps || [];
  const skillsToStrengthen = data?.skillsToStrengthen || [];
  const provenSkills = data?.provenSkills || [];
  const optionalSkills = data?.optionalSkills || [];

  const categories = useMemo(() => {
    const set = new Set();
    const all = [...criticalGaps, ...skillsToStrengthen, ...provenSkills, ...optionalSkills];
    all.forEach(s => { if (s.category) set.add(s.category); });
    return ['ALL', ...Array.from(set)];
  }, [criticalGaps, skillsToStrengthen, provenSkills, optionalSkills]);

  const filteredSkills = useMemo(() => {
    let list = [];
    if (activeTab === 'critical') list = criticalGaps;
    else if (activeTab === 'strengthen') list = skillsToStrengthen;
    else if (activeTab === 'proven') list = provenSkills;
    else if (activeTab === 'optional') list = optionalSkills;
    else list = [...criticalGaps, ...skillsToStrengthen, ...provenSkills, ...optionalSkills];

    if (selectedCategory !== 'ALL') {
      list = list.filter(s => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.skill.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q)));
    }
    return list;
  }, [activeTab, selectedCategory, searchQuery, criticalGaps, skillsToStrengthen, provenSkills, optionalSkills]);

  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, currentPage]);

  const totalPages = Math.ceil(filteredSkills.length / pageSize) || 1;

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Skill Gaps & Prioritization" subtitle="Loading your calibrated competency analysis...">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  return (
    <CareerWorkspaceLayout
      title="Skill Gaps & Learning Priorities"
      subtitle="Prioritized mathematical ranking of your competencies against target employer requirements."
    >
      <div className="space-y-6">
        {/* 1. Top Category Summary Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => { setActiveTab('critical'); setCurrentPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'critical'
                ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-sm ring-1 ring-rose-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Critical Gaps</div>
            <div className="text-2xl font-bold text-white mt-1">{criticalGaps.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">High importance, low mastery</div>
          </button>

          <button
            onClick={() => { setActiveTab('strengthen'); setCurrentPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'strengthen'
                ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">To Strengthen</div>
            <div className="text-2xl font-bold text-white mt-1">{skillsToStrengthen.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Moderate grasp, needs polish</div>
          </button>

          <button
            onClick={() => { setActiveTab('proven'); setCurrentPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'proven'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm ring-1 ring-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Proven Skills</div>
            <div className="text-2xl font-bold text-white mt-1">{provenSkills.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Strong evidence (75%+)</div>
          </button>

          <button
            onClick={() => { setActiveTab('optional'); setCurrentPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'optional'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Optional / Secondary</div>
            <div className="text-2xl font-bold text-white mt-1">{optionalSkills.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Preferred or peripheral tools</div>
          </button>
        </div>

        {/* 2. Controls & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by skill or category..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Category Filter & View Mode Toggles */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'cards' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Priority Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Detailed Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. View Content */}
        {viewMode === 'cards' ? (
          /* Card View (Max 6 initially or filtered) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.slice(0, 9).map((item) => (
              <div
                key={item.skill}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider font-mono">
                      {item.category || 'General'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border font-mono ${
                      item.masteryScore < 45
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : item.masteryScore < 75
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      Mastery: {item.masteryScore}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{item.skill}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.whyItMatters}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Role Importance:</span>
                      <span className="text-white font-medium">{item.importance}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Est. Learning Effort:</span>
                      <span className="text-white font-medium">~{item.estimatedLearningHours} hrs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/career/${analysisId}/resources`)}
                    className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View Learning Triad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/career/${analysisId}/assessments`)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Test Skill
                  </button>
                </div>
              </div>
            ))}

            {filteredSkills.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-slate-500">
                No competencies found matching your filter criteria.
              </div>
            )}
          </div>
        ) : (
          /* Detailed Accessible Expandable Table */
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 sticky left-0 bg-slate-950 z-10">Skill Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mastery</th>
                    <th className="py-3 px-4">Importance</th>
                    <th className="py-3 px-4">Priority Score</th>
                    <th className="py-3 px-4">Est. Effort</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedSkills.map((item) => {
                    const isExpanded = expandedSkill === item.skill;
                    return (
                      <Fragment key={item.skill}>
                        <tr className="group hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white sticky left-0 bg-slate-900/90 group-hover:bg-slate-800/40 z-10">
                            {item.skill}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{item.category || 'General'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{item.masteryScore}%</span>
                              <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    item.masteryScore < 45 ? 'bg-rose-500' : item.masteryScore < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${item.masteryScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">{item.importance}/100</td>
                          <td className="py-3 px-4 font-mono font-bold text-primary-400">{item.priorityScore}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono">~{item.estimatedLearningHours} hrs</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setExpandedSkill(isExpanded ? null : item.skill)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Hide' : 'Details'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan={7} className="p-4 space-y-2 border-b border-slate-800/80">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="font-semibold text-slate-300">Why This Matters:</span>
                                  <p className="text-slate-400 mt-0.5 leading-relaxed">{item.whyItMatters}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-300">Recommended Next Step:</span>
                                  <p className="text-slate-400 mt-0.5 leading-relaxed">{item.nextBestAction}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {paginatedSkills.length} of {filteredSkills.length} skills</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-slate-800 disabled:opacity-40 rounded text-slate-200"
                >
                  Previous
                </button>
                <span className="font-mono">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 bg-slate-800 disabled:opacity-40 rounded text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerSkillGapsPage;
