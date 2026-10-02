import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen, Code, Trophy, ExternalLink,
  Clock, Check
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';

const triadTypes = [
  { key: 'ALL', label: 'All Modalities' },
  { key: 'LEARN', label: 'Learn (Theory)', icon: BookOpen, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { key: 'PRACTICE', label: 'Practice (Drill)', icon: Code, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { key: 'PROVE', label: 'Prove (Portfolio)', icon: Trophy, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
];

const CareerResourcesPage = () => {
  const { analysisId } = useParams();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [freeOnly, setFreeOnly] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchResources = async () => {
      try {
        const res = await careerWorkspaceApi.getResources(analysisId);
        if (isMounted && res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Fetch resources error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchResources();
    return () => { isMounted = false; };
  }, [analysisId]);

  const handleFeedback = async (resourceId, feedbackType, rating = 5) => {
    try {
      setFeedbackStatus(prev => ({ ...prev, [resourceId]: feedbackType }));
      await careerWorkspaceApi.submitResourceFeedback(analysisId, {
        resourceId,
        rating,
        difficultyFeedback: feedbackType === 'too_easy' ? 'too_easy' : feedbackType === 'too_difficult' ? 'too_difficult' : undefined,
        formatFeedback: feedbackType === 'too_long' ? 'too_long' : undefined,
        helpful: feedbackType === 'helpful'
      });
    } catch (err) {
      console.error('Submit feedback error:', err);
    }
  };

  const triplets = useMemo(() => data?.triplets || [], [data]);

  // Extract unique skills
  const availableSkills = useMemo(() => {
    const set = new Set();
    triplets.forEach(t => { if (t.skill) set.add(t.skill); });
    return ['ALL', ...Array.from(set)];
  }, [triplets]);

  // Filter triplets
  const filteredTriplets = useMemo(() => {
    return triplets.filter(t => {
      if (selectedSkill !== 'ALL' && t.skill !== selectedSkill) return false;
      return true;
    });
  }, [triplets, selectedSkill]);

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Curated Resources" subtitle="Ranking verified learning resources...">
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  return (
    <CareerWorkspaceLayout
      title="Targeted Learning Resources"
      subtitle="Curated Learn / Practice / Prove triads matched specifically to your skill gap priorities and learning preferences."
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Skill Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter Skill:</span>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-[#162033] border border-white/[0.1] rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {availableSkills.map(s => (
                  <option key={s} value={s} className="bg-[#111827]">{s}</option>
                ))}
              </select>
            </div>

            {/* Triad Filter */}
            <div className="flex items-center gap-1 bg-[#162033] p-1 rounded-xl border border-white/[0.08]">
              {triadTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-semibold ${
                    selectedType === t.key
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Free Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none bg-[#162033] px-3 py-2 rounded-xl border border-white/[0.08]">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="accent-indigo-500 rounded cursor-pointer w-4 h-4"
              />
              <span>Free Resources Only</span>
            </label>
          </div>
        </div>

        {/* Triplets by Skill */}
        {filteredTriplets.length === 0 ? (
          <div className="text-center py-16 bg-[#111827] rounded-2xl border border-white/[0.08] shadow-md">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No resources found</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or resetting the skill selection.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredTriplets.map((triplet) => {
              const resourcesToDisplay = [];
              if ((selectedType === 'ALL' || selectedType === 'LEARN') && triplet.learnResource) {
                resourcesToDisplay.push({ item: triplet.learnResource, modality: 'LEARN' });
              }
              if ((selectedType === 'ALL' || selectedType === 'PRACTICE') && triplet.practiceResource) {
                resourcesToDisplay.push({ item: triplet.practiceResource, modality: 'PRACTICE' });
              }
              if ((selectedType === 'ALL' || selectedType === 'PROVE') && triplet.proveResource) {
                resourcesToDisplay.push({ item: triplet.proveResource, modality: 'PROVE' });
              }

              // Apply free-only filter
              const finalResources = resourcesToDisplay.filter(({ item }) => {
                if (freeOnly && !item.isFree) return false;
                return true;
              });

              if (finalResources.length === 0) return null;

              return (
                <div key={triplet.skill} className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                      <h3 className="text-lg font-bold text-white tracking-tight">{triplet.skill}</h3>
                      <span className="text-xs text-slate-400 font-medium">
                        • Complete Triad Progression
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {finalResources.map(({ item, modality }) => {
                      const userFeedback = feedbackStatus[item._id || item.id || item.title];
                      const badgeInfo =
                        modality === 'LEARN'
                          ? { label: 'Learn • Theory', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' }
                          : modality === 'PRACTICE'
                            ? { label: 'Practice • Drill', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' }
                            : { label: 'Prove • Project', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' };

                      return (
                        <div
                          key={item.title}
                          className="flex flex-col justify-between p-6 rounded-2xl bg-[#111827] border border-white/[0.08] hover:border-white/[0.18] transition-all shadow-md hover:shadow-xl"
                        >
                          <div>
                            {/* Top Badge Row */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeInfo.color}`}>
                                {badgeInfo.label}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${item.isFree ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                                  {item.isFree ? 'Free' : 'Paid'}
                                </span>
                              </div>
                            </div>

                            {/* Title & Platform */}
                            <h4 className="text-base font-bold text-white line-clamp-2 mb-1 leading-snug">
                              {item.title}
                            </h4>
                            <div className="text-xs text-indigo-400 mb-2.5 font-semibold">
                              {item.platform || item.provider || 'Curated Resource'}
                            </div>

                            {/* Reason / Context */}
                            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                              {item.matchReason || item.description || 'Targeted resource to close your identified skill gap.'}
                            </p>
                          </div>

                          <div>
                            {/* Metadata */}
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-3 border-t border-white/[0.06]">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>{item.estimatedMinutes ? `${item.estimatedMinutes} mins` : item.duration || 'Self-paced'}</span>
                              </div>
                              <span className="text-xs capitalize font-medium text-slate-300">
                                {item.difficulty || 'Intermediate'}
                              </span>
                            </div>

                            {/* Outbound Link Button */}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#162033] hover:bg-[#1e2a42] text-xs font-semibold text-white border border-white/[0.08] transition-colors mb-3 shadow-sm"
                            >
                              <span>Start Resource</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </a>

                            {/* Feedback Section */}
                            <div className="pt-2 border-t border-white/[0.06]">
                              {userFeedback ? (
                                <div className="text-center py-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-1.5 font-semibold">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Feedback saved! Calibrating...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400 font-medium">Feedback:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleFeedback(item._id || item.id || item.title, 'helpful')}
                                      className="px-2 py-1 rounded-lg text-xs bg-[#162033] hover:bg-[#1e2a42] border border-white/[0.06] text-slate-300 hover:text-white transition-colors"
                                      title="Helpful"
                                    >
                                      👍 Helpful
                                    </button>
                                    <button
                                      onClick={() => handleFeedback(item._id || item.id || item.title, 'too_easy')}
                                      className="px-2 py-1 rounded-lg text-xs bg-[#162033] hover:bg-[#1e2a42] border border-white/[0.06] text-slate-300 hover:text-white transition-colors"
                                      title="Too Easy"
                                    >
                                      🥱 Easy
                                    </button>
                                    <button
                                      onClick={() => handleFeedback(item._id || item.id || item.title, 'too_difficult')}
                                      className="px-2 py-1 rounded-lg text-xs bg-[#162033] hover:bg-[#1e2a42] border border-white/[0.06] text-slate-300 hover:text-white transition-colors"
                                      title="Too Difficult"
                                    >
                                      🤯 Hard
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerResourcesPage;
