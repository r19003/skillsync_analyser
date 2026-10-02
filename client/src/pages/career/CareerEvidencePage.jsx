import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, PlusCircle, Sparkles, HelpCircle, Layers
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import toast from 'react-hot-toast';

const CareerEvidencePage = () => {
  const { analysisId } = useParams();

  const [evidenceData, setEvidenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchEvidence = async () => {
      try {
        const res = await careerWorkspaceApi.getEvidence(analysisId);
        if (isMounted && res.data?.success) {
          setEvidenceData(res.data);
        }
      } catch (err) {
        console.error('Fetch evidence error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (analysisId) fetchEvidence();
    return () => { isMounted = false; };
  }, [analysisId]);

  const handleFeedback = async (skill, type) => {
    try {
      await careerWorkspaceApi.submitEvidenceFeedback(analysisId, { skill, feedbackType: type });
      setFeedbackSent(prev => ({ ...prev, [skill]: type }));
      toast.success(`Feedback recorded: "${type}"`);
    } catch (err) {
      toast.error('Failed to record feedback.');
    }
  };

  if (isLoading) {
    return (
      <CareerWorkspaceLayout title="Resume Evidence Ledger" subtitle="Extracting exact textual traces from your resume...">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CareerWorkspaceLayout>
    );
  }

  const strongList = evidenceData?.strongEvidence || [];
  const partialList = evidenceData?.partialEvidence || [];
  const mentionedList = evidenceData?.mentionedOnly || [];
  const noEvidenceList = evidenceData?.noEvidence || [];

  const renderEvidenceRow = (item, badgeColor, badgeLabel) => {
    const isExpanded = expandedSkill === item.skill;
    const userFeedback = feedbackSent[item.skill];

    return (
      <div key={item.skill} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition-all">
        <div
          onClick={() => setExpandedSkill(isExpanded ? null : item.skill)}
          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
              {badgeLabel}
            </span>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-white truncate block">{item.skill}</span>
              <span className="text-xs text-slate-400 font-mono">{item.sourceSection} • Confidence: {item.confidence}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline-block max-w-xs truncate italic">
              "{item.fullSentence}"
            </span>
            <button className="p-1 text-slate-400 hover:text-white rounded">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer */}
        {isExpanded && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-300">Exact Extracted Sentence from Resume:</span>
              <p className="mt-1 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 italic leading-relaxed">
                "{item.fullSentence}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-slate-300">Why It Was Classified This Way:</span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  Evaluated as {item.evidenceLevel} evidence due to presence in the {item.sourceSection}.
                  {item.metricsDetected ? ' Measurable impact metrics were detected.' : ' No quantitative performance metrics were detected in this bullet.'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-300">How to Strengthen This Skill:</span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  {item.strengtheningAdvice}
                </p>
              </div>
            </div>

            {/* User Agreement Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Do you agree with this classification?</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleFeedback(item.skill, 'This evidence is correct')}
                  className={`px-2.5 py-1 rounded text-[11px] border font-medium transition-all ${
                    userFeedback === 'This evidence is correct'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ✓ This is correct
                </button>
                <button
                  onClick={() => handleFeedback(item.skill, 'This is incorrect')}
                  className={`px-2.5 py-1 rounded text-[11px] border font-medium transition-all ${
                    userFeedback === 'This is incorrect'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ✗ Incorrect
                </button>
                <button
                  onClick={() => handleFeedback(item.skill, 'I have stronger evidence')}
                  className={`px-2.5 py-1 rounded text-[11px] border font-medium transition-all ${
                    userFeedback === 'I have stronger evidence'
                      ? 'bg-primary-500/20 text-primary-300 border-primary-500'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  + I have stronger evidence
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <CareerWorkspaceLayout
      title="Resume Evidence Verification"
      subtitle="Inspect verbatim textual traces extracted from your resume. Grouped into verifiable evidence tiers."
    >
      <div className="space-y-6">
        {/* 1. Strong Evidence Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white">Strong Evidence ({strongList.length})</h3>
            <span className="text-xs text-slate-400 font-mono">• Professional experience & quantified metrics</span>
          </div>

          <div className="space-y-2">
            {strongList.map(item => renderEvidenceRow(item, 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', 'Strong'))}
            {strongList.length === 0 && (
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500">
                No work-experience or quantified evidence detected.
              </div>
            )}
          </div>
        </div>

        {/* 2. Partial Evidence Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-white">Partial Evidence ({partialList.length})</h3>
            <span className="text-xs text-slate-400 font-mono">• Academic & capstone project contexts</span>
          </div>

          <div className="space-y-2">
            {partialList.map(item => renderEvidenceRow(item, 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', 'Project'))}
            {partialList.length === 0 && (
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500">
                No project-level evidence detected.
              </div>
            )}
          </div>
        </div>

        {/* 3. Mentioned Only Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold text-white">Mentioned Only ({mentionedList.length})</h3>
            <span className="text-xs text-slate-400 font-mono">• Listed in skills section without narrative proof</span>
          </div>

          <div className="space-y-2">
            {mentionedList.map(item => renderEvidenceRow(item, 'bg-amber-500/10 text-amber-400 border-amber-500/30', 'Mentioned'))}
          </div>
        </div>

        {/* 4. No Evidence Compact List */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h3 className="text-sm font-bold text-white">No Evidence Detected ({noEvidenceList.length})</h3>
            </div>
            <span className="text-xs text-slate-400">Compact list of unproven role skills</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {noEvidenceList.map((item) => (
              <span
                key={item.skill}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono"
              >
                {item.skill}
              </span>
            ))}
            {noEvidenceList.length === 0 && (
              <span className="text-xs text-slate-500">All role skills have at least partial evidence.</span>
            )}
          </div>
        </div>
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerEvidencePage;
