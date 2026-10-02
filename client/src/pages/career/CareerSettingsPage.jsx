import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sliders, Save, CheckCircle2, Clock, Calendar,
  BookOpen, DollarSign, Code, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import Button from '../../components/ui/Button';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LEARNING_STYLES = [
  'Videos',
  'Written documentation',
  'Interactive practice',
  'Projects',
  'Mixed'
];

const PROGRAMMING_LANGUAGES = ['Python', 'Java', 'JavaScript', 'C++', 'Go'];

const CareerSettingsPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    targetRole: 'Software Engineer',
    targetSeniority: 'Entry-Level',
    targetCompletionDate: '',
    weeklyHours: 10,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    maxSessionDurationMinutes: 60,
    preferredStudyTime: 'Evening',
    learningStyles: ['Interactive practice', 'Projects'],
    budget: 'Free only',
    preferredLanguage: 'Python',
    skippedTopics: []
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await careerWorkspaceApi.getProfile(analysisId);
        if (isMounted && res.data?.success && res.data.profile) {
          const p = res.data.profile;
          setFormData(prev => ({
            ...prev,
            targetRole: p.targetRole || prev.targetRole,
            targetSeniority: p.targetSeniority || prev.targetSeniority,
            targetCompletionDate: p.targetCompletionDate ? p.targetCompletionDate.split('T')[0] : '',
            weeklyHours: p.weeklyHours || 10,
            availableDays: p.availableDays?.length ? p.availableDays : prev.availableDays,
            maxSessionDurationMinutes: p.maxSessionDurationMinutes || 60,
            preferredStudyTime: p.preferredStudyTime || 'Evening',
            learningStyles: p.learningStyles?.length ? p.learningStyles : prev.learningStyles,
            budget: p.budget || 'Free only',
            preferredLanguage: p.preferredLanguage || 'Python',
            skippedTopics: p.skippedTopics || []
          }));
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchProfile();
    return () => { isMounted = false; };
  }, [analysisId]);

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.availableDays.includes(day);
      return {
        ...prev,
        availableDays: exists
          ? prev.availableDays.filter(d => d !== day)
          : [...prev.availableDays, day]
      };
    });
  };

  const toggleStyle = (style) => {
    setFormData(prev => {
      const exists = prev.learningStyles.includes(style);
      return {
        ...prev,
        learningStyles: exists
          ? prev.learningStyles.filter(s => s !== style)
          : [...prev.learningStyles, style]
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await careerWorkspaceApi.saveProfile(analysisId, formData);
      if (res.data?.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Personalization Settings" subtitle="Loading profile preferences...">
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  const isSwe = formData.targetRole.toLowerCase().includes('software');

  return (
    <CareerWorkspaceLayout
      title="Personalization & Study Configuration"
      subtitle="Calibrate your study schedule, learning styles, resource budget, and language preferences."
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Saved Success Notification */}
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Preferences saved! Roadmap and curated resources have been recalibrated.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="text-xs"
              onClick={() => navigate(`/career/${analysisId}/roadmap`)}
            >
              View Roadmap
            </Button>
          </div>
        )}

        {/* Section 1: Study Commitment */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-6 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Time & Availability Commitment</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Hours Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Weekly Study Hours</span>
                <span className="font-bold text-indigo-400 font-mono">{formData.weeklyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={formData.weeklyHours}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value, 10) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>4 hrs (Casual)</span>
                <span>10 hrs (Standard)</span>
                <span>30 hrs (Bootcamp)</span>
              </div>
            </div>

            {/* Target Interview Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Interview / Readiness Date
              </label>
              <input
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                className="w-full bg-[#162033] border border-white/[0.1] rounded-xl text-xs text-white px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Available Study Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = formData.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-500'
                        : 'bg-[#162033] text-slate-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Duration & Study Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Max Session Duration
              </label>
              <select
                value={formData.maxSessionDurationMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSessionDurationMinutes: parseInt(e.target.value, 10) }))}
                className="w-full bg-[#162033] border border-white/[0.1] rounded-xl text-xs text-white px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Recommended)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes (Deep Work)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Study Time
              </label>
              <select
                value={formData.preferredStudyTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredStudyTime: e.target.value }))}
                className="w-full bg-[#162033] border border-white/[0.1] rounded-xl text-xs text-white px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="Morning">Morning (8am - 12pm)</option>
                <option value="Afternoon">Afternoon (12pm - 5pm)</option>
                <option value="Evening">Evening (5pm - 9pm)</option>
                <option value="Late Night">Late Night (9pm+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Learning Modality & Budget */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-6 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Learning Style & Content Preferences</h3>
          </div>

          {/* Learning Styles */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Preferred Learning Styles (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {LEARNING_STYLES.map((style) => {
                const active = formData.learningStyles.includes(style);
                return (
                  <div
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      active
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-white font-semibold ring-1 ring-emerald-500/30'
                        : 'border-white/[0.08] bg-[#162033]/60 text-slate-400 hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    <span>{style}</span>
                    {active && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Budget */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Resource Cost Budget
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full bg-[#162033] border border-white/[0.1] rounded-xl text-xs text-white px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="Free only">Free Resources Only (Open-Source, Docs, Free Tiers)</option>
                <option value="Free and paid">Free and Paid (Coursera, Udemy, LeetCode Premium)</option>
              </select>
            </div>

            {/* Programming Language (if SWE) */}
            {isSwe && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Primary DSA Language
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                  className="w-full bg-[#162033] border border-white/[0.1] rounded-xl text-xs text-white px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                >
                  {PROGRAMMING_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Calibrating...' : 'Save & Recalibrate Workspace'}</span>
          </Button>
        </div>
      </form>
    </CareerWorkspaceLayout>
  );
};

export default CareerSettingsPage;
