import { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, KeyRound, FileText, TrendingUp,
  MapPin, BookOpen, CheckSquare, Activity, Sliders,
  ChevronRight, ArrowLeft, Briefcase, Code
} from 'lucide-react';
import Navbar from '../../layout/Navbar';
import PersonalizationModal from './PersonalizationModal';
import careerWorkspaceApi from '../../../api/careerWorkspaceApi';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: 'overview', label: 'Overview', icon: LayoutDashboard },
  { path: 'skills', label: 'Skill Gaps', icon: Target },
  { path: 'keywords', label: 'ATS Keywords', icon: KeyRound },
  { path: 'evidence', label: 'Resume Evidence', icon: FileText },
  { path: 'market', label: 'Market Insights', icon: TrendingUp },
  { path: 'roadmap', label: 'My Roadmap', icon: MapPin },
  { path: 'resources', label: 'Resources', icon: BookOpen },
  { path: 'assessments', label: 'Assessments', icon: CheckSquare },
  { path: 'progress', label: 'Progress', icon: Activity },
  { path: 'settings', label: 'Personalization', icon: Sliders }
];

const CareerWorkspaceLayout = ({ children, title, subtitle }) => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [overviewData, setOverviewData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadOverview = async () => {
      try {
        const res = await careerWorkspaceApi.getOverview(analysisId);
        if (isMounted && res.data?.success) {
          setOverviewData(res.data);
          // If user hasn't completed onboarding, prompt them!
          if (!res.data.onboardingCompleted && !sessionStorage.getItem(`onboarded_${analysisId}`)) {
            setIsModalOpen(true);
            sessionStorage.setItem(`onboarded_${analysisId}`, 'true');
          }
        }
      } catch (err) {
        console.warn('Workspace layout overview load:', err.message);
      }
    };

    const loadProfile = async () => {
      try {
        const res = await careerWorkspaceApi.getProfile(analysisId);
        if (isMounted && res.data?.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        // silent fallback
      }
    };

    if (analysisId) {
      loadOverview();
      loadProfile();
    }
    return () => { isMounted = false; };
  }, [analysisId]);

  const handleSaveProfile = async (formData) => {
    setIsSavingProfile(true);
    try {
      const res = await careerWorkspaceApi.saveProfile(analysisId, formData);
      if (res.data?.success) {
        toast.success('Career preferences saved! Roadmap calibrated.');
        setProfile(res.data.profile);
        setIsModalOpen(false);
        // Refresh overview
        const ov = await careerWorkspaceApi.getOverview(analysisId);
        if (ov.data?.success) setOverviewData(ov.data);
      }
    } catch (err) {
      toast.error('Failed to save preferences.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Automatically scroll window to top whenever switching tabs in the Career Workspace
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const targetRole = overviewData?.targetRole || profile?.targetRole || 'Software Engineer';
  const isSwe = targetRole.toLowerCase().includes('software');

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex flex-col pt-16">
      {/* Global Navbar (Fixed at top: 0, height: 64px) */}
      <Navbar />

      {/* Career Workspace Secondary Bar (Solid background to prevent ghost text underneath) */}
      <div className="border-b border-white/[0.08] bg-[#0a0f1e] sticky top-16 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-2.5 gap-2.5">
            {/* Left: Breadcrumbs & Role Indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/history')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Back to History"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Career Workspace</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs text-slate-200 font-semibold">{overviewData?.candidateName || 'Candidate'}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isSwe
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isSwe ? <Code className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                  <span>{targetRole}</span>
                </span>
              </div>
            </div>

            {/* Right: Quick Personalization Trigger & KPI */}
            <div className="flex items-center gap-3">
              {overviewData?.kpis?.roleFit && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#162033] border border-white/[0.08] rounded-lg text-xs">
                  <span className="text-slate-400">{overviewData.kpis.roleFit.label}:</span>
                  <span className="font-bold text-indigo-400">{overviewData.kpis.roleFit.score}%</span>
                </div>
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#283548] border border-white/[0.1] rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Personalize Plan</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Horizontal on mobile, persistent submenu) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 pb-2">
            {NAV_ITEMS.map((item) => {
              const fullPath = `/career/${analysisId}/${item.path}`;
              const isActive = location.pathname.includes(`/career/${analysisId}/${item.path}`);
              return (
                <NavLink
                  key={item.path}
                  to={fullPath}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(title || subtitle) && (
          <div className="mb-6 pb-4 border-b border-white/[0.08]">
            {title && <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      {/* Personalization Modal */}
      <PersonalizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProfile={profile}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
};

export default CareerWorkspaceLayout;
