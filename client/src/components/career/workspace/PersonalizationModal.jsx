import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Calendar, Clock, DollarSign, BookOpen,
  CheckCircle2, X, Sliders, Briefcase, Code, Compass
} from 'lucide-react';
import Button from '../../ui/Button';

const PersonalizationModal = ({
  isOpen,
  onClose,
  initialProfile = {},
  onSave,
  isSaving = false
}) => {
  const [formData, setFormData] = useState(() => ({
    targetRole: initialProfile?.targetRole || 'Software Engineer',
    targetSeniority: initialProfile?.targetSeniority || 'Entry-Level',
    targetDate: initialProfile?.targetCompletionDate ? initialProfile.targetCompletionDate.split('T')[0] : '',
    currentStatus: initialProfile?.currentStatus || 'Recent Graduate',
    weeklyHours: initialProfile?.weeklyHours || 10,
    availableDays: initialProfile?.availableDays?.length ? initialProfile.availableDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    sessionDurationMinutes: initialProfile?.maxSessionDurationMinutes || 45,
    preferredStudyTime: initialProfile?.preferredStudyTime || 'Evening',
    learningStyles: initialProfile?.learningStyles?.length ? initialProfile.learningStyles : ['Interactive practice', 'Projects'],
    budget: initialProfile?.budget || 'Free only',
    preferredLanguage: initialProfile?.preferredLanguage || 'Python',
    primaryGoals: initialProfile?.primaryGoals?.length ? initialProfile.primaryGoals : ['Prepare for placements', 'Build portfolio'],
    timelineIntensity: initialProfile?.timelineIntensity || 'Balanced',
    remindersEnabled: initialProfile?.remindersEnabled ?? true,
  }));

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.availableDays.includes(day);
      const updated = exists ? prev.availableDays.filter(d => d !== day) : [...prev.availableDays, day];
      return { ...prev, availableDays: updated.length ? updated : ['Monday'] };
    });
  };

  const toggleStyle = (style) => {
    setFormData(prev => {
      const exists = prev.learningStyles.includes(style);
      const updated = exists ? prev.learningStyles.filter(s => s !== style) : [...prev.learningStyles, style];
      return { ...prev, learningStyles: updated.length ? updated : ['Mixed'] };
    });
  };

  const toggleGoal = (goal) => {
    setFormData(prev => {
      const exists = prev.primaryGoals.includes(goal);
      const updated = exists ? prev.primaryGoals.filter(g => g !== goal) : [...prev.primaryGoals, goal];
      return { ...prev, primaryGoals: updated.length ? updated : ['Build portfolio'] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  const isSwe = formData.targetRole === 'Software Engineer';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Personalize Your Career Path</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calibrate your timeline, available study hours, and learning style for an adaptive roadmap.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Target Role & Seniority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Career Track</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Software Engineer', icon: Code, label: 'Software Eng' },
                    { id: 'Business Analyst', icon: Briefcase, label: 'Business Analyst' }
                  ].map(r => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setFormData(prev => ({ ...prev, targetRole: r.id }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        formData.targetRole === r.id
                          ? 'bg-primary-600/15 border-primary-500/50 text-primary-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <r.icon className="w-4 h-4 text-primary-400" />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Seniority</label>
                <select
                  value={formData.targetSeniority}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetSeniority: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="Internship">Internship / Co-op</option>
                  <option value="Entry-Level">Entry-Level (New Grad)</option>
                  <option value="Junior (1-2 yrs)">Junior (1-2 Years Experience)</option>
                  <option value="Mid-Level">Associate / Mid-Level</option>
                </select>
              </div>
            </div>

            {/* Weekly Commitment Slider */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white">Weekly Time Commitment</span>
                  <p className="text-[11px] text-slate-400">How many hours can you realistically dedicate each week?</p>
                </div>
                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 text-primary-300 font-bold text-sm rounded-lg">
                  {formData.weeklyHours} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={formData.weeklyHours}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) }))}
                className="w-full accent-primary-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>2 hrs (Casual)</span>
                <span>10 hrs (Recommended)</span>
                <span>20+ hrs (Intensive)</span>
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Available Study Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const active = formData.availableDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? 'bg-primary-600 text-white border-primary-500'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Learning Style & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Preferred Learning Styles</label>
                <div className="flex flex-wrap gap-2">
                  {['Interactive practice', 'Projects', 'Videos', 'Written documentation', 'Mixed'].map(style => {
                    const active = formData.learningStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                          active
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Resource Cost Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Free only', 'Free and paid'].map(b => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setFormData(prev => ({ ...prev, budget: b }))}
                      className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                        formData.budget === b
                          ? 'bg-primary-600/20 text-primary-300 border-primary-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language & Timeline Intensity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isSwe && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Preferred DSA Language</label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Pace Intensity</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Relaxed', 'Balanced', 'Intensive'].map(intensity => (
                    <button
                      type="button"
                      key={intensity}
                      onClick={() => setFormData(prev => ({ ...prev, timelineIntensity: intensity }))}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center transition-all ${
                        formData.timelineIntensity === intensity
                          ? 'bg-primary-600 text-white border-primary-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Goals */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Primary Objectives</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Prepare for placements',
                  'Build portfolio',
                  'Improve resume fit',
                  'Specific upcoming interview',
                  'Career transition'
                ].map(g => {
                  const active = formData.primaryGoals.includes(g);
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Skip for now
              </button>

              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSaving}>
                  Save & Regenerate Plan
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PersonalizationModal;
